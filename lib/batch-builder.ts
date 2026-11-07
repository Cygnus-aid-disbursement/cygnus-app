import { Buffer } from "buffer";
import {
  buildBatch,
  inclusionProof,
  type Batch,
  type BatchEntry,
} from "@cygnus-aid-disbursement/sdk";
import { hex } from "./format";

export interface DisbursementPaymentItem {
  reference: string;
  amount: bigint;
}

export interface BeneficiaryReceiptRecord {
  programmeId: string;
  batchIndex: number;
  leaf: string;
  proof: string[];
  recipientRef: string;
  amount: string;
}

export interface BuiltDisbursement {
  batch: Batch;
  rootHex: string;
  totalFormatted: string;
  count: number;
  receipts: BeneficiaryReceiptRecord[];
}

/**
 * Builds a Merkle disbursement batch from entries and a salt, generating verify-compatible receipts.
 * Raw beneficiary references are salted and never exposed in the receipt output.
 */
export function buildDisbursementPackage(
  programmeId: string,
  batchIndex: number,
  salt: Uint8Array,
  entries: BatchEntry[],
): BuiltDisbursement {
  if (entries.length === 0) {
    throw new Error("Batch must contain at least one payment entry");
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry.reference || entry.reference.trim().length === 0) {
      throw new Error(`Entry at index ${i} is missing a beneficiary reference`);
    }
    if (entry.amount <= 0n) {
      throw new Error(`Entry at index ${i} must have an amount greater than zero`);
    }
  }

  const batch = buildBatch(entries, salt);
  const receipts: BeneficiaryReceiptRecord[] = [];

  for (let i = 0; i < batch.count; i++) {
    const proof = inclusionProof(batch, i);
    const leafHex = hex(batch.leaves[i]);
    const proofHexList = proof.map((p) => hex(p));
    const recipientRefHex = hex(batch.recipientRefs[i]);

    receipts.push({
      programmeId,
      batchIndex,
      leaf: leafHex,
      proof: proofHexList,
      recipientRef: recipientRefHex,
      amount: entries[i].amount.toString(),
    });
  }

  return {
    batch,
    rootHex: hex(batch.root),
    totalFormatted: batch.total.toString(),
    count: batch.count,
    receipts,
  };
}

/**
 * Parses raw JSON string into payment entries.
 */
export function parsePaymentEntriesJson(jsonText: string): BatchEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Invalid JSON input for disbursement entries");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Disbursement entries JSON must be an array of objects");
  }

  return parsed.map((item, idx) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Entry at index ${idx} must be an object`);
    }
    const rec = item as Record<string, unknown>;
    if (typeof rec.reference !== "string" || rec.reference.trim().length === 0) {
      throw new Error(`Entry at index ${idx} is missing a valid string reference`);
    }

    let amount: bigint;
    try {
      amount = BigInt(String(rec.amount));
      if (amount <= 0n) throw new Error();
    } catch {
      throw new Error(
        `Entry at index ${idx} has an invalid amount (must be positive integer stroops)`,
      );
    }

    return {
      reference: rec.reference.trim(),
      amount,
    };
  });
}
