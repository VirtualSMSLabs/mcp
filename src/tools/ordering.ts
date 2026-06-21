import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callApi, buildParams, isApiError, makeApiError } from "../client.js";
import { parseActivation } from "../parser.js";
import { ok, err } from "../types.js";

const orderNumberSchema = {
  service: z.string().describe("Service code (required, e.g. 'tg' for Telegram)"),
  country: z.string().describe("Country ID (required, e.g. '0', '39', '73')"),
  maxPrice: z
    .number()
    .optional()
    .describe("Maximum price willing to pay"),
  operator: z
    .string()
    .optional()
    .describe("Mobile operator filter (e.g. 'claro'). Use 'any' for no preference."),
  phoneException: z
    .string()
    .optional()
    .describe("Phone prefixes to exclude (comma-separated, e.g. '123,456')"),
  forward: z
    .enum(["0", "1"])
    .optional()
    .describe("Enable call forwarding: '0' (no) or '1' (yes). Support varies by provider."),
  activationType: z
    .enum(["0", "1", "2"])
    .optional()
    .describe("Activation type: '0'=SMS, '1'=number, '2'=voice"),
  language: z
    .string()
    .optional()
    .describe("Language for voice activation (e.g. 'en', 'pt')"),
  useCashBack: z
    .enum(["true", "false"])
    .optional()
    .describe("Use cashback balance first"),
  userId: z
    .string()
    .optional()
    .describe("End-user ID for statistics and blocking"),
  ref: z.string().optional().describe("Referral ID for tracking"),
  poolProvider: z
    .enum(["alpha", "prime", "gamma", "zeta"])
    .optional()
    .describe("Provider alias. Overrides the VIRTUALSMS_POOL_PROVIDER env var."),
};

export function registerOrderingTools(server: McpServer): void {
  server.registerTool(
    "order_number",
    {
      description:
        "Order a virtual phone number for SMS verification. Returns {activationId, phoneNumber}. Use the activationId with set_activation_status and get_activation_status. If no numbers are available, the API returns NO_NUMBERS error. If insufficient balance, returns NO_BALANCE.",
      inputSchema: orderNumberSchema,
    },
    async (params) => {
      try {
        const response = await callApi(
          buildParams("getNumber", params as Record<string, string | number | boolean | undefined>)
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
    "order_number_v2",
    {
      description:
        "Order a virtual phone number with a richer JSON response. Returns {activationId, phoneNumber, activationCost, countryCode, canGetAnotherSms, activationTime}. Same parameters as order_number plus an optional orderId for idempotency.",
      inputSchema: {
        ...orderNumberSchema,
        orderId: z
          .string()
          .optional()
          .describe("Order ID for idempotency (not enforced by all providers)"),
      },
    },
    async (params) => {
      try {
        const response = await callApi(
          buildParams("getNumberV2", params as Record<string, string | number | boolean | undefined>)
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
