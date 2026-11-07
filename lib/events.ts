import type { CygnusEvent } from "@cygnus-aid-disbursement/sdk";
import { formatStroops, hex, shortAddress, shortHex } from "./format";

export interface FormattedEvent {
  type: CygnusEvent["type"];
  programmeId: string;
  title: string;
  description: string;
  details?: Record<string, string>;
  copyValues?: Record<string, string>;
  badgeTone?: "neutral" | "active" | "warn";
}

export function formatCygnusEvent(event: CygnusEvent): FormattedEvent {
  const programmeId = event.programmeId.toString();

  switch (event.type) {
    case "ProgrammeCreated": {
      return {
        type: event.type,
        programmeId,
        title: "Programme created",
        description: `Created with budget of ${formatStroops(event.total)}`,
        details: {
          Sponsor: shortAddress(event.sponsor),
          Implementer: shortAddress(event.implementer),
          Budget: formatStroops(event.total),
        },
        copyValues: {
          Sponsor: event.sponsor,
          Implementer: event.implementer,
        },
        badgeTone: "active",
      };
    }

    case "ProgrammeFunded": {
      return {
        type: event.type,
        programmeId,
        title: "Programme funded",
        description: `Funded with ${formatStroops(event.amount)}`,
        details: {
          Amount: formatStroops(event.amount),
        },
        badgeTone: "active",
      };
    }

    case "MilestoneClaimed": {
      const evidenceHex = hex(event.evidenceHash);
      return {
        type: event.type,
        programmeId,
        title: `Milestone ${event.milestoneIndex} claimed`,
        description: event.claimedLate
          ? "Milestone claim submitted after deadline"
          : "Milestone claim submitted with proof of work",
        details: {
          "Milestone index": event.milestoneIndex.toString(),
          "Evidence hash": shortHex(event.evidenceHash),
          Timing: event.claimedLate ? "Claimed late" : "On time",
        },
        copyValues: {
          "Evidence hash": evidenceHex,
        },
        badgeTone: event.claimedLate ? "warn" : "neutral",
      };
    }

    case "MilestoneApproved": {
      return {
        type: event.type,
        programmeId,
        title: `Milestone ${event.milestoneIndex} approved`,
        description: "Milestone approval recorded on chain, unlocking funds for disbursement",
        details: {
          "Milestone index": event.milestoneIndex.toString(),
        },
        badgeTone: "active",
      };
    }

    case "MilestoneRejected": {
      const reasonHex = hex(event.reasonHash);
      return {
        type: event.type,
        programmeId,
        title: `Milestone ${event.milestoneIndex} rejected`,
        description: "Milestone rejected by approver with rejection reason hash recorded on chain",
        details: {
          "Milestone index": event.milestoneIndex.toString(),
          "Reason hash": shortHex(event.reasonHash),
        },
        copyValues: {
          "Reason hash": reasonHex,
        },
        badgeTone: "warn",
      };
    }

    case "BatchDisbursed": {
      const rootHex = hex(event.root);
      return {
        type: event.type,
        programmeId,
        title: `Disbursement batch ${event.batchIndex}`,
        description: `Disbursed ${formatStroops(event.total)} across ${event.count} recipient payouts`,
        details: {
          "Batch index": event.batchIndex.toString(),
          Total: formatStroops(event.total),
          Recipients: event.count.toString(),
          "Merkle root": shortHex(event.root),
        },
        copyValues: {
          "Merkle root": rootHex,
        },
        badgeTone: "active",
      };
    }

    case "ProgrammeRefunded": {
      return {
        type: event.type,
        programmeId,
        title: "Programme balance refunded",
        description: `Unclaimed remaining balance of ${formatStroops(event.amount)} refunded to sponsor`,
        details: {
          "Refunded amount": formatStroops(event.amount),
        },
        badgeTone: "neutral",
      };
    }
  }
}
