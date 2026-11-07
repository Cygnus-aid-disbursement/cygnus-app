import type { Programme } from "@cygnus-aid-disbursement/sdk";
import { formatStroops, shortAddress } from "./format";
import { programmeStatusLabel, progress } from "./enums";
import { isImplementerVerified } from "./astrolabe";

export interface ClientProgrammeSummary {
  id: string;
  sponsor: string;
  implementer: string;
  statusTag: "Active" | "Closed";
  statusLabel: string;
  totalFormatted: string;
  disbursedFormatted: string;
  sponsorShort: string;
  implementerShort: string;
  progressPct: number;
  isImplementerVerified: boolean;
}

export function toClientProgrammeSummary(p: Programme): ClientProgrammeSummary {
  return {
    id: p.id.toString(),
    sponsor: p.sponsor,
    implementer: p.implementer,
    statusTag: p.status.tag,
    statusLabel: programmeStatusLabel(p.status),
    totalFormatted: formatStroops(p.total),
    disbursedFormatted: formatStroops(p.disbursed),
    sponsorShort: shortAddress(p.sponsor),
    implementerShort: shortAddress(p.implementer),
    progressPct: progress(p.disbursed, p.total),
    isImplementerVerified: isImplementerVerified(p.implementer),
  };
}

export type StatusFilter = "All" | "Active" | "Closed";

export function filterProgrammes(
  programmes: ClientProgrammeSummary[],
  query: string,
  status: StatusFilter,
): ClientProgrammeSummary[] {
  const normalizedQuery = query.trim().toLowerCase();

  return programmes.filter((p) => {
    // Status filter match
    if (status !== "All" && p.statusTag !== status) {
      return false;
    }

    // Query filter match
    if (normalizedQuery.length === 0) {
      return true;
    }

    // Match programme ID (with or without # prefix)
    const idWithHash = `#${p.id}`.toLowerCase();
    if (p.id.toLowerCase() === normalizedQuery || idWithHash === normalizedQuery) {
      return true;
    }

    // Match sponsor or implementer address substring
    if (
      p.sponsor.toLowerCase().includes(normalizedQuery) ||
      p.implementer.toLowerCase().includes(normalizedQuery)
    ) {
      return true;
    }

    return false;
  });
}
