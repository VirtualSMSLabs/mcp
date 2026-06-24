import type { Transport, TransportResponse } from "@virtualsmslabs/js-sdk";

export class MockTransport implements Transport {
  private queue: TransportResponse[] = [];
  public requests: { url: string; headers: Record<string, string> }[] = [];

  enqueue(response: TransportResponse): void {
    this.queue.push(response);
  }

  enqueueJson(body: unknown, statusCode: number = 200, headers: Record<string, string> = {}): void {
    this.queue.push({
      statusCode,
      body: JSON.stringify(body),
      headers,
    });
  }

  enqueueText(body: string, statusCode: number = 200, headers: Record<string, string> = {}): void {
    this.queue.push({
      statusCode,
      body,
      headers,
    });
  }

  async send(url: string, headers: Record<string, string>): Promise<TransportResponse> {
    this.requests.push({ url, headers });

    if (this.queue.length === 0) {
      throw new Error("MockTransport: no queued response. Call enqueue() first.");
    }

    return this.queue.shift()!;
  }

  get lastRequest(): { url: string; headers: Record<string, string> } | undefined {
    return this.requests[this.requests.length - 1];
  }

  reset(): void {
    this.queue = [];
    this.requests = [];
  }
}

export function rateLimitHeaders(limit: number, remaining: number): Record<string, string> {
  return {
    "x-ratelimit-limit": String(limit),
    "x-ratelimit-remaining": String(remaining),
  };
}

export function rateLimitedResponse(
  errorCode: string = "BANNED",
  retryAfter: number = 60,
  limit: number = 100,
  remaining: number = 0,
): TransportResponse {
  return {
    statusCode: 429,
    body: errorCode,
    headers: {
      "retry-after": String(retryAfter),
      "x-ratelimit-limit": String(limit),
      "x-ratelimit-remaining": String(remaining),
    },
  };
}
