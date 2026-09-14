import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/progress-bar";
import { getBatches, getProgramme } from "@/lib/cygnus";
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

  const batches = await getBatches(programme.id, programme.batch_count).catch(() => []);

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
            <Field label="Sponsor" value={shortAddress(programme.sponsor)} />
            <Field label="Implementer" value={shortAddress(programme.implementer)} />
            <Field label="Approver" value={approverLabel(programme.approver)} />
            <Field label="Asset" value={shortAddress(programme.asset)} />
            <Field label="Budget" value={formatStroops(programme.total)} />
            <Field label="Funded" value={formatStroops(programme.funded)} />
            <Field label="Released" value={formatStroops(programme.released)} />
            <Field label="Disbursed" value={formatStroops(programme.disbursed)} />
            <Field label="Metadata hash" value={shortHex(programme.metadata_hash)} mono />
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
                  <Field label="Description hash" value={shortHex(m.description_hash)} mono />
                  {state.evidence_hash && (
                    <Field label="Evidence hash" value={shortHex(state.evidence_hash)} mono />
                  )}
                  {state.reason_hash && (
                    <Field label="Rejection reason hash" value={shortHex(state.reason_hash)} mono />
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
                    <Field label="Root" value={shortHex(b.root)} mono />
                  </div>
                  <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                    {hex(b.root)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-xs" : ""}>{value}</dd>
    </div>
  );
}
