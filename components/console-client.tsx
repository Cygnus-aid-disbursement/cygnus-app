"use client";

import { useState } from "react";
import { Buffer } from "buffer";
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  XBULL_ID,
} from "@creit.tech/stellar-wallets-kit";
import {
  Cygnus,
  hashEvidence,
  hashProgrammeMetadata,
  hashMilestoneDescription,
  hashRejectionReason,
} from "@cygnus-aid-disbursement/sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CONTRACT_ID, NETWORK_PASSPHRASE } from "@/lib/client-cygnus";
import { shortAddress } from "@/lib/format";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "https://soroban-testnet.stellar.org";
// Native XLM Stellar Asset Contract on Testnet. Editable per programme.
const NATIVE_SAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

let kit: StellarWalletsKit | null = null;
function walletKit(): StellarWalletsKit {
  if (!kit) {
    kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: XBULL_ID,
      modules: allowAllModules(),
    });
  }
  return kit;
}

export function ConsoleClient() {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function connect() {
    const k = walletKit();
    await k.openModal({
      onWalletSelected: async (option) => {
        k.setWallet(option.id);
        const { address } = await k.getAddress();
        setAddress(address);
      },
    });
  }

  function client(): Cygnus {
    if (!address) throw new Error("connect a wallet first");
    const signer = walletKit();
    return new Cygnus({
      contractId: CONTRACT_ID,
      networkPassphrase: NETWORK_PASSPHRASE,
      rpcUrl: RPC_URL,
      publicKey: address,
      signTransaction: async (xdr) => {
        const { signedTxXdr } = await signer.signTransaction(xdr, {
          address,
          networkPassphrase: NETWORK_PASSPHRASE,
        });
        return { signedTxXdr, signerAddress: address };
      },
    });
  }

  // Wrap an action so every form shares status and error handling.
  async function run(label: string, action: (cy: Cygnus) => Promise<unknown>) {
    setBusy(true);
    setStatus(`${label}...`);
    try {
      const result = await action(client());
      setStatus(`${label} succeeded${result === undefined ? "" : `: ${String(result)}`}`);
    } catch (e) {
      setStatus(`${label} failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  if (!address) {
    return (
      <Card>
        <CardContent className="space-y-3 pt-5">
          <p className="text-sm text-muted-foreground">
            Connect a Stellar wallet to create programmes, fund them, claim milestones, and approve
            or reject as an approver. Only hashes go on chain; the documents behind them stay here.
          </p>
          <Button onClick={connect}>Connect wallet</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
        <span>
          Connected as <span className="font-mono">{shortAddress(address)}</span>
        </span>
        <Button variant="outline" size="sm" onClick={() => setAddress(null)}>
          Disconnect
        </Button>
      </div>

      {status && (
        <div className="rounded-md border border-border bg-muted p-3 text-sm">{status}</div>
      )}

      <ClaimForm busy={busy} run={run} />
      <ApproveRejectForm busy={busy} run={run} />
      <FundForm busy={busy} run={run} />
      <CreateForm busy={busy} run={run} address={address} />
    </div>
  );
}

type Runner = (label: string, action: (cy: Cygnus) => Promise<unknown>) => Promise<void>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function labelledInput(
  label: string,
  value: string,
  onChange: (v: string) => void,
  props: React.InputHTMLAttributes<HTMLInputElement> = {},
) {
  return (
    <label className="block text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-border bg-background p-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </label>
  );
}

function ClaimForm({ busy, run }: { busy: boolean; run: Runner }) {
  const [programmeId, setProgrammeId] = useState("");
  const [index, setIndex] = useState("0");
  const [evidence, setEvidence] = useState("");

  return (
    <Section title="Claim a milestone">
      {labelledInput("Programme id", programmeId, setProgrammeId, { inputMode: "numeric" })}
      {labelledInput("Milestone index", index, setIndex, { inputMode: "numeric" })}
      <label className="block text-sm">
        <span className="text-muted-foreground">Evidence (text or JSON; only its hash is stored)</span>
        <textarea
          className="mt-1 h-24 w-full rounded-md border border-border bg-background p-2 text-sm"
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
        />
      </label>
      <Button
        disabled={busy || !programmeId}
        onClick={() =>
          run("Claim", async (cy) => {
            const hash = hashEvidence({ text: evidence });
            const tx = await cy.claim(BigInt(programmeId), Number(index), hash);
            await tx.signAndSend();
            return `evidence hash ${hash.toString("hex").slice(0, 16)}...`;
          })
        }
      >
        Claim
      </Button>
    </Section>
  );
}

function ApproveRejectForm({ busy, run }: { busy: boolean; run: Runner }) {
  const [programmeId, setProgrammeId] = useState("");
  const [index, setIndex] = useState("0");
  const [reason, setReason] = useState("");

  return (
    <Section title="Approve or reject a milestone">
      {labelledInput("Programme id", programmeId, setProgrammeId, { inputMode: "numeric" })}
      {labelledInput("Milestone index", index, setIndex, { inputMode: "numeric" })}
      <div className="flex gap-3">
        <Button
          disabled={busy || !programmeId}
          onClick={() =>
            run("Approve", async (cy) => {
              await (await cy.approve(BigInt(programmeId), Number(index))).signAndSend();
            })
          }
        >
          Approve
        </Button>
        <Button
          variant="outline"
          disabled={busy || !programmeId}
          onClick={() =>
            run("Reject", async (cy) => {
              const hash = hashRejectionReason({ text: reason });
              await (await cy.reject(BigInt(programmeId), Number(index), hash)).signAndSend();
            })
          }
        >
          Reject
        </Button>
      </div>
      <label className="block text-sm">
        <span className="text-muted-foreground">Rejection reason (hashed, for reject only)</span>
        <textarea
          className="mt-1 h-20 w-full rounded-md border border-border bg-background p-2 text-sm"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
    </Section>
  );
}

function FundForm({ busy, run }: { busy: boolean; run: Runner }) {
  const [programmeId, setProgrammeId] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <Section title="Fund a programme">
      {labelledInput("Programme id", programmeId, setProgrammeId, { inputMode: "numeric" })}
      {labelledInput("Amount (stroops)", amount, setAmount, { inputMode: "numeric" })}
      <Button
        disabled={busy || !programmeId || !amount}
        onClick={() =>
          run("Fund", async (cy) => {
            await (await cy.fund(BigInt(programmeId), BigInt(amount))).signAndSend();
          })
        }
      >
        Fund
      </Button>
    </Section>
  );
}

function CreateForm({ busy, run, address }: { busy: boolean; run: Runner; address: string }) {
  const [implementer, setImplementer] = useState(address);
  const [approver, setApprover] = useState(address);
  const [asset, setAsset] = useState(NATIVE_SAC);
  const [total, setTotal] = useState("");
  const [title, setTitle] = useState("");
  const [milestoneAmount, setMilestoneAmount] = useState("");
  const [dueBy, setDueBy] = useState("");
  const [description, setDescription] = useState("");

  return (
    <Section title="Create a programme">
      {labelledInput("Implementer address", implementer, setImplementer)}
      {labelledInput("Approver address", approver, setApprover)}
      {labelledInput("Asset contract id", asset, setAsset)}
      {labelledInput("Total budget (stroops)", total, setTotal, { inputMode: "numeric" })}
      {labelledInput("Programme title (hashed as metadata)", title, setTitle)}
      {labelledInput("Milestone amount (stroops)", milestoneAmount, setMilestoneAmount, {
        inputMode: "numeric",
      })}
      {labelledInput("Milestone due date", dueBy, setDueBy, { type: "date" })}
      {labelledInput("Milestone description (hashed)", description, setDescription)}
      <Button
        disabled={busy || !total || !milestoneAmount || !dueBy}
        onClick={() =>
          run("Create programme", async (cy) => {
            const due = BigInt(Math.floor(new Date(dueBy).getTime() / 1000));
            const tx = await cy.createProgramme({
              sponsor: address,
              implementer,
              asset,
              total: BigInt(total),
              milestones: [
                {
                  amount: BigInt(milestoneAmount),
                  description_hash: hashMilestoneDescription({ text: description }),
                  due_by: due,
                },
              ],
              approver: { tag: "Single", values: [approver] },
              metadataHash: hashProgrammeMetadata({ title }),
            });
            const sent = await tx.signAndSend();
            const id = sent.result.unwrap();
            return `programme id ${id}`;
          })
        }
      >
        Create programme
      </Button>
    </Section>
  );
}
