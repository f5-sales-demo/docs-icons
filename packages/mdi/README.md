# @f5-sales-demo/icons-mdi

Material Design Icons with an Astro component wrapper. Wraps `@iconify-json/mdi`.

## Usage

```astro
---
import MdiIcon from '@f5-sales-demo/icons-mdi/Icon.astro';
---

<MdiIcon name="database" />
<MdiIcon name="cloud" size="2rem" />
<MdiIcon name="shield-check" label="Security verified" />
```

## Props

| Prop | Type | Default | Description |
| ------ | ------ | --------- | ------------- |
| `name` | `string` | — | **Required.** MDI icon name |
| `size` | `string` | `'1.5em'` | Width and height |
| `label` | `string` | — | Accessible label |
| `class` | `string` | — | CSS class(es) |

Browse all icons at [pictogrammers.com/library/mdi](https://pictogrammers.com/library/mdi/).
