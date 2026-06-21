import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callApi, buildParams } from "../client.js";
import { parseBalance } from "../parser.js";
import { ok, err } from "../types.js";

export function registerBalanceTools(server: McpServer): void {
  server.registerTool(
    "get_balance",
    {
      description:
        "Get the current account balance for your VirtualSMS API key. Returns the balance in account currency. No parameters needed.",
      inputSchema: {},
    },
    async () => {
      try {
        const response = await callApi(buildParams("getBalance"));
        const parsed = parseBalance(response.raw);
        return ok(parsed);
      } catch (e) {
        return err(e instanceof Error ? e.message : String(e));
      }
    }
  );
}
