import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { getSharedClient, resetSharedClient } from "../src/shared-client.js";
import { handleGetRateLimitInfo } from "../src/tools/rate-limit.js";
import { MockTransport, rateLimitHeaders } from "./helpers/mock-transport.js";

const originalApiKey = process.env.VIRTUALSMS_API_KEY;
const originalApiUrl = process.env.VIRTUALSMS_API_URL;
const originalPoolProvider = process.env.VIRTUALSMS_POOL_PROVIDER;

beforeEach(() => {
  process.env.VIRTUALSMS_API_KEY = "test-key-123";
  delete process.env.VIRTUALSMS_API_URL;
  delete process.env.VIRTUALSMS_POOL_PROVIDER;
  resetSharedClient();
});

afterEach(() => {
  if (originalApiKey !== undefined) process.env.VIRTUALSMS_API_KEY = originalApiKey;
  else delete process.env.VIRTUALSMS_API_KEY;
  if (originalApiUrl !== undefined) process.env.VIRTUALSMS_API_URL = originalApiUrl;
  else delete process.env.VIRTUALSMS_API_URL;
  if (originalPoolProvider !== undefined) process.env.VIRTUALSMS_POOL_PROVIDER = originalPoolProvider;
  else delete process.env.VIRTUALSMS_POOL_PROVIDER;
  resetSharedClient();
});

describe("get_rate_limit_info tool", () => {
  test("returns null before any API call has been made", async () => {
    const result = await handleGetRateLimitInfo();
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(result.content[0].text);
    expect(data).toEqual({ rateLimit: null });
  });

  test("returns rate limit info after a successful API call", async () => {
    const client = getSharedClient();
    const mock = new MockTransport();
    mock.enqueueText("ACCESS_BALANCE:25.50", 200, rateLimitHeaders(100, 95));
    (client as any).transport = mock;
    await client.getBalance();

    const result = await handleGetRateLimitInfo();
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(result.content[0].text);
    expect(data).toEqual({ rateLimit: { limit: 100, remaining: 95 } });
  });

  test("returns null when API response had no rate limit headers", async () => {
    const client = getSharedClient();
    const mock = new MockTransport();
    mock.enqueueText("ACCESS_BALANCE:10.00", 200, {});
    (client as any).transport = mock;
    await client.getBalance();

    const result = await handleGetRateLimitInfo();
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(result.content[0].text);
    expect(data).toEqual({ rateLimit: null });
  });
});
