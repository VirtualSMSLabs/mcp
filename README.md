# VirtualSMS MCP Server

[![npm version](https://img.shields.io/npm/v/@virtualsmslabs/mcp.svg)](https://www.npmjs.com/package/@virtualsmslabs/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that wraps the [VirtualSMS](https://virtualsms.de) Consumer API, allowing AI assistants like Claude, Cursor, and Copilot to purchase virtual phone numbers, retrieve SMS verification codes, and manage activations — all through natural language.

## What is VirtualSMS?

[VirtualSMS](https://virtualsms.de) is a platform for renting virtual phone numbers for SMS verification. It supports 200+ services (Telegram, WhatsApp, Google, Instagram, etc.) across 100+ countries with multiple provider backends.

## What This MCP Server Does

This MCP server exposes **19 tools** that map 1:1 to the VirtualSMS Consumer API actions. It normalizes the API's mixed text/JSON responses into clean structured JSON that LLMs can reason about.

### Tool Categories

| Category | Tools | Purpose |
|----------|-------|---------|
| **Account** | `get_balance`, `get_rate_limit_info` | Check account balance and rate limit status |
| **Information & Pricing** | `get_numbers_status`, `get_countries`, `get_services_list`, `get_operators`, `get_prices`, `get_prices_extended`, `get_prices_verification`, `get_top_countries_by_service` | Browse availability, services, and pricing |
| **Ordering** | `order_number`, `order_number_v2` | Purchase virtual phone numbers |
| **Activation Management** | `get_active_activations`, `check_extra_activation`, `get_extra_activation`, `set_activation_status`, `get_activation_status`, `get_activation_status_v2` | Manage ordered numbers and retrieve SMS codes |
| **Notifications** | `get_notifications` | View account alerts and penalties |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- A VirtualSMS API key (available from your [VirtualSMS dashboard](https://virtualsms.de))

### 3-Step Setup

1. **Get your API key** from the VirtualSMS dashboard.

2. **Add the MCP server to your IDE** — see [INSTALL.md](docs/INSTALL.md) for IDE-specific instructions. The short version for Claude Code:

   ```bash
   claude mcp add virtualsms --env VIRTUALSMS_API_KEY=your_api_key_here -- npx -y @virtualsmslabs/mcp
   ```

3. **Start using it** — ask your AI assistant:

   > "Check my VirtualSMS balance"
   > "Get prices for Telegram in Brazil"
   > "Order a number for WhatsApp in Argentina, then check for the SMS code"

## Configuration

All configuration is via environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VIRTUALSMS_API_KEY` | **Yes** | — | Your VirtualSMS API key |
| `VIRTUALSMS_API_URL` | No | `https://api.virtualsms.de` | Base API URL (override for self-hosted or testing) |
| `VIRTUALSMS_POOL_PROVIDER` | No | — | Default provider alias: `alpha`, `prime`, `gamma`, or `zeta` |

### Pool Providers

VirtualSMS supports multiple upstream providers behind aliases:

| Alias | Description |
|-------|-------------|
| `alpha` | Default provider (alpha provider) |
| `prime` | prime provider |
| `gamma` | gamma provider |
| `zeta` | zeta provider |

If `VIRTUALSMS_POOL_PROVIDER` is not set, the platform auto-routes to the best available provider. You can override it per-call using the `poolProvider` parameter on most tools.

## Tool Reference

### Account

#### `get_balance`
Get current account balance.
- **Parameters:** None
- **Returns:** `{ balance: number }`

#### `get_rate_limit_info`
Get rate limit information from the most recent API call.
- **Parameters:** None
- **Returns:** `{ rateLimit: { limit: number, remaining: number } | null }`

Returns `null` if no API call has been made yet or the API did not return rate limit headers. The `limit` is the maximum number of requests per window, and `remaining` is how many are left. This information is updated automatically after every other tool call.

### Information & Pricing

#### `get_numbers_status`
Get quantity of available numbers per service.
- **Parameters:** `country?`, `operator?`, `poolProvider?`
- **Returns:** `{ "serviceCode_countryId": count, ... }`

#### `get_countries`
Get list of all available countries.
- **Parameters:** `poolProvider?`
- **Returns:** Map of `countryId` → `{ id, rus, eng, chn, visible, retry, rent, multiService }`

#### `get_services_list`
Get available services for a country.
- **Parameters:** `country?`, `poolProvider?`
- **Returns:** `{ status, services: [{ code, name }] }`

#### `get_operators`
Get available mobile operators for a country.
- **Parameters:** `country` (required), `poolProvider?`
- **Returns:** `{ status, countryOperators: ["any", "claro", "vivo", ...] }`

#### `get_prices`
Get current prices for services.
- **Parameters:** `service?`, `country?`, `poolProvider?`
- **Returns:** `{ countryId: { serviceCode: { cost, count } } }`

#### `get_prices_extended`
Get prices with price tiers.
- **Parameters:** `service?`, `country?`, `freePrice?`, `poolProvider?`
- **Returns:** `{ countryId: { serviceCode: { cnt, physicalCount, freePriceMap, cost } } }`

#### `get_prices_verification`
Get prices organized by service then country.
- **Parameters:** `service?`, `poolProvider?`
- **Returns:** `{ serviceCode: { countryId: { count, price } } }`

#### `get_top_countries_by_service`
Get top 10 countries by purchase share and success rate.
- **Parameters:** `service` (required)
- **Returns:** `[{ country, share, rate }]`

### Ordering

#### `order_number`
Purchase a virtual phone number for SMS verification.
- **Parameters:** `service` (required), `country` (required), `maxPrice?`, `operator?`, `phoneException?`, `forward?`, `activationType?`, `language?`, `useCashBack?`, `userId?`, `ref?`, `poolProvider?`
- **Returns:** `{ activationId, phoneNumber }`

#### `order_number_v2`
Purchase a virtual phone number with richer JSON response.
- **Parameters:** Same as `order_number` + `orderId?`
- **Returns:** `{ activationId, phoneNumber, activationCost, countryCode, canGetAnotherSms, activationTime }`

### Activation Management

#### `get_active_activations`
Get all current active activations.
- **Parameters:** None
- **Returns:** `{ status, activeActivations: [{ activationId, serviceCode, phoneNumber, activationCost, activationStatus, smsCode, smsText, ... }] }`

#### `check_extra_activation`
Check if a number is available for extra activation.
- **Parameters:** `id` (required — original activation ID)
- **Returns:** `{ status, cost, service, phone, country }`

#### `get_extra_activation`
Create an extra activation on a previously used number.
- **Parameters:** `id` (required)
- **Returns:** `{ activationId, phoneNumber }`

#### `set_activation_status`
Change activation status.
- **Parameters:** `id` (required), `status` (required — `"1"` ready, `"3"` retry, `"6"` finish, `"8"` cancel)
- **Returns:** `{ success: boolean, action: string }`

#### `get_activation_status`
Get activation status (text format).
- **Parameters:** `id` (required)
- **Returns:** `{ status, code? }` — status is one of `STATUS_WAIT_CODE`, `STATUS_WAIT_RETRY`, `STATUS_OK`, `STATUS_CANCEL`

#### `get_activation_status_v2`
Get activation status (JSON format, more detailed).
- **Parameters:** `id` (required)
- **Returns:** `{ status, code?, verificationType?, sms?, call? }`

### Notifications

#### `get_notifications`
Get user notifications (penalties, low balance, admin messages).
- **Parameters:** None
- **Returns:** `{ status, notifications: [{ id, type, title, content, read, createdAt }], unreadCount }`

## Error Handling

The VirtualSMS API uses text-based error codes. This MCP server normalizes them into structured JSON error objects:

```json
{
  "error": "NO_NUMBERS",
  "message": "No phone numbers available for the requested service/country."
}
```

Errors are returned as tool results (not thrown as exceptions), so the LLM can reason about them and take corrective action.

### Common Error Codes

| Code | Meaning |
|------|---------|
| `BAD_KEY` | Invalid or missing API key |
| `NO_BALANCE` | Insufficient account balance |
| `NO_NUMBERS` | No phone numbers available |
| `WRONG_SERVICE` | Invalid service code |
| `WRONG_COUNTRY` | Invalid or missing country ID |
| `WRONG_ACTIVATION_ID` | Invalid activation ID |
| `EARLY_CANCEL_DENIED` | Cannot cancel within 5 minutes of ordering |
| `BANNED` | Account is blocked or rate-limited (HTTP 429) |
| `CONCURRENT_LIMIT` | Concurrent activation limit reached (HTTP 429) |
| `NO_ACTIVATION` | No activation found with the given ID |

### Rate Limiting

The API enforces rate limits and returns `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers on every response. When the rate limit is exceeded (HTTP 429), the API returns a `Retry-After` header indicating how many seconds to wait before retrying.

The MCP server captures these headers automatically. Use the `get_rate_limit_info` tool to check your current rate limit status at any time. When a rate limit error occurs, the error response includes:

```json
{
  "error": "BANNED",
  "message": "Account or IP has been banned",
  "httpStatus": 429,
  "retryAfter": 60,
  "rateLimitLimit": 100,
  "rateLimitRemaining": 0
}
```

## Installation Guides

For step-by-step installation instructions for your specific IDE, see:

- **[docs/INSTALL.md](docs/INSTALL.md)** — Covers Claude Code, Claude Desktop, Cursor, VS Code (Copilot Chat), Windsurf, Cline, and OpenCode

## Guide for LLMs

If you are an LLM looking to install this MCP server autonomously, see:

- **[docs/LLM-GUIDE.md](docs/LLM-GUIDE.md)** — Machine-readable instructions for self-installation

## Typical Workflow

Here's a typical SMS verification workflow using the MCP tools:

```
1. get_balance                          → Check you have funds
2. get_prices(service="wa", country="73") → Check price and availability
3. order_number(service="wa", country="73") → Purchase a number → get activationId
4. set_activation_status(id, status="1")  → Signal "ready to receive SMS"
5. get_activation_status(id)              → Poll until STATUS_OK:{code}
6. set_activation_status(id, status="6")  → Finish the activation
```

## Development

```bash
git clone https://github.com/VirtualSMSLabs/mcp.git
cd mcp
npm install
npm run build
npm start
```

### Testing with MCP Inspector

```bash
npm run inspector
```

This launches the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) — a web UI for interactively testing MCP tools.

## License

[MIT](LICENSE) — Copyright (c) 2026 VirtualSMS Labs

## Links

- [VirtualSMS Website](https://virtualsms.de)
- [API Documentation](https://virtualsms.de/dev)
- [GitHub Repository](https://github.com/VirtualSMSLabs/mcp)
- [npm Package](https://www.npmjs.com/package/@virtualsmslabs/mcp)
- [Report an Issue](https://github.com/VirtualSMSLabs/mcp/issues)
