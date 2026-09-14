import { readFileSync } from "node:fs";
import { Cygnus, deployments, type Programme, type DisbursementBatch } from "@cygnus-aid-disbursement/sdk";

// Server-side reads only. This module must not be imported from a client
// component; the console builds its own client with a wallet signer.

// A funded Testnet account used purely to simulate read-only calls. No signing
// happens with it. Overridable with READER_PUBLIC_KEY.
const DEFAULT_READER = "GDHREYZHXGFZ63QDFA5JHZPD2DRCXIHB7VB66VKNW24RFNTB743RRBIP";

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "https://soroban-testnet.stellar.org";

function resolveDeployment(): { contractId: string; networkPassphrase: string } {
  // A contract developer can point the app at a local deployment through this
  // environment variable, per docs/multi-repo.md.
  const path = process.env.CONSTELLATION_DEPLOYMENTS;
  if (path) {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return { contractId: parsed.contracts.programme, networkPassphrase: parsed.networkPassphrase };
  }
  return {
    contractId: deployments.testnet.contracts.programme,
    networkPassphrase: deployments.testnet.networkPassphrase,
  };
}

export function serverCygnus(): Cygnus {
  const deployment = resolveDeployment();
  return new Cygnus({
    contractId: deployment.contractId,
    networkPassphrase: deployment.networkPassphrase,
    rpcUrl: RPC_URL,
    publicKey: process.env.READER_PUBLIC_KEY || DEFAULT_READER,
  });
}

export function contractId(): string {
  return resolveDeployment().contractId;
}

/** Programme ids are contiguous from zero, so probe upward until a gap. */
export async function listProgrammes(max = 50): Promise<Programme[]> {
  const cygnus = serverCygnus();
  const programmes: Programme[] = [];
  for (let id = 0n; id < BigInt(max); id++) {
    const programme = await cygnus.getProgramme(id);
    if (!programme) break;
    programmes.push(programme);
  }
  return programmes;
}

export async function getProgramme(id: bigint): Promise<Programme | undefined> {
  return serverCygnus().getProgramme(id);
}

export async function getBatches(id: bigint, count: number): Promise<DisbursementBatch[]> {
  const cygnus = serverCygnus();
  const batches: DisbursementBatch[] = [];
  for (let i = 0; i < count; i++) {
    const batch = await cygnus.getBatch(id, i);
    if (batch) batches.push(batch);
  }
  return batches;
}
