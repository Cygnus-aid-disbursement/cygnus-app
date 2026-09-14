"use client";

import { useState } from "react";
import { Buffer } from "buffer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { readerCygnus } from "@/lib/client-cygnus";

const SAMPLE = `{
  "programmeId": "1",
  "batchIndex": 0,
  "leaf": "<64 hex chars>",
  "proof": ["<64 hex chars>", "..."]
}`;

type Result = { kind: "included" } | { kind: "excluded" } | { kind: "error"; message: string };

export default function VerifyPage() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function verify() {
    setBusy(true);
    setResult(null);
    try {
      const receipt = JSON.parse(text);
      const leaf = Buffer.from(receipt.leaf, "hex");
      const proof = (receipt.proof as string[]).map((p) => Buffer.from(p, "hex"));
      if (leaf.length !== 32) throw new Error("leaf must be 32 bytes of hex");
      const ok = await readerCygnus().verifyInclusion(
        BigInt(receipt.programmeId),
        Number(receipt.batchIndex),
        leaf,
        proof,
      );
      setResult({ kind: ok ? "included" : "excluded" });
    } catch (e) {
      setResult({ kind: "error", message: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Verify a receipt</h1>
        <p className="max-w-3xl text-muted-foreground">
          A beneficiary receipt proves that a payout was included in a published batch. Paste the
          receipt below. Verification is checked against the batch root stored on chain. It confirms
          the payout was committed to; it does not prove the money was received.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="h-48 w-full rounded-md border border-border bg-background p-3 font-mono text-xs"
            placeholder={SAMPLE}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button onClick={verify} disabled={busy || text.trim().length === 0}>
            {busy ? "Verifying..." : "Verify inclusion"}
          </Button>

          {result?.kind === "included" && (
            <p className="text-sm font-medium text-accent">
              Included. This receipt matches the batch root on chain.
            </p>
          )}
          {result?.kind === "excluded" && (
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Not included. The proof does not match the batch root, or the batch does not exist.
            </p>
          )}
          {result?.kind === "error" && (
            <p className="text-sm text-muted-foreground">Could not verify: {result.message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
