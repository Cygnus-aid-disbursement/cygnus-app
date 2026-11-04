import { describe, expect, it } from "vitest";
import { contractId, RPC_URL } from "../lib/cygnus";
import { deployments } from "@cygnus-aid-disbursement/sdk";

describe("cygnus config", () => {
  it("provides default RPC URL", () => {
    expect(RPC_URL).toBeDefined();
    expect(RPC_URL).toContain("soroban");
  });

  it("resolves default contract ID from sdk deployments", () => {
    const id = contractId();
    expect(id).toBe(deployments.testnet.contracts.programme);
  });
});
