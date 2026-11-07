"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress-bar";
import { CopyButton } from "@/components/copy-button";
import { AstrolabeBadge } from "@/components/astrolabe-badge";
import {
  filterProgrammes,
  type ClientProgrammeSummary,
  type StatusFilter,
} from "@/lib/programme-filter";

export interface ProgrammeSearchProps {
  initialProgrammes: ClientProgrammeSummary[];
}

export function ProgrammeSearch({ initialProgrammes }: ProgrammeSearchProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");

  const filtered = useMemo(() => {
    return filterProgrammes(initialProgrammes, query, status);
  }, [initialProgrammes, query, status]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setQuery("");
    }
  };

  const resetFilters = () => {
    setQuery("");
    setStatus("All");
  };

  return (
    <div className="space-y-6">
      {/* Search and filter controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <label htmlFor="programme-search-input" className="sr-only">
            Search programmes by ID, sponsor, or implementer address
          </label>
          <input
            id="programme-search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by ID, sponsor, or implementer..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status filter buttons */}
        <div
          role="group"
          aria-label="Filter programmes by status"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 p-1"
        >
          {(["All", "Active", "Closed"] as const).map((filterOption) => (
            <button
              key={filterOption}
              type="button"
              onClick={() => setStatus(filterOption)}
              aria-pressed={status === filterOption}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                status === filterOption
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>
      </div>

      {/* Accessible results announcement */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filtered.length} of {initialProgrammes.length} programmes
        </span>
        <div aria-live="polite" className="sr-only">
          {filtered.length === 0
            ? "No programmes found matching search criteria"
            : `Showing ${filtered.length} of ${initialProgrammes.length} programmes`}
        </div>
      </div>

      {/* Programme cards or empty state */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center space-y-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No programmes match your current filter criteria.
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => (
            <Link key={p.id} href={`/programmes/${p.id}`}>
              <Card className="transition-colors hover:border-accent">
                <CardContent className="space-y-3 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Programme #{p.id}</span>
                    <Badge tone={p.statusTag === "Active" ? "active" : "closed"}>
                      {p.statusLabel}
                    </Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-muted-foreground">Sponsor</dt>
                      <dd className="flex items-center gap-1">
                        <span>{p.sponsorShort}</span>
                        <CopyButton
                          value={p.sponsor}
                          label={`Copy sponsor address for programme #${p.id}`}
                        />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Implementer</dt>
                      <dd className="flex flex-wrap items-center gap-1">
                        <span>{p.implementerShort}</span>
                        {p.isImplementerVerified && <AstrolabeBadge />}
                        <CopyButton
                          value={p.implementer}
                          label={`Copy implementer address for programme #${p.id}`}
                        />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Budget</dt>
                      <dd>{p.totalFormatted}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Disbursed</dt>
                      <dd>{p.disbursedFormatted}</dd>
                    </div>
                  </dl>
                  <ProgressBar value={p.progressPct} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
