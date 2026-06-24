import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSharedClient } from "../shared-client.js";
import { handleFormatError } from "./error-handler.js";
import { ok } from "../types.js";

export function registerActivationTools(server: McpServer): void {
  server.registerTool(
    "get_active_activations",
    {
      description:
        "Get all current active activations for your account. Returns {status, activeActivations: [{activationId, serviceCode, phoneNumber, activationCost, activationStatus, smsCode, smsText, activationTime, discount, repeated, countryCode, countryName}]}.",
      inputSchema: {},
    },
    async () => {
      try {
        const client = getSharedClient();
        const result = await client.getActiveActivations();
        return ok(result);
      } catch (e) {
        return handleFormatError(e);
      }
    }
  );

  server.registerTool(
    "check_extra_activation",
    {
      description:
        "Check if a number from a previous activation is available for an extra/additional activation. Returns {status, cost, service, phone, country} or error if not available.",
      inputSchema: {
        id: z
          .string()
          .describe("Original activation ID (required)"),
      },
    },
    async ({ id }) => {
      try {
        const client = getSharedClient();
        const result = await client.checkExtraActivation(parseInt(id, 10));
        return ok(result);
      } catch (e) {
        return handleFormatError(e);
      }
    }
  );

  server.registerTool(
    "get_extra_activation",
    {
      description:
        "Create an extra/additional activation on a previously used number. Returns {activationId, phoneNumber} on success. Requires the number to still be available (check with check_extra_activation first).",
      inputSchema: {
        id: z
          .string()
          .describe("Original activation ID (required)"),
      },
    },
    async ({ id }) => {
      try {
        const client = getSharedClient();
        const result = await client.getExtraActivation(parseInt(id, 10));
        return ok(result);
      } catch (e) {
        return handleFormatError(e);
      }
    }
  );

  server.registerTool(
    "set_activation_status",
    {
      description:
        "Change the status of an activation. Status codes: '1'=Ready (SMS sent, waiting for code), '3'=Retry (request another SMS), '6'=Finish (complete activation), '8'=Cancel. Cancel denied within 5 minutes of ordering. Frequent cancellations decrease your Trust Score.",
      inputSchema: {
        id: z.string().describe("Activation ID (required)"),
        status: z
          .enum(["1", "3", "6", "8"])
          .describe("Status code: '1'=ready, '3'=retry, '6'=finish, '8'=cancel"),
      },
    },
    async ({ id, status }) => {
      try {
        const client = getSharedClient();
        const result = await client.setStatus(
          parseInt(id, 10),
          parseInt(status, 10),
        );
        return ok({ success: true, action: result });
      } catch (e) {
        return handleFormatError(e);
      }
    }
  );

  server.registerTool(
    "get_activation_status",
    {
      description:
        "Get the current status of an activation (text format). Returns {status, code?}. Status values: STATUS_WAIT_CODE (waiting for SMS), STATUS_WAIT_RETRY (waiting after retry request), STATUS_OK (SMS received, code in 'code' field), STATUS_CANCEL (cancelled).",
      inputSchema: {
        id: z.string().describe("Activation ID (required)"),
      },
    },
    async ({ id }) => {
      try {
        const client = getSharedClient();
        const result = await client.getStatus(parseInt(id, 10));
        return ok(result);
      } catch (e) {
        return handleFormatError(e);
      }
    }
  );

  server.registerTool(
    "get_activation_status_v2",
    {
      description:
        "Get the current status of an activation (JSON format). Returns {status, code?, verificationType?, sms?, call?}. More detailed than get_activation_status — includes call/SMS verification details.",
      inputSchema: {
        id: z.string().describe("Activation ID (required)"),
      },
    },
    async ({ id }) => {
      try {
        const client = getSharedClient();
        const result = await client.getStatusV2(parseInt(id, 10));
        return ok(result);
      } catch (e) {
        return handleFormatError(e);
      }
    }
  );
}
