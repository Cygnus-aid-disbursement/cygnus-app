import { describe, it, expect } from "vitest";
import {
  buildDisbursementPackage,
  parsePaymentEntriesJson,
  parsePaymentEntriesCsv,
} from "../lib/batch-builder";
import { verifyReceipt } from "../lib/receipt";
import { verifyProof } from "@cygnus-aid-disbursement/sdk";
import { Buffer } from "buffer";

describe("batch-builder module", () => {
  const dummySalt = new Uint8Array(32);
  dummySalt.fill(0x55);

  describe("parsePaymentEntriesJson", () => {
    it("parses valid JSON array of entries", () => {
      const json = JSON.stringify([
        { reference: "BEN-001", amount: 10000000 },
        { reference: "BEN-002", amount: "20000000" },
      ]);
      const entries = parsePaymentEntriesJson(json);
      expect(entries).toHaveLength(2);
      expect(entries[0].reference).toBe("BEN-001");
      expect(entries[0].amount).toBe(10000000n);
      expect(entries[1].reference).toBe("BEN-002");
      expect(entries[1].amount).toBe(20000000n);
    });

    it("rejects non-array or invalid JSON", () => {
      expect(() => parsePaymentEntriesJson("invalid json")).toThrow("Invalid JSON");
      expect(() => parsePaymentEntriesJson('{"reference":"BEN-1"}')).toThrow("must be an array");
    });

    it("rejects entries with empty reference or non-positive amount", () => {
      expect(() =>
        parsePaymentEntriesJson(JSON.stringify([{ reference: "", amount: 100 }])),
      ).toThrow("missing a valid string reference");

      expect(() =>
        parsePaymentEntriesJson(JSON.stringify([{ reference: "B1", amount: 0 }])),
      ).toThrow("invalid amount");

      expect(() =>
        parsePaymentEntriesJson(JSON.stringify([{ reference: "B1", amount: -50 }])),
      ).toThrow("invalid amount");
    });
  });

  describe("parsePaymentEntriesCsv", () => {
    it("parses valid CSV with headers", () => {
      const csv = `reference,amount
BEN-101,50000000
BEN-102,75000000`;
      const entries = parsePaymentEntriesCsv(csv);
      expect(entries).toHaveLength(2);
      expect(entries[0].reference).toBe("BEN-101");
      expect(entries[0].amount).toBe(50000000n);
      expect(entries[1].reference).toBe("BEN-102");
      expect(entries[1].amount).toBe(75000000n);
    });

    it("parses CSV without headers and handles quotes and whitespace", () => {
      const csv = ` "BEN-201" , 1000
"BEN-202",  2000 `;
      const entries = parsePaymentEntriesCsv(csv);
      expect(entries).toHaveLength(2);
      expect(entries[0].reference).toBe("BEN-201");
      expect(entries[0].amount).toBe(1000n);
      expect(entries[1].reference).toBe("BEN-202");
      expect(entries[1].amount).toBe(2000n);
    });

    it("throws on empty CSV or CSV with only headers", () => {
      expect(() => parsePaymentEntriesCsv("")).toThrow("empty");
      expect(() => parsePaymentEntriesCsv("reference,amount\n")).toThrow("only headers");
    });

    it("reports specific line number on malformed row or invalid amount", () => {
      const badFormat = `reference,amount
BEN-1,100
INVALID_LINE_WITHOUT_COMMA
BEN-2,200`;
      expect(() => parsePaymentEntriesCsv(badFormat)).toThrow('Line 3: expected format "reference,amount"');

      const badAmount = `reference,amount
BEN-1,100
BEN-2,not-a-number`;
      expect(() => parsePaymentEntriesCsv(badAmount)).toThrow('Line 3: invalid amount "not-a-number"');

      const negativeAmount = `reference,amount
BEN-1,-50`;
      expect(() => parsePaymentEntriesCsv(negativeAmount)).toThrow('Line 2: invalid amount "-50"');
    });
  });

  describe("buildDisbursementPackage", () => {
    it("builds package, salts references, and produces verify-compatible receipts", async () => {
      const entries = [
        { reference: "PRIVATE_BENEFICIARY_ALICE", amount: 10_0000000n },
        { reference: "PRIVATE_BENEFICIARY_BOB", amount: 20_0000000n },
      ];

      const pkg = buildDisbursementPackage("1", 0, dummySalt, entries);
      expect(pkg.count).toBe(2);
      expect(pkg.receipts).toHaveLength(2);
      expect(pkg.rootHex).toMatch(/^[0-9a-f]{64}$/);

      // Verify privacy invariant: raw references must never appear in generated receipts
      const receiptStr = JSON.stringify(pkg.receipts);
      expect(receiptStr).not.toContain("PRIVATE_BENEFICIARY_ALICE");
      expect(receiptStr).not.toContain("PRIVATE_BENEFICIARY_BOB");

      // Verify Merkle proof validity for first receipt
      const r0 = pkg.receipts[0];
      const leaf0 = Buffer.from(r0.leaf, "hex");
      const proof0 = r0.proof.map((p) => Buffer.from(p, "hex"));
      const rootBuf = Buffer.from(pkg.rootHex, "hex");
      expect(verifyProof(leaf0, proof0, rootBuf)).toBe(true);

      // Verify receipt works seamlessly with verifyReceipt
      const mockVerifier = {
        verifyInclusion: async () => true,
      };
      const verifyResult = await verifyReceipt(JSON.stringify(r0), mockVerifier);
      expect(verifyResult.kind).toBe("included");
    });

    it("throws when entries list is empty", () => {
      expect(() => buildDisbursementPackage("1", 0, dummySalt, [])).toThrow(
        "at least one payment entry",
      );
    });
  });
});
