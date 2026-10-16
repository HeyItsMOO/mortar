#!/usr/bin/env bash
# catalog-compat.sh [MANIFEST]: decodes MANIFEST (default: the bundled catalog) with the internal/components package
# of the last two released Mortar versions, so a catalog change that would leave them on their bundled copy (as
# v0.3.0 was by The Sims 4's entry) is caught before it is signed. Needs network for the tags and their modules.
set -euo pipefail
cd "$(dirname "$0")/.."
manifest=$(realpath "${1:-internal/components/components.json}")
mapfile -t tags < <(git ls-remote --tags origin 'v*' | awk '{print $2}' | sed -n 's|^refs/tags/\(v[0-9][^^]*\)$|\1|p' | sort -V | tail -2)
work=$(mktemp -d "${TMPDIR:-/var/tmp}/mortar-compat-XXXXXX")
trap 'rm -rf "$work"' EXIT
failed=0
for tag in "${tags[@]}"; do
  git rev-parse -q --verify "refs/tags/$tag" >/dev/null || git fetch -q --depth=1 origin "refs/tags/$tag:refs/tags/$tag"
  dir=$work/$tag
  mkdir -p "$dir"
  git archive "$tag" | tar -x -m -C "$dir"
  cat >"$dir/internal/components/compat_check_test.go" <<'GO'
package components

import (
	"os"
	"testing"
)

func TestCompatDecode(t *testing.T) {
	b, err := os.ReadFile(os.Getenv("COMPAT_MANIFEST"))
	if err != nil {
		t.Fatal(err)
	}
	m, err := Decode(b)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("reads %d games", len(m.Games))
}
GO
  if (cd "$dir" && COMPAT_MANIFEST=$manifest go test -count=1 -run '^TestCompatDecode$' -v ./internal/components) >"$work/$tag.log" 2>&1; then
    echo "$tag: $(grep -o 'reads [0-9]* games' "$work/$tag.log")"
  else
    echo "$tag: refuses the catalog:"
    grep -E 'compat_check_test.go|FAIL|error' "$work/$tag.log" | head -5
    failed=1
  fi
done
exit "$failed"
