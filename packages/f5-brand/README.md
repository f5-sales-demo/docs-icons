# @f5-sales-demo/icons-f5-brand

F5 brand icons in Iconify JSON format with an Astro component wrapper.

## Contents

- **665 icons** covering networking, security, cloud, AI, and other technology domains
- All icons are 50x50 SVG line art with `currentColor` for theme adaptability
- Single `icons.json` file in Iconify JSON format

## Usage

```astro
---
import F5Icon from '@f5-sales-demo/icons-f5-brand/Icon.astro';
---

<F5Icon name="ai-admin" />
<F5Icon name="ai-admin" size="2rem" />
<F5Icon name="ai-admin" label="Admin icon" />
```

## Props

| Prop | Type | Default | Description |
| ------ | ------ | --------- | ------------- |
| `name` | `string` | — | **Required.** Icon name (see `icons.json` for available names) |
| `size` | `string` | `'1.5em'` | Width and height of the icon |
| `label` | `string` | — | Accessible label. When set, icon gets `role="img"` and `aria-label` |
| `class` | `string` | — | CSS class(es) to apply to the SVG element |

## Building

```bash
node scripts/build.mjs
```

Reads SVGs from `svg/`, converts to Iconify JSON, outputs `icons.json`.
