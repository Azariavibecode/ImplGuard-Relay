# V4 lifecycle and citation failure

Contract: `0x9049AbF4D9256BEfE621C71303151c6748A51930`.

The deployed source matched commit `a902299` with SHA-256 `b9e85bf73796e6c3ead8f901ce6078caaf1199e9c486df0ddade730d121997d2` before subsequent local corrections.

The run completed 14 finalized SDK transactions from the authorized auxiliary wallets. Both direct-source pairs grounded. Both semantic reviews returned INCONCLUSIVE. The positive-control readback explicitly reported INVALID_SOURCE_REFERENCES, so the contract correctly withheld the permit. Wrong-digest and proxy candidates returned SOURCE_UNVERIFIED with exact before/after equality.

Final state: 4 protocols, 4 proposals, 0 blocked verdicts, 0 activations. This is an incomplete release, not a successful happy path.

- [Detailed transaction table and canonical readbacks](live/0x9049abf4d9256befe621c71303151c6748a51930/STUDIONET_E2E.md)
- [Raw transaction receipts and snapshots](live/0x9049abf4d9256befe621c71303151c6748a51930/release-suite.json)
- [Original deployed-source parity](live/0x9049abf4d9256befe621c71303151c6748a51930/deployed-source.json)
- [Independent finality audit](live/0x9049abf4d9256befe621c71303151c6748a51930/finality-audit.json)

The prepared source replaces model-copied quote/path/hash fields with deterministic source catalogs. The model selects bounded IDs; code derives and validates the full authenticated references. All source characters remain represented, and catalog order follows each file. Local direct-contract tests pass (48). This change needs a replacement deployment and fresh positive, policy-negative and browser-wallet evidence before resubmission.

The production Cloudflare deployment remains the earlier V3 publication documented in `live/v3/cloudflare.json`. The local frontend is prepared for V4 inspection but was not republished as a completed release after these failed reviews.
