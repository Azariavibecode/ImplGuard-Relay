# Steward remediation working record — 2026-10-26

This revision is under development. V2 remains the last deployed version; local changes below are not evidence of a replacement deployment or browser-wallet E2E.

Local verification: 44 tests pass through gltest direct execution of the actual contract entrypoints. The React production build succeeds. This verifies local behavior, not replacement-deployment execution.

| Request | Implemented change | Verification still required |
|---|---|---|
| Deterministic policy enforcement | A single authenticated `implguard-policy` JSON block maps all eight categories to DENY or ALLOW_DISCLOSED. DENY overrides positive semantic permission. Missing/invalid policy blocks grounding. | Fresh deployed negative and conditional-positive lifecycle |
| Proxy implementation scope | Direct Solidity source review only. Explorer proxy metadata, delegation, fallback and assembly are rejected. Source review does not establish historical runtime bytecode identity. | Real direct-contract fixtures and proxy negative control |
| Registry vs Ethereum activation | Public proposal records carry GENLAYER_REGISTRY_ONLY on consumption; frontend explains registry scope and renders finding references. | Publish matching production build and obtain signed browser readback |
| Source-specific findings | Bounded quotes carry category, source side, path and SHA-256. Exact source bytes are checked; comparative validators must independently judge relevance and missing material privileges. | Fresh deployed semantic findings with citations |
| Source limits | At most 32 files, 42,000 characters per file, 64,000 combined source characters, 180 ABI entries, 100,000 response bytes. Imports must resolve exactly inside the bundle; no remapping inference. Direct behavioral tests cover exact aggregate boundary and unsupported layouts. | Fresh deployed unsupported-source control |
| Browser production E2E | Pending | Registration, proposal, grounding, review, registry activation, rejected call; browser wallet signatures and finalized readbacks |
| Final revision parity | Pending | Exact final Git commit, replacement deploy source hash and production build verification |

For future Ethereum integration, a separate adapter must authenticate the actual proxy upgrade authority (such as its owner/timelock/multisig), bind chain, proxy, current and candidate bytecode, block state and nonce, and confirm execution receipts. This registry does not supply those facts.

Prepared verification commands:

```text
python -m pytest -q -p no:cacheprovider
npm --prefix frontend run build
node scripts/verify_v3_release.mjs <replacement-address>
node scripts/audit_browser_evidence.mjs <browser-export.json> <replacement-address>
```

The frontend exports browser-observed transaction evidence with hosted origin, actor, exact returned IDs, finalized outcome and before/after state, including rejected grounding attempts. The RPC auditor checks network facts; browser signature provenance still requires the manual production journey in [BROWSER_REVIEWER_JOURNEY.md](../docs/BROWSER_REVIEWER_JOURNEY.md).
