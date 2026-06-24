import { getSharedClient } from "../shared-client.js";
import { handleFormatError } from "./error-handler.js";
import { ok } from "../types.js";

export async function handleGetBalance() {
  try {
    const client = getSharedClient();
    const balance = await client.getBalance();
    return ok(balance);
  } catch (e) {
    return handleFormatError(e);
  }
}

export function registerBalanceTools(server: import("@modelcontextprotocol/sdk/server/mcp.js").McpServer): void {
  server.registerTool(
    "get_balance",
    {
      description:
        "Get the current account balance for your VirtualSMS API key. Returns the balance in account currency. No parameters needed.",
      inputSchema: {},
    },
    async () => handleGetBalance()
  );
}
