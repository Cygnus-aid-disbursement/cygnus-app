import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading aid programmes...">
      <section className="space-y-3">
        <div className="h-8 w-64 rounded bg-muted/60 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full max-w-2xl rounded bg-muted/40 animate-pulse" />
          <div className="h-4 w-5/6 max-w-xl rounded bg-muted/40 animate-pulse" />
        </div>
      </section>

      {/* Filter and search bar skeleton */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-10 w-full max-w-sm rounded-md bg-muted/50 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-16 rounded-md bg-muted/40 animate-pulse" />
            <div className="h-8 w-16 rounded-md bg-muted/40 animate-pulse" />
            <div className="h-8 w-16 rounded-md bg-muted/40 animate-pulse" />
          </div>
        </div>

        {/* Programme cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((key) => (
            <Card key={key} className="border-border">
              <CardContent className="space-y-3 pt-5">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 rounded bg-muted/50 animate-pulse" />
                  <div className="h-5 w-20 rounded bg-muted/40 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="h-4 w-28 rounded bg-muted/40 animate-pulse" />
                  <div className="h-4 w-28 rounded bg-muted/40 animate-pulse" />
                  <div className="h-4 w-28 rounded bg-muted/40 animate-pulse" />
                  <div className="h-4 w-28 rounded bg-muted/40 animate-pulse" />
                </div>
                <div className="h-2 w-full rounded bg-muted/30 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading aid programmes from Stellar ledger...</span>
    </div>
  );
}
