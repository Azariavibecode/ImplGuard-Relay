# V5 catalog-ID lifecycle — incomplete release

Observed contract: `0x0af8c3Af2899b5D4e41Ba567C6f4E62B7668B341`.

The original deployed source matched the catalog-ID revision at `977f517`, SHA-256 `10e13ed0539bab52d1f62ccd9cc0665533f195440697b2d4592ac0d37cdc9ece`. Subsequent local citation-diagnostic/repair changes have not been deployed.

Recorded result: 11/11 submitted transactions FINALIZED, with successful leader execution and majority agreement. An independent audit re-read every transaction and checked sender, target and exact return. Final observed counters: 4 protocols, 3 proposals, 0 blocked verdicts, 0 activations.

The direct positive-control sources grounded. Its semantic review returned INCONCLUSIVE / INVALID_SOURCE_REFERENCES. The error establishes that citation validation rejected the assessment; it does not identify which individual check failed because the deployed version did not retain that detail. No permit was issued.

Wrong-digest and proxy controls returned SOURCE_UNVERIFIED and preserved complete before/after state. The forbidden branch registered its protocol, then encountered an `eth_gasPrice` fetch failure before proposal submission. It has no proposal hash and no completed negative semantic verdict.

- [Detailed ledger and state readbacks](live/0x0af8c3af2899b5d4e41ba567c6f4e62b7668b341/STUDIONET_E2E.md)
- [Raw receipts, validator observations and snapshots](live/0x0af8c3af2899b5d4e41ba567c6f4e62b7668b341/release-suite.json)
- [Source parity at deployment](live/0x0af8c3af2899b5d4e41ba567c6f4e62b7668b341/deployed-source.json)
- [Independent 11-hash finality audit](live/0x0af8c3af2899b5d4e41ba567c6f4e62b7668b341/finality-audit.json)

The prepared correction retains per-condition validation errors and rejected reference details. It permits one citation-only repair while code prevents any change to semantic fields, followed by the complete original validation and policy gates. Local tests: 51 pass. This is not evidence of a successful live repair or activation.

Continuation signing was paused on 2026-10-27 when automatic approval review rejected recovering wallet keys from conversation history and injecting them to sign transactions. No new write was sent by that rejected action. The E2E task is authorized, but that credential-recovery/use method requires explicit authorization or a normal secure credential input flow.

Cloudflare still serves the documented V3 publication. No browser-wallet lifecycle is claimed. The current release must not be resubmitted as complete.
