import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import {
  buildBatch,
  saltRecipientRef,
  verifyProof,
  inclusionProof,
  amountToBe16,
  hashLeaf,
  hashNode,
} from "@cygnus-aid-disbursement/sdk";

describe("batch and merkle tree utilities", () => {
  const testSalt = new Uint8Array(32);
  testSalt.fill(0x42);

  describe("saltRecipientRef", () => {
    it("produces 32-byte salted recipient references", () => {
      const ref = saltRecipientRef("beneficiary-user-1", testSalt);
      expect(ref).toBeInstanceOf(Buffer);
      expect(ref.length).toBe(32);
    });

    it("is deterministic for identical salt and reference", () => {
      const ref1 = saltRecipientRef("id-12345", testSalt);
      const ref2 = saltRecipientRef("id-12345", testSalt);
      expect(ref1.equals(ref2)).toBe(true);
    });

    it("produces completely different references with different salts", () => {
      const altSalt = new Uint8Array(32);
      altSalt.fill(0x99);

      const ref1 = saltRecipientRef("id-12345", testSalt);
      const ref2 = saltRecipientRef("id-12345", altSalt);
      expect(ref1.equals(ref2)).toBe(false);
    });

    it("never leaks raw reference string in the output buffer", () => {
      const secret = "secret-beneficiary-national-id-999";
      const ref = saltRecipientRef(secret, testSalt);
      expect(ref.toString("utf8")).not.toContain(secret);
    });
  });

  describe("amountToBe16", () => {
    it("encodes 0 as 16 null bytes", () => {
      const buf = amountToBe16(0n);
      expect(buf.length).toBe(16);
      expect(buf.every((b) => b === 0)).toBe(true);
    });

    it("encodes 1 stroop in big-endian representation", () => {
      const buf = amountToBe16(1n);
      expect(buf.length).toBe(16);
      expect(buf[15]).toBe(1);
      expect(buf.slice(0, 15).every((b) => b === 0)).toBe(true);
    });

    it("encodes large 64-bit and 128-bit values accurately", () => {
      const amount = 100_000_0000000n; // 100,000 XLM
      const buf = amountToBe16(amount);
      expect(buf.length).toBe(16);
      const hexVal = amount.toString(16).padStart(32, "0");
      expect(buf.toString("hex")).toBe(hexVal);
    });
  });

  describe("hashLeaf", () => {
    it("computes 32-byte leaf hash from recipientRef and amount", () => {
      const recipientRef = Buffer.alloc(32, 0x11);
      const leaf = hashLeaf(recipientRef, 50_0000000n);
      expect(leaf.length).toBe(32);
    });

    it("produces distinct leaves for different amounts with same recipient", () => {
      const recipientRef = Buffer.alloc(32, 0x11);
      const leaf1 = hashLeaf(recipientRef, 10n);
      const leaf2 = hashLeaf(recipientRef, 20n);
      expect(leaf1.equals(leaf2)).toBe(false);
    });
  });

  describe("hashNode", () => {
    it("is commutative because children are sorted by byte value", () => {
      const a = Buffer.alloc(32, 0x01);
      const b = Buffer.alloc(32, 0x02);
      const nodeAB = hashNode(a, b);
      const nodeBA = hashNode(b, a);
      expect(nodeAB.equals(nodeBA)).toBe(true);
    });
  });

  describe("buildBatch and proof verification", () => {
    it("handles single-entry batch where root is the leaf", () => {
      const entries = [{ reference: "user-single", amount: 1_0000000n }];
      const batch = buildBatch(entries, testSalt);
      expect(batch.count).toBe(1);
      expect(batch.total).toBe(1_0000000n);
      expect(batch.leaves.length).toBe(1);
      expect(batch.root.equals(batch.leaves[0])).toBe(true);

      const proof = inclusionProof(batch, 0);
      expect(proof).toHaveLength(0);
      expect(verifyProof(batch.leaves[0], proof, batch.root)).toBe(true);
    });

    it("builds multi-entry batch and verifies inclusion proofs for all leaves", () => {
      const entries = [
        { reference: "user-1", amount: 10_0000000n },
        { reference: "user-2", amount: 20_0000000n },
        { reference: "user-3", amount: 30_0000000n },
        { reference: "user-4", amount: 40_0000000n },
        { reference: "user-5", amount: 50_0000000n },
      ];

      const batch = buildBatch(entries, testSalt);
      expect(batch.count).toBe(5);
      expect(batch.total).toBe(150_0000000n);
      expect(batch.leaves).toHaveLength(5);

      for (let i = 0; i < batch.leaves.length; i++) {
        const proof = inclusionProof(batch, i);
        expect(verifyProof(batch.leaves[i], proof, batch.root)).toBe(true);
      }
    });

    it("rejects invalid proofs or mismatched leaves", () => {
      const entries = [
        { reference: "alice", amount: 100n },
        { reference: "bob", amount: 200n },
      ];
      const batch = buildBatch(entries, testSalt);
      const proofAlice = inclusionProof(batch, 0);

      // Tampered leaf
      const fakeLeaf = Buffer.alloc(32, 0xff);
      expect(verifyProof(fakeLeaf, proofAlice, batch.root)).toBe(false);

      // Wrong proof for leaf
      const proofBob = inclusionProof(batch, 1);
      expect(verifyProof(batch.leaves[0], proofBob, batch.root)).toBe(false);

      // Tampered root
      const fakeRoot = Buffer.alloc(32, 0xee);
      expect(verifyProof(batch.leaves[0], proofAlice, fakeRoot)).toBe(false);
    });
  });
});
