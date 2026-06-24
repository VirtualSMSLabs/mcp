import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getSharedClient } from "../shared-client.js";
import { handleFormatError } from "./error-handler.js";
import { ok } from "../types.js";

export function registerNotificationTools(server: McpServer): void {
  server.registerTool(
    "get_notifications",
    {
      description:
        "Get user notifications including penalties, low balance alerts, and admin messages. Returns {status, notifications: [{id, type, title, content, read, createdAt}], unreadCount}. Notification types include: penalty, penalty_lifted, low_balance, welcome, admin, general, info, warning, success, announcement, maintenance, payment_approved, payment_refunded, payment_error.",
      inputSchema: {},
    },
    async () => {
      try {
        const client = getSharedClient();
        const result = await client.getNotifications();
        return ok(result);
      } catch (e) {
        return handleFormatError(e);
      }
    }
  );
}
