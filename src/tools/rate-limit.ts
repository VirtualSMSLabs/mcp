import { getSharedClient } from "../shared-client.js";
import { ok } from "../types.js";

export async function handleGetRateLimitInfo() {
  const client = getSharedClient();
  const rateLimit = client.getRateLimitInfo();
  return ok({ rateLimit });
}
