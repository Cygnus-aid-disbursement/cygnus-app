import { describe, it, expect } from "vitest";
import {
  parseContractErrorCode,
  getContractErrorDescription,
  formatErrorMessage,
  CONTRACT_ERROR_DESCRIPTIONS,
} from "../lib/errors";

describe("errors module", () => {
  describe("parseContractErrorCode", () => {
    it("extracts code from standard Soroban Error(Contract, #N) format", () => {
      expect(parseContractErrorCode("HostError: Error(Contract, #1)")).toBe(1);
      expect(parseContractErrorCode("Error(Contract, #7)")).toBe(7);
      expect(parseContractErrorCode("Transaction failed with Error(Contract, 11)")).toBe(11);
    });

    it("extracts code from Error instance messages", () => {
      const err = new Error("Simulation failed: Error(Contract, #2)");
      expect(parseContractErrorCode(err)).toBe(2);
    });

    it("extracts code from contract code #N pattern", () => {
      expect(parseContractErrorCode("failed with contract code #14")).toBe(14);
      expect(parseContractErrorCode("contract code 5")).toBe(5);
    });

    it("accepts numeric code directly if valid", () => {
      expect(parseContractErrorCode(1)).toBe(1);
      expect(parseContractErrorCode(14)).toBe(14);
      expect(parseContractErrorCode(999)).toBeNull();
    });

    it("returns null for unrecognized strings or errors", () => {
      expect(parseContractErrorCode("Network request failed")).toBeNull();
      expect(parseContractErrorCode(new Error("Timeout"))).toBeNull();
      expect(parseContractErrorCode(null)).toBeNull();
      expect(parseContractErrorCode(undefined)).toBeNull();
    });
  });

  describe("getContractErrorDescription", () => {
    it("returns friendly explanations for all defined error codes", () => {
      expect(getContractErrorDescription(1)).toBe("Programme not found on-chain.");
      expect(getContractErrorDescription(7)).toBe("Insufficient funds available in programme.");
      expect(getContractErrorDescription(11)).toBe("Invalid Merkle batch or proof root mismatch.");
      expect(getContractErrorDescription(99)).toBeUndefined();
    });

    it("has descriptions for codes 1 through 14", () => {
      for (let i = 1; i <= 14; i++) {
        expect(CONTRACT_ERROR_DESCRIPTIONS[i]).toBeDefined();
        expect(typeof CONTRACT_ERROR_DESCRIPTIONS[i]).toBe("string");
      }
    });
  });

  describe("formatErrorMessage", () => {
    it("formats known contract error codes into clear messages", () => {
      const msg = formatErrorMessage(new Error("RPC call failed: Error(Contract, #1)"));
      expect(msg).toBe("ProgrammeNotFound: Programme not found on-chain.");
    });

    it("formats milestone claim error", () => {
      const msg = formatErrorMessage("Error(Contract, #4)");
      expect(msg).toBe("MilestoneNotClaimable: Milestone cannot be claimed yet.");
    });

    it("extracts the first line from standard Error messages", () => {
      const err = new Error("Connection refused\nExtra debug details line 2");
      expect(formatErrorMessage(err)).toBe("Connection refused");
    });

    it("uses plain strings as error message", () => {
      expect(formatErrorMessage("User rejected signature")).toBe("User rejected signature");
    });

    it("returns default fallback when error is empty or undefined", () => {
      expect(formatErrorMessage(null)).toBe("An unexpected error occurred");
      expect(formatErrorMessage(undefined)).toBe("An unexpected error occurred");
      expect(formatErrorMessage("")).toBe("An unexpected error occurred");
      expect(formatErrorMessage(null, "Custom fallback")).toBe("Custom fallback");
    });
  });
});
