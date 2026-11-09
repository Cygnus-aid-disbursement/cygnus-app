/**
 * Validation utilities for Stellar accounts, Soroban contracts, and financial amounts.
 */

// Stellar StrKey ed25519 public key: G + 55 RFC4648 Base32 chars
const STELLAR_PUBLIC_KEY_REGEX = /^G[A-Z2-7]{55}$/;

// Soroban StrKey Contract ID: C + 55 RFC4648 Base32 chars
const SOROBAN_CONTRACT_ID_REGEX = /^C[A-Z2-7]{55}$/;

/**
 * Validates a Stellar account public address (starts with 'G', 56 chars).
 */
export function isValidStellarAddress(address: string): boolean {
  if (typeof address !== "string") return false;
  return STELLAR_PUBLIC_KEY_REGEX.test(address.trim());
}

/**
 * Validates a Soroban Contract ID (starts with 'C', 56 chars).
 */
export function isValidContractId(contractId: string): boolean {
  if (typeof contractId !== "string") return false;
  return SOROBAN_CONTRACT_ID_REGEX.test(contractId.trim());
}

export interface ValidationResult<T> {
  valid: boolean;
  value?: T;
  error?: string;
}

/**
 * Validates positive Stroop amounts (1 XLM = 10,000,000 stroops).
 * Rejects negative values, decimals, non-digits, and zero.
 */
export function validateStroopAmount(
  rawInput: string,
  fieldName = "Amount",
): ValidationResult<bigint> {
  if (!rawInput || typeof rawInput !== "string") {
    return { valid: false, error: `${fieldName} is required` };
  }

  const trimmed = rawInput.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  // Must only contain digits
  if (!/^\d+$/.test(trimmed)) {
    if (trimmed.includes(".")) {
      return {
        valid: false,
        error: `${fieldName} must be an integer in stroops (1 XLM = 10,000,000 stroops, no decimals allowed)`,
      };
    }
    if (trimmed.startsWith("-")) {
      return { valid: false, error: `${fieldName} cannot be negative` };
    }
    return { valid: false, error: `${fieldName} must contain digits only` };
  }

  try {
    const amount = BigInt(trimmed);
    if (amount <= 0n) {
      return { valid: false, error: `${fieldName} must be greater than zero stroops` };
    }
    return { valid: true, value: amount };
  } catch {
    return { valid: false, error: `${fieldName} is not a valid integer` };
  }
}

/**
 * Validates programme identifiers (non-negative integer).
 */
export function validateProgrammeId(rawInput: string): ValidationResult<bigint> {
  if (!rawInput || typeof rawInput !== "string") {
    return { valid: false, error: "Programme ID is required" };
  }

  const trimmed = rawInput.trim();
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: "Programme ID must be a non-negative integer" };
  }

  try {
    const id = BigInt(trimmed);
    return { valid: true, value: id };
  } catch {
    return { valid: false, error: "Programme ID is not a valid integer" };
  }
}

/**
 * Validates milestone or batch indices (non-negative 32-bit integer).
 */
export function validateIndex(rawInput: string, fieldName = "Index"): ValidationResult<number> {
  if (rawInput === undefined || rawInput === null || typeof rawInput !== "string") {
    return { valid: false, error: `${fieldName} is required` };
  }

  const trimmed = rawInput.trim();
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: `${fieldName} must be a non-negative integer` };
  }

  const num = Number(trimmed);
  if (!Number.isSafeInteger(num) || num < 0) {
    return { valid: false, error: `${fieldName} is out of safe range` };
  }

  return { valid: true, value: num };
}
