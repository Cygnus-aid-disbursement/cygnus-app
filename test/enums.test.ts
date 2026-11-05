import { describe, expect, it } from "vitest";
import { approverLabel, milestoneStatusLabel, programmeStatusLabel, progress } from "../lib/enums";
import type {
  ApproverConfig,
  MilestoneStatus,
  ProgrammeStatus,
} from "@cygnus-aid-disbursement/sdk";

describe("milestoneStatusLabel", () => {
  it("returns status tag name", () => {
    const pending = { tag: "Pending", values: undefined } as unknown as MilestoneStatus;
    const claimed = { tag: "Claimed", values: undefined } as unknown as MilestoneStatus;
    const approved = { tag: "Approved", values: undefined } as unknown as MilestoneStatus;
    const rejected = { tag: "Rejected", values: undefined } as unknown as MilestoneStatus;

    expect(milestoneStatusLabel(pending)).toBe("Pending");
    expect(milestoneStatusLabel(claimed)).toBe("Claimed");
    expect(milestoneStatusLabel(approved)).toBe("Approved");
    expect(milestoneStatusLabel(rejected)).toBe("Rejected");
  });
});

describe("programmeStatusLabel", () => {
  it("returns status tag name", () => {
    const active = { tag: "Active", values: undefined } as unknown as ProgrammeStatus;
    const closed = { tag: "Closed", values: undefined } as unknown as ProgrammeStatus;

    expect(programmeStatusLabel(active)).toBe("Active");
    expect(programmeStatusLabel(closed)).toBe("Closed");
  });
});

describe("approverLabel", () => {
  it("formats Single approver", () => {
    const single: ApproverConfig = { tag: "Single", values: ["GABC"] };
    expect(approverLabel(single)).toBe("Single approver");
  });

  it("formats Panel approver with length and threshold", () => {
    const panel: ApproverConfig = {
      tag: "Panel",
      values: [["GABC", "GDEF", "GHIJ"], 2],
    };
    expect(approverLabel(panel)).toBe("Panel of 3, threshold 2");
  });

  it("formats Oracle approver", () => {
    const oracle: ApproverConfig = { tag: "Oracle", values: ["GABC"] };
    expect(approverLabel(oracle)).toBe("Oracle approver");
  });
});

describe("progress", () => {
  it("calculates exact percentage for normal ranges", () => {
    expect(progress(0n, 100n)).toBe(0);
    expect(progress(50n, 100n)).toBe(50);
    expect(progress(100n, 100n)).toBe(100);
  });

  it("handles integer truncation correctly", () => {
    expect(progress(1n, 3n)).toBe(33);
    expect(progress(2n, 3n)).toBe(66);
  });

  it("clamps to 0 and 100", () => {
    expect(progress(200n, 100n)).toBe(100);
    expect(progress(1n, 0n)).toBe(0);
    expect(progress(0n, 0n)).toBe(0);
    expect(progress(-10n, 100n)).toBe(0);
    expect(progress(50n, -100n)).toBe(0);
  });

  it("handles very large 128-bit numbers without precision loss", () => {
    const huge = 100_000_000_000_000_000_000n;
    expect(progress(huge / 2n, huge)).toBe(50);
    expect(progress(huge / 4n, huge)).toBe(25);
  });
});
