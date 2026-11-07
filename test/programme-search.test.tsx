import { describe, it, expect } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProgrammeSearch } from "../components/programme-search";
import type { ClientProgrammeSummary } from "../lib/programme-filter";

describe("ProgrammeSearch component", () => {
  const mockProgrammes: ClientProgrammeSummary[] = [
    {
      id: "1",
      sponsor: "GASPOPNSOR111111111111111111111111111111111111111111111111",
      implementer: "GAIMPLEMENTER11111111111111111111111111111111111111111111",
      statusTag: "Active",
      statusLabel: "Active",
      totalFormatted: "100.0 XLM",
      disbursedFormatted: "25.0 XLM",
      sponsorShort: "GASPO...1111",
      implementerShort: "GAIMP...1111",
      progressPct: 25,
    },
    {
      id: "2",
      sponsor: "GASPOPNSOR222222222222222222222222222222222222222222222222",
      implementer: "GAIMPLEMENTER22222222222222222222222222222222222222222222",
      statusTag: "Closed",
      statusLabel: "Closed",
      totalFormatted: "50.0 XLM",
      disbursedFormatted: "50.0 XLM",
      sponsorShort: "GASPO...2222",
      implementerShort: "GAIMP...2222",
      progressPct: 100,
    },
  ];

  it("renders search input with accessible label and placeholder", () => {
    const html = renderToStaticMarkup(<ProgrammeSearch initialProgrammes={mockProgrammes} />);
    expect(html).toContain('id="programme-search-input"');
    expect(html).toContain('type="search"');
    expect(html).toContain("Search programmes by ID, sponsor, or implementer address");
  });

  it("renders status filter buttons for All, Active, and Closed", () => {
    const html = renderToStaticMarkup(<ProgrammeSearch initialProgrammes={mockProgrammes} />);
    expect(html).toContain("All</button>");
    expect(html).toContain("Active</button>");
    expect(html).toContain("Closed</button>");
  });

  it("renders live aria announcement for result count", () => {
    const html = renderToStaticMarkup(<ProgrammeSearch initialProgrammes={mockProgrammes} />);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("Showing 2 of 2 programmes");
  });

  it("renders cards with copy buttons for sponsor and implementer", () => {
    const html = renderToStaticMarkup(<ProgrammeSearch initialProgrammes={mockProgrammes} />);
    expect(html).toContain("Programme #1");
    expect(html).toContain("Programme #2");
    expect(html).toContain("Copy sponsor address for programme #1");
    expect(html).toContain("Copy implementer address for programme #1");
  });

  it("renders empty state when initial programmes array is empty", () => {
    const html = renderToStaticMarkup(<ProgrammeSearch initialProgrammes={[]} />);
    expect(html).toContain("No programmes match your current filter criteria.");
    expect(html).toContain("Reset filters");
  });
});
