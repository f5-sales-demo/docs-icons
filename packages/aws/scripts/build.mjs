#!/usr/bin/env node

/**
 * Fetches pre-built Iconify JSON for AWS architecture icons from GitHub.
 *
 * Source: awslabs/aws-icons-for-plantuml (aws-icons-mermaid.json)
 * - Already in complete Iconify JSON format
 * - ~885 icons with per-icon width/height overrides (48 default, 64 services, 74 categories)
 * - Color icons with palette: true (inline fills)
 * - License: CC-BY-ND 2.0
 */

import { writeFileSync } from 'node:fs';
import https from 'node:https';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outFile = join(__dirname, '..', 'icons.json');

const url = 'https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/main/dist/aws-icons-mermaid.json';

function fetch(href) {
  return new Promise((resolve, reject) => {
    https
      .get(href, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetch(res.headers.location).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${href}`));
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

const raw = await fetch(url);
const data = JSON.parse(raw);

writeFileSync(outFile, `${JSON.stringify(data, null, 2)}\n`);

const count = Object.keys(data.icons).length;
console.log(`Fetched ${count} AWS icons → ${outFile}`);
