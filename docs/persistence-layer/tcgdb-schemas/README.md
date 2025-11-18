# TCGDB Schema Snapshots

This folder mirrors the normalized JSON Schemas that the TCG Database app (apps/tcgdb) consumes through
the Palmyra persistence layer. Each file is an immutable snapshot of the upstream schema definition from
`/home/angelcc/projects/tcgland/monorepo_main/golang/libraries/data_model/products` so the team can review
and discuss entity shapes inside this monorepo without opening the legacy tree.

## Source of Truth
- Authoritative files still live under `golang/libraries/data_model/products` in the core monorepo.
- Schemas follow the `{game-code}_normalized_{set|card}.schema.json` naming pattern (e.g., `pkm_sets.schema.json`).
- When upstream changes land, copy the updated files here in the same naming scheme and open a PR noting the
  source commit/branch.

## Included Schemas (as of 2025-11-18)
- `pkm_sets.schema.json`
- `pkm_cards.schema.json`
- `mtg_sets.schema.json`
- `mtg_cards.schema.json`

## Maintenance Expectations
1. Update the Schema Repository (contracts + persistence) before changing downstream services or UI flows.
2. Regenerate the API/SDK if a schema change affects public contracts.
3. Refresh these documentation copies last so they always describe what is already deployed or merged.

If you need additional context on how these schemas are enforced, see `docs/persistence-layer/persistent-layer.md`.
