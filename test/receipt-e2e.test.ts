import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { buildDisbursementPackage, parsePaymentEntriesCsv } from "../lib/batch-builder";
import { verifyReceipt, type InclusionVerifier } from "../lib/receipt";
import { verifyProof } from "@cygnus-aid-disbursement/sdk";

describe("End-to-end Receipt Lifecycle & Verification", () => {
  it("generates privacy-preserving receipts that cryptographically verify against ledger root", async () => {
    // 1. NGO aid operator inputs CSV of beneficiaries
    const csvData = `beneficiary_ref,amount_stroops
AID-SUDAN-REG-001,50000000
AID-SUDAN-REG-002,75000000
AID-SUDAN-REG-003,125000000
AID-SUDAN-REG-004,250000000`;

    const entries = parsePaymentEntriesCsv(csvData);
    expect(entries).toHaveLength(4);

    // 2. Build disbursement package with a confidential salt
    const salt = Buffer.alloc(32);
    salt.write("secret-programme-salt-alpha-2026");

    const programmeId = "42";
    const batchIndex = 3;
    const pkg = buildDisbursementPackage(programmeId, batchIndex, salt, entries);

    expect(pkg.count).toBe(4);
    expect(pkg.totalFormatted).toBe("500000000"); // 50 XLM total

    // Invariant: raw IDs must never appear in receipts
    const serializedReceipts = JSON.stringify(pkg.receipts);
    expect(serializedReceipts).not.toContain("AID-SUDAN-REG-001");
    expect(serializedReceipts).not.toContain("AID-SUDAN-REG-002");

    // 3. Mock contract verifier that knows the committed root on-chain
    const committedRootHex = pkg.rootHex;
    const verifier: ReceiptVerifier = {
      verifyInclusion: async (progId, bIdx, leaf, proof) => {
        // Simulates contract checking Merkle inclusion against stored batch root
        if (progId !== 42n || bIdx !== 3) return false;
        const leafBuf = Buffer.from(leaf);
        const proofBufs = proof.map((p) => Buffer.from(p));
        const rootBuf = Buffer.from(committedRootHex, "hex");
        return verifyProof(leafBuf, proofBufs, rootBuf);
      },
    };

    // 4. Beneficiary 2 tests their receipt
    const benReceipt = pkg.receipts[1];
    const benReceiptJson = JSON.stringify(benReceipt);

    const result = await verifyReceipt(benReceiptJson, verifier);
    expect(result.kind).toBe("included");

    // 5. Tampered receipt detection: modified leaf hash
    const tamperedReceipt = {
      ...benReceipt,
      leaf: "00".repeat(32), // False leaf
    };
    const tamperedResult = await verifyReceipt(JSON.stringify(tamperedReceipt), verifier);
    expect(tamperedResult.kind).toBe("excluded");

    // 6. Malformed proof detection: invalid hex
    const badProofReceipt = {
      ...benReceipt,
      proof: ["not-a-valid-hex-proof"],
    };
    const badProofResult = await verifyReceipt(JSON.stringify(badProofReceipt), verifier);
    expect(badProofResult.kind).toBe("error");
    if (badProofResult.kind === "error") {
      expect(badProofResult.message).toContain("64 hexadecimal characters");
    }
  });
});
