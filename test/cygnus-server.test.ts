import { describe, it, expect, vi } from "vitest";
import {
  listProgrammes,
  getProgramme,
  getBatches,
  getProgrammeEvents,
  resolveDeployment,
} from "../lib/cygnus";
import { createMockProgramme, createMockBatch } from "./mocks/fixtures";
import type { Programme, DisbursementBatch, CygnusEvent } from "@cygnus-aid-disbursement/sdk";

describe("cygnus server queries", () => {
  describe("listProgrammes", () => {
    it("probes upward and returns contiguous programmes until null/undefined", async () => {
      const p0 = createMockProgramme({ id: 0n });
      const p1 = createMockProgramme({ id: 1n });
      const mockClient = {
        getProgramme: vi.fn(async (id: bigint): Promise<Programme | undefined> => {
          if (id === 0n) return p0;
          if (id === 1n) return p1;
          return undefined;
        }),
      };

      const result = await listProgrammes(10, mockClient);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(0n);
      expect(result[1].id).toBe(1n);
      expect(mockClient.getProgramme).toHaveBeenCalledTimes(3);
    });

    it("terminates gracefully when contract throws ProgrammeNotFound (code 1)", async () => {
      const p0 = createMockProgramme({ id: 0n });
      const mockClient = {
        getProgramme: vi.fn(async (id: bigint): Promise<Programme | undefined> => {
          if (id === 0n) return p0;
          throw new Error("Simulation failed: Error(Contract, #1)");
        }),
      };

      const result = await listProgrammes(10, mockClient);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(0n);
    });

    it("respects max query limit", async () => {
      const mockClient = {
        getProgramme: vi.fn(async (id: bigint) => createMockProgramme({ id })),
      };

      const result = await listProgrammes(3, mockClient);
      expect(result).toHaveLength(3);
      expect(mockClient.getProgramme).toHaveBeenCalledTimes(3);
    });

    it("rethrows if probe for first programme fails with network/system error", async () => {
      const mockClient = {
        getProgramme: vi.fn(async () => {
          throw new Error("RPC network timeout");
        }),
      };

      await expect(listProgrammes(10, mockClient)).rejects.toThrow("RPC network timeout");
    });
  });

  describe("getProgramme", () => {
    it("returns programme when found", async () => {
      const p = createMockProgramme({ id: 5n });
      const mockClient = {
        getProgramme: vi.fn(async () => p),
      };

      const result = await getProgramme(5n, mockClient);
      expect(result).toEqual(p);
      expect(mockClient.getProgramme).toHaveBeenCalledWith(5n);
    });

    it("returns undefined when contract throws ProgrammeNotFound (code 1)", async () => {
      const mockClient = {
        getProgramme: vi.fn(async () => {
          throw new Error("HostError: Error(Contract, #1)");
        }),
      };

      const result = await getProgramme(99n, mockClient);
      expect(result).toBeUndefined();
    });

    it("rethrows unexpected errors", async () => {
      const mockClient = {
        getProgramme: vi.fn(async () => {
          throw new Error("Stellar RPC internal error");
        }),
      };

      await expect(getProgramme(1n, mockClient)).rejects.toThrow("Stellar RPC internal error");
    });
  });

  describe("getBatches", () => {
    it("fetches specified count of batches", async () => {
      const b0 = createMockBatch({ count: 10 });
      const b1 = createMockBatch({ count: 20 });
      const mockClient = {
        getBatch: vi.fn(
          async (_id: bigint, idx: number): Promise<DisbursementBatch | undefined> => {
            if (idx === 0) return b0;
            if (idx === 1) return b1;
            return undefined;
          },
        ),
      };

      const batches = await getBatches(1n, 2, mockClient);
      expect(batches).toHaveLength(2);
      expect(batches[0].count).toBe(10);
      expect(batches[1].count).toBe(20);
    });

    it("stops gracefully when batch index is out of range (code 14)", async () => {
      const b0 = createMockBatch({ count: 5 });
      const mockClient = {
        getBatch: vi.fn(async (_id: bigint, idx: number) => {
          if (idx === 0) return b0;
          throw new Error("Error(Contract, #14)");
        }),
      };

      const batches = await getBatches(1n, 5, mockClient);
      expect(batches).toHaveLength(1);
    });
  });

  describe("resolveDeployment", () => {
    it("resolves default testnet deployment when no override is set", () => {
      const deployment = resolveDeployment();
      expect(deployment.contractId).toMatch(/^C[A-Z0-9]{55}$/);
      expect(deployment.networkPassphrase).toContain("Test SDF Network");
    });
  });

  describe("getProgrammeEvents", () => {
    it("filters contract events strictly for the requested programme ID", async () => {
      const evProg1: CygnusEvent = {
        type: "ProgrammeFunded",
        programmeId: 1n,
        amount: 100n,
      };
      const evProg2: CygnusEvent = {
        type: "ProgrammeFunded",
        programmeId: 2n,
        amount: 200n,
      };

      const mockClient = {
        events: vi.fn(async () => [evProg1, evProg2]),
      };

      const events = await getProgrammeEvents(1n, 0, mockClient);
      expect(events).toHaveLength(1);
      expect(events[0].programmeId).toBe(1n);
    });

    it("returns empty array gracefully on network/RPC error", async () => {
      const mockClient = {
        events: vi.fn(async () => {
          throw new Error("RPC events rate limited");
        }),
      };

      const events = await getProgrammeEvents(1n, 0, mockClient);
      expect(events).toEqual([]);
    });
  });
});
