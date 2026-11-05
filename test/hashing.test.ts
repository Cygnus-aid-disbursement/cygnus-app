import { describe, it, expect } from "vitest";
import {
  hashProgrammeMetadata,
  hashMilestoneDescription,
  hashEvidence,
  hashRejectionReason,
  canonicalJson,
  DOMAINS,
} from "@cygnus-aid-disbursement/sdk";

describe("domain-separated hashing utilities", () => {
  describe("DOMAINS constants", () => {
    it("defines distinct domain tags for each data type", () => {
      expect(DOMAINS.programmeMetadata).toBe("cygnus.programme-metadata.v1");
      expect(DOMAINS.milestoneDescription).toBe("cygnus.milestone-description.v1");
      expect(DOMAINS.evidence).toBe("cygnus.evidence.v1");
      expect(DOMAINS.rejectionReason).toBe("cygnus.rejection-reason.v1");

      const uniqueDomains = new Set(Object.values(DOMAINS));
      expect(uniqueDomains.size).toBe(4);
    });
  });

  describe("canonicalJson", () => {
    it("sorts object keys alphabetically for deterministic encoding", () => {
      const obj1 = { z: 1, a: 2, m: 3 };
      const obj2 = { a: 2, m: 3, z: 1 };
      expect(canonicalJson(obj1)).toBe(canonicalJson(obj2));
      expect(canonicalJson(obj1)).toBe('{"a":2,"m":3,"z":1}');
    });

    it("sorts nested object keys recursively", () => {
      const nested1 = { b: { y: 2, x: 1 }, a: 1 };
      const nested2 = { a: 1, b: { x: 1, y: 2 } };
      expect(canonicalJson(nested1)).toBe(canonicalJson(nested2));
    });

    it("preserves array ordering", () => {
      const arr1 = { items: [3, 2, 1] };
      const arr2 = { items: [1, 2, 3] };
      expect(canonicalJson(arr1)).not.toBe(canonicalJson(arr2));
    });
  });

  describe("domain hashing", () => {
    const payload = {
      title: "Clean Water Project",
      location: "District 9",
    };

    it("hashes programme metadata into 32-byte sha256 buffer", () => {
      const hash = hashProgrammeMetadata(payload);
      expect(hash.length).toBe(32);
      expect(hashProgrammeMetadata(payload).equals(hash)).toBe(true);
    });

    it("hashes milestone description into 32-byte buffer", () => {
      const hash = hashMilestoneDescription(payload);
      expect(hash.length).toBe(32);
    });

    it("hashes evidence into 32-byte buffer", () => {
      const hash = hashEvidence(payload);
      expect(hash.length).toBe(32);
    });

    it("hashes rejection reason into 32-byte buffer", () => {
      const hash = hashRejectionReason({ reason: "Insufficient receipts provided" });
      expect(hash.length).toBe(32);
    });

    it("produces distinct hashes for identical content across different domains", () => {
      // Due to domain prefixing, identical content hashed under different domains must never match
      const metaHash = hashProgrammeMetadata(payload);
      const descHash = hashMilestoneDescription(payload);
      const evidHash = hashEvidence(payload);

      expect(metaHash.equals(descHash)).toBe(false);
      expect(metaHash.equals(evidHash)).toBe(false);
      expect(descHash.equals(evidHash)).toBe(false);
    });
  });
});
