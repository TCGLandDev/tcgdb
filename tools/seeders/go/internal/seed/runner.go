package seed

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"

	"github.com/zenGate-Global/palmyra-pro-saas/platform/go/persistence"
)

// KeyFunc returns a stable identifier string extracted from the raw JSON payload.
type KeyFunc func(map[string]any) (string, error)

// Options control how a seed job runs.
type Options struct {
	InputPath    string
	TableName    string
	DatabaseURL  string
	Concurrency  int
	KeyFunc      KeyFunc
	SlugFunc     func(map[string]any) (string, error)
	Mutate       func(map[string]any) ([]string, error)
	EntityIDFunc func(map[string]any, string) (uuid.UUID, error)
	Namespace    uuid.UUID
	Logger       *zap.Logger
}

// Run streams the input file and writes each record into the requested table.
func Run(ctx context.Context, opts Options) error {
	if opts.InputPath == "" {
		return errors.New("input path is required")
	}
	if opts.TableName == "" {
		return errors.New("table name is required")
	}
	if opts.DatabaseURL == "" {
		return errors.New("database url is required")
	}
	if opts.KeyFunc == nil {
		return errors.New("key extractor is required")
	}
	if opts.EntityIDFunc == nil && opts.Namespace == uuid.Nil {
		return errors.New("uuid namespace is required")
	}
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}
	if opts.Concurrency <= 0 {
		opts.Concurrency = runtime.NumCPU()
	}

	file, err := os.Open(opts.InputPath)
	if err != nil {
		return fmt.Errorf("open input: %w", err)
	}
	defer file.Close()

	pool, err := persistence.NewPool(ctx, persistence.PoolConfig{ConnString: opts.DatabaseURL})
	if err != nil {
		return fmt.Errorf("init pool: %w", err)
	}
	defer persistence.ClosePool(pool)

	schemaStore, err := persistence.NewSchemaRepositoryStore(ctx, pool)
	if err != nil {
		return fmt.Errorf("init schema store: %w", err)
	}

	schemaRecord, err := schemaStore.GetActiveSchemaByTableName(ctx, opts.TableName)
	if err != nil {
		return fmt.Errorf("resolve schema for %s: %w", opts.TableName, err)
	}

	validator := persistence.NewSchemaValidator()
	entityRepo, err := persistence.NewEntityRepository(ctx, pool, schemaStore, validator, persistence.EntityRepositoryConfig{
		SchemaID: schemaRecord.SchemaID,
	})
	if err != nil {
		return fmt.Errorf("init entity repo: %w", err)
	}

	opts.Logger.Info("starting seed", zap.String("table", opts.TableName), zap.String("file", opts.InputPath), zap.Int("concurrency", opts.Concurrency))

	stats, err := streamAndInsert(ctx, file, entityRepo, opts)
	if err != nil {
		return err
	}

	opts.Logger.Info("seed completed",
		zap.String("table", opts.TableName),
		zap.Int64("processed", stats.Processed.Load()),
		zap.Int64("skipped", stats.Skipped.Load()),
		zap.Any("ignoredFields", stats.ignoredSnapshot()),
	)

	return nil
}

type statsTracker struct {
	Processed atomic.Int64
	Skipped   atomic.Int64
	ignored   sync.Map // map[string]*atomic.Int64
}

type job struct {
	line int
	raw  []byte
}

func (s *statsTracker) addIgnored(fields []string) {
	for _, field := range fields {
		if field == "" {
			continue
		}
		counterAny, _ := s.ignored.LoadOrStore(field, &atomic.Int64{})
		counterAny.(*atomic.Int64).Add(1)
	}
}

func (s *statsTracker) ignoredSnapshot() map[string]int64 {
	result := make(map[string]int64)
	s.ignored.Range(func(key, value any) bool {
		result[key.(string)] = value.(*atomic.Int64).Load()
		return true
	})
	return result
}

