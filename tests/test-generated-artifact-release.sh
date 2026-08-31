#!/usr/bin/env bash
# Hermetic contract tests for the generated icon release gate.
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
SCRIPT="$ROOT/scripts/prepare-generated-artifact-release.mjs"
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
FAIL=0

new_repo() {
  local repo="$WORK/$1"
  mkdir -p "$repo/packages/widget" "$repo/scripts"
  git -C "$repo" init -qb main
  git -C "$repo" config user.email test@example.com
  git -C "$repo" config user.name test
  cp "$SCRIPT" "$repo/scripts/prepare-generated-artifact-release.mjs"
  printf '%s\n' '{"name":"widget","version":"1.2.3","dependencies":{"source":"1.0.0"}}' >"$repo/packages/widget/package.json"
  printf '%s\n' '{"icons":{}}' >"$repo/packages/widget/icons.json"
  git -C "$repo" add .
  git -C "$repo" commit -qm baseline
  printf '%s\n' '{"name":"widget","version":"1.2.4","dependencies":{"source":"1.1.0"}}' >"$repo/packages/widget/package.json"
  echo '{"icons":{"updated":{}}}' >"$repo/packages/widget/icons.json"
  printf '%s' "$repo"
}

assert_passes() {
  local repo
  repo=$(new_repo valid)
  if (cd "$repo" && node scripts/prepare-generated-artifact-release.mjs verify) >/dev/null 2>&1; then
    echo '[OK] matching regenerated asset and patch bump pass'
  else
    echo '[FAIL] valid generated release should pass'
    FAIL=1
  fi
}

assert_rejects_missing_asset() {
  local repo rc=0
  repo=$(new_repo missing-asset)
  git -C "$repo" checkout -- packages/widget/icons.json
  (cd "$repo" && node scripts/prepare-generated-artifact-release.mjs verify) >/dev/null 2>&1 || rc=$?
  if [ "$rc" -ne 0 ]; then
    echo '[OK] missing regenerated asset is rejected'
  else
    echo '[FAIL] missing regenerated asset should fail'
    FAIL=1
  fi
}

assert_rejects_wrong_version() {
  local repo rc=0
  repo=$(new_repo wrong-version)
  sed -i 's/1.2.4/1.3.0/' "$repo/packages/widget/package.json"
  (cd "$repo" && node scripts/prepare-generated-artifact-release.mjs verify) >/dev/null 2>&1 || rc=$?
  if [ "$rc" -ne 0 ]; then
    echo '[OK] non-patch version bump is rejected'
  else
    echo '[FAIL] non-patch version bump should fail'
    FAIL=1
  fi
}

assert_passes
assert_rejects_missing_asset
assert_rejects_wrong_version
exit "$FAIL"
