# cygnus-app

The public dashboard and implementer console for Cygnus, a humanitarian aid
disbursement protocol on Stellar's Soroban platform. Anyone can read the public
record without an account; an implementer connects a wallet to create programmes,
claim milestones, and approve or reject them.

Unaudited. Testnet only. There is no mainnet deployment and no mainnet
configuration. Do not use this to move real value.

This is the application repository, the last of three:

- [cygnus-contracts](https://github.com/Cygnus-aid-disbursement/cygnus-contracts)
  — the Rust contract and protocol specification.
- [cygnus-sdk](https://github.com/Cygnus-aid-disbursement/cygnus-sdk) — the
  TypeScript client, Merkle batches, and hashing conventions.
- **cygnus-app** (here) — the dashboard and console.

Dependencies point one way: contracts, then SDK, then app. Everything on chain
goes through `@cygnus-aid-disbursement/sdk`; this app never calls a contract
directly and never re-implements Merkle or hashing logic. See
[docs/multi-repo.md](docs/multi-repo.md).

## What the chain proves, and what it does not

Cygnus records that funds moved from one party to another under a stated rule: a
programme was funded, a milestone was claimed and approved, a batch of a given
total and count was disbursed. That is what this dashboard shows.

It does not show that goods were delivered, that services were rendered, or that
the right people received aid. A disbursement batch publishes a Merkle root, a
total, and a count; it commits to a list of payouts without proving anyone
received value. Beneficiaries are never named. Read the record for what it is: a
public, tamper-evident account of money movement, not a receipt for outcomes.

Individual payouts never go on chain. A disbursement publishes only a Merkle
root, a total, and a count, and recipient references are salted before they are
hashed into a leaf, so the same person cannot be correlated across programmes.
The dashboard never displays a recipient list because none exists on chain.

## Status

Reads live from the Testnet programme contract
`CBN6MNOWZISG6EXVCUQSGKASFSIBVDBZSVASI6FZYBLBMLHMQWL6SAL7`, vendored through the
SDK.

What works today: the public dashboard (programme list, programme detail with the
milestone timeline and disbursement batches, and the receipt verify page) with no
wallet, and the implementer console for create, fund, claim, approve, and reject
behind a Stellar wallet.

What does not work yet: the console cannot yet build and submit a disbursement
batch or produce receipts, there is no event feed on the detail page, and there
is no anchor payout flow or offline field client. These gaps are tracked as
GitHub issues.

## Two faces

- **Public dashboard.** No wallet, no account. A list of programmes with sponsor,
  implementer, budget, and disbursement progress; a programme detail with the
  milestone timeline, each claim and approval with its evidence hash, and each
  disbursement batch with its root, total, and count; and a page where anyone can
  paste a receipt and verify an inclusion proof against the on-chain root.
- **Implementer console.** Authenticated by a Stellar wallet. Create and fund a
  programme, claim a milestone with evidence, and approve or reject as an
  approver. Evidence documents stay in the browser; only their hashes go on chain,
  and the hash is shown next to each document.

## Setup

Prerequisites: Node 20 or later and pnpm 9 or later (`corepack enable`).

The SDK is a private GitHub Packages dependency. Authenticate with a token that
has `read:packages`:

```bash
export NODE_AUTH_TOKEN=<a GitHub token with read:packages>
pnpm install
pnpm dev
```

Then open http://localhost:3000. The dashboard reads live from the deployment the
SDK vendors, so it works with no deployment of your own.

## Configuration

Copy `.env.example` to `.env.local`. Every value has a working default except
`NODE_AUTH_TOKEN`.

- `NODE_AUTH_TOKEN` — a token with `read:packages`, used only to install the SDK
  from GitHub Packages. Not read at runtime.
- `CYGNUS_DEPLOYMENTS` — point the app at a specific deployment file instead of
  the SDK's vendored one. A contract developer running a local Testnet deploy sets
  this to their contracts repo's `deployments/local-testnet.json`, per
  docs/multi-repo.md. Server-side only.
- `NEXT_PUBLIC_RPC_URL` — Soroban RPC URL. Defaults to the public Testnet RPC.
- `READER_PUBLIC_KEY` / `NEXT_PUBLIC_READER_PUBLIC_KEY` — a funded Testnet
  account used only to simulate read-only calls. No signing happens with it.
- `NEXT_PUBLIC_CONTRACT_ID` — override the programme contract id in the browser.
  Defaults to the id the SDK vendors; normally left unset.

## Development

```bash
pnpm dev        # local dev server
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Deploying to Vercel

The app builds on Vercel with the framework defaults; no `vercel.json` is needed.

- Root directory: the repository root (this repo holds only the app).
- Build command: `pnpm build` (Vercel's Next.js default, `next build`).
- Install command: the default `pnpm install`. The repo's `.npmrc` points the
  `@cygnus-aid-disbursement` scope at GitHub Packages and reads `NODE_AUTH_TOKEN`,
  so the install fails without that token.
- Output: left to the Next.js default; do not set an output directory.

Environment variables to set in the Vercel project:

- `NODE_AUTH_TOKEN` (required) — a GitHub token with `read:packages`, so the
  build can install the SDK from GitHub Packages.
- `NEXT_PUBLIC_RPC_URL` (optional) — defaults to the public Testnet RPC.
- `READER_PUBLIC_KEY` and `NEXT_PUBLIC_READER_PUBLIC_KEY` (optional) — a funded
  Testnet account for read-only simulation; both default to a built-in account.
- `NEXT_PUBLIC_CONTRACT_ID` (optional) — defaults to the id the SDK vendors.

## Scope

At this stage the console covers create, fund, claim, approve, and reject. The
disbursement UI, beneficiary receipts beyond the verify page, anchor payouts, and
the offline field client are tracked in [ISSUES.md](ISSUES.md).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Report security issues privately per
[SECURITY.md](SECURITY.md).

## License

Apache-2.0. See [LICENSE](LICENSE).
