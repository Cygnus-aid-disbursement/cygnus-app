import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/progress-bar";
import { CopyButton } from "@/components/copy-button";
import { EventTimeline } from "@/components/event-timeline";
import { AstrolabeBadge } from "@/components/astrolabe-badge";
import { getBatches, getProgramme, getProgrammeEvents } from "@/lib/cygnus";
import { isImplementerVerified } from "@/lib/astrolabe";
import { formatCygnusEvent } from "@/lib/events";
import { approverLabel, milestoneStatusLabel, programmeStatusLabel, progress } from "@/lib/enums";
import { formatStroops, formatTimestamp, hex, shortAddress, shortHex } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProgrammeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let programme;
  try {
    programme = await getProgramme(BigInt(id));
  } catch {
    programme = undefined;
  }
  if (!programme) notFound();

  const [batches, rawEvents] = await Promise.all([
    getBatches(programme.id, programme.batch_count).catch(() => []),
    getProgrammeEvents(programme.id).catch(() => []),
  ]);
  const events = rawEvents.map(formatCygnusEvent);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          Back to programmes
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Programme #{programme.id.toString()}</h1>
          <Badge tone={programme.status.tag === "Active" ? "active" : "closed"}>
            {programmeStatusLabel(programme.status)}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <Field
              label="Sponsor"
              value={shortAddress(programme.sponsor)}
              copyValue={programme.sponsor}
            />
            <Field
              label="Implementer"
              value={shortAddress(programme.implementer)}
              copyValue={programme.implementer}
              extra={isImplementerVerified(programme.implementer) ? <AstrolabeBadge /> : undefined}
            />
            <Field label="Approver" value={approverLabel(programme.approver)} />
            <Field
              label="Asset"
              value={shortAddress(programme.asset)}
              copyValue={programme.asset}
            />
            <Field label="Budget" value={formatStroops(programme.total)} />
            <Field label="Funded" value={formatStroops(programme.funded)} />
            <Field label="Released" value={formatStroops(programme.released)} />
            <Field label="Disbursed" value={formatStroops(programme.disbursed)} />
            <Field
              label="Metadata hash"
              value={shortHex(programme.metadata_hash)}
              copyValue={hex(programme.metadata_hash)}
              mono
            />
          </dl>
          <ProgressBar value={progress(programme.disbursed, programme.total)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {programme.milestones.map((m, i) => {
            const state = programme.milestone_states[i];
            return (
              <div key={i} className="border-l-2 border-border pl-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">Milestone {i}</span>
                  <Badge>{milestoneStatusLabel(state.status)}</Badge>
                  {state.claimed_late && <Badge tone="warn">claimed late</Badge>}
                  <span className="text-sm text-muted-foreground">
                    {formatStroops(m.amount)} due {formatTimestamp(m.due_by)}
                  </span>
                </div>
                <dl className="mt-1 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                  <Field
                    label="Description hash"
                    value={shortHex(m.description_hash)}
                    copyValue={hex(m.description_hash)}
                    mono
                  />
                  {state.evidence_hash && (
                    <Field
                      label="Evidence hash"
                      value={shortHex(state.evidence_hash)}
                      copyValue={hex(state.evidence_hash)}
                      mono
                    />
                  )}
                  {state.reason_hash && (
                    <Field
                      label="Rejection reason hash"
                      value={shortHex(state.reason_hash)}
                      copyValue={hex(state.reason_hash)}
                      mono
                    />
                  )}
                  {state.claimed_at > 0n && (
                    <Field label="Claimed at" value={formatTimestamp(state.claimed_at)} />
                  )}
                </dl>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disbursement batches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Each batch publishes a Merkle root, a total, and a count. It does not publish who was
            paid. A beneficiary can verify their own receipt on the{" "}
            <Link href="/verify" className="underline">
              verify page
            </Link>
            .
          </p>
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No batches disbursed yet.</p>
          ) : (
            <div className="space-y-3">
              {batches.map((b) => (
                <div key={b.index} className="rounded-md border border-border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Batch {b.index}</span>
                    <span className="text-muted-foreground">{formatTimestamp(b.disbursed_at)}</span>
                  </div>
                  <div className="mt-1 grid gap-x-6 gap-y-1 sm:grid-cols-3">
                    <Field label="Total" value={formatStroops(b.total)} />
                    <Field label="Count" value={b.count.toString()} />
                    <Field label="Root" value={shortHex(b.root)} copyValue={hex(b.root)} mono />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2 rounded bg-muted/40 px-2 py-1 font-mono text-xs text-muted-foreground">
                    <span className="break-all">{hex(b.root)}</span>
                    <CopyButton value={hex(b.root)} label={`Copy batch ${b.index} Merkle root`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Chronological contract events emitted by the programme contract on the Stellar ledger.
            The record confirms transactions executed under protocol rules; it does not represent
            proof of physical delivery of goods or aid receipt.
          </p>
          <EventTimeline events={events} />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  copyValue,
  extra,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyValue?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`flex flex-wrap items-center gap-1 ${mono ? "font-mono text-xs" : ""}`}>
        <span>{value}</span>
        {extra}
        {copyValue && <CopyButton value={copyValue} label={`Copy ${label.toLowerCase()}`} />}
      </dd>
    </div>
  );
}
