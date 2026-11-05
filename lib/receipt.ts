import { Buffer } from "buffer";
import { formatErrorMessage } from "./errors";

export interface BeneficiaryReceipt {
  programmeId: string;
  batchIndex: number;
  leaf: string;
  proof: string[];
}

export type ReceiptVerificationResult =
  { kind: "included" } | { kind: "excluded" } | { kind: "error"; message: string };

export interface InclusionVerifier {
  verifyInclusion(
    programmeId: bigint,
    batchIndex: number,
    leaf: Buffer,
    proof: Buffer[],
  ): Promise<boolean>;
}

/**
 * Validates and parses a raw JSON receipt string into typed, decoded buffers.
 */
export function parseReceipt(text: string): {
  programmeId: bigint;
  batchIndex: number;
  leaf: Buffer;
  proof: Buffer[];
} {
  if (!text || text.trim().length === 0) {
    throw new Error("Receipt input is empty");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Receipt is not valid JSON");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Receipt must be a JSON object");
  }

  const rec = parsed as Record<string, unknown>;

  if (rec.programmeId === undefined || rec.programmeId === null) {
    throw new Error("Receipt missing programmeId");
  }

  let programmeId: bigint;
  try {
    programmeId = BigInt(String(rec.programmeId).trim());
    if (programmeId < 0n) throw new Error();
  } catch {
    throw new Error("programmeId must be a non-negative integer");
  }

  if (
    typeof rec.batchIndex !== "number" ||
    !Number.isInteger(rec.batchIndex) ||
    rec.batchIndex < 0
  ) {
    throw new Error("batchIndex must be a non-negative integer");
  }

  if (typeof rec.leaf !== "string") {
    throw new Error("leaf must be a 64-character hex string");
  }

  const leafHex = rec.leaf.trim();
  if (!/^[0-9a-fA-F]{64}$/.test(leafHex)) {
    throw new Error("leaf must be exactly 32 bytes (64 hexadecimal characters)");
  }
  const leaf = Buffer.from(leafHex, "hex");

  if (!Array.isArray(rec.proof)) {
    throw new Error("proof must be an array of 64-character hex strings");
  }

  const proof: Buffer[] = [];
  for (let i = 0; i < rec.proof.length; i++) {
    const item = rec.proof[i];
    if (typeof item !== "string" || !/^[0-9a-fA-F]{64}$/.test(item.trim())) {
      throw new Error(`proof[${i}] must be exactly 32 bytes (64 hexadecimal characters)`);
    }
    proof.push(Buffer.from(item.trim(), "hex"));
  }

  return {
    programmeId,
    batchIndex: rec.batchIndex,
    leaf,
    proof,
  };
}

/**
 * Validates a receipt string and checks inclusion on-chain via the provided verifier client.
 */
export async function verifyReceipt(
  text: string,
  verifier: InclusionVerifier,
): Promise<ReceiptVerificationResult> {
  try {
    const { programmeId, batchIndex, leaf, proof } = parseReceipt(text);
    const ok = await verifier.verifyInclusion(programmeId, batchIndex, leaf, proof);
    return { kind: ok ? "included" : "excluded" };
  } catch (e) {
    return { kind: "error", message: formatErrorMessage(e) };
  }
}
