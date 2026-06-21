# LLM Guide: Self-Installing the VirtualSMS MCP Server

> This document is written for LLMs (AI assistants) that need to install the VirtualSMS MCP server on a user's machine without human assistance. If you are an LLM reading this, follow the instructions below.

## What This MCP Server Provides

The VirtualSMS MCP server (`@virtualsmslabs/mcp`) is an npm package that wraps the VirtualSMS Consumer API. It exposes 18 tools for purchasing virtual phone numbers, retrieving SMS verification codes, checking prices, and managing activations.

**Package:** `@virtualsmslabs/mcp`
**Runtime:** Node.js 18+
**Transport:** stdio
**npm command:** `npx -y @virtualsmslabs/mcp`

### Required Environment Variable

| Variable | Required | Description |
|----------|----------|-------------|
| `VIRTUALSMS_API_KEY` | **Yes** | The user's VirtualSMS API key |

### Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VIRTUALSMS_API_URL` | `https://api.virtualsms.de` | Base API URL |
| `VIRTUALSMS_POOL_PROVIDER` | (none) | Provider alias: `alpha`, `prime`, `gamma`, `zeta` |

### Available Tools (18)

1. `get_balance` — Check account balance
2. `get_numbers_status` — Check number availability per service/country
3. `get_countries` — List all countries
4. `get_services_list` — List services for a country
5. `get_operators` — List operators for a country
6. `get_prices` — Get service prices
7. `get_prices_extended` — Get prices with price tiers
8. `get_prices_verification` — Get prices by service→country
9. `get_top_countries_by_service` — Top 10 countries by share/rate
10. `order_number` — Purchase a phone number
11. `order_number_v2` — Purchase with JSON response
12. `get_active_activations` — List active activations
13. `check_extra_activation` — Check if extra activation is available
14. `get_extra_activation` — Create extra activation
15. `set_activation_status` — Set status (ready/retry/finish/cancel)
16. `get_activation_status` — Get status (text format)
17. `get_activation_status_v2` — Get status (JSON format)
18. `get_notifications` — Get account notifications

---

## Step 1: Detect the User's IDE

Before installing, determine which IDE the user is running. Check for these config files and directories:

### Detection Rules (check in order)

1. **Claude Code** — Check if the user is currently in a Claude Code session. Look for:
   - `~/.claude.json` or `~/.claude/` directory
   - `claude` command available in PATH
   - If you are Claude Code, you can use `claude mcp add` directly

2. **Claude Desktop** — Check for:
   - macOS: `~/Library/Application Support/Claude/`
   - Windows: `%APPDATA%\Claude\`
   - If `claude_desktop_config.json` exists in that directory

3. **Cursor** — Check for:
   - `~/.cursor/` directory
   - `.cursor/mcp.json` in the current project

4. **VS Code (Copilot Chat)** — Check for:
   - `.vscode/` directory in the current project
   - VS Code process running (check with `pgrep -f "code" ` on macOS/Linux or `tasklist | findstr Code.exe` on Windows)

5. **Windsurf** — Check for:
   - `~/.codeium/windsurf/` directory
   - Windsurf process running

6. **Cline** — Check for:
   - VS Code with the Cline extension installed
   - `cline_mcp_settings.json` in VS Code global storage

7. **OpenCode** — Check for:
   - `opencode.jsonc` in project root
   - `~/.config/opencode/` directory
   - If you are OpenCode, you can modify `opencode.jsonc` directly

### If You Cannot Determine the IDE

Ask the user: "Which IDE are you using? (Claude Code, Claude Desktop, Cursor, VS Code, Windsurf, Cline, or OpenCode)"

---

## Step 2: Get the API Key

You need the user's VirtualSMS API key. If they haven't provided it:

> "I need your VirtualSMS API key to install the MCP server. You can find it in your VirtualSMS dashboard at https://virtualsms.de/dev"

Do **not** generate or guess API keys. The key must come from the user.

---

## Step 3: Install for the Detected IDE

### Claude Code

Run this command (you can use the `claude mcp add` CLI):

```bash
claude mcp add virtualsms \
  --env VIRTUALSMS_API_KEY=<USER_API_KEY> \
  -- npx -y @virtualsmslabs/mcp
```

**Or** create/edit `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    "virtualsms": {
      "command": "npx",
      "args": ["-y", "@virtualsmslabs/mcp"],
      "env": {
        "VIRTUALSMS_API_KEY": "<USER_API_KEY>"
      }
    }
  }
}
```

### Claude Desktop

Edit `claude_desktop_config.json`:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "virtualsms": {
      "command": "npx",
      "args": ["-y", "@virtualsmslabs/mcp"],
      "env": {
        "VIRTUALSMS_API_KEY": "<USER_API_KEY>"
      }
    }
  }
}
```

