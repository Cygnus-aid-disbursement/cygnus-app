## Summary
<!-- Briefly explain the purpose of this change and what problem it solves. -->

## Changes Made
- 

## Invariant Checklist
- [ ] **Privacy Invariant:** No raw beneficiary identifier reaches the ledger or public API responses (salted recipient references only).
- [ ] **Honest Ledger Claims:** No claims that blockchain verifies physical delivery of aid or goods.
- [ ] **Dependency Direction:** Dependencies flow one way (`cygnus-contracts` -> `cygnus-sdk` -> `cygnus-app`). No direct Soroban contract imports in the app.

## Quality Checks
- [ ] `pnpm lint` passes with 0 warnings/errors.
- [ ] `pnpm typecheck` passes cleanly (`tsc --noEmit`).
- [ ] `pnpm run format:check` passes with Prettier compliance.
- [ ] `pnpm test` passes all unit and integration tests.
- [ ] `pnpm build` succeeds without production build errors.

## Related Issues
Fixes #
