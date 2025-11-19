package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/google/uuid"
	"go.uber.org/zap"

	platformlogging "github.com/zenGate-Global/palmyra-pro-saas/platform/go/logging"
	"github.com/zenGate-Global/palmyra-pro-saas/tools/seeders/go/internal/seed"
)

var (
	namespace       = uuid.NewSHA1(uuid.NameSpaceURL, []byte("palmyra-pkm-cards"))
	entityNamespace = uuid.NewSHA1(uuid.NameSpaceURL, []byte("palmyra-pkm-cards-entity"))
)

func main() {
	input := flag.String("input", "", "Path to the JSONL file exported from pkmtcgio")
	table := flag.String("table", "pkm_cards", "Target entity table name")
	concurrency := flag.Int("concurrency", 8, "Number of parallel workers")
	databaseURL := flag.String("database-url", os.Getenv("DATABASE_URL"), "PostgreSQL connection string")
	flag.Parse()

	if *input == "" {
		log.Fatal("input is required")
	}
	if *databaseURL == "" {
		log.Fatal("database-url is required (flag or DATABASE_URL env)")
	}

	logger, err := platformlogging.NewLogger(platformlogging.Config{Component: "seed-pkm-cards", Level: "info"})
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
		KeyFunc:     seed.PokemonCardKey,
		SlugFunc: func(m map[string]any) (string, error) {
			fields := []string{"tcgLandPublicId", "sId", "cId", "lang", "number", "name", "oracleId"}
			parts := make([]string, 0, len(fields))
			for _, key := range fields {
				if v, ok := m[key].(string); ok && v != "" {
					parts = append(parts, v)
				}
			}
			if ids, ok := m["tcgPlayerIds"].([]any); ok {
				idParts := make([]string, 0, len(ids))
				for _, raw := range ids {
					switch val := raw.(type) {
					case float64:
						idParts = append(idParts, fmt.Sprintf("%d", int(val)))
					case string:
						if val != "" {
							idParts = append(idParts, val)
						}
					}
				}
				if len(idParts) > 0 {
					parts = append(parts, strings.Join(idParts, "-"))
				}
			}
			return strings.Join(parts, "-"), nil
		},
		Mutate: func(m map[string]any) ([]string, error) {
			allowed := map[string]struct{}{
				"abilities":              {},
				"ancientTrait":           {},
				"artist":                 {},
				"attacks":                {},
				"cId":                    {},
				"convertedRetreatCost":   {},
				"evolvesFrom":            {},
				"evolvesTo":              {},
				"flavorText":             {},
				"hp":                     {},
				"images":                 {},
				"lang":                   {},
				"legalities":             {},
				"level":                  {},
				"name":                   {},
				"nationalPokedexNumbers": {},
				"number":                 {},
				"oracleId":               {},
				"path":                   {},
				"rarity":                 {},
				"regulationMark":         {},
				"resistances":            {},
				"retreatCost":            {},
				"rules":                  {},
				"sId":                    {},
				"subtypes":               {},
				"supertype":              {},
				"tcgLandPublicId":        {},
				"tcgPlayerIds":           {},
				"types":                  {},
				"weaknesses":             {},
			}
			removed := []string{}
			for k := range m {
				if _, ok := allowed[k]; !ok {
					delete(m, k)
					removed = append(removed, k)
				}
			}
			return removed, nil
		},
		EntityIDFunc: func(m map[string]any, _ string) (uuid.UUID, error) {
			value, ok := m["tcgLandPublicId"].(string)
			if !ok || value == "" {
				return uuid.Nil, fmt.Errorf("tcgLandPublicId is required")
			}
			return uuid.NewSHA1(entityNamespace, []byte(value)), nil
		},
		Namespace: namespace,
		Logger:    logger,
	}); err != nil {
		logger.Fatal("seed failed", zap.Error(err))
	}
}
