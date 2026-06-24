import { VirtualSMSClient } from "@virtualsmslabs/js-sdk";

let sharedClient: VirtualSMSClient | null = null;

export function getSharedClient(): VirtualSMSClient {
  if (sharedClient) return sharedClient;

  const apiKey = process.env.VIRTUALSMS_API_KEY ?? "";
  const apiUrl = process.env.VIRTUALSMS_API_URL ?? undefined;

  sharedClient = new VirtualSMSClient(apiKey, apiUrl);
  return sharedClient;
}

export function resetSharedClient(): void {
  sharedClient = null;
}

export function getPoolProvider(): string | undefined {
  const pp = process.env.VIRTUALSMS_POOL_PROVIDER;
  return pp && pp.trim() !== "" ? pp.trim() : undefined;
}
