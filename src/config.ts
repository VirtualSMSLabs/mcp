export const config = {
  apiKey: process.env.VIRTUALSMS_API_KEY ?? "",
  apiUrl: (
    process.env.VIRTUALSMS_API_URL ?? "https://api.virtualsms.de"
  ).replace(/\/+$/, ""),
  poolProvider: process.env.VIRTUALSMS_POOL_PROVIDER ?? "",
  requestTimeoutMs: 30000,
} as const;

export function validateConfig(): void {
  if (!config.apiKey) {
    console.error(
      "FATAL: VIRTUALSMS_API_KEY environment variable is not set. The server cannot function without it."
    );
    console.error(
      "Set it via: export VIRTUALSMS_API_KEY=your_api_key  (or use your IDE's env configuration)"
    );
  }
}

export function getEndpoint(): string {
  return `${config.apiUrl}/stubs/handler_api`;
}
