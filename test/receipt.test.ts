import { describe, it, expect, vi } from "vitest";
import { Buffer } from "buffer";
import { parseReceipt, verifyReceipt, type InclusionVerifier } from "../lib/receipt";

describe("receipt module", () => {
  const sampleLeaf = "a".repeat(64);
  const sampleProof1 = "b".repeat(64);
  const sampleProof2 = "c".repeat(64);

  const validReceiptJson = JSON.stringify({
    programmeId: "1",
    batchIndex: 0,
    leaf: sampleLeaf,
    proof: [sampleProof1, sampleProof2],
  });

  describe("parseReceipt", () => {
    it("successfully parses valid receipt JSON into buffers and bigints", () => {
      const parsed = parseReceipt(validReceiptJson);
      expect(parsed.programmeId).toBe(1n);
      expect(parsed.batchIndex).toBe(0);
      expect(parsed.leaf.toString("hex")).toBe(sampleLeaf);
      expect(parsed.proof).toHaveLength(2);
      expect(parsed.proof[0].toString("hex")).toBe(sampleProof1);
      expect(parsed.proof[1].toString("hex")).toBe(sampleProof2);
    });

    it("accepts numeric programmeId and zero batchIndex", () => {
      const json = JSON.stringify({
        programmeId: 0,
        batchIndex: 0,
        leaf: sampleLeaf,
        proof: [],
      });
      const parsed = parseReceipt(json);
      expect(parsed.programmeId).toBe(0n);
      expect(parsed.batchIndex).toBe(0);
      expect(parsed.proof).toHaveLength(0);
    });

    it("rejects empty or whitespace input", () => {
      expect(() => parseReceipt("")).toThrow("Receipt input is empty");
      expect(() => parseReceipt("   \n ")).toThrow("Receipt input is empty");
    });

    it("rejects malformed JSON", () => {
      expect(() => parseReceipt("{ not valid json }")).toThrow("Receipt is not valid JSON");
    });

    it("rejects non-object JSON payloads", () => {
      expect(() => parseReceipt("[]")).toThrow("Receipt must be a JSON object");
      expect(() => parseReceipt('"hello"')).toThrow("Receipt must be a JSON object");
      expect(() => parseReceipt("123")).toThrow("Receipt must be a JSON object");
    });

    it("rejects missing or invalid programmeId", () => {
      expect(() =>
        parseReceipt(JSON.stringify({ batchIndex: 0, leaf: sampleLeaf, proof: [] })),
      ).toThrow("Receipt missing programmeId");

      expect(() =>
        parseReceipt(
          JSON.stringify({ programmeId: "xyz", batchIndex: 0, leaf: sampleLeaf, proof: [] }),
        ),
      ).toThrow("programmeId must be a non-negative integer");

      expect(() =>
        parseReceipt(
          JSON.stringify({ programmeId: -1, batchIndex: 0, leaf: sampleLeaf, proof: [] }),
        ),
      ).toThrow("programmeId must be a non-negative integer");
    });

    it("rejects invalid batchIndex", () => {
      expect(() =>
        parseReceipt(
          JSON.stringify({ programmeId: 1, batchIndex: -1, leaf: sampleLeaf, proof: [] }),
        ),
      ).toThrow("batchIndex must be a non-negative integer");

      expect(() =>
        parseReceipt(
          JSON.stringify({ programmeId: 1, batchIndex: 1.5, leaf: sampleLeaf, proof: [] }),
        ),
      ).toThrow("batchIndex must be a non-negative integer");

      expect(() =>
        parseReceipt(
          JSON.stringify({ programmeId: 1, batchIndex: "0", leaf: sampleLeaf, proof: [] }),
        ),
      ).toThrow("batchIndex must be a non-negative integer");
    });

    it("rejects invalid leaf hex length and non-hex characters", () => {
      expect(() =>
        parseReceipt(JSON.stringify({ programmeId: 1, batchIndex: 0, leaf: "abcd", proof: [] })),
      ).toThrow("leaf must be exactly 32 bytes (64 hexadecimal characters)");

      expect(() =>
        parseReceipt(
          JSON.stringify({ programmeId: 1, batchIndex: 0, leaf: "g".repeat(64), proof: [] }),
        ),
      ).toThrow("leaf must be exactly 32 bytes (64 hexadecimal characters)");
    });

    it("rejects invalid proof items", () => {
      expect(() =>
        parseReceipt(
          JSON.stringify({
            programmeId: 1,
            batchIndex: 0,
            leaf: sampleLeaf,
            proof: "not-an-array",
          }),
        ),
      ).toThrow("proof must be an array of 64-character hex strings");

      expect(() =>
        parseReceipt(
          JSON.stringify({ programmeId: 1, batchIndex: 0, leaf: sampleLeaf, proof: ["short-hex"] }),
        ),
      ).toThrow("proof[0] must be exactly 32 bytes");
    });
  });

  describe("verifyReceipt", () => {
    it("returns included when verifier confirms on-chain root match", async () => {
      const mockVerifier: InclusionVerifier = {
        verifyInclusion: vi.fn(async () => true),
      };

      const result = await verifyReceipt(validReceiptJson, mockVerifier);
      expect(result).toEqual({ kind: "included" });
      expect(mockVerifier.verifyInclusion).toHaveBeenCalledWith(
        1n,
        0,
        Buffer.from(sampleLeaf, "hex"),
        [Buffer.from(sampleProof1, "hex"), Buffer.from(sampleProof2, "hex")],
      );
    });

    it("returns excluded when proof does not match on-chain batch root", async () => {
      const mockVerifier: InclusionVerifier = {
        verifyInclusion: vi.fn(async () => false),
      };

      const result = await verifyReceipt(validReceiptJson, mockVerifier);
      expect(result).toEqual({ kind: "excluded" });
    });

    it("returns error kind when JSON or fields are invalid", async () => {
      const mockVerifier: InclusionVerifier = {
        verifyInclusion: vi.fn(),
      };

      const result = await verifyReceipt("invalid json", mockVerifier);
      expect(result.kind).toBe("error");
      if (result.kind === "error") {
        expect(result.message).toBe("Receipt is not valid JSON");
      }
      expect(mockVerifier.verifyInclusion).not.toHaveBeenCalled();
    });

    it("formats on-chain Soroban contract errors gracefully", async () => {
      const mockVerifier: InclusionVerifier = {
        verifyInclusion: vi.fn(async () => {
          throw new Error("RPC error: Error(Contract, #14)");
        }),
      };

      const result = await verifyReceipt(validReceiptJson, mockVerifier);
      expect(result.kind).toBe("error");
      if (result.kind === "error") {
        expect(result.message).toContain("BatchIndexOutOfRange");
      }
    });
  });
});
