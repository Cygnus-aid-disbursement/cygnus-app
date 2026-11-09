# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Progressive Web App (PWA) manifest and offline field worker shell.
- Drips Network OSS Grant funding profile (`FUNDING.json`).

## [0.1.0] - 2026-11-09

### Added

- **Core Dashboard Search & Filter:** Client-side search by programme ID, sponsor address, and implementer address, with status filtering (`All`, `Active`, `Closed`) and accessible screen-reader count announcements.
- **Accessible Copy Button:** Interactive `CopyButton` component with tooltip feedback and visual confirmation, integrated across programme hashes, roots, and wallet headers.
- **Chronological Event Feed:** Timeline component on programme detail pages rendering live contract events (`funded`, `claimed`, `approved`, `rejected`, `disbursed`) with copyable transaction hashes.
- **Disbursement Batch Builder:** Implementer console tool supporting dual JSON and CSV list inputs, local beneficiary identifier salting, Merkle tree calculation, direct Soroban contract submission, and downloadable verify-compatible receipt packages.
- **Stellar Anchor Off-Ramp Flow:** SEP-31/24 quote requesting, payout initiation, and status polling UI with graceful `StubAnchor` fallbacks and quote expiration detection.
- **Astrolabe Verified-NGO Badges:** Verification badge displaying legal NGO identity from the Astrolabe Schema Registry, accompanied by honest ledger disclaimers and keyboard accessibility.
- **Resilient UI Shell:** Next.js `loading.tsx` skeletons for root and detail routes, plus client error boundaries (`error.tsx`) with retry actions.
- **Input Validation Suite:** Strict Base32 StrKey validation for Stellar addresses and contract IDs, non-negative integer validations, and stroop format checks (`lib/validators.ts`).
- **Comprehensive Test Suite:** 21 test suites comprising 160 unit and integration tests with vitest.
- **Contributor Experience:** Contributor Covenant Code of Conduct (`CODE_OF_CONDUCT.md`), GitHub issue and pull request templates, and modernized GitHub Actions workflow.

### Security & Privacy

- **Beneficiary Privacy Invariant:** Raw beneficiary references are salted locally and never leave the browser or reach the blockchain; only Merkle roots and blinded hashes are committed.
- **Honest Ledger Claims:** Clear disclaimers across all views clarifying that the blockchain verifies authorized funds movement under protocol rules, not physical delivery of aid or goods.
- **Zero AI Attribution:** Strict adherence to clean, human-maintained open-source repository conventions.
