import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callApi, buildParams, isApiError, makeApiError } from "../client.js";
import { ok, err } from "../types.js";

export function registerInfoTools(server: McpServer): void {
  server.registerTool(
    "get_numbers_status",
    {
      description:
        "Get the quantity of available phone numbers per service for a given country. Returns a map of {serviceCode_countryId: count}. Useful for checking availability before ordering.",
      inputSchema: {
        country: z
          .string()
          .optional()
          .describe("Country ID (e.g. '39' for Argentina, '73' for Brazil)"),
        operator: z
          .string()
          .optional()
          .describe("Filter by mobile operator (e.g. 'claro', 'vivo')"),
        poolProvider: z
          .enum(["alpha", "prime", "gamma", "zeta"])
          .optional()
          .describe("Provider alias. Overrides the VIRTUALSMS_POOL_PROVIDER env var."),
      },
    },
    async ({ country, operator, poolProvider }) => {
      try {
        const response = await callApi(
          buildParams("getNumbersStatus", { country, operator, poolProvider })
        );
        if (response.isJson && response.json) return ok(response.json);
        if (isApiError(response.raw)) {
          const apiErr = makeApiError(response.raw);
          return ok(apiErr);
        }
        return ok({ raw: response.raw });
      } catch (e) {
        return err(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    "get_countries",
    {
      description:
        "Get the list of all available countries on the platform. Returns a map of countryId -> country info (id, names in rus/eng/chn, visibility, retry, rent, multiService flags).",
      inputSchema: {
        poolProvider: z
          .enum(["alpha", "prime", "gamma", "zeta"])
          .optional()
          .describe("Provider alias. Overrides the VIRTUALSMS_POOL_PROVIDER env var."),
      },
    },
    async ({ poolProvider }) => {
      try {
        const response = await callApi(
          buildParams("getCountries", { poolProvider })
        );
        if (response.isJson && response.json) return ok(response.json);
        if (isApiError(response.raw)) {
          const apiErr = makeApiError(response.raw);
          return ok(apiErr);
        }
        return ok({ raw: response.raw });
      } catch (e) {
        return err(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    "get_services_list",
    {
      description:
        "Get the list of available services (e.g. Telegram, WhatsApp) for a specific country. Returns an array of {code, name} objects.",
      inputSchema: {
        country: z
          .string()
          .optional()
          .describe("Country ID to filter services (e.g. '39')"),
        poolProvider: z
          .enum(["alpha", "prime", "gamma", "zeta"])
          .optional()
          .describe("Provider alias. Overrides the VIRTUALSMS_POOL_PROVIDER env var."),
      },
    },
    async ({ country, poolProvider }) => {
      try {
        const response = await callApi(
          buildParams("getServicesList", { country, poolProvider })
        );
        if (response.isJson && response.json) return ok(response.json);
        if (isApiError(response.raw)) {
          const apiErr = makeApiError(response.raw);
          return ok(apiErr);
        }
        return ok({ raw: response.raw });
      } catch (e) {
        return err(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    "get_operators",
    {
      description:
        "Get the list of available mobile operators for a specific country. Returns an array of operator name strings (e.g. ['any', 'claro', 'vivo', 'tim', 'oi']).",
      inputSchema: {
        country: z
          .string()
          .describe("Country ID (required, e.g. '73' for Brazil)"),
        poolProvider: z
          .enum(["alpha", "prime", "gamma", "zeta"])
          .optional()
          .describe("Provider alias. Overrides the VIRTUALSMS_POOL_PROVIDER env var."),
      },
    },
    async ({ country, poolProvider }) => {
      try {
        const response = await callApi(
          buildParams("getOperators", { country, poolProvider })
        );
        if (response.isJson && response.json) return ok(response.json);
        if (isApiError(response.raw)) {
          const apiErr = makeApiError(response.raw);
          return ok(apiErr);
        }
        return ok({ raw: response.raw });
      } catch (e) {
        return err(e instanceof Error ? e.message : String(e));
      }
    }
  );
}
