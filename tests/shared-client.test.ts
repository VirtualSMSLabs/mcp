import { describe, test, expect, beforeEach, mock, afterEach } from "bun:test";
import { VirtualSMSClient } from "@virtualsmslabs/js-sdk";
import { getSharedClient, resetSharedClient } from "../src/shared-client.js";
import { MockTransport } from "./helpers/mock-transport.js";

const originalApiKey = process.env.VIRTUALSMS_API_KEY;
const originalApiUrl = process.env.VIRTUALSMS_API_URL;
const originalPoolProvider = process.env.VIRTUALSMS_POOL_PROVIDER;

afterEach(() => {
  if (originalApiKey !== undefined) process.env.VIRTUALSMS_API_KEY = originalApiKey;
  else delete process.env.VIRTUALSMS_API_KEY;
  if (originalApiUrl !== undefined) process.env.VIRTUALSMS_API_URL = originalApiUrl;
  else delete process.env.VIRTUALSMS_API_URL;
  if (originalPoolProvider !== undefined) process.env.VIRTUALSMS_POOL_PROVIDER = originalPoolProvider;
  else delete process.env.VIRTUALSMS_POOL_PROVIDER;
  resetSharedClient();
});

describe("shared-client", () => {
  test("creates VirtualSMSClient from VIRTUALSMS_API_KEY env var", () => {
    process.env.VIRTUALSMS_API_KEY = "test-key-123";
    const client = getSharedClient();
    expect(client).toBeInstanceOf(VirtualSMSClient);
  });

  test("uses VIRTUALSMS_API_URL override when set", () => {
    process.env.VIRTUALSMS_API_KEY = "test-key-123";
    process.env.VIRTUALSMS_API_URL = "https://custom.example.com";
    const client = getSharedClient();
    expect(client).toBeInstanceOf(VirtualSMSClient);
  });

  test("returns same instance on repeated calls (singleton)", () => {
    process.env.VIRTUALSMS_API_KEY = "test-key-123";
    const a = getSharedClient();
    const b = getSharedClient();
    expect(a).toBe(b);
  });

  test("resetSharedClient forces new instance on next call", () => {
    process.env.VIRTUALSMS_API_KEY = "test-key-123";
    const a = getSharedClient();
    resetSharedClient();
    const b = getSharedClient();
    expect(a).not.toBe(b);
  });
});
