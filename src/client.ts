import { config, getEndpoint } from "./config.js";
import type { ApiResponse, ApiError } from "./types.js";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public apiError?: ApiError
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const KNOWN_ERROR_CODES = new Set([
  "BAD_KEY",
  "ERROR_SQL",
  "BAD_ACTION",
  "BANNED",
  "NO_NUMBERS",
  "NO_BALANCE",
  "WRONG_SERVICE",
  "WRONG_COUNTRY",
  "WRONG_ACTIVATION_ID",
  "RENEW_ACTIVATION_NOT_AVAILABLE",
  "NEW_ACTIVATION_IMPOSSIBLE",
  "EARLY_CANCEL_DENIED",
  "NO_ACTIVATION",
  "BAD_STATUS",
  "NO_METRICS",
  "ACCESS_EXPIRE",
  "ACCESS_RETRY_GET",
]);

export function isApiError(raw: string): boolean {
  const trimmed = raw.trim();
  if (KNOWN_ERROR_CODES.has(trimmed)) return true;

  return false;
}

export function makeApiError(raw: string): ApiError {
  const code = raw.trim();
  const messages: Record<string, string> = {
    BAD_KEY: "Invalid or missing API key.",
    ERROR_SQL: "Internal server error.",
    BAD_ACTION: "Invalid or unknown action.",
    BANNED: "Account is blocked or restricted.",
    NO_NUMBERS: "No phone numbers available for the requested service/country.",
    NO_BALANCE: "Insufficient account balance to complete this operation.",
    WRONG_SERVICE: "Invalid service code.",
    WRONG_COUNTRY: "Invalid or missing country ID.",
    WRONG_ACTIVATION_ID: "Invalid or non-existent activation ID.",
    RENEW_ACTIVATION_NOT_AVAILABLE: "Extra activation is not available for this number.",
    NEW_ACTIVATION_IMPOSSIBLE: "Cannot create a new activation on this number.",
    EARLY_CANCEL_DENIED: "Cannot cancel within 5 minutes of ordering.",
    NO_ACTIVATION: "No activation found with the given ID.",
    BAD_STATUS: "Invalid status code.",
    NO_METRICS: "Not enough data to calculate metrics.",
    ACCESS_EXPIRE: "Activation has expired.",
    ACCESS_RETRY_GET: "Retry request accepted — waiting for another SMS.",
  };

  return {
    error: code,
    message: messages[code] ?? code,
  };
}

export async function callApi(
  params: Record<string, string | number | boolean | undefined>
): Promise<ApiResponse> {
  if (!config.apiKey) {
    throw new Error(
      "VIRTUALSMS_API_KEY is not set. Configure it in your MCP client settings."
    );
  }

  const url = new URL(getEndpoint());

  url.searchParams.set("api_key", config.apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json, text/plain" },
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(
        `Request timed out after ${config.requestTimeoutMs / 1000}s. The API may be unreachable.`
      );
    }
    throw new Error(
      `Network error contacting VirtualSMS API: ${e instanceof Error ? e.message : String(e)}`
    );
  }
  clearTimeout(timeout);

  const raw = await res.text();

  const trimmed = raw.trim();
  let isJson = false;
  let json: unknown = undefined;

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      json = JSON.parse(trimmed);
      isJson = true;
    } catch {
      // Not valid JSON, treat as text
    }
  }

  return { raw, isJson, json };
}

export function buildParams(
  action: string,
  extra?: Record<string, string | number | boolean | undefined>
): Record<string, string | number | boolean | undefined> {
  const params: Record<string, string | number | boolean | undefined> = {
    action,
    ...extra,
  };

  if (config.poolProvider && !("poolProvider" in params)) {
    params.poolProvider = config.poolProvider;
  }

  return params;
}
