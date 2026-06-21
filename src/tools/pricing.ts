import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callApi, buildParams, isApiError, makeApiError } from "../client.js";
import { ok, err } from "../types.js";

const poolProviderSchema = z
  .enum(["alpha", "prime", "gamma", "zeta"])
  .optional()
  .describe("Provider alias. Overrides the VIRTUALSMS_POOL_PROVIDER env var.");

export function registerPricingTools(server: McpServer): void {
  server.registerTool(
    "get_prices",
    {
      description:
        "Get current prices for services. Returns a nested map: countryId -> serviceCode -> {cost, count}. Filter by service and/or country to narrow results.",
      inputSchema: {
        service: z
          .string()
          .optional()
          .describe("Service code (e.g. 'tg' for Telegram, 'wa' for WhatsApp)"),
        country: z
          .string()
          .optional()
          .describe("Country ID (e.g. '39')"),
        poolProvider: poolProviderSchema,
      },
    },
    async ({ service, country, poolProvider }) => {
      try {
        const response = await callApi(
          buildParams("getPrices", { service, country, poolProvider })
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
    "get_prices_extended",
    {
      description:
        "Get extended pricing with price tiers (freePriceMap). Returns countryId -> serviceCode -> {cnt, physicalCount, freePriceMap: {price: count}, cost}. The freePriceMap shows available price tiers.",
      inputSchema: {
        service: z.string().optional().describe("Service code (e.g. 'tg')"),
        country: z.string().optional().describe("Country ID (e.g. '39')"),
        freePrice: z
          .boolean()
          .optional()
          .describe("If true, shows only the lowest price tier"),
        poolProvider: poolProviderSchema,
      },
    },
    async ({ service, country, freePrice, poolProvider }) => {
      try {
        const response = await callApi(
          buildParams("getPricesExtended", {
            service,
            country,
            freePrice,
            poolProvider,
          })
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
    "get_prices_verification",
    {
      description:
        "Get prices organized by service then country (inverted structure). Returns serviceCode -> countryId -> {count, price}. Useful when you want to compare a single service across all countries.",
      inputSchema: {
        service: z
          .string()
          .optional()
          .describe("Service code (e.g. 'tg'). Omit to get all services."),
        poolProvider: poolProviderSchema,
      },
    },
    async ({ service, poolProvider }) => {
      try {
        const response = await callApi(
          buildParams("getPricesVerification", { service, poolProvider })
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
    "get_top_countries_by_service",
    {
      description:
        "Get the top 10 countries for a specific service, ranked by purchase share and success rate. Returns an array of {country, share, rate}. Returns NO_METRICS error if insufficient data.",
      inputSchema: {
        service: z
          .string()
          .describe("Service code (required, e.g. 'tg', 'wa')"),
      },
    },
    async ({ service }) => {
      try {
        const response = await callApi(
          buildParams("getListOfTopCountriesByService", { service })
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
