import { describe, it, expect, vi } from "vitest";
import { Buffer } from "buffer";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  requestQuote,
  initiatePayout,
  pollPayoutStatus,
  isQuoteExpired,
  type Anchor,
  type Quote,
  type PayoutStatus,
} from "../lib/anchor";
import { AnchorPayout } from "../components/anchor-payout";
import { StubAnchor } from "@cygnus-aid-disbursement/sdk";

describe("anchor module", () => {
  describe("StubAnchor fallback handling", () => {
    it("handles StubAnchor in requestQuote with helpful message", async () => {
      const stub = new StubAnchor();
      await expect(requestQuote(100n, "NGN", stub)).rejects.toThrow(
        "Anchor off-ramp is not yet configured",
      );
    });

    it("handles StubAnchor in initiatePayout with helpful message", async () => {
      const stub = new StubAnchor();
      const dummyRef = Buffer.alloc(32, 1);
      await expect(initiatePayout("quote-1", dummyRef, 100n, stub)).rejects.toThrow(
        "Anchor payout initiation is in stub mode",
      );
    });

    it("handles StubAnchor in pollPayoutStatus with helpful message", async () => {
      const stub = new StubAnchor();
      await expect(pollPayoutStatus("payout-1", stub)).rejects.toThrow(
        "Anchor status polling is in stub mode",
      );
    });
  });

  describe("Custom/configured Anchor operations", () => {
    const mockQuote: Quote = {
      id: "quote-xyz-123",
      sourceAmount: 10_0000000n,
      destinationAmount: "15000.00",
      destinationAsset: "NGN",
      expiresAt: "2026-11-08T12:00:00Z",
    };

    const mockStatus: PayoutStatus = {
      payoutId: "payout-xyz-789",
      state: "processing",
      detail: "Transfer dispatched to local mobile rail",
    };

    const mockAnchor: Anchor = {
      quote: vi.fn(async () => mockQuote),
      initiatePayout: vi.fn(async () => mockStatus),
      pollStatus: vi.fn(async () => ({ ...mockStatus, state: "completed" as const })),
    };

    it("requests and formats quote correctly", async () => {
      const res = await requestQuote(10_0000000n, "NGN", mockAnchor);
      expect(res.id).toBe("quote-xyz-123");
      expect(res.destinationAmount).toBe("15000.00");
      expect(mockAnchor.quote).toHaveBeenCalledWith(10_0000000n, "NGN");
    });

    it("initiates payout with salted recipientRef", async () => {
      const dummyRef = Buffer.alloc(32, 0x77);
      const res = await initiatePayout("quote-xyz-123", dummyRef, 10_0000000n, mockAnchor);
      expect(res.payoutId).toBe("payout-xyz-789");
      expect(res.state).toBe("processing");
      expect(mockAnchor.initiatePayout).toHaveBeenCalledWith({
        quoteId: "quote-xyz-123",
        recipientRef: dummyRef,
        sourceAmount: 10_0000000n,
      });
    });

    it("polls payout status", async () => {
      const res = await pollPayoutStatus("payout-xyz-789", mockAnchor);
      expect(res.payoutId).toBe("payout-xyz-789");
      expect(res.state).toBe("completed");
    });
  });

  describe("Validation guards & quote expiration", () => {
    it("validates positive amounts in requestQuote", async () => {
      await expect(requestQuote(0n)).rejects.toThrow("greater than zero");
      await expect(requestQuote(-500n)).rejects.toThrow("greater than zero");
    });

    it("validates arguments in initiatePayout", async () => {
      const validRef = Buffer.alloc(32);
      await expect(initiatePayout("", validRef, 100n)).rejects.toThrow("Quote ID cannot be empty");
      await expect(initiatePayout("quote-1", Buffer.alloc(16), 100n)).rejects.toThrow(
        "32-byte Buffer",
      );
      await expect(initiatePayout("quote-1", validRef, 0n)).rejects.toThrow("greater than zero");
    });

    it("evaluates quote expiration correctly", () => {
      const pastTime = new Date(Date.now() - 10000).toISOString();
      const futureTime = new Date(Date.now() + 60000).toISOString();

      expect(isQuoteExpired(pastTime)).toBe(true);
      expect(isQuoteExpired(futureTime)).toBe(false);
      expect(isQuoteExpired("invalid-date-string")).toBe(false);
    });
  });

  describe("AnchorPayout component", () => {
    it("renders with StubAnchor badge and tabs", () => {
      const html = renderToStaticMarkup(<AnchorPayout />);
      expect(html).toContain("Anchor fiat off-ramp");
      expect(html).toContain("StubAnchor Mode");
      expect(html).toContain("1. Request quote");
      expect(html).toContain("2. Initiate payout");
      expect(html).toContain("3. Track payout");
      expect(html).toContain("Destination Currency");
    });
  });
});
