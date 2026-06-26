# @f5-sales-demo/icons-phosphor

Phosphor icons with an Astro component wrapper. Wraps `@iconify-json/ph`.

## Usage

```astro
---
import PhosphorIcon from '@f5-sales-demo/icons-phosphor/Icon.astro';
---

<PhosphorIcon name="globe" />
<PhosphorIcon name="lightning" size="2rem" />
<PhosphorIcon name="shield-check" label="Verified" />
```

## Props

| Prop | Type | Default | Description |
| ------ | ------ | --------- | ------------- |
| `name` | `string` | — | **Required.** Phosphor icon name |
| `size` | `string` | `'1.5em'` | Width and height |
| `label` | `string` | — | Accessible label |
| `class` | `string` | — | CSS class(es) |

Browse all icons at [phosphoricons.com](https://phosphoricons.com/).
