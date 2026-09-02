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
  local artifact_mode=${2:-updated}
  mkdir -p "$repo/packages/widget/scripts" "$repo/scripts"
  git -C "$repo" init -qb main
  git -C "$repo" config user.email test@example.com
  git -C "$repo" config user.name test
  cp "$SCRIPT" "$repo/scripts/prepare-generated-artifact-release.mjs"
  printf '%s\n' '{"scripts":{"build":"node packages/widget/scripts/build.mjs"}}' >"$repo/package.json"
  if [ "$artifact_mode" = updated ]; then
    cat >"$repo/packages/widget/scripts/build.mjs" <<'EOF'
import { readFileSync, writeFileSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('packages/widget/package.json', 'utf8'));
const updated = pkg.dependencies.source === '1.1.0';
writeFileSync('packages/widget/icons.json', `${JSON.stringify({ icons: updated ? { updated: {} } : {} })}\n`);
EOF
  else
    cat >"$repo/packages/widget/scripts/build.mjs" <<'EOF'
import { writeFileSync } from 'node:fs';
writeFileSync('packages/widget/icons.json', `${JSON.stringify({ icons: {} })}\n`);
EOF
  fi
  printf '%s\n' '{"name":"widget","version":"1.2.3","dependencies":{"source":"1.0.0"}}' >"$repo/packages/widget/package.json"
  printf '%s\n' '{"icons":{}}' >"$repo/packages/widget/icons.json"
  git -C "$repo" add .
  git -C "$repo" commit -qm baseline
  git -C "$repo" tag baseline
  printf '%s\n' '{"name":"widget","version":"1.2.4","dependencies":{"source":"1.1.0"}}' >"$repo/packages/widget/package.json"
  (cd "$repo" && npm run build --silent)
  git -C "$repo" add .
  git -C "$repo" commit -qm dependency-update
  printf '%s' "$repo"
}

verify_repo() {
  local repo=$1
  (cd "$repo" && npm run build --silent && GITHUB_BASE_SHA=$(git rev-parse baseline) \
    node scripts/prepare-generated-artifact-release.mjs verify)
}

assert_passes() {
  local repo
  repo=$(new_repo valid)
  if verify_repo "$repo" >/dev/null 2>&1; then
    echo '[OK] matching regenerated asset and patch bump pass'
  else
    echo '[FAIL] valid generated release should pass'
    FAIL=1
  fi
}

assert_accepts_byte_identical_asset() {
  local repo
  repo=$(new_repo byte-identical identical)
  if verify_repo "$repo" >/dev/null 2>&1; then
    echo '[OK] byte-identical regenerated asset passes'
  else
    echo '[FAIL] byte-identical regenerated asset should pass'
    FAIL=1
  fi
}

assert_rejects_missing_asset() {
  local repo rc=0
  repo=$(new_repo missing-asset)
  git -C "$repo" show baseline:packages/widget/icons.json >"$repo/packages/widget/icons.json"
  git -C "$repo" add packages/widget/icons.json
  git -C "$repo" commit -qm stale-artifact
  verify_repo "$repo" >/dev/null 2>&1 || rc=$?
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
  git -C "$repo" add packages/widget/package.json
  git -C "$repo" commit -qm wrong-version
  verify_repo "$repo" >/dev/null 2>&1 || rc=$?
  if [ "$rc" -ne 0 ]; then
    echo '[OK] non-patch version bump is rejected'
  else
    echo '[FAIL] non-patch version bump should fail'
    FAIL=1
  fi
}

assert_passes
assert_accepts_byte_identical_asset
assert_rejects_missing_asset
assert_rejects_wrong_version
exit "$FAIL"
