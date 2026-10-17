#!/usr/bin/env bash
# Render budget: React commits, mounts and re-renders, DOM and layout work, heap and backend calls for every screen and
# common interaction, in a throwaway self-test sandbox on a copy of the maintainer's data. Exits 1 over the budget.
# Knobs and the cases: frontend/e2e/render-budget.ts. Opt-in (`bun run renders`), in no gate: it walks every screen with
# a settle and an idle watch each, which takes minutes.
#
#   scripts/render-budget.sh                                  every case on a copy of the real data
#   MORTAR_RENDER_ONLY=mods,config scripts/render-budget.sh   the cases whose names start with these
#   MORTAR_RENDER_URL=http://127.0.0.1:9455 scripts/render-budget.sh   against a running selftest.sh server
set -euo pipefail
cd "$(dirname "$0")/.."
exec bun frontend/e2e/render-budget.ts
