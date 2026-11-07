import { describe, it, expect } from "vitest";
import {
  filterProgrammes,
  toClientProgrammeSummary,
  type ClientProgrammeSummary,
} from "../lib/programme-filter";
import { createMockProgramme } from "./mocks/fixtures";

describe("programme filtering logic", () => {
  const p0: ClientProgrammeSummary = {
    id: "0",
    sponsor: "GASPONSORAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    implementer: "GAIMPLEMENTERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    statusTag: "Active",
    statusLabel: "Active",
    totalFormatted: "100.0 XLM",
    disbursedFormatted: "25.0 XLM",
    sponsorShort: "GASPO...AAAA",
    implementerShort: "GAIMP...AAAA",
    progressPct: 25,
    isImplementerVerified: false,
  };

  const p1: ClientProgrammeSummary = {
    id: "1",
    sponsor: "GASPONSORBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    implementer: "GAIMPLEMENTERBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    statusTag: "Closed",
    statusLabel: "Closed",
    totalFormatted: "50.0 XLM",
    disbursedFormatted: "50.0 XLM",
    sponsorShort: "GASPO...BBBB",
    implementerShort: "GAIMP...BBBB",
    progressPct: 100,
    isImplementerVerified: false,
  };

  const p2: ClientProgrammeSummary = {
    id: "2",
    sponsor: "GAORANGECCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
    implementer: "GABANANACCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
    statusTag: "Active",
    statusLabel: "Active",
    totalFormatted: "200.0 XLM",
    disbursedFormatted: "0.0 XLM",
    sponsorShort: "GAORA...CCCC",
    implementerShort: "GABAN...CCCC",
    progressPct: 0,
    isImplementerVerified: true,
  };

  const list = [p0, p1, p2];

  describe("toClientProgrammeSummary", () => {
    it("converts raw Programme with bigints into client-safe summary", () => {
      const raw = createMockProgramme({ id: 42n });
      const summary = toClientProgrammeSummary(raw);

      expect(summary.id).toBe("42");
      expect(summary.statusTag).toBe("Active");
      expect(typeof summary.progressPct).toBe("number");
      expect(typeof summary.totalFormatted).toBe("string");
    });
  });

  describe("filterProgrammes", () => {
    it("returns all programmes when query is empty and status is All", () => {
      const results = filterProgrammes(list, "", "All");
      expect(results).toHaveLength(3);
    });

    it("filters by status: Active", () => {
      const results = filterProgrammes(list, "", "Active");
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.id)).toEqual(["0", "2"]);
    });

    it("filters by status: Closed", () => {
      const results = filterProgrammes(list, "", "Closed");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("1");
    });

    it("searches by exact programme ID (numeric or # prefixed)", () => {
      expect(filterProgrammes(list, "0", "All")).toHaveLength(1);
      expect(filterProgrammes(list, "#0", "All")).toHaveLength(1);
      expect(filterProgrammes(list, "1", "All")).toHaveLength(1);
      expect(filterProgrammes(list, "#2", "All")).toHaveLength(1);
      expect(filterProgrammes(list, "99", "All")).toHaveLength(0);
    });

    it("searches by sponsor address substring (case-insensitive)", () => {
      const results = filterProgrammes(list, "orange", "All");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("2");
    });

    it("searches by implementer address substring (case-insensitive)", () => {
      const results = filterProgrammes(list, "banana", "All");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("2");
    });

    it("combines search query and status filter simultaneously", () => {
      // Query "sponsor" matches p0 and p1, but status "Closed" matches only p1
      const results = filterProgrammes(list, "sponsor", "Closed");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("1");
    });

    it("returns empty array when nothing matches", () => {
      const results = filterProgrammes(list, "nonexistent-address", "All");
      expect(results).toHaveLength(0);
    });
  });
});
