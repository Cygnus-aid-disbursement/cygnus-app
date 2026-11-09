import { describe, it, expect } from "vitest";
import {
  isValidStellarAddress,
  isValidContractId,
  validateStroopAmount,
  validateProgrammeId,
  validateIndex,
} from "../lib/validators";

describe("validators module", () => {
  describe("isValidStellarAddress", () => {
    it("accepts valid 56-character G addresses", () => {
      const valid = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
      expect(isValidStellarAddress(valid)).toBe(true);
    });

    it("rejects addresses with invalid length or prefix", () => {
      expect(isValidStellarAddress("G123")).toBe(false);
      expect(
        isValidStellarAddress("CBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"),
      ).toBe(false);
      expect(isValidStellarAddress("")).toBe(false);
      expect(isValidStellarAddress(null as unknown as string)).toBe(false);
    });

    it("rejects addresses with invalid Base32 characters like 0, 1, 8, 9", () => {
      // 0, 1, 8, 9 are not valid RFC4648 Base32 chars
      const bad = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA0";
      expect(isValidStellarAddress(bad)).toBe(false);
    });
  });

  describe("isValidContractId", () => {
    it("accepts valid 56-character C contract IDs", () => {
      const validContract = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
      expect(isValidContractId(validContract)).toBe(true);
    });

    it("rejects invalid contract IDs", () => {
      expect(isValidContractId("GDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC")).toBe(
        false,
      );
      expect(isValidContractId("C123")).toBe(false);
      expect(isValidContractId("")).toBe(false);
    });
  });

  describe("validateStroopAmount", () => {
    it("accepts positive integer stroops", () => {
      const res = validateStroopAmount("10000000");
      expect(res.valid).toBe(true);
      expect(res.value).toBe(10000000n);
    });

    it("rejects decimals and explains stroop conversion", () => {
      const res = validateStroopAmount("1.5");
      expect(res.valid).toBe(false);
      expect(res.error).toContain("no decimals allowed");
    });

    it("rejects negative amounts and zero", () => {
      expect(validateStroopAmount("-500").error).toContain("cannot be negative");
      expect(validateStroopAmount("0").error).toContain("greater than zero");
    });

    it("rejects empty or non-digit input", () => {
      expect(validateStroopAmount("").error).toContain("required");
      expect(validateStroopAmount("abc").error).toContain("digits only");
    });
  });

  describe("validateProgrammeId", () => {
    it("accepts non-negative integer IDs", () => {
      expect(validateProgrammeId("0").value).toBe(0n);
      expect(validateProgrammeId("42").value).toBe(42n);
    });

    it("rejects negative or non-integer IDs", () => {
      expect(validateProgrammeId("-1").valid).toBe(false);
      expect(validateProgrammeId("abc").valid).toBe(false);
      expect(validateProgrammeId("").valid).toBe(false);
    });
  });

  describe("validateIndex", () => {
    it("accepts non-negative integer indices", () => {
      expect(validateIndex("0").value).toBe(0);
      expect(validateIndex("12").value).toBe(12);
    });

    it("rejects negative numbers or floats", () => {
      expect(validateIndex("-1").valid).toBe(false);
      expect(validateIndex("1.2").valid).toBe(false);
      expect(validateIndex("foo").valid).toBe(false);
    });
  });
});
