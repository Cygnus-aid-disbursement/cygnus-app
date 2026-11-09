# Cygnus App

[![CI](https://github.com/Cygnus-aid-disbursement/cygnus-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Cygnus-aid-disbursement/cygnus-app/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Vitest](https://img.shields.io/badge/tests-160%20passing-brightgreen.svg)](test)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](tsconfig.json)

The open-source public dashboard and implementer console for **Cygnus**, a humanitarian aid disbursement protocol built on Stellar's Soroban smart contract platform. Anyone can inspect programme funding, milestone approvals, and disbursement commitments without an account. Accredited implementers connect a Stellar wallet to manage programmes, submit milestone evidence, calculate Merkle payout batches, and trigger anchor off-ramps.

> **Status:** Unaudited. Configured for Stellar Testnet. Intended for demonstration, protocol testing, and grant evaluation.

---

## Architecture & Multi-Repository Design

Cygnus is structured across three repositories with strict one-way dependency flow:

```
┌─────────────────────────────────┐
│        cygnus-contracts         │  Rust / Soroban smart contracts
│  (Protocol Specification & WASM)│  Owns deployment truth
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│           cygnus-sdk            │  TypeScript SDK & bindings
│(Client, Merkle Tree, & Hashing) │  Vendors contract interfaces
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│           cygnus-app            │  Next.js 15 App Router Frontend
│     (Public Dashboard & UI)     │  Consumes SDK; no raw contract calls
└─────────────────────────────────┘
```

See [docs/multi-repo.md](docs/multi-repo.md) for the cross-repository specification.

---

## Core Protocol Guarantees

### 1. The Privacy Invariant

Humanitarian disbursements operate in sensitive environments. Beneficiary personal information (names, national identification numbers, phone numbers, biometric records) **never reaches the blockchain or public API responses**:

- Beneficiary references are salted with a confidential programme secret.
- Salted references are hashed into Merkle tree leaves (`SHA256(recipientRef || amount)`).
- Only the 32-byte Merkle root, the total stroop amount, and the recipient count are committed on-chain.
- The same beneficiary cannot be correlated across different programmes.

### 2. Honest Ledger Claims

Cygnus adheres strictly to the Constellation honest ledger standard:

- **What the blockchain records:** Authorized funds movement under protocol rules (escrow locks, multi-party approvals, and cryptographic root commitments).
- **What the blockchain does not prove:** Physical delivery of relief supplies, food baskets, or physical cash handoffs.
- **Astrolabe Verified-NGO Badges:** Verification confirms an organization's legal identity and registry accreditation via the Astrolabe Schema Registry; it does not claim proof of physical aid delivery.

---

## Features

### 1. Public Transparency Dashboard (`/`)

- **Real-Time Ledger Querying:** Direct live reads of programme budgets, milestone releases, and disbursement batches from Stellar Testnet.
- **Client-Side Search & Filter:** Instant search by programme ID, sponsor address, or implementer address.
- **Status Filter Chips:** Filter by `All`, `Active`, and `Closed` with accessible screen-reader live announcements (`aria-live="polite"`).
- **Astrolabe Accreditation:** Visual badge display for verified implementers with hover/aria disclaimers.

### 2. Programme Detail & Event Timeline (`/programmes/[id]`)

- **Milestone Tracking:** Milestone states (`Proposed`, `Claimed`, `Approved`, `Rejected`) with budget progress indicators.
- **Evidence Verification:** Display of cryptographically hashed evidence and rejection reasons.
- **Chronological Event Feed:** Live timeline formatted from contract events (`funded`, `claimed`, `approved`, `rejected`, `disbursed`) with copyable transaction hashes.

### 3. Cryptographic Receipt Verification (`/verify`)

- **Self-Service Inclusion Proof:** Beneficiaries and independent auditors can paste their receipt JSON.
- **Zero-Knowledge Inclusion:** Cryptographically validates Merkle inclusion proofs against the on-chain batch root without disclosing any other recipient in the batch.

### 4. Implementer Console (`/console`)

- **Wallet Connection:** Connects via Stellar Wallets Kit (Freighter, xBull, Albedo).
- **Disbursement Batch Builder:**
  - Ingest payment lists via structured JSON or field-sheet CSV (`reference,amount`).
  - Local confidential salting and real-time Merkle tree generation.
  - Downloadable receipt packages ready for distribution to beneficiaries.
  - One-click transaction submission via `cy.disburse()`.
- **Anchor Off-Ramp Flow:**
  - SEP-31 / SEP-24 fiat off-ramp quote requesting and status tracking.
  - Graceful fallback for `StubAnchor` in test environments.

---

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- pnpm 9.x or higher (`corepack enable`)
- A Stellar wallet browser extension (e.g., [xBull](https://xbull.app) or [Freighter](https://www.freighter.app)) for console interactions.

### Installation

```bash
# Clone the repository
git clone https://github.com/Cygnus-aid-disbursement/cygnus-app.git
cd cygnus-app

# Set your GitHub Packages read token
export NODE_AUTH_TOKEN="your_github_token_with_read_packages"

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application will immediately read from the deployed testnet contract vendored through the SDK.

---

## Configuration

Copy `.env.example` to `.env.local` to override defaults:

| Variable                             | Description                                           | Default                               |
| :----------------------------------- | :---------------------------------------------------- | :------------------------------------ |
| `NODE_AUTH_TOKEN`                    | GitHub token with `read:packages` (install-time only) | —                                     |
| `NEXT_PUBLIC_RPC_URL`                | Soroban RPC endpoint                                  | `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_NETWORK_PASSPHRASE`     | Stellar network passphrase                            | `Test SDF Network ; September 2015`   |
| `NEXT_PUBLIC_CONTRACT_ID`            | Override default programme contract ID                | Vendored from SDK                     |
| `CYGNUS_DEPLOYMENTS`                 | Path to local deployment JSON (server-side only)      | —                                     |
| `NEXT_PUBLIC_ASTROLABE_REGISTRY_URL` | Astrolabe schema registry resolver URL                | Testnet resolver                      |

---

## Repository Map

```
cygnus-app/
├── app/
│   ├── layout.tsx                # Global shell, navigation, and font configuration
│   ├── loading.tsx               # Root loading skeleton
│   ├── error.tsx                 # Root error boundary with retry trigger
│   ├── page.tsx                  # Public dashboard homepage
│   ├── programmes/[id]/          # Programme detail view with live event feed
│   ├── verify/                   # Receipt proof verification client
│   └── console/                  # Implementer console route
├── components/
│   ├── ui/                       # Accessible UI primitives (Button, Card, Badge)
│   ├── anchor-payout.tsx         # Stellar anchor fiat off-ramp component
│   ├── astrolabe-badge.tsx       # Verified-NGO badge with honest ledger disclaimers
│   ├── console-client.tsx        # Wallet connection and programme management forms
│   ├── copy-button.tsx           # Accessible clipboard button with feedback state
│   ├── disbursement-builder.tsx  # Merkle disbursement batch builder
│   ├── event-timeline.tsx        # Chronological contract event timeline
│   └── programme-search.tsx      # Client-side search and status filter
├── docs/
│   ├── multi-repo.md             # Cross-repository contract specification
│   └── disbursement-and-anchor.md# Batch privacy architecture and anchor flows
├── lib/
│   ├── anchor.ts                 # Stellar Anchor client integration
│   ├── astrolabe.ts              # Astrolabe Schema Registry NGO verification
│   ├── batch-builder.ts          # Recipient salting and Merkle tree generation
│   ├── cygnus.ts                 # Server-side Soroban data queries and events
│   ├── errors.ts                 # Soroban contract error translation (`Error(Contract, #N)`)
│   ├── events.ts                 # Contract event parsing and formatting
│   ├── format.ts                 # BigInt stroop currency formatting
│   ├── programme-filter.ts       # Pure search and filter logic
│   ├── receipt.ts                # Strict receipt parser and proof verification
│   └── validators.ts             # Stellar address, contract ID, and stroop validators
└── test/                         # Comprehensive unit & integration tests (160+ tests)
```

---

## Quality Assurance & Verification

Cygnus App enforces strict code quality and verification gates:

```bash
# Run test suite (160 tests across 21 files)
pnpm test

# Check TypeScript types
pnpm typecheck

# Lint with ESLint
pnpm lint

# Check code formatting with Prettier
pnpm run format:check

# Format code automatically
pnpm run format

# Compile production build
pnpm build
```

---

## Contributing

We welcome contributions from the open-source community. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting pull requests.

All commits follow the [Conventional Commits](https://www.conventionalcommits.org) specification (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `style:`).

---

## License & Security

- **License:** Licensed under the [Apache License, Version 2.0](LICENSE).
- **Security Policy:** For vulnerability reporting, please see [SECURITY.md](SECURITY.md).
