#!/usr/bin/env node

/**
 * Converts Azure architecture icons from the azureiconkento npm package
 * into a namespaced Iconify JSON file.
 *
 * Source: azureiconkento/azureicons/allicons.json
 * - ~606 icons in Iconify JSON format, 18x18, colorful with gradients
 * - Critical: Gradient IDs conflict (svgID0 appears in 49/50 icons)
 *   This script namespaces all id= and url(#...) references per icon.
 * - License: Microsoft Icon Terms
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const sourcePath = require.resolve('azureiconkento/azureicons/allicons.json');
const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
const outFile = join(__dirname, '..', 'icons.json');

const icons = {};

for (const [name, icon] of Object.entries(source.icons)) {
  let body = icon.body;

  // Namespace all id="..." references to prevent cross-icon gradient conflicts.
  // Pattern: replace id="svgIDN" with id="az-{iconName}-N"
  // and corresponding url(#svgIDN) with url(#az-{iconName}-N)
  const idMatches = body.matchAll(/\bid="([^"]+)"/g);
  const ids = new Set();
  for (const m of idMatches) {
    ids.add(m[1]);
  }

  for (const id of ids) {
    const safe = `az-${name}-${id}`;
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Replace id="..." attribute
    body = body.replace(new RegExp(`id="${escaped}"`, 'g'), `id="${safe}"`);
    // Replace url(#...) references
    body = body.replace(new RegExp(`url\\(#${escaped}\\)`, 'g'), `url(#${safe})`);
    // Replace href="#..." references (for <use> elements)
    body = body.replace(new RegExp(`href="#${escaped}"`, 'g'), `href="#${safe}"`);
  }

  icons[name] = { ...icon, body };
}

const output = {
  prefix: 'azure',
  width: source.width || 18,
  height: source.height || 18,
  icons,
};

writeFileSync(outFile, `${JSON.stringify(output, null, 2)}\n`);

const count = Object.keys(icons).length;
console.log(`Built ${count} Azure icons (namespaced) → ${outFile}`);
