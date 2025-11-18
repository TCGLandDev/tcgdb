package main

import (
	"context"
	"flag"
	"log"
	"os"

	"github.com/google/uuid"
	"go.uber.org/zap"

	platformlogging "github.com/zenGate-Global/palmyra-pro-saas/platform/go/logging"
	"github.com/zenGate-Global/palmyra-pro-saas/tools/seeders/go/internal/seed"
)

var namespace = uuid.NewSHA1(uuid.NameSpaceURL, []byte("palmyra-mtg-sets"))

func main() {
	input := flag.String("input", "", "Path to the Scryfall sets JSONL file")
	table := flag.String("table", "mtg_sets", "Target entity table name")
	concurrency := flag.Int("concurrency", 8, "Number of parallel workers")
	databaseURL := flag.String("database-url", os.Getenv("DATABASE_URL"), "PostgreSQL connection string")
	flag.Parse()

	if *input == "" {
		log.Fatal("input is required")
	}
	if *databaseURL == "" {
		log.Fatal("database-url is required (flag or DATABASE_URL env)")
	}

	logger, err := platformlogging.NewLogger(platformlogging.Config{Component: "seed-mtg-sets", Level: "info"})
	if err != nil {
		log.Fatalf("init logger: %v", err)
	}
	defer func() {
		_ = logger.Sync()
	}()

	ctx := context.Background()
	if err := seed.Run(ctx, seed.Options{
		InputPath:   *input,
		TableName:   *table,
		DatabaseURL: *databaseURL,
		Concurrency: *concurrency,
		KeyFunc:     seed.MTGSetKey,
		Mutate: func(m map[string]any) error {
			allowed := map[string]struct{}{
				"id":               {},
				"name":             {},
				"path":             {},
				"numberCardsInSet": {},
			}
			for k := range m {
				if _, ok := allowed[k]; !ok {
					delete(m, k)
				}
			}
			return nil
		},
		Namespace: namespace,
		Logger:    logger,
	}); err != nil {
		logger.Fatal("seed failed", zap.Error(err))
	}
}
