import { randomUUID } from "node:crypto";
import { z } from "zod";
import { callbackHostAllowed, parseHostList } from "./config.js";

export const TOKEN_BUFFER_MS = 60_000;
export const REQUEST_TIMEOUT_MS = 30_000;
export const MAX_PAGE_SIZE = 50;
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export const safeId = z
  .string()
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "ID must contain only alphanumeric characters, hyphens, and underscores"
  );

// HTTPS only; if NOMBA_ALLOWED_CALLBACK_HOSTS is set, the host must be on it. A callback
// URL decides where payment notifications or customers are sent, so injected text must
// not be able to point it at an attacker.
export const callbackUrlSchema = z
  .string()
  .url()
  .startsWith("https://", "Callback URL must use HTTPS")
  .refine(
    (u) => callbackHostAllowed(u, parseHostList(process.env.NOMBA_ALLOWED_CALLBACK_HOSTS)),
    "Callback host is not in NOMBA_ALLOWED_CALLBACK_HOSTS"
  );

/** 2348012345678 and 08012345678 are the same number. */
export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("234") ? "0" + digits.slice(3) : digits;
}

/** limit and cursor for list endpoints. */
export const pagingSchema = {
  limit: z
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .optional()
    .describe(`Number of results per page (max ${MAX_PAGE_SIZE})`),
  cursor: z.string().optional().describe("Pagination cursor from a previous response"),
};

/** A Naira amount, capped by the per-transaction limit so every money tool enforces it. */
export function amountSchema(max: number, description: string, whole = false) {
  const n = whole ? z.number().int() : z.number();
  return n.positive().max(max).describe(description);
}

/**
 * Nomba requires a unique merchantTxRef on every outflow and uses it to deduplicate.
 * Callers can pass their own; otherwise we generate one and return it in the result.
 */
export function newMerchantTxRef(): string {
  return `mcp-${randomUUID()}`;
}

/** A 32-character reference for things Nomba keys by accountRef. */
export function newAccountRef(): string {
  return randomUUID().replaceAll("-", "");
}

export function jsonResponse(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
  };
}

export function errorResponse(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text" as const, text: `Error: ${msg}` }],
    isError: true,
  };
}

export function buildParams(
  obj: Record<string, unknown>
): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) params[k] = String(v);
  }
  return params;
}

const SENSITIVE_LOG_FIELDS = new Set([
  "accountNumber",
  "phoneNumber",
  "customerEmail",
  "meterNumber",
  "smartcardNumber",
  "tokenizedCardId",
  "bvn",
]);

function maskValue(value: string): string {
  if (value.length <= 4) return "****";
  return "*".repeat(value.length - 4) + value.slice(-4);
}

export function logToolCall(tool: string, params?: Record<string, unknown>) {
  const sanitized: Record<string, unknown> = { ts: new Date().toISOString(), tool };
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (SENSITIVE_LOG_FIELDS.has(k) && typeof v === "string") {
        sanitized[k] = maskValue(v);
      } else if (typeof v === "string" && v.length > 100) {
        sanitized[k] = v.slice(0, 20) + "...";
      } else {
        sanitized[k] = v;
      }
    }
  }
  console.error(JSON.stringify(sanitized));
}
