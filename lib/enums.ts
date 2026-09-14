import type { ApproverConfig, MilestoneStatus, ProgrammeStatus } from "@cygnus-aid-disbursement/sdk";

export function milestoneStatusLabel(status: MilestoneStatus): string {
  return status.tag;
}

export function programmeStatusLabel(status: ProgrammeStatus): string {
  return status.tag;
}

export function approverLabel(approver: ApproverConfig): string {
  switch (approver.tag) {
    case "Single":
      return "Single approver";
    case "Panel":
      return `Panel of ${approver.values[0].length}, threshold ${approver.values[1]}`;
    case "Oracle":
      return "Oracle approver";
  }
}

export function progress(disbursed: bigint, total: bigint): number {
  if (total <= 0n) return 0;
  const pct = Number((disbursed * 100n) / total);
  return Math.min(100, Math.max(0, pct));
}
