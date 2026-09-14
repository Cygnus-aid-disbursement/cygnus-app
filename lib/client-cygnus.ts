"use client";

import { Cygnus, deployments } from "@cygnus-aid-disbursement/sdk";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "https://soroban-testnet.stellar.org";
// A funded Testnet account, used only to simulate read-only calls from the
// browser. No signing happens with it.
const READER = process.env.NEXT_PUBLIC_READER_PUBLIC_KEY ?? "GDHREYZHXGFZ63QDFA5JHZPD2DRCXIHB7VB66VKNW24RFNTB743RRBIP";

export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID ?? deployments.testnet.contracts.programme;
export const NETWORK_PASSPHRASE = deployments.testnet.networkPassphrase;

/** Read-only browser client for the verify page. */
export function readerCygnus(): Cygnus {
  return new Cygnus({
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    publicKey: READER,
  });
}
