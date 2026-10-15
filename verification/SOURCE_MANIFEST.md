# Test source manifest

The repository includes synthetic semantic fixtures in `fixtures/upgrade-evidence.md`. They test policy/disclosure binding only and are explicitly not evidence about a real DAO upgrade.

Live E2E requires two distinct, publicly verified Ethereum implementation addresses whose Blockscout source/ABI responses are stable. Before running:

1. Record exact addresses and explorer links.
2. Confirm `is_contract=true` and `is_verified=true`.
3. Freeze policy/disclosures in a full Git commit.
4. Compute SHA-256 over exact raw file bytes.
5. Record expected results before transactions.
6. Preserve raw transaction-level evidence without overstating validator conflicts or unavailable sources.
