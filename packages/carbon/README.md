# @f5-sales-demo/icons-carbon

Carbon Design icons with an Astro component wrapper. Wraps `@iconify-json/carbon`.

## Usage

```astro
---
import CarbonIcon from '@f5-sales-demo/icons-carbon/Icon.astro';
---

<CarbonIcon name="cloud" />
<CarbonIcon name="analytics" size="2rem" />
<CarbonIcon name="security" label="Security" />
```

## Props

| Prop | Type | Default | Description |
| ------ | ------ | --------- | ------------- |
| `name` | `string` | — | **Required.** Carbon icon name |
| `size` | `string` | `'1.5em'` | Width and height |
| `label` | `string` | — | Accessible label |
| `class` | `string` | — | CSS class(es) |

Browse all icons at [carbondesignsystem.com/guidelines/icons/library](https://carbondesignsystem.com/guidelines/icons/library/).
