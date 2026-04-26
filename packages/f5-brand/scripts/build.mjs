#!/usr/bin/env node

/**
 * Converts F5 brand SVG files into a single Iconify JSON file.
 *
 * - Strips `f5-icon-` or `f5-` prefix from filenames to derive icon names
 * - Replaces hard-coded dark colors with `currentColor` for theme adaptability
 * - Preserves `fill="none"` and `fill="#fff"` (structural/white fills)
 * - Skips `ai-governance.svg` (bare name collides with `f5-icon-ai-governance.svg`)
 * - Extracts SVG body (content between <svg> tags)
 * - Reads viewBox dimensions from the <svg> element
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgDir = join(__dirname, '..', 'svg');
const outFile = join(__dirname, '..', 'icons.json');

const files = readdirSync(svgDir)
  .filter((f) => f.endsWith('.svg'))
  .sort();

const icons = {};
const skipped = [];

for (const file of files) {
  // Skip bare ai-governance.svg — collides with f5-icon-ai-governance.svg
  if (file === 'ai-governance.svg') {
    skipped.push(file);
    continue;
  }

  // Derive icon name: strip f5-icon- or f5- prefix, remove .svg extension
  let name = basename(file, '.svg');
  if (name.startsWith('f5-icon-')) {
    name = name.slice('f5-icon-'.length);
  } else if (name.startsWith('f5-')) {
    name = name.slice('f5-'.length);
  }

  const raw = readFileSync(join(svgDir, file), 'utf8');

  // Extract viewBox dimensions
  const viewBoxMatch = raw.match(/viewBox="([^"]+)"/);
  let width = 50;
  let height = 50;
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].split(/\s+/).map(Number);
    if (parts.length === 4) {
      width = parts[2];
      height = parts[3];
    }
  }

  // Extract SVG body — content between <svg ...> and </svg>
  const bodyMatch = raw.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!bodyMatch) {
    console.warn(`WARN: Could not extract body from ${file}, skipping`);
    skipped.push(file);
    continue;
  }

  let body = bodyMatch[1].trim();

  // Replace dark colors with currentColor for theme adaptability
  // fill="#231f20" → fill="currentColor"
  body = body.replace(/fill="#231f20"/gi, 'fill="currentColor"');
  // fill="#000" or fill="#000000" → fill="currentColor"
  body = body.replace(/fill="#0{3,6}"/gi, 'fill="currentColor"');
  // stroke="#231f20" → stroke="currentColor"
  body = body.replace(/stroke="#231f20"/gi, 'stroke="currentColor"');
  // stroke="#000" or stroke="#000000" → stroke="currentColor"
  body = body.replace(/stroke="#0{3,6}"/gi, 'stroke="currentColor"');
  // stroke="#222" → stroke="currentColor"
  body = body.replace(/stroke="#222"/gi, 'stroke="currentColor"');

  // Preserve fill="none" and fill="#fff" — these are NOT replaced above
  // (our patterns only target specific dark hex values)

  icons[name] = { body, width, height };
}

const output = {
  prefix: 'f5-brand',
  width: 50,
  height: 50,
  icons,
};

writeFileSync(outFile, `${JSON.stringify(output, null, 2)}\n`);

console.log(`Built ${Object.keys(icons).length} icons → ${outFile}`);
if (skipped.length > 0) {
  console.log(`Skipped ${skipped.length}: ${skipped.join(', ')}`);
}
