# @f5-sales-demo/icons-lucide

Lucide icons with an Astro component wrapper. Wraps `@iconify-json/lucide`.

## Usage

```astro
---
import LucideIcon from '@f5-sales-demo/icons-lucide/Icon.astro';
---

<LucideIcon name="rocket" />
<LucideIcon name="heart" size="2rem" />
<LucideIcon name="star" label="Favorite" />
```

## Props

| Prop | Type | Default | Description |
| ------ | ------ | --------- | ------------- |
| `name` | `string` | — | **Required.** Lucide icon name |
| `size` | `string` | `'1.5em'` | Width and height |
| `label` | `string` | — | Accessible label |
| `class` | `string` | — | CSS class(es) |

Browse all icons at [lucide.dev/icons](https://lucide.dev/icons).
