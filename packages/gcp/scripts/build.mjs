#!/usr/bin/env node

/**
 * Converts Google Cloud architecture SVGs into a single Iconify JSON file.
 *
 * Source: AwesomeLogos/google-cloud-icons GitHub repo
 * - ~216 product icons at 24x24 in docs/images/*.svg
 * - Critical: CSS class conflicts (.cls-1 used in 135/216 icons)
 *   This script converts <style> CSS classes to inline fill= attributes.
 * - License: Apache-2.0
 */

import { execSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import https from 'node:https';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outFile = join(__dirname, '..', 'icons.json');

const zipUrl = 'https://github.com/AwesomeLogos/google-cloud-icons/archive/refs/heads/main.zip';

function fetch(href) {
  return new Promise((resolve, reject) => {
    https
      .get(href, { headers: { 'User-Agent': 'docs-icons-build' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetch(res.headers.location).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${href}`));
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

/**
 * Parse CSS <style> block and extract class → property mappings.
 * Handles fill, filter, mask, opacity and other SVG-relevant CSS properties.
 */
function parseStyleBlock(styleContent) {
  const mappings = {};
  const ruleRegex = /([^{}]+)\{([^}]+)\}/g;
  let match = ruleRegex.exec(styleContent);
  while (match !== null) {
    const selectors = match[1].trim();
    const declarations = match[2].trim();

    // Parse all declarations into property map
    const props = {};
    for (const decl of declarations.split(';')) {
      const colonIdx = decl.indexOf(':');
      if (colonIdx === -1) continue;
      const prop = decl.slice(0, colonIdx).trim();
      const val = decl.slice(colonIdx + 1).trim();
      if (prop && val) props[prop] = val;
    }

    if (Object.keys(props).length > 0) {
      for (const sel of selectors.split(',')) {
        const clsMatch = sel.trim().match(/^\.([\w-]+)$/);
        if (clsMatch) {
          mappings[clsMatch[1]] = props;
        }
      }
    }
    match = ruleRegex.exec(styleContent);
  }
  return mappings;
}

/**
 * Replace class="cls-N" with inline SVG attributes using parsed CSS mappings,
 * then remove the <defs><style>...</style></defs> block.
 *
 * Maps CSS properties to SVG attributes:
 *   fill → fill="..."
 *   filter → filter="..."
 *   mask → mask="..."
 *   opacity → opacity="..."
 */
function inlineStyles(svgContent) {
  const styleMatch = svgContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (!styleMatch) return svgContent;

  const mappings = parseStyleBlock(styleMatch[1]);
  let result = svgContent;

  for (const [cls, props] of Object.entries(mappings)) {
    // Build inline attribute string from CSS properties
    const attrs = Object.entries(props)
      .map(([prop, val]) => `${prop}="${val}"`)
      .join(' ');

    // Handle class="cls-N" (single class)
    result = result.replace(new RegExp(`class="${cls}"`, 'g'), attrs);
    // Handle class="cls-N cls-M" (multiple classes)
    result = result.replace(new RegExp(`class="([^"]*\\b)${cls}(\\b[^"]*)"`, 'g'), (_match, before, after) => {
      const remaining = `${before}${after}`.trim();
      if (remaining) {
        return `${attrs} class="${remaining}"`;
      }
      return attrs;
    });
  }

  // Remove <style> block (and containing <defs> if it only holds <style>)
  result = result.replace(/<defs>\s*<style[^>]*>[\s\S]*?<\/style>\s*<\/defs>/gi, '');
  result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  return result;
}

console.log('Downloading GCP icon archive...');
const zipBuffer = await fetch(zipUrl);

const tmpDir = mkdtempSync(join(tmpdir(), 'gcp-icons-'));
const zipFile = join(tmpDir, 'gcp-icons.zip');
writeFileSync(zipFile, zipBuffer);

execSync(`unzip -q "${zipFile}" -d "${tmpDir}"`);

// Find the extracted directory
const extractedDir = readdirSync(tmpDir).find((d) => {
  try {
    return statSync(join(tmpDir, d)).isDirectory() && d.startsWith('google-cloud-icons');
  } catch {
    return false;
  }
});

if (!extractedDir) {
  console.error('Could not find extracted directory');
  rmSync(tmpDir, { recursive: true });
  process.exit(1);
}

// SVGs are flat files in docs/images/
const imagesDir = join(tmpDir, extractedDir, 'docs', 'images');
const svgFiles = readdirSync(imagesDir)
  .filter((f) => f.endsWith('.svg'))
  .sort();

const icons = {};
const skipped = [];

for (const file of svgFiles) {
  const raw = readFileSync(join(imagesDir, file), 'utf8');

  // Inline CSS styles to prevent cross-icon class conflicts
  const processed = inlineStyles(raw);

  // Extract viewBox dimensions
  const viewBoxMatch = processed.match(/viewBox="([^"]+)"/);
  let width = 24;
  let height = 24;
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].split(/\s+/).map(Number);
    if (parts.length === 4) {
      width = parts[2];
      height = parts[3];
    }
  }

  // Extract SVG body
  const bodyMatch = processed.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!bodyMatch) {
    skipped.push(file);
    continue;
  }

  const body = bodyMatch[1].trim();

  // Derive icon name: strip .svg, underscores → hyphens, lowercase
  const name = basename(file, '.svg').replace(/_/g, '-').toLowerCase();

  if (icons[name]) {
    console.log(`SKIP duplicate name "${name}" from ${file}`);
    continue;
  }

  icons[name] = { body, width, height };
}

// Clean up temp directory
rmSync(tmpDir, { recursive: true });

const output = {
  prefix: 'gcp',
  width: 24,
  height: 24,
  icons,
};

writeFileSync(outFile, `${JSON.stringify(output, null, 2)}\n`);

const count = Object.keys(icons).length;
console.log(`Built ${count} GCP icons → ${outFile}`);
if (skipped.length > 0) {
  console.log(`Skipped ${skipped.length}: ${skipped.join(', ')}`);
}