func streamAndInsert(ctx context.Context, reader io.Reader, repo *persistence.EntityRepository, opts Options) (*statsTracker, error) {
	jobs := make(chan job, opts.Concurrency*2)
	stats := &statsTracker{}

	g, ctx := errgroup.WithContext(ctx)

	g.Go(func() error {
		defer close(jobs)
		scanner := bufio.NewScanner(reader)
		buf := make([]byte, 0, 1024*1024)
		scanner.Buffer(buf, 16*1024*1024)
		line := 0
		for scanner.Scan() {
			line++
			b := append([]byte(nil), scanner.Bytes()...)
			select {
			case <-ctx.Done():
				return ctx.Err()
			case jobs <- job{line: line, raw: b}:
			}
		}
		if err := scanner.Err(); err != nil {
			return fmt.Errorf("scan input: %w", err)
		}
		return nil
	})

	for i := 0; i < opts.Concurrency; i++ {
		g.Go(func() error {
			for {
				select {
				case <-ctx.Done():
					return ctx.Err()
				case j, ok := <-jobs:
					if !ok {
						return nil
					}
					if err := handleJob(ctx, repo, j, stats, opts); err != nil {
						return err
					}
				}
			}
		})
	}

	if err := g.Wait(); err != nil {
		return nil, err
	}

	return stats, nil
}

func handleJob(ctx context.Context, repo *persistence.EntityRepository, j job, stats *statsTracker, opts Options) error {
	var payload map[string]any
	if err := json.Unmarshal(j.raw, &payload); err != nil {
		return fmt.Errorf("line %d: decode payload: %w", j.line, err)
	}

	rawBytes := j.raw
	if opts.Mutate != nil {
		ignored, err := opts.Mutate(payload)
		if err != nil {
			return fmt.Errorf("line %d: mutate payload: %w", j.line, err)
		}
		stats.addIgnored(ignored)
		encoded, err := json.Marshal(payload)
		if err != nil {
			return fmt.Errorf("line %d: encode payload: %w", j.line, err)
		}
		rawBytes = encoded
	}

	key, err := opts.KeyFunc(payload)
	if err != nil {
		return fmt.Errorf("line %d: derive key: %w", j.line, err)
	}

	slugSource := key
	if opts.SlugFunc != nil {
		if slugSource, err = opts.SlugFunc(payload); err != nil {
			return fmt.Errorf("line %d: derive slug: %w", j.line, err)
		}
	}

	slug, err := buildSlug(slugSource)
	if err != nil {
		return fmt.Errorf("line %d: slugify %q: %w", j.line, key, err)
	}

	var entityID uuid.UUID
	if opts.EntityIDFunc != nil {
		entityID, err = opts.EntityIDFunc(payload, key)
		if err != nil {
			return fmt.Errorf("line %d: derive entity id: %w", j.line, err)
		}
	} else {
		entityID = uuid.NewSHA1(opts.Namespace, []byte(key))
	}

	_, err = repo.CreateEntity(ctx, persistence.CreateEntityParams{
		EntityID: entityID,
		Slug:     slug,
		Payload:  persistence.SchemaDefinition(rawBytes),
	})
	switch {
	case err == nil:
		stats.Processed.Add(1)
		if v := stats.Processed.Load(); v%1000 == 0 {
			opts.Logger.Info("progress", zap.Int64("processed", v))
		}
		return nil
	case errors.Is(err, persistence.ErrEntityAlreadyExists):
		stats.Skipped.Add(1)
		return nil
	default:
		return fmt.Errorf("line %d: insert entity: %w", j.line, err)
	}
}

func buildSlug(key string) (string, error) {
	normalized := strings.ToLower(strings.TrimSpace(key))
	var b strings.Builder
	lastDash := false
	for _, r := range normalized {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
			lastDash = false
			continue
		}
		if !lastDash {
			b.WriteByte('-')
			lastDash = true
		}
	}
	slug := strings.Trim(b.String(), "-")
	if slug == "" {
		return "", errors.New("empty slug after normalization")
	}
	return persistence.NormalizeSlug(slug)
}
