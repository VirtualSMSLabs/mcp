import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { getSharedClient, resetSharedClient } from "../src/shared-client.js";
import { handleFormatError } from "../src/tools/error-handler.js";
import { MockTransport, rateLimitedResponse } from "./helpers/mock-transport.js";
import {
  VirtualSMSException,
  RateLimitException,
  AuthenticationException,
} from "@virtualsmslabs/js-sdk";

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

describe("error handler", () => {
  test("formats RateLimitException with rate limit fields", () => {
    const ex = new RateLimitException(
      "BANNED",
      "Account or IP has been banned",
      429,
      60,
      null,
      100,
      0,
    );

    const result = handleFormatError(ex);
    expect(result.isError).toBe(true);
    const data = JSON.parse(result.content[0].text);
    expect(data).toEqual({
      error: "BANNED",
      message: "Account or IP has been banned",
      httpStatus: 429,
      retryAfter: 60,
      rateLimitLimit: 100,
      rateLimitRemaining: 0,
    });
  });

  test("formats RateLimitException without rate limit fields (null)", () => {
    const ex = new RateLimitException(
      "CONCURRENT_LIMIT",
      "Concurrent activation limit reached",
      429,
      30,
      null,
      null,
      null,
    );

    const result = handleFormatError(ex);
    expect(result.isError).toBe(true);
    const data = JSON.parse(result.content[0].text);
    expect(data).toEqual({
      error: "CONCURRENT_LIMIT",
      message: "Concurrent activation limit reached",
      httpStatus: 429,
      retryAfter: 30,
      rateLimitLimit: null,
      rateLimitRemaining: null,
    });
  });

  test("formats generic VirtualSMSException without rate limit fields", () => {
    const ex = new VirtualSMSException(
      "NO_NUMBERS",
      "No phone numbers available for the requested service and country",
      200,
    );

    const result = handleFormatError(ex);
    expect(result.isError).toBe(true);
    const data = JSON.parse(result.content[0].text);
    expect(data).toEqual({
      error: "NO_NUMBERS",
      message: "No phone numbers available for the requested service and country",
      httpStatus: 200,
      retryAfter: null,
      rateLimitLimit: null,
      rateLimitRemaining: null,
    });
  });

  test("formats non-SDK Error as plain text", () => {
    const ex = new Error("Something went wrong");
    const result = handleFormatError(ex);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Something went wrong");
  });

  test("formats string error", () => {
    const result = handleFormatError("network timeout");
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("network timeout");
  });
});