**Important:** Use the literal API key value (no `${VAR}` expansion). Restart Claude Desktop after editing.

### Cursor

Create or edit `.cursor/mcp.json` in the project root:

```json
{
  "mcpServers": {
    "virtualsms": {
      "command": "npx",
      "args": ["-y", "@virtualsmslabs/mcp"],
      "env": {
        "VIRTUALSMS_API_KEY": "<USER_API_KEY>"
      }
    }
  }
}
```

### VS Code (Copilot Chat)

Create or edit `.vscode/mcp.json` in the project root:

```json
{
  "servers": {
    "virtualsms": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@virtualsmslabs/mcp"],
      "env": {
        "VIRTUALSMS_API_KEY": "<USER_API_KEY>"
      }
    }
  }
}
```

### Windsurf

Create or edit `mcp_config.json`:
- **Global:** `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "virtualsms": {
      "command": "npx",
      "args": ["-y", "@virtualsmslabs/mcp"],
      "env": {
        "VIRTUALSMS_API_KEY": "<USER_API_KEY>"
      }
    }
  }
}
```

Use the literal API key value. Restart Windsurf after editing.

### Cline

Edit `cline_mcp_settings.json` in VS Code global storage:
- **macOS:** `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- **Windows:** `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "virtualsms": {
      "command": "npx",
      "args": ["-y", "@virtualsmslabs/mcp"],
      "env": {
        "VIRTUALSMS_API_KEY": "<USER_API_KEY>"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### OpenCode

Create or edit `opencode.jsonc` in the project root:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "virtualsms": {
      "type": "local",
      "command": ["npx", "-y", "@virtualsmslabs/mcp"],
      "enabled": true,
      "environment": {
        "VIRTUALSMS_API_KEY": "<USER_API_KEY>"
      },
      "timeout": 10000
    }
  }
}
```

**Note:** OpenCode uses `environment` (not `env`), `{env:VAR}` syntax for expansion (not `${VAR}`), and `command` is an array.

---

## Step 4: Verify Installation

After installing, verify the MCP server is working:

1. Restart the IDE if required (Claude Desktop, Windsurf, Cline all require restart)
2. Check server connection status in the IDE's MCP panel
3. Test by calling the `get_balance` tool — it should return `{"balance": <number>}`
4. If the tool returns `{"error": "BAD_KEY", "message": "Invalid or missing API key."}`, the API key is wrong

### Common Verification Commands

```bash
# Claude Code
claude mcp list
claude mcp get virtualsms

# Check Node.js version
node --version  # Should be >= 18

# Test the package directly
npx -y @virtualsmslabs/mcp
# Should start without errors (it will wait for stdin — press Ctrl+C to exit)
```

---

## Step 5: Common Error Recovery

| Error | Cause | Fix |
|-------|-------|-----|
| `VIRTUALSMS_API_KEY is not set` | Env var not reaching the process | Use literal key value in config (not `${VAR}`) for Claude Desktop, Windsurf, Cline |
| `BAD_KEY` | Invalid API key | Ask user for a new key from their dashboard |
| `Request timed out` | API unreachable or wrong URL | Check `VIRTUALSMS_API_URL` override |
| `npx: command not found` | Node.js not installed | Install Node.js 18+ from https://nodejs.org/ |
| Server not appearing | IDE not restarted or config invalid | Restart IDE, validate JSON syntax |

---

## Example Workflow for LLMs

Once the MCP server is installed, you can help the user with SMS verification workflows:

### Check Balance
```
User: "What's my VirtualSMS balance?"
→ Call get_balance → returns {"balance": 15.50}
```

### Find Prices
```
User: "How much does a WhatsApp number cost in Brazil?"
→ Call get_prices(service="wa", country="73")
→ returns {"73": {"wa": {"cost": 0.50, "count": 50}}}
```

### Order and Receive SMS
```
User: "Get me a Telegram number in Argentina and wait for the SMS code"
→ Call order_number(service="tg", country="39") → returns {"activationId": "12345", "phoneNumber": "549..."}
→ Call set_activation_status(id="12345", status="1") → returns {"success": true, "action": "ready"}
→ Call get_activation_status(id="12345") → poll every 5-10 seconds
→ Returns {"status": "STATUS_OK", "code": "123456"} when SMS arrives
→ Call set_activation_status(id="12345", status="6") → finish activation
→ Tell user: "Your Telegram verification code is 123456"
```

### Cancel an Activation
```
User: "Cancel my last activation"
→ Call get_active_activations → find the latest activationId
→ Call set_activation_status(id="12345", status="8") → returns {"success": true, "action": "cancel"}
```

**Note on polling:** MCP tool calls are synchronous — do not call `get_activation_status` in a tight loop. Wait 5-10 seconds between checks, and inform the user that you are waiting for the SMS to arrive.
