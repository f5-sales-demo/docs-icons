# @f5-sales-demo/icons-tabler

Tabler icons with an Astro component wrapper. Wraps `@iconify-json/tabler`.

## Usage

```astro
---
import TablerIcon from '@f5-sales-demo/icons-tabler/Icon.astro';
---

<TablerIcon name="shield" />
<TablerIcon name="database" size="2rem" />
<TablerIcon name="lock" label="Locked" />
```

## Props

| Prop | Type | Default | Description |
| ------ | ------ | --------- | ------------- |
| `name` | `string` | — | **Required.** Tabler icon name |
| `size` | `string` | `'1.5em'` | Width and height |
| `label` | `string` | — | Accessible label |
| `class` | `string` | — | CSS class(es) |

Browse all icons at [tabler.io/icons](https://tabler.io/icons).
