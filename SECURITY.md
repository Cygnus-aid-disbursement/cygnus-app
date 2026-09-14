# Security policy

Cygnus is unaudited and Testnet only. There is no mainnet configuration. Do not
use it to move real value.

## Reporting a vulnerability

Report privately to **security@cygnus-aid.org**. Do not open a public issue for a
suspected vulnerability. Include what you did, what you observed, and how to
reproduce it. We will acknowledge and keep you updated, and we ask for reasonable
time to fix before public disclosure.

## Sensitive surfaces in this repository

- **Beneficiary privacy.** Evidence documents and beneficiary references are
  handled in the browser. Only hashes and salted references may ever be sent to
  the chain through the SDK. A change that puts a document or a raw identifier on
  chain, or that displays one, is a privacy breach.
- **Wallet signing.** The console signs transactions with the user's wallet. It
  must only ever request signatures for the action the user initiated, and must
  never transmit a secret key. Signing happens in the wallet, not in this app.
- **No direct contract calls.** All on-chain interaction goes through
  `@cygnus-aid-disbursement/sdk`. Re-implementing Merkle or hashing logic here
  could silently diverge from the contract and mislead a viewer.
- **Honest presentation.** The dashboard must not imply the chain proves goods
  were delivered or that recipients received aid. Misleading copy is a security
  concern here, because it launders credibility.

## Scope

This policy covers the application in this repository. The contract and SDK carry
their own `SECURITY.md` with the same reporting address.
