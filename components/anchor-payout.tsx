"use client";

import * as React from "react";
import { useState } from "react";
import { Buffer } from "buffer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  requestQuote,
  initiatePayout,
  pollPayoutStatus,
  isQuoteExpired,
  type FormattedQuote,
  type FormattedPayoutStatus,
} from "@/lib/anchor";
import { formatStroops } from "@/lib/format";

export function AnchorPayout() {
  const [activeTab, setActiveTab] = useState<"quote" | "initiate" | "status">("quote");
  const [sourceAmount, setSourceAmount] = useState("50000000"); // 5 XLM
  const [destinationAsset, setDestinationAsset] = useState("NGN");
  const [quoteResult, setQuoteResult] = useState<FormattedQuote | null>(null);

  const [quoteIdInput, setQuoteIdInput] = useState("");
  const [recipientRefInput, setRecipientRefInput] = useState("");
  const [initiateAmount, setInitiateAmount] = useState("50000000");
  const [payoutResult, setPayoutResult] = useState<FormattedPayoutStatus | null>(null);

  const [pollIdInput, setPollIdInput] = useState("");
  const [statusResult, setStatusResult] = useState<FormattedPayoutStatus | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetQuote = async () => {
    setLoading(true);
    setError(null);
    try {
      const amountBigInt = BigInt(sourceAmount);
      const res = await requestQuote(amountBigInt, destinationAsset);
      setQuoteResult(res);
      setQuoteIdInput(res.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayout = async () => {
    setLoading(true);
    setError(null);
    try {
      const refBuffer = Buffer.from(recipientRefInput.replace(/^0x/, ""), "hex");
      if (refBuffer.length !== 32) {
        throw new Error("Recipient reference must be a 32-byte hexadecimal string (64 characters)");
      }
      const res = await initiatePayout(quoteIdInput, refBuffer, BigInt(initiateAmount));
      setPayoutResult(res);
      setPollIdInput(res.payoutId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handlePollStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!pollIdInput.trim()) {
        throw new Error("Please enter a payout ID to check status");
      }
      const res = await pollPayoutStatus(pollIdInput.trim());
      setStatusResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Anchor fiat off-ramp</CardTitle>
          <Badge tone="warn">StubAnchor Mode</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Convert on-chain funds to local fiat or mobile money through Stellar Anchor services.
          Beneficiaries are identified only by salted references; raw identifiers are never shared
          with the network.
        </p>

        {/* Navigation tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          <Button
            variant={activeTab === "quote" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab("quote");
              setError(null);
            }}
          >
            1. Request quote
          </Button>
          <Button
            variant={activeTab === "initiate" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab("initiate");
              setError(null);
            }}
          >
            2. Initiate payout
          </Button>
          <Button
            variant={activeTab === "status" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab("status");
              setError(null);
            }}
          >
            3. Track payout
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-border bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Quote Tab */}
        {activeTab === "quote" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="quote-amount" className="text-xs text-muted-foreground">
                  Source Amount (Stroops)
                </label>
                <input
                  id="quote-amount"
                  className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm font-mono"
                  value={sourceAmount}
                  onChange={(e) => setSourceAmount(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="quote-asset" className="text-xs text-muted-foreground">
                  Destination Currency
                </label>
                <select
                  id="quote-asset"
                  className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm"
                  value={destinationAsset}
                  onChange={(e) => setDestinationAsset(e.target.value)}
                  disabled={loading}
                >
                  <option value="NGN">NGN (Nigerian Naira)</option>
                  <option value="KES">KES (Kenyan Shilling)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>

            <Button onClick={handleGetQuote} disabled={loading} size="sm">
              {loading ? "Requesting quote..." : "Get exchange quote"}
            </Button>

            {quoteResult && (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Quote: {quoteResult.id}</span>
                  {isQuoteExpired(quoteResult.expiresAt) && <Badge tone="warn">Expired</Badge>}
                </div>
                <div>Source: {formatStroops(BigInt(quoteResult.sourceAmountFormatted))} XLM</div>
                <div>
                  Destination: {quoteResult.destinationAmount} {quoteResult.destinationAsset}
                </div>
                <div className="text-muted-foreground">Expires at: {quoteResult.expiresAt}</div>
              </div>
            )}
          </div>
        )}

        {/* Initiate Tab */}
        {activeTab === "initiate" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div>
                <label htmlFor="initiate-quote-id" className="text-xs text-muted-foreground">
                  Quote ID
                </label>
                <input
                  id="initiate-quote-id"
                  className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm font-mono"
                  value={quoteIdInput}
                  onChange={(e) => setQuoteIdInput(e.target.value)}
                  placeholder="e.g. quote-12345"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="initiate-recipient-ref" className="text-xs text-muted-foreground">
                  Salted Recipient Reference (32 bytes hex)
                </label>
                <input
                  id="initiate-recipient-ref"
                  className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm font-mono text-xs"
                  value={recipientRefInput}
                  onChange={(e) => setRecipientRefInput(e.target.value)}
                  placeholder="<64 hex characters>"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="initiate-source-amount" className="text-xs text-muted-foreground">
                  Amount in Stroops
                </label>
                <input
                  id="initiate-source-amount"
                  className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm font-mono"
                  value={initiateAmount}
                  onChange={(e) => setInitiateAmount(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <Button onClick={handleInitiatePayout} disabled={loading} size="sm">
              {loading ? "Submitting..." : "Initiate off-ramp payout"}
            </Button>

            {payoutResult && (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-xs space-y-1">
                <div className="font-medium text-foreground">
                  Payout ID: {payoutResult.payoutId}
                </div>
                <div>
                  Status: <span className="font-semibold">{payoutResult.state}</span>
                </div>
                {payoutResult.detail && <div>Detail: {payoutResult.detail}</div>}
              </div>
            )}
          </div>
        )}

        {/* Status Tab */}
        {activeTab === "status" && (
          <div className="space-y-3">
            <div>
              <label htmlFor="poll-payout-id" className="text-xs text-muted-foreground">
                Payout ID
              </label>
              <input
                id="poll-payout-id"
                className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm font-mono"
                value={pollIdInput}
                onChange={(e) => setPollIdInput(e.target.value)}
                placeholder="Enter payout ID..."
                disabled={loading}
              />
            </div>

            <Button onClick={handlePollStatus} disabled={loading} size="sm">
              {loading ? "Checking..." : "Poll payout status"}
            </Button>

            {statusResult && (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-xs space-y-1">
                <div className="font-medium text-foreground">
                  Payout ID: {statusResult.payoutId}
                </div>
                <div>
                  State: <span className="font-semibold">{statusResult.state}</span>
                </div>
                {statusResult.detail && <div>Detail: {statusResult.detail}</div>}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
