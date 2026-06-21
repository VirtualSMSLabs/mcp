# Installation Guide

This guide covers installing the VirtualSMS MCP server in all major MCP-compatible IDEs.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- A VirtualSMS API key (from your [dashboard](https://virtualsms.de))

The MCP server is distributed via npm as `@virtualsmslabs/mcp`. All examples below use `npx -y @virtualsmslabs/mcp` which downloads and runs the latest version automatically.

---

## Claude Code

### Option A: CLI (recommended)

```bash
claude mcp add virtualsms \
  --env VIRTUALSMS_API_KEY=your_api_key_here \
  -- npx -y @virtualsmslabs/mcp
```

To use a non-default API URL or pool provider:

```bash
claude mcp add virtualsms \
  --env VIRTUALSMS_API_KEY=your_api_key_here \
  --env VIRTUALSMS_API_URL=https://api.virtualsms.de \
  --env VIRTUALSMS_POOL_PROVIDER=alpha \
  -- npx -y @virtualsmslabs/mcp
```

### Option B: Config file

Create `.mcp.json` in your project root (project scope, shared via VCS):

```json
{
  "mcpServers": {
    "virtualsms": {
      "command": "npx",
      "args": ["-y", "@virtualsmslabs/mcp"],
      "env": {
        "VIRTUALSMS_API_KEY": "${VIRTUALSMS_API_KEY}"
      }
    }
  }
}
```

Then set the env var in your shell or `.env`:

```bash
export VIRTUALSMS_API_KEY=your_api_key_here
```

### Verify

```bash
claude mcp list
claude mcp get virtualsms
```

---

## Claude Desktop

### Config file location

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

### Config

```json
{
  "mcpServers": {
    "virtualsms": {
      "command": "npx",
      "args": ["-y", "@virtualsmslabs/mcp"],
      "env": {
        "VIRTUALSMS_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Notes:**
- Claude Desktop does not support environment variable expansion — you must put your actual API key in the config.
- Restart Claude Desktop after making config changes.

---

## Cursor

### Config file location

- **Project:** `.cursor/mcp.json` in project root
- **Global:** `~/.cursor/mcp.json`

### Config

```json
{
  "mcpServers": {
    "virtualsms": {
      "command": "npx",
      "args": ["-y", "@virtualsmslabs/mcp"],
      "env": {
        "VIRTUALSMS_API_KEY": "${env:VIRTUALSMS_API_KEY}"
      },
      "envFile": "${workspaceFolder}/.env"
    }
  }
}
```

Create a `.env` file in your project root:

```
VIRTUALSMS_API_KEY=your_api_key_here
```

**Notes:**
- Cursor supports `${env:VAR_NAME}` expansion.
- The `envFile` field lets you reference a `.env` file for secrets.

---

## VS Code (Copilot Chat / GitHub Copilot)

### Config file location

- **Project:** `.vscode/mcp.json` in project root (shared via VCS)
- **User:** VS Code Settings JSON (`Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)")

### Project config (`.vscode/mcp.json`)

```json
{
  "servers": {
    "virtualsms": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@virtualsmslabs/mcp"],
      "env": {
        "VIRTUALSMS_API_KEY": "${input:virtualsmsApiKey}"
      }
    }
  },
  "inputs": [
    {
      "id": "virtualsmsApiKey",
      "type": "promptString",
      "description": "VirtualSMS API Key",
      "password": true
    }
  ]
}
```

**Notes:**
- VS Code uses `inputs` for secure prompting of secrets — the user is prompted once and the value is stored in the OS credential store.
- Alternatively, hardcode the key: `"VIRTUALSMS_API_KEY": "your_api_key_here"`

---

## Windsurf

### Config file location

- **Global:** `~/.codeium/windsurf/mcp_config.json`
- **Project:** `mcp_config.json` in project root

### Config

```json
{
  "mcpServers": {
    "virtualsms": {
      "command": "npx",
      "args": ["-y", "@virtualsmslabs/mcp"],
      "env": {
        "VIRTUALSMS_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Notes:**
- Windsurf does not support environment variable expansion — use the literal API key.
- Restart Windsurf after making config changes.

---

## Cline

### Config file location

- **Global:** `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` (macOS)
- **Windows:** `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- **Linux:** `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

### Config

```json
{
  "mcpServers": {
    "virtualsms": {
      "command": "npx",
      "args": ["-y", "@virtualsmslabs/mcp"],
      "env": {
        "VIRTUALSMS_API_KEY": "your_api_key_here"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**Notes:**
- Cline does not support environment variable expansion — use the literal API key.
- The `autoApprove` array lets you pre-approve specific tool names so they run without user confirmation.

---

## OpenCode

### Config file location

- **Project:** `opencode.jsonc` in project root
- **Global:** `~/.config/opencode/opencode.json`

### Config

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "virtualsms": {
      "type": "local",
      "command": ["npx", "-y", "@virtualsmslabs/mcp"],
      "enabled": true,
      "environment": {
        "VIRTUALSMS_API_KEY": "{env:VIRTUALSMS_API_KEY}"
      },
      "timeout": 10000
    }
  }
}
```

Then set the env var:

```bash
export VIRTUALSMS_API_KEY=your_api_key_here
```

**Notes:**
- OpenCode uses `{env:VAR_NAME}` for env var expansion (different from Claude Code's `${VAR}`).
- The `command` field is an array (not split into `command` + `args` like other hosts).
- The field is `environment` (not `env`).

---

## Verifying Installation

After installing in any IDE, verify the server is running:

1. Restart your IDE (if required)
2. Check the MCP server status — most IDEs show connected servers in their settings or status bar
3. Try asking your AI assistant: "What's my VirtualSMS balance?"

If the server fails to start, check:
- Your API key is correct (no trailing spaces or quotes)
- Node.js 18+ is installed: `node --version`
- The package can be fetched: `npx -y @virtualsmslabs/mcp --help`

---

## Troubleshooting

### "VIRTUALSMS_API_KEY is not set"

The environment variable is not reaching the MCP server process. Check:
- In Claude Desktop / Windsurf / Cline: you must use the literal key (no `${VAR}` expansion)
- In Claude Code / Cursor / OpenCode: ensure the env var is exported in your shell before launching the IDE

### "Request timed out"

The API may be unreachable. Check:
- Your internet connection
- The `VIRTUALSMS_API_URL` value (if overridden)
- Try a different `VIRTUALSMS_POOL_PROVIDER`

### "BAD_KEY" error

Your API key is invalid or expired. Generate a new one from the VirtualSMS dashboard.

### "NO_BALANCE" error

Your account has insufficient funds. Top up your balance at virtualsms.de.

### Server not appearing in IDE

- For Claude Desktop / Windsurf: fully quit and restart the app (not just reload)
- For Claude Code: run `claude mcp list` to verify registration
- For VS Code: check the Output panel (View → Output → select "MCP") for error messages
