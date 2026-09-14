# Open issues — cygnus-app

Unclaimed work in this repository, ordered easiest to hardest, with difficulty
labels matching `CONTRIBUTING.md`: `good first issue`, `intermediate`,
`advanced`. This list is the source of truth for what is open; `CONTRIBUTING.md`
mirrors it. To claim one, comment on the matching GitHub issue.

The largest unclaimed pieces here are the **offline field client** (#7) and
**anchor payout flows** (#6), the two biggest bodies of work in the whole project.

---

## 1. Empty and loading states polish — `good first issue`

The dashboard shows a bare message when the ledger is unreachable or empty. Add
proper loading skeletons and a friendlier empty state.

**Acceptance criteria**
- A loading state on the programme list and detail.
- A distinct empty state and error state, both readable on a phone.

## 2. Copy-to-clipboard for hashes and addresses — `good first issue`

Hashes and addresses are shown truncated. Add a click-to-copy control that copies
the full value.

**Acceptance criteria**
- Copy control on every truncated hash and address.
- Accessible label and a visible confirmation.

## 3. Programme search and filter — `intermediate`

As the number of programmes grows, the list needs search by sponsor or
implementer and a filter by status.

**Acceptance criteria**
- Client-side search and status filter over the loaded programmes.
- Works with keyboard only and announces result counts.

## 4. Event feed on the programme detail — `intermediate`

The detail page reads current state. Add a chronological feed from contract
events (funded, claimed, approved, rejected, disbursed, refunded) via the SDK's
event helper.

**Acceptance criteria**
- A time-ordered feed on the detail page built from `Cygnus.events`.
- Handles pagination and an empty range.

## 5. Disbursement UI in the console — `intermediate`

The console does not yet build and submit a disbursement batch. Add a flow that
takes a list of references and amounts, builds a batch with the SDK, shows the
root, total, and count, submits it, and produces downloadable receipts.

**Acceptance criteria**
- A batch builder using the SDK; references are salted, never shown raw on chain.
- Downloadable per-beneficiary receipts compatible with the verify page.
- The design section in the contract PRD is linked.

## 6. Anchor payout flow — `advanced`

Once the SDK ships a real anchor implementation (cygnus-sdk #6), add a UI to quote
and initiate a payout through an anchor to local currency or mobile money.

**Acceptance criteria**
- Quote, initiate, and status views wired to the SDK anchor interface.
- Clear handling of a stub anchor that is not configured.

## 7. Offline field client as a progressive web app — `advanced`

The single largest piece. A field office loses connectivity; the app must queue
claims and disbursement batches locally, sign them, and submit when a connection
returns. Nothing in a distribution may require a live connection at the moment it
happens.

**Acceptance criteria**
- A PWA that works offline: queue, local signing, and deferred submission.
- A clear pending and synced state for each queued action.
- No data loss across a reload while offline.

## 8. Astrolabe verified-NGO badges — `advanced`

Show a verified badge on programmes whose implementer holds a `verified-ngo`
attestation, read from Astrolabe.

**Acceptance criteria**
- A badge driven by Astrolabe attestations, with the trust source named.
- No implication that verification means the chain proves aid delivery.
