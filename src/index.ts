#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config, validateConfig } from "./config.js";
import { registerBalanceTools } from "./tools/balance.js";
import { registerInfoTools } from "./tools/info.js";
import { registerPricingTools } from "./tools/pricing.js";
import { registerOrderingTools } from "./tools/ordering.js";
import { registerActivationTools } from "./tools/activation.js";
import { registerNotificationTools } from "./tools/notifications.js";
import { registerRateLimitTools } from "./tools/rate-limit-register.js";

validateConfig();

const server = new McpServer({
  name: "virtualsms-mcp",
  version: "1.1.1",
});

registerBalanceTools(server);
registerInfoTools(server);
registerPricingTools(server);
registerOrderingTools(server);
registerActivationTools(server);
registerNotificationTools(server);
registerRateLimitTools(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `VirtualSMS MCP server running on stdio (endpoint: ${config.apiUrl}/stubs/handler_api)`
  );
  if (!config.apiKey) {
    console.error(
      "WARNING: VIRTUALSMS_API_KEY is not set — all API calls will fail until configured."
    );
  }
}

main().catch((error) => {
  console.error("Fatal error starting VirtualSMS MCP server:", error);
  process.exit(1);
});
