# Contributing to cygnus-app

Welcome. This repository is the public dashboard and implementer console for
Cygnus, and a first-time contributor who has never touched Stellar should be able
to read this file and open a useful pull request the same day. If anything here is
unclear, that is a bug in this document; please say so.

## What this repository is, and the other two

Cygnus is a humanitarian aid disbursement protocol. A sponsor funds a programme,
an implementer claims funds against milestones, an approver releases each
milestone budget, and the implementer disburses to beneficiaries in batches that
are publicly auditable without naming anyone. This app is how people read that
record and how implementers act on it.

Cygnus ships as three repositories:

- [cygnus-contracts](https://github.com/Cygnus-aid-disbursement/cygnus-contracts)
  — the Rust programme contract and the protocol specification.
- [cygnus-sdk](https://github.com/Cygnus-aid-disbursement/cygnus-sdk) — the typed
  client, Merkle batches, and hashing conventions.
- **cygnus-app** (this one) — the dashboard and console.

Dependencies point one way: **contracts, then SDK, then app, never reversed.**
This app depends on the published SDK package; it never talks to a contract
directly and never re-implements SDK logic. If the app needs something the SDK
cannot do, the fix goes in the SDK. See [docs/multi-repo.md](docs/multi-repo.md).

## The domain in two minutes

Four ideas carry most of the design:

- **Programme.** A funded agreement with a sponsor, an implementer, an approver,
  and milestones. Funds sit in the contract, never in a platform account.
- **Milestone.** A unit of work with an amount and a due date. Claimed with an
  evidence hash, then approved or rejected.
- **Disbursement batch.** A payout to many beneficiaries, shown here as a Merkle
  root, a total, and a count. Individual payouts and identities never appear.
- **What the chain proves.** That funds moved under a stated rule. Not that goods
  arrived or that the right people were paid. No screen may imply the second.

The contract's `docs/protocol.md` is the normative document for on-chain
behaviour. The SDK's `docs/hashing.md` fixes how documents become hashes. This app
follows both through the SDK.

## Repository map

```
app/
  layout.tsx            shell and navigation
  page.tsx              public dashboard: programme list
  programmes/[id]/      programme detail: milestones and batches
  verify/               paste a receipt, verify an inclusion proof
  console/              wallet-authenticated implementer console
components/
  ui/                   small shadcn-style primitives (button, card, badge)
  console-client.tsx    the console forms and wallet wiring
  progress-bar.tsx
lib/
  cygnus.ts             server-side SDK reads; resolves the deployment
  client-cygnus.ts      browser read client for the verify page
  format.ts, enums.ts   presentation helpers
test/                   unit tests for the presentation helpers
```

## Getting set up

Prerequisites:

- Node 20 or later.
- pnpm 9 or later (`corepack enable`).
- A Stellar wallet extension (for example xBull or Freighter) to use the console.

The SDK is a private GitHub Packages dependency. Authenticate with a token that
has `read:packages`, then install and run:

```bash
export NODE_AUTH_TOKEN=<a GitHub token with read:packages>
pnpm install
pnpm dev
```

Open http://localhost:3000. The dashboard reads live from the deployment the SDK
vendors, so it works with no deployment of your own; that is the fastest proof
your setup works. To point the app at a local contract deployment, set
`CONSTELLATION_DEPLOYMENTS` in `.env.local` as described in the README.

## Where to start

Issues carry one of three difficulty labels: `good first issue`, `intermediate`,
`advanced`, plus area labels. The full list with acceptance criteria lives in
[ISSUES.md](ISSUES.md); it and this section are kept in step.

1. **Empty and loading states polish** — `good first issue`.
2. **Copy-to-clipboard for hashes and addresses** — `good first issue`.
3. **Programme search and filter** — `intermediate`.
4. **Event feed on the programme detail** — `intermediate`.
5. **Disbursement UI in the console** — `intermediate`.
6. **Anchor payout flow** — `advanced`.
7. **Offline field client as a progressive web app** — `advanced`. One of the two
   largest pieces in the whole project.
8. **Astrolabe verified-NGO badges** — `advanced`.

To claim an issue, comment on it. For a large piece such as the offline field
client, open a discussion first so the approach is agreed before you build.

## Rules that matter here

A reviewer will send a pull request back for any of these:

- **No direct contract calls.** All on-chain interaction goes through the SDK. No
  re-implemented Merkle or hashing logic lives here.
- **No beneficiary identifier reaches the chain or the screen.** Evidence stays in
  the browser; only hashes and salted references are sent through the SDK.
- **No misleading copy.** Nothing may imply the chain proves goods were delivered
  or that recipients received aid. This is a correctness rule, not a style one.
- **Amounts are `bigint` stroops.** Format for display without floating point.
- **Read the deployment from the SDK.** No hardcoded contract ids; use
  `deployments` or `CONSTELLATION_DEPLOYMENTS`.

## Code style

TypeScript and React with the Next.js App Router, Tailwind CSS, and small
shadcn-style primitives. Linted with `next lint`, type-checked with `tsc`, tested
with Vitest. Commits follow
[Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`,
`docs:`, `test:`, `chore:`. Branch names read like `feat/event-feed` or
`fix/mobile-layout`.

CI runs exactly these, and they must pass:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Pull request checklist

- [ ] `pnpm lint` is clean.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` succeeds.
- [ ] New UI is legible on a phone and keyboard accessible.
- [ ] No direct contract calls and no re-implemented SDK logic.
- [ ] No copy implies the chain proves delivery of goods or receipt of aid.
- [ ] Any dependent pull request in another repository is linked.

## Releases

Application repositories are not versioned for consumers. They deploy from `main`
and tag releases for changelog purposes only. Contributors must not change the
pinned SDK version in a feature pull request unless the change is the point of the
pull request; bumping the SDK is part of the cross-repository release flow in
docs/multi-repo.md.

## Security

Report vulnerabilities privately per [SECURITY.md](SECURITY.md), never in a public
issue. The sensitive surfaces here are beneficiary privacy, wallet signing, and
honest presentation. This project is unaudited and Testnet only.

## Community

Design discussion happens in GitHub Discussions. Two merged pull requests earn
triage rights on request. Application repositories grant commit rights more
readily than the protocol repository does, once you have a track record of merged
work. Keep pull requests small so they can be reviewed quickly.
