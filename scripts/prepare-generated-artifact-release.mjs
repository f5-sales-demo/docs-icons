#!/usr/bin/env node

/**
 * Prepare or verify generated icon artifacts after a workspace dependency update.
 *
 * The command deliberately derives the affected packages from the Git diff.  This
 * keeps Renovate from carrying a hand-maintained package list and makes the
 * resulting npm release atomic: a changed icon dependency always has the rebuilt
 * icons.json and exactly one matching patch version bump.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const mode = process.argv[2] ?? 'prepare';
if (!['prepare', 'verify'].includes(mode)) {
  throw new Error('Usage: prepare-generated-artifact-release.mjs [prepare|verify]');
}

const root = resolve(new URL('..', import.meta.url).pathname);
const run = (command, args, options = {}) =>
  execFileSync(command, args, { cwd: root, encoding: 'utf8', ...options });
const lines = (command, args) => run(command, args).trim().split('\n').filter(Boolean);
const json = (revision, path) => JSON.parse(run('git', ['show', `${revision}:${path}`]));
const current = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));

function baseRevision() {
  if (process.env.GITHUB_BASE_SHA) return process.env.GITHUB_BASE_SHA;
  if (process.env.RENOVATE_BASE_BRANCH) {
    const ref = `origin/${process.env.RENOVATE_BASE_BRANCH}`;
    try { return run('git', ['merge-base', 'HEAD', ref]).trim(); } catch { /* fall through */ }
  }
  try { return run('git', ['merge-base', 'HEAD', 'origin/main']).trim(); } catch {
    // A minimal local test repository may have only its baseline commit.
    return run('git', ['rev-parse', 'HEAD']).trim();
  }
}

function dependencyMap(pkg) {
  return Object.fromEntries(['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']
    .map((field) => [field, pkg[field] ?? {}]));
}

function changedDependencyPackages(base) {
  // Comparing the base tree with the working tree is intentional. Renovate runs
  // post-upgrade tasks before it commits the updated manifests.
  const changed = lines('git', ['diff', '--name-only', base, '--', 'packages/*/package.json']);
  return changed.filter((path) => {
    try {
      return JSON.stringify(dependencyMap(json(base, path))) !== JSON.stringify(dependencyMap(current(path)));
    } catch {
      throw new Error(`${path} must exist in both the base revision and the dependency update`);
    }
  }).map((path) => path.split('/')[1]).sort();
}

function patchBump(before, after) {
  const match = /^(\d+)\.(\d+)\.(\d+)(.*)$/.exec(before);
  if (!match) return false;
  return after === `${match[1]}.${match[2]}.${Number(match[3]) + 1}${match[4]}`;
}

function changedPaths(base) {
  return lines('git', ['diff', '--name-only', base]);
}

function verify(base, affected) {
  const changed = new Set(changedPaths(base));
  for (const name of affected) {
    const manifest = `packages/${name}/package.json`;
    const icons = `packages/${name}/icons.json`;
    if (!changed.has(icons)) throw new Error(`${icons} was not regenerated for its dependency update`);
    const before = json(base, manifest).version;
    const after = current(manifest).version;
    if (!patchBump(before, after)) {
      throw new Error(`${manifest} must be bumped exactly one patch (${before} -> ${after})`);
    }
  }
}

const base = baseRevision();
const affected = changedDependencyPackages(base);
console.log(`Base revision: ${base}`);
console.log(`Affected packages: ${affected.join(', ') || 'none'}`);

if (mode === 'verify') {
  verify(base, affected);
  console.log('Generated artifact release gate passed.');
  process.exit(0);
}

if (affected.length === 0) {
  console.log('No workspace dependency update; nothing to prepare.');
  process.exit(0);
}

const changedBeforeBuild = new Set(lines('git', ['status', '--porcelain']).map((line) => line.slice(3)));
run('npm', ['ci'], { stdio: 'inherit' });
for (const name of affected) {
  run('node', [`packages/${name}/scripts/build.mjs`], { stdio: 'inherit' });
}
const changedAfterBuild = new Set(lines('git', ['status', '--porcelain']).map((line) => line.slice(3)));
for (const path of changedAfterBuild) {
  if (!changedBeforeBuild.has(path) && !affected.some((name) => path === `packages/${name}/icons.json`)) {
    throw new Error(`regeneration produced unrelated output: ${path}`);
  }
}

for (const name of affected) {
  const manifest = `packages/${name}/package.json`;
  const pkg = current(manifest);
  const match = /^(\d+)\.(\d+)\.(\d+)(.*)$/.exec(pkg.version);
  if (!match) throw new Error(`${manifest} has a non-semver version: ${pkg.version}`);
  pkg.version = `${match[1]}.${match[2]}.${Number(match[3]) + 1}${match[4]}`;
  // JSON.stringify is intentional: package manifests in this repository use this layout.
  await import('node:fs/promises').then(({ writeFile }) =>
    writeFile(resolve(root, manifest), `${JSON.stringify(pkg, null, 2)}\n`));
}
run('npm', ['install', '--package-lock-only', '--ignore-scripts'], { stdio: 'inherit' });

verify(base, affected);
console.log('Generated artifacts and package patch versions prepared.');
