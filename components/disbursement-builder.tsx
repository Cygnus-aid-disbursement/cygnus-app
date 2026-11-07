"use client";

import * as React from "react";
import { useState } from "react";
import { Buffer } from "buffer";
import type { Cygnus } from "@cygnus-aid-disbursement/sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import {
  buildDisbursementPackage,
  parsePaymentEntriesJson,
  type BuiltDisbursement,
} from "@/lib/batch-builder";
import { formatStroops } from "@/lib/format";

export interface DisbursementBuilderProps {
  busy: boolean;
  run: (label: string, action: (cy: Cygnus) => Promise<unknown>) => Promise<void>;
}

const DEFAULT_SAMPLE_JSON = `[
  { "reference": "BENEFICIARY_ID_001", "amount": 10000000 },
  { "reference": "BENEFICIARY_ID_002", "amount": 20000000 },
  { "reference": "BENEFICIARY_ID_003", "amount": 30000000 }
]`;

export function DisbursementBuilder({ busy, run }: DisbursementBuilderProps) {
  const [programmeId, setProgrammeId] = useState("0");
  const [batchIndex, setBatchIndex] = useState("0");
  const [jsonInput, setJsonInput] = useState(DEFAULT_SAMPLE_JSON);
  const [built, setBuilt] = useState<BuiltDisbursement | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleComputeBatch = () => {
    setBuildError(null);
    setSubmitted(false);
    try {
      const entries = parsePaymentEntriesJson(jsonInput);
      const salt = new Uint8Array(32);
      // Per-programme deterministic salt based on programme ID
      const saltBuffer = Buffer.alloc(32);
      saltBuffer.write(`cygnus.programme.${programmeId}.salt.v1`);
      salt.set(saltBuffer);

      const pkg = buildDisbursementPackage(
        programmeId,
        parseInt(batchIndex, 10) || 0,
        salt,
        entries,
      );
      setBuilt(pkg);
    } catch (e) {
      setBuildError(e instanceof Error ? e.message : String(e));
      setBuilt(null);
    }
  };

  const handleSubmit = async () => {
    if (!built) return;

    await run(`Disburse batch ${batchIndex}`, async (cy) => {
      const tx = await cy.disburse(
        BigInt(programmeId),
        built.batch.root,
        built.batch.total,
        built.batch.count,
      );
      await tx.signAndSend();
      setSubmitted(true);
    });
  };

  const handleDownloadReceipts = () => {
    if (!built) return;
    const blob = new Blob([JSON.stringify(built.receipts, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipts-programme-${programmeId}-batch-${batchIndex}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Disbursement batch builder</CardTitle>
          <a
            href="https://github.com/Cygnus-aid-disbursement/cygnus-contracts/blob/main/docs/design.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Contract PRD Design Spec
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Prepare and disburse a batch of beneficiary payments. Beneficiary identifiers are salted
          locally and combined into a Merkle tree; only the root, total, and count reach the chain.
          Downloadable receipts prove inclusion without disclosing beneficiary identities.
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="batch-programme-id" className="text-xs text-muted-foreground">
              Programme ID
            </label>
            <input
              id="batch-programme-id"
              className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm font-mono"
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              disabled={busy}
            />
          </div>

          <div>
            <label htmlFor="batch-index-input" className="text-xs text-muted-foreground">
              Batch Index
            </label>
            <input
              id="batch-index-input"
              className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm font-mono"
              value={batchIndex}
              onChange={(e) => setBatchIndex(e.target.value)}
              disabled={busy}
            />
          </div>
        </div>

        <div>
          <label htmlFor="batch-json-input" className="text-xs text-muted-foreground">
            Payment Entries (JSON array of &#123; reference, amount in stroops &#125;)
          </label>
          <textarea
            id="batch-json-input"
            className="mt-1 h-36 w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            disabled={busy}
          />
        </div>

        {buildError && <p className="text-xs font-medium text-destructive">{buildError}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleComputeBatch} variant="outline" disabled={busy}>
            Compute Merkle tree
          </Button>

          {built && (
            <Button onClick={handleSubmit} disabled={busy}>
              {busy ? "Submitting..." : "Submit disbursement to chain"}
            </Button>
          )}

          {built && (
            <Button onClick={handleDownloadReceipts} variant="outline" disabled={busy}>
              Download all receipts (JSON)
            </Button>
          )}
        </div>

        {built && (
          <div className="rounded-md border border-border bg-muted/30 p-4 text-sm space-y-3">
            <h4 className="font-medium text-foreground">Computed Batch Summary</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
              <div>
                <span className="text-muted-foreground">Recipients:</span>{" "}
                <span className="font-mono">{built.count}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>{" "}
                <span className="font-mono">{formatStroops(built.batch.total)} XLM</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-muted-foreground">Merkle Root:</span>{" "}
                <span className="font-mono break-all">{built.rootHex.slice(0, 10)}...</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 rounded bg-muted/50 p-2 font-mono text-xs">
              <span className="break-all">{built.rootHex}</span>
              <CopyButton value={built.rootHex} label="Copy computed Merkle root" />
            </div>

            {submitted && (
              <p className="text-xs font-medium text-accent">
                Transaction submitted. Beneficiaries can now verify inclusion with their receipts on
                the verify page.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
