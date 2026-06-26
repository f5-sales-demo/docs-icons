# @f5-sales-demo/icons-f5xc

F5 Distributed Cloud (XC) service icons in Iconify JSON format with an Astro component.

## Icons (30)

| Icon Name | Description |
| --- | --- |
| `account-protection` | Account Protection |
| `administration` | Administration |
| `ai_assistant_logo` | AI Assistant |
| `application-traffic-insight` | Application Traffic Insight |
| `audit-logs-and-alerts` | Audit Logs and Alerts |
| `authentication-intelligence` | Authentication Intelligence |
| `big-ip-apm` | BIG-IP APM |
| `big_ip_utilities` | BIG-IP Utilities |
| `billing` | Billing |
| `bot-defense` | Bot Defense |
| `client-side-defense` | Client-Side Defense |
| `content-delivery-network` | Content Delivery Network |
| `data-intelligence` | Data Intelligence |
| `ddos-and-transit-services` | DDoS and Transit Services |
| `delegated-access` | Delegated Access |
| `distributed-apps` | Distributed Apps |
| `dns-management` | DNS Management |
| `doc` | Documentation |
| `mobile_app_shield` | Mobile App Shield |
| `multi-cloud-app-connect` | Multi-Cloud App Connect |
| `multi-cloud-network-connect` | Multi-Cloud Network Connect |
| `nginx-one` | NGINX One |
| `observability` | Observability |
| `platform` | Platform |
| `shared-configuration` | Shared Configuration |
| `support` | Support |
| `user-support` | User Support |
| `voltshare` | VoltShare |
| `web-app-and-api-protection` | Web App & API Protection |
| `web-app-scanning` | Web App Scanning |

## Usage (Astro)

```astro
---
import Icon from '@f5-sales-demo/icons-f5xc/Icon.astro';
---

<Icon name="web-app-and-api-protection" size="2em" />
<Icon name="multi-cloud-network-connect" size="1.5em" label="Multi-Cloud Network Connect" />
```

## Usage (JSON)

```js
import icons from '@f5-sales-demo/icons-f5xc';
// icons.prefix === 'f5xc'
// icons.icons['bot-defense'].body === '<svg body...>'
```

## Build

```bash
node scripts/build.mjs
```

Reads SVGs from `svg/` and produces `icons.json`.

## License

MIT
