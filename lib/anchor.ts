import { Buffer } from "buffer";
import {
  StubAnchor,
  NotImplementedError,
  type Anchor,
  type Quote,
  type PayoutRequest,
  type PayoutStatus,
} from "@cygnus-aid-disbursement/sdk";

export type { Anchor, Quote, PayoutRequest, PayoutStatus };

let currentAnchor: Anchor = new StubAnchor();

/**
 * Configure the global anchor instance (e.g. for testing or production SEP anchor).
 */
export function setAnchorClient(anchor: Anchor): void {
  currentAnchor = anchor;
}

export function getAnchorClient(): Anchor {
  return currentAnchor;
}

export interface FormattedQuote {
  id: string;
  sourceAmountFormatted: string;
  destinationAmount: string;
  destinationAsset: string;
  expiresAt: string;
}

export interface FormattedPayoutStatus {
  payoutId: string;
  state: PayoutStatus["state"];
  detail?: string;
}

/**
 * Checks whether an ISO expiration timestamp has elapsed.
 */
export function isQuoteExpired(expiresAt: string, nowMs = Date.now()): boolean {
  const expiryTime = Date.parse(expiresAt);
  if (isNaN(expiryTime)) {
    return false;
  }
  return expiryTime <= nowMs;
}

/**
 * Requests an exchange quote from the anchor for converting stroops to local fiat / mobile asset.
 */
export async function requestQuote(
  sourceAmountStroops: bigint,
  destinationAsset = "NGN",
  anchor: Anchor = getAnchorClient(),
): Promise<FormattedQuote> {
  if (sourceAmountStroops <= 0n) {
    throw new Error("Source amount must be greater than zero stroops");
  }

  try {
    const quote = await anchor.quote(sourceAmountStroops, destinationAsset);
    return {
      id: quote.id,
      sourceAmountFormatted: quote.sourceAmount.toString(),
      destinationAmount: quote.destinationAmount,
      destinationAsset: quote.destinationAsset,
      expiresAt: quote.expiresAt,
    };
  } catch (e) {
    if (e instanceof NotImplementedError) {
      throw new Error(
        "Anchor off-ramp is not yet configured for this network. StubAnchor does not support live quotes.",
      );
    }
    throw e;
  }
}

/**
 * Initiates an anchor payout to a beneficiary's local currency off-ramp.
 * Note: Only the 32-byte salted recipientRef is passed; raw beneficiary identifiers are never sent.
 */
export async function initiatePayout(
  quoteId: string,
  recipientRef: Buffer,
  sourceAmount: bigint,
  anchor: Anchor = getAnchorClient(),
): Promise<FormattedPayoutStatus> {
  if (!quoteId || quoteId.trim().length === 0) {
    throw new Error("Quote ID cannot be empty");
  }
  if (!Buffer.isBuffer(recipientRef) || recipientRef.length !== 32) {
    throw new Error("Recipient reference must be a 32-byte Buffer");
  }
  if (sourceAmount <= 0n) {
    throw new Error("Payout amount must be greater than zero stroops");
  }

  try {
    const status = await anchor.initiatePayout({
      quoteId: quoteId.trim(),
      recipientRef,
      sourceAmount,
    });
    return {
      payoutId: status.payoutId,
      state: status.state,
      detail: status.detail,
    };
  } catch (e) {
    if (e instanceof NotImplementedError) {
      throw new Error(
        "Anchor payout initiation is in stub mode. Live off-ramp payouts require a connected SEP-31/SEP-24 anchor.",
      );
    }
    throw e;
  }
}

/**
 * Polls status of an existing payout by ID.
 */
export async function pollPayoutStatus(
  payoutId: string,
  anchor: Anchor = getAnchorClient(),
): Promise<FormattedPayoutStatus> {
  try {
    const status = await anchor.pollStatus(payoutId);
    return {
      payoutId: status.payoutId,
      state: status.state,
      detail: status.detail,
    };
  } catch (e) {
    if (e instanceof NotImplementedError) {
      throw new Error("Anchor status polling is in stub mode.");
    }
    throw e;
  }
}
