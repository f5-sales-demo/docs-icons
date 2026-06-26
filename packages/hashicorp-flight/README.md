# @f5-sales-demo/icons-hashicorp-flight

HashiCorp Flight icons in Iconify JSON format with an Astro component wrapper.

## Contents

- ~671 icons at 24px covering cloud infrastructure, vendor logos, and UI elements
- Single `icons.json` file in Iconify JSON format
- Color variants (vendor logos) preserved with original colors

## Usage

```astro
---
import FlightIcon from '@f5-sales-demo/icons-hashicorp-flight/Icon.astro';
---

<FlightIcon name="terraform" />
<FlightIcon name="cloud" size="2rem" />
<FlightIcon name="aws-color" label="Amazon Web Services" />
```

## Props

| Prop | Type | Default | Description |
| ------ | ------ | --------- | ------------- |
| `name` | `string` | — | **Required.** Flight icon name (without `-24` suffix) |
| `size` | `string` | `'1.5em'` | Width and height |
| `label` | `string` | — | Accessible label |
| `class` | `string` | — | CSS class(es) |

## Building

Requires `@hashicorp/flight-icons` to be installed (listed as dependency):

```bash
npm install
node scripts/build.mjs
```

Reads 24px SVGs from the installed `@hashicorp/flight-icons` package,
converts to Iconify JSON, outputs `icons.json`.
