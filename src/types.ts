export type ToolResult =
  | { content: { type: "text"; text: string }[] }
  | {
      isError: true;
      content: { type: "text"; text: string }[];
    };

export function ok(data: unknown): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function err(message: string): ToolResult {
  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}
