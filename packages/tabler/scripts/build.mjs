#!/usr/bin/env node

/**
 * Copies the Iconify JSON file from @iconify-json/tabler into this package
 * so it can be exported alongside Icon.astro.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const source = require.resolve('@iconify-json/tabler/icons.json');
const dest = join(__dirname, '..', 'icons.json');

const data = JSON.parse(readFileSync(source, 'utf8'));
writeFileSync(dest, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Copied tabler icons.json → ${dest}`);
