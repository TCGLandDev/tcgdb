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

var namespace = uuid.NewSHA1(uuid.NameSpaceURL, []byte("palmyra-pkm-cards"))

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
		Namespace:   namespace,
		Logger:      logger,
	}); err != nil {
		logger.Fatal("seed failed", zap.Error(err))
	}
}
