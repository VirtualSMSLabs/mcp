import { VirtualSMSException, RateLimitException } from "@virtualsmslabs/js-sdk";
import type { ToolResult } from "../types.js";

export function handleFormatError(e: unknown): ToolResult {
  if (e instanceof RateLimitException) {
    const ex = e as RateLimitException;
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: ex.errorCode,
            message: ex.message,
            httpStatus: ex.httpStatus,
            retryAfter: ex.retryAfter,
            rateLimitLimit: ex.rateLimitLimit,
            rateLimitRemaining: ex.rateLimitRemaining,
          }, null, 2),
        },
      ],
    };
  }

  if (e instanceof VirtualSMSException) {
    const ex = e as VirtualSMSException;
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: ex.errorCode,
            message: ex.message,
            httpStatus: ex.httpStatus,
            retryAfter: ex.retryAfter,
            rateLimitLimit: null,
            rateLimitRemaining: null,
          }, null, 2),
        },
      ],
    };
  }

  return {
    isError: true,
    content: [
      {
        type: "text",
        text: e instanceof Error ? e.message : String(e),
      },
    ],
  };
}
