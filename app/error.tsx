"use client";

import * as React from "react";
import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log unexpected runtime errors for diagnostics
    console.error("Cygnus App runtime error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive text-sm font-semibold"
              aria-hidden="true"
            >
              !
            </span>
            <CardTitle className="text-xl">Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The application encountered an error while interacting with the Stellar ledger or rendering this view.
            Testnet may be experiencing temporary rate limits or a scheduled reset.
          </p>

          <div className="rounded-md border border-border bg-muted/40 p-3 font-mono text-xs text-foreground break-all">
            {error.message || "Unknown unexpected application error"}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button onClick={() => reset()} variant="default" size="sm">
              Try again
            </Button>
            <Link
              href="/"
              className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted transition-colors"
            >
              Back to programmes
            </Link>
            <Link
              href="/console"
              className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Open console
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
