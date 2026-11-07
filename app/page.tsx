import { Card, CardContent } from "@/components/ui/card";
import { listProgrammes } from "@/lib/cygnus";
import { toClientProgrammeSummary } from "@/lib/programme-filter";
import { ProgrammeSearch } from "@/components/programme-search";

export const dynamic = "force-dynamic";

export default async function Home() {
  let programmes;
  let error: string | undefined;
  try {
    programmes = await listProgrammes();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const summaries = programmes ? programmes.map(toClientProgrammeSummary) : [];

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Aid disbursement programmes</h1>
        <p className="max-w-3xl text-muted-foreground">
          Every programme, milestone, approval, and disbursement here is read live from the Stellar
          Testnet. The record shows that funds moved under a stated rule. It does not show that
          goods were delivered or that the right people received aid, and beneficiaries are never
          named: each disbursement publishes only a Merkle root, a total, and a count.
        </p>
      </section>

      {error ? (
        <Card>
          <CardContent className="pt-5 text-sm text-muted-foreground">
            Could not read the ledger right now. Testnet may be resetting or rate limiting. Detail:{" "}
            {error}
          </CardContent>
        </Card>
      ) : summaries.length > 0 ? (
        <ProgrammeSearch initialProgrammes={summaries} />
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
