import type {
  ParsedBalance,
  ParsedActivation,
  ParsedStatus,
  ParsedSetStatus,
} from "./types.js";
import { isApiError, makeApiError } from "./client.js";

export function parseBalance(raw: string): ParsedBalance {
  if (isApiError(raw)) {
    const apiErr = makeApiError(raw);
    throw new Error(`${apiErr.error}: ${apiErr.message}`);
  }

  if (raw.startsWith("ACCESS_BALANCE:")) {
    const balanceStr = raw.split(":")[1];
    return { balance: parseFloat(balanceStr) };
  }

  throw new Error(`Unexpected response from getBalance: ${raw}`);
}

export function parseActivation(raw: string): ParsedActivation {
  if (isApiError(raw)) {
    const apiErr = makeApiError(raw);
    throw new Error(`${apiErr.error}: ${apiErr.message}`);
  }

  if (raw.startsWith("ACCESS_NUMBER:")) {
    const parts = raw.split(":");
    if (parts.length >= 3) {
      return {
        activationId: parts[1],
        phoneNumber: parts.slice(2).join(":"),
      };
    }
  }

  throw new Error(`Unexpected response from ordering: ${raw}`);
}

export function parseStatus(raw: string): ParsedStatus {
  if (isApiError(raw)) {
    const apiErr = makeApiError(raw);
    throw new Error(`${apiErr.error}: ${apiErr.message}`);
  }

  const trimmed = raw.trim();

  if (trimmed.startsWith("STATUS_OK:")) {
    const code = trimmed.split(":").slice(1).join(":");
    return { status: "STATUS_OK", code };
  }

  const validStatuses = [
    "STATUS_WAIT_CODE",
    "STATUS_WAIT_RETRY",
    "STATUS_WAIT_RESEND",
    "STATUS_CANCEL",
  ];

  if (validStatuses.includes(trimmed)) {
    return { status: trimmed };
  }

  return { status: trimmed };
}

export function parseSetStatus(raw: string): ParsedSetStatus {
  if (isApiError(raw)) {
    const apiErr = makeApiError(raw);
    throw new Error(`${apiErr.error}: ${apiErr.message}`);
  }

  const trimmed = raw.trim();

  const successMap: Record<string, string> = {
    ACCESS_READY: "ready",
    ACCESS_RETRY_GET: "retry",
    ACCESS_ACTIVATION: "finish",
    ACCESS_CANCEL: "cancel",
  };

  if (successMap[trimmed]) {
    return { success: true, action: successMap[trimmed] };
  }

  return { success: false, action: trimmed };
}
