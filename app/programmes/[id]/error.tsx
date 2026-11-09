"use client";

import * as React from "react";
import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ProgrammeErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProgrammeDetailError({ error, reset }: ProgrammeErrorProps) {
  useEffect(() => {
    console.error("Programme detail error:", error);
  }, [error]);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-xs text-muted-foreground hover:underline">
        &larr; Back to all programmes
      </Link>

      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive text-sm font-semibold"
              aria-hidden="true"
            >
              !
            </span>
            <CardTitle className="text-lg">Unable to load programme</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Could not fetch this programme from the Stellar network. It might not exist, or the RPC node is temporarily unreachable.
          </p>

          <div className="rounded-md border border-border bg-muted/40 p-3 font-mono text-xs text-foreground break-all">
            {error.message || "Failed to load programme data from contract"}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button onClick={() => reset()} variant="default" size="sm">
              Retry query
            </Button>
            <Link
              href="/"
              className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted transition-colors"
            >
              Return to dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
