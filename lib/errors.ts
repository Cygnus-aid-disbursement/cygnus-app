import { Errors } from "@cygnus-aid-disbursement/sdk";

/**
 * Human-friendly descriptions for known Cygnus contract error codes.
 */
export const CONTRACT_ERROR_DESCRIPTIONS: Record<number, string> = {
  1: "Programme not found on-chain.",
  2: "Programme is already closed.",
  3: "Milestone index is out of range.",
  4: "Milestone cannot be claimed yet.",
  5: "Milestone has not been claimed yet.",
  6: "Milestone has already been approved or rejected.",
  7: "Insufficient funds available in programme.",
  8: "Insufficient released funds for disbursement.",
  9: "Programme has not reached its end date.",
  10: "Invalid disbursement or funding amount.",
  11: "Invalid Merkle batch or proof root mismatch.",
  12: "Approver configuration kind is unimplemented.",
  13: "No remaining balance to refund to sponsor.",
  14: "Disbursement batch index is out of range.",
};

/**
 * Extracts a numeric Soroban contract error code from an error or error message.
 * Matches patterns like "Error(Contract, #1)", "Error(Contract, 1)", "contract code 1", etc.
 */
export function parseContractErrorCode(error: unknown): number | null {
  if (typeof error === "number") {
    return error in Errors ? error : null;
  }
  const str = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (!str) return null;

  const match =
    str.match(/Error\(Contract,\s*#?(\d+)\)/i) ?? str.match(/contract\s+code\s*#?(\d+)/i);
  if (match && match[1]) {
    const code = parseInt(match[1], 10);
    if (!isNaN(code)) return code;
  }
  return null;
}

/**
 * Returns a human-readable explanation for a contract error code or undefined if unknown.
 */
export function getContractErrorDescription(code: number): string | undefined {
  return CONTRACT_ERROR_DESCRIPTIONS[code];
}

/**
 * Normalizes an unknown error into a clean, human-readable error message suitable for UI display.
 */
export function formatErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred",
): string {
  if (!error) return fallback;

  const code = parseContractErrorCode(error);
  if (code !== null) {
    const desc = getContractErrorDescription(code);
    const sdkError = (Errors as Record<string, { message: string }>)[String(code)];
    const label = sdkError?.message ?? `Error ${code}`;
    return desc ? `${label}: ${desc}` : `Contract error ${code}: ${label}`;
  }

  if (error instanceof Error) {
    // If the message contains verbose JSON-RPC diagnostics, pick the first clean line
    const firstLine = error.message.split("\n")[0].trim();
    return firstLine.length > 0 ? firstLine : fallback;
  }

  if (typeof error === "string") {
    const trimmed = error.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  return fallback;
}
