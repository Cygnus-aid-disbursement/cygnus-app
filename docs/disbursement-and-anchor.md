# Disbursement Architecture & Anchor Integration

This document outlines the architecture of Cygnus disbursement batches, privacy guarantees, receipt verification, and Stellar Anchor off-ramp flows.

---

## 1. Privacy Invariant & Salted Beneficiary References

Humanitarian operations routinely disburse aid in conflict regions, disaster zones, or vulnerable communities. Beneficiary lists contain sensitive personal identifiers (national ID, phone numbers, biometric references, refugee registration numbers).

### Privacy Principle

**No raw beneficiary identifier ever reaches the Stellar ledger or public API responses.**

```
Raw Identifier ("BEN-9021") + Programme Secret Salt
                    │
                    ▼
            HMAC-SHA256 / SHA256
                    │
                    ▼
        Salted Recipient Reference (32 bytes)
                    │
                    ▼
         Leaf = SHA256(recipientRef || amount)
                    │
                    ▼
          Merkle Tree Construction
                    │
                    ▼
         Only Merkle Root + Total + Count committed on-chain
```

- When an NGO submits a disbursement batch via `cy.disburse(programmeId, root, total, count)`, only the cryptographic summary is stored in contract storage.
- Neither the contract nor network observers can infer recipient count identities, individual payment sizes (other than the aggregate total), or identity linkages across programmes.

---

## 2. Batch Builder Ingestion Formats

The Cygnus Console (`/console`) provides batch preparation from both structured JSON and standard tabular CSV:

### JSON Format

```json
[
  { "reference": "BENEFICIARY_ID_001", "amount": 10000000 },
  { "reference": "BENEFICIARY_ID_002", "amount": 20000000 }
]
```

### CSV Format

Standard CSV exported from humanitarian field sheets (with or without headers):

```csv
reference,amount
AID-SUDAN-001,15000000
AID-SUDAN-002,25000000
```

Validation ensures:

- References are non-empty after trimming.
- Amounts are strictly positive integer stroops (1 XLM = 10,000,000 stroops).
- Parsing errors pinpoint exact line numbers to streamline field operation imports.

---

## 3. Cryptographic Receipt Verification (`/verify`)

For each leaf in a disbursement batch, `buildDisbursementPackage` generates an exportable JSON receipt containing:

- `programmeId`: Target aid programme identifier.
- `batchIndex`: Index of the committed batch within the programme.
- `leaf`: 32-byte hexadecimal representation of `SHA256(recipientRef || amount)`.
- `proof`: Array of 32-byte sister node hashes forming the Merkle inclusion proof.

When a recipient or auditor enters a receipt into `/verify`:

1. The app decodes the leaf and proof hex buffers.
2. The client queries the Soroban contract's `verify_inclusion` function or verifies the proof against the programme's recorded batch root.
3. Verification confirms that this exact disbursement commitment was signed by the authorized programme implementer, without leaking details of other beneficiaries in the same batch.

---

## 4. Stellar Anchor Off-Ramp Integration

For cash aid delivery in regions without direct crypto rails, Cygnus integrates with Stellar Anchor services (SEP-31 cross-border payments & SEP-24 hosted off-ramps):

1. **Quote Request (`requestQuote`)**: Requests conversion rates between on-chain stroops and local fiat/mobile assets (e.g. NGN, KES).
2. **Payout Initiation (`initiatePayout`)**: Passes the quote ID, the 32-byte salted `recipientRef`, and source amount to the anchor. Raw identities are never forwarded.
3. **Status Tracking (`pollPayoutStatus`)**: Polls the anchor transaction lifecycle (`pending`, `processing`, `completed`, `error`).

In test and development environments, the SDK supplies `StubAnchor`, which clearly indicates stub mode while preserving standard anchor interfaces for turnkey production deployment.

---

## 5. Honest Ledger Claims & Astrolabe Attestations

Cygnus adheres strictly to the Constellation honest ledger principle:

- **What the ledger verifies:** Authorized funds movement under protocol rules (escrow locks, Merkle root commitments, and implementer authorization).
- **What the ledger does NOT verify:** Physical delivery of goods, food parcels, or local in-person handoffs.
- **Astrolabe Verified-NGO Badges:** Signifies that the implementer's organization identity and legal registration have been attested via the Astrolabe Schema Registry. It explicitly does not represent physical delivery proof.
