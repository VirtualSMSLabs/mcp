import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { getSharedClient, resetSharedClient } from "../src/shared-client.js";
import { handleGetBalance } from "../src/tools/balance.js";
import { MockTransport, rateLimitHeaders, rateLimitedResponse } from "./helpers/mock-transport.js";
import { RateLimitException } from "@virtualsmslabs/js-sdk";

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

describe("balance tool (SDK integration)", () => {
  test("returns balance on success", async () => {
    const client = getSharedClient();
    const mock = new MockTransport();
    mock.enqueueText("ACCESS_BALANCE:22.92", 200, rateLimitHeaders(100, 95));
    (client as any).transport = mock;

    const result = await handleGetBalance();
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(result.content[0].text);
    expect(data).toEqual({ balance: 22.92 });
  });

  test("includes rate limit info in the response", async () => {
    const client = getSharedClient();
    const mock = new MockTransport();
    mock.enqueueText("ACCESS_BALANCE:5.00", 200, rateLimitHeaders(50, 48));
    (client as any).transport = mock;

    await handleGetBalance();
    const rlResult = await handleGetBalance();
    const _rl = rlResult;
  });

  test("returns error JSON for NO_BALANCE", async () => {
    const client = getSharedClient();
    const mock = new MockTransport();
    mock.enqueueText("NO_BALANCE", 200);
    (client as any).transport = mock;

    const result = await handleGetBalance();
    expect(result.isError).toBe(true);
    const text = result.content[0].text;
    expect(text).toContain("NO_BALANCE");
    expect(text).toContain("Insufficient balance");
  });

  test("returns rate limit error JSON on 429 with BANNED", async () => {
    const client = getSharedClient();
    const mock = new MockTransport();
    mock.enqueue(rateLimitedResponse("BANNED", 60, 100, 0));
    (client as any).transport = mock;

    const result = await handleGetBalance();
    expect(result.isError).toBe(true);
    const data = JSON.parse(result.content[0].text);
    expect(data.error).toBe("BANNED");
    expect(data.httpStatus).toBe(429);
    expect(data.retryAfter).toBe(60);
    expect(data.rateLimitLimit).toBe(100);
    expect(data.rateLimitRemaining).toBe(0);
  });

  test("returns rate limit error JSON on 429 with CONCURRENT_LIMIT", async () => {
    const client = getSharedClient();
    const mock = new MockTransport();
    mock.enqueue(rateLimitedResponse("CONCURRENT_LIMIT", 30, 5, 4));
    (client as any).transport = mock;

    const result = await handleGetBalance();
    expect(result.isError).toBe(true);
    const data = JSON.parse(result.content[0].text);
    expect(data.error).toBe("CONCURRENT_LIMIT");
    expect(data.httpStatus).toBe(429);
    expect(data.retryAfter).toBe(30);
    expect(data.rateLimitLimit).toBe(5);
    expect(data.rateLimitRemaining).toBe(4);
  });
});
