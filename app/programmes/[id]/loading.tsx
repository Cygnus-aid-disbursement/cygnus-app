import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProgrammeDetailLoading() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading programme details...">
      {/* Header Skeleton */}
      <section className="space-y-3">
        <div className="h-4 w-28 rounded bg-muted/40 animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="h-8 w-60 rounded bg-muted/60 animate-pulse" />
          <div className="h-6 w-24 rounded bg-muted/40 animate-pulse" />
        </div>
        <div className="h-4 w-full max-w-xl rounded bg-muted/30 animate-pulse" />
      </section>

      {/* Summary Metrics Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((key) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 rounded bg-muted/40 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-32 rounded bg-muted/60 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Milestones Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-40 rounded bg-muted/50 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((key) => (
            <div
              key={key}
              className="h-16 rounded-md border border-border/50 bg-muted/20 animate-pulse"
            />
          ))}
        </CardContent>
      </Card>

      {/* Timeline Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-44 rounded bg-muted/50 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((key) => (
            <div key={key} className="h-12 rounded bg-muted/20 animate-pulse" />
          ))}
        </CardContent>
      </Card>
      <span className="sr-only">Loading programme record from Stellar network...</span>
    </div>
  );
}
