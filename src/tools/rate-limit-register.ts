import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleGetRateLimitInfo } from "./rate-limit.js";

export function registerRateLimitTools(server: McpServer): void {
  server.registerTool(
    "get_rate_limit_info",
    {
      description:
        "Get the current rate limit information from the most recent API call. Returns {rateLimit: {limit, remaining} | null}. Returns null if no API call has been made yet or the API did not return rate limit headers. The limit is the maximum number of requests per window, and remaining is how many are left. Updated automatically after every other tool call.",
      inputSchema: {},
    },
    async () => handleGetRateLimitInfo()
  );
}
