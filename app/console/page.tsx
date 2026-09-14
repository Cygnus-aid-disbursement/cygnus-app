import { ConsoleClient } from "@/components/console-client";

export const metadata = { title: "Cygnus console" };

export default function ConsolePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Implementer console</h1>
        <p className="max-w-3xl text-muted-foreground">
          Authenticated by your wallet. Create and fund programmes, claim milestones with evidence,
          and approve or reject as an approver. Documents never leave your browser; only their hashes
          are written on chain.
        </p>
      </div>
      <ConsoleClient />
    </div>
  );
}
