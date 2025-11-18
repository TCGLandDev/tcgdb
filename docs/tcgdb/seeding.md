# TCGDB Data Seeding

Use these Go CLI utilities to load the normalized Pokémon and MTG exports into
the Palmyra persistence layer without touching the admin HTTP API. Each tool
streams newline-delimited JSON, validates every payload with the current schema
(via `platform/go/persistence`), and inserts into the requested entity table
with deterministic IDs/slugs so reruns remain idempotent.

## Commands

| Command | Default Table | Input | Description |
| --- | --- | --- | --- |
| `go run ./tools/seeders/go/cmd/seed-pkm-sets` | `pkm_sets` | `sets.jsonl` from `pkmtcgio` dump | Imports normalized Pokémon sets. |
| `go run ./tools/seeders/go/cmd/seed-pkm-cards` | `pkm_cards` | `cards.jsonl` from `pkmtcgio` dump | Imports normalized Pokémon singles. |
| `go run ./tools/seeders/go/cmd/seed-mtg-sets` | `mtg_sets` | `sets.jsonl` from `scryfall` dump | Imports normalized MTG sets. |
| `go run ./tools/seeders/go/cmd/seed-mtg-cards` | `mtg_cards` | `cards.jsonl` from `scryfall` dump | Imports normalized MTG singles. |

## Shared Flags

| Flag | Description |
| --- | --- |
| `-input` | Absolute/relative path to the JSONL file. **Required.** |
| `-table` | Overrides the destination entity table. Defaults per command. |
| `-database-url` | Postgres connection string; falls back to the `DATABASE_URL` env var. |
| `-concurrency` | Number of worker goroutines (default `8`). |

Example run:

```bash
DATABASE_URL=postgres://palmyra:palmyra@localhost:5432/palmyra?sslmode=disable \
  go run ./tools/seeders/go/cmd/seed-pkm-cards \
    -input /home/angelcc/projects/tcgland/tmp/runs/2025-08-12T05:00:01.384209Z/pkmtcgio/cards.jsonl \
    -concurrency 12
```

Progress is logged every 1,000 inserts. When a document already exists, the
seeders skip it rather than raising an error, keeping the process idempotent.
