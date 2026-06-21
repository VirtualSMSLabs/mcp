import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callApi, buildParams, isApiError, makeApiError } from "../client.js";
import { ok, err } from "../types.js";

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
        const response = await callApi(buildParams("getNotifications"));
        if (response.isJson && response.json) return ok(response.json);
        if (isApiError(response.raw)) {
          return ok(makeApiError(response.raw));
        }
        return ok({ raw: response.raw });
      } catch (e) {
        return err(e instanceof Error ? e.message : String(e));
      }
    }
  );
}
