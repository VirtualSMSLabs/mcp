import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callApi, buildParams, isApiError, makeApiError } from "../client.js";
import {
  parseStatus,
  parseSetStatus,
  parseActivation,
} from "../parser.js";
import { ok, err } from "../types.js";

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
        const response = await callApi(buildParams("getActiveActivations"));
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
        const response = await callApi(
          buildParams("checkExtraActivation", { id })
        );
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
        const response = await callApi(
          buildParams("getExtraActivation", { id })
        );
        if (isApiError(response.raw)) {
          return ok(makeApiError(response.raw));
        }
        const parsed = parseActivation(response.raw);
        return ok(parsed);
      } catch (e) {
        return err(e instanceof Error ? e.message : String(e));
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
        const response = await callApi(
          buildParams("setStatus", { id, status })
        );
        if (isApiError(response.raw)) {
          return ok(makeApiError(response.raw));
        }
        const parsed = parseSetStatus(response.raw);
        return ok(parsed);
      } catch (e) {
        return err(e instanceof Error ? e.message : String(e));
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
        const response = await callApi(
          buildParams("getStatus", { id })
        );
        if (isApiError(response.raw)) {
          return ok(makeApiError(response.raw));
        }
        const parsed = parseStatus(response.raw);
        return ok(parsed);
      } catch (e) {
        return err(e instanceof Error ? e.message : String(e));
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
        const response = await callApi(
          buildParams("getStatusV2", { id })
        );
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
