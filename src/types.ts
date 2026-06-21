export interface ApiResponse {
  raw: string;
  isJson: boolean;
  json?: unknown;
}

export interface ParsedBalance {
  balance: number;
}

export interface ParsedActivation {
  activationId: string;
  phoneNumber: string;
}

export interface ParsedStatus {
  status: string;
  code?: string;
}

export interface ParsedSetStatus {
  success: boolean;
  action: string;
}

export interface ApiError {
  error: string;
  message: string;
}

export interface CountryInfo {
  id: number;
  rus: string;
  eng: string;
  chn: string;
  visible: number;
  retry: number;
  rent: number;
  multiService: number;
}

export interface ServiceInfo {
  code: string;
  name: string;
}

export interface PriceInfo {
  cost: number;
  count: number;
}

export interface ExtendedPriceInfo {
  cnt: number;
  physicalCount: number;
  freePriceMap: Record<string, number>;
  cost: number;
}

export interface VerificationPriceInfo {
  count: number;
  price: string;
}

export interface TopCountryInfo {
  country: string;
  share: string;
  rate: string;
}

export interface ActiveActivation {
  activationId: string;
  serviceCode: string;
  phoneNumber: string;
  activationCost: string;
  activationStatus: string;
  smsCode: string[];
  smsText: string[];
  activationTime: string;
  discount: string;
  repeated: string;
  countryCode: string;
  countryName: string;
}

export interface OrderNumberV2Response {
  activationId: number;
  phoneNumber: string;
  activationCost: number;
  countryCode: string;
  canGetAnotherSms: boolean;
  activationTime: string;
}

export interface CheckExtraActivationResponse {
  status: string;
  cost: number;
  service: string;
  phone: number;
  country: number;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

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
