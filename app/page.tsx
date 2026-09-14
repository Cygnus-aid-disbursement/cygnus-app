import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/progress-bar";
import { listProgrammes } from "@/lib/cygnus";
import { formatStroops, shortAddress } from "@/lib/format";
import { programmeStatusLabel, progress } from "@/lib/enums";

export const dynamic = "force-dynamic";

export default async function Home() {
  let programmes;
  let error: string | undefined;
  try {
    programmes = await listProgrammes();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Aid disbursement programmes</h1>
        <p className="max-w-3xl text-muted-foreground">
          Every programme, milestone, approval, and disbursement here is read live from the Stellar
          Testnet. The record shows that funds moved under a stated rule. It does not show that goods
          were delivered or that the right people received aid, and beneficiaries are never named:
          each disbursement publishes only a Merkle root, a total, and a count.
        </p>
      </section>

      {error ? (
        <Card>
          <CardContent className="pt-5 text-sm text-muted-foreground">
            Could not read the ledger right now. Testnet may be resetting or rate limiting. Detail:{" "}
            {error}
          </CardContent>
        </Card>
      ) : programmes && programmes.length > 0 ? (
        <div className="grid gap-4">
          {programmes.map((p) => (
            <Link key={p.id.toString()} href={`/programmes/${p.id}`}>
              <Card className="transition-colors hover:border-accent">
                <CardContent className="space-y-3 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Programme #{p.id.toString()}</span>
                    <Badge tone={p.status.tag === "Active" ? "active" : "closed"}>
                      {programmeStatusLabel(p.status)}
                    </Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-muted-foreground">Sponsor</dt>
                      <dd>{shortAddress(p.sponsor)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Implementer</dt>
                      <dd>{shortAddress(p.implementer)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Budget</dt>
                      <dd>{formatStroops(p.total)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Disbursed</dt>
                      <dd>{formatStroops(p.disbursed)}</dd>
                    </div>
                  </dl>
                  <ProgressBar value={progress(p.disbursed, p.total)} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-5 text-sm text-muted-foreground">
            No programmes yet. Run the contract repo&apos;s demo script, or create one in the
            console.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
