# Steward evidence packet

Review status: incomplete release. The observed catalog-ID deployment has 11 independently audited finalized transactions and no successful activation. The prepared citation-diagnostic/repair revision requires another deployment. This packet is a project self-verification record.

## Deployment and source

Replacement contract: [0x0af8c3Af2899b5D4e41Ba567C6f4E62B7668B341](https://explorer-studio.genlayer.com/address/0x0af8c3Af2899b5D4e41Ba567C6f4E62B7668B341).

The deployed source matches the catalog-ID contract at commit `977f517`, SHA-256 `10e13ed0539bab52d1f62ccd9cc0665533f195440697b2d4592ac0d37cdc9ece`. [Source parity record](../verification/live/0x0af8c3af2899b5d4e41ba567c6f4e62b7668b341/deployed-source.json).

## Request-to-proof mapping

| Steward requirement | Code boundary | Direct verification | Live proof |
|---|---|---|---|
| Deterministic prohibitions | `_policy_rules`; post-consensus DENY override | `test_policy_denial_overrides_model_permission`; incomplete-policy controls; disclosed-condition tests | Pending completed release ledger |
| Proxy scope | `_fetch_verified_contract`; explicit null proxy type and empty implementation list; conservative delegation/assembly rejection | Metadata, delegation, source-boundary and import-completeness tests | Proxy negative control in release suite |
| Registry activation wording | `activation_scope=GENLAYER_REGISTRY_ONLY`; production scope notice | Single-use activation direct test; frontend build | Fresh activation pending |
| Source-specific findings | `_reference_catalog`, `_materialize_references`, `_check_references`; comparative relevance principle | Exact derived quote/path/hash and full-source catalog tests | Authenticated live findings pending |
| Source support limits | Bounded source acquisition and exact import resolution | Exact 64,000-character aggregate boundary and unsupported-layout tests | Grounding and rejected-source controls |
| Browser production lifecycle | Injected wallet provider; local browser journal; RPC evidence auditor | Production build only; no browser completion claim | Manual journey pending |
| Repository/deployment parity | `verify_v3_release.mjs`; independent finality auditor | Exact source hash comparison | Original parity record above; final release evidence pending |

## Evidence authorities and fixture scope

The sponsor controls the policy and disclosure inside its own registry namespace. GitHub commit/tree/blob/raw endpoints authenticate the committed artifact bytes and object identity, not real-world upgrade authority. The fixture is pinned to commit `b27603129bafe7de97d3789c2d9cc7281eefd1c3`; its descriptors are in [v3-descriptors.json](../fixtures/v3-descriptors.json).

Blockscout independently provides address identity, verified Solidity source bundles and ABI for BAT (`0x0d8775f648430679a709e98d2b0cb6250d2887ef`) and GNO (`0x6810e776880c02933d47db1b9fc05908e5386b96`). These are public source-comparison fixtures. Their issuers did not authorize a migration through this application. The current/candidate direction affects the expected semantic result: BAT-to-GNO is the candidate no-expansion control; the reverse introduces sale/mint/refund capabilities under DENY rules. Neither direction certifies storage-layout compatibility or an external upgrade.

The wrong-digest control deliberately supplies a zero digest. The USDC proxy control uses a real verified proxy and must fail direct-only source admission. Both controls require exact unchanged protocol/proposal/counter snapshots.

## Reproduction

```text
python -m pytest -q -p no:cacheprovider
npm --prefix frontend run build
node scripts/verify_v3_release.mjs <contract-address>
node scripts/audit_release_finality.mjs <contract-address>
```

Local result: 51 passing direct/static tests, including evidence-only repair and rejection of semantic-field changes during repair. The direct tests mock remote web/model observations while calling the actual contract entrypoints; they are not network consensus evidence.

Follow [BROWSER_REVIEWER_JOURNEY.md](BROWSER_REVIEWER_JOURNEY.md) for the manual hosted-wallet journey. Export its browser journal and run `node scripts/audit_browser_evidence.mjs <export.json> <contract-address>`. The RPC audit proves network facts; browser provenance remains a client/manual observation.

## Superseded and incomplete records

- V1: incomplete-source bundle issue, superseded by V2.
- V2: 25 historical SDK transactions; no browser signature claim; source-completeness correction acknowledged by the steward.
- V3: 14 finalized calls, semantic INCONCLUSIVE, conflicting evidence-array prompt corrected afterward.
- V4: 14 finalized calls, INVALID_SOURCE_REFERENCES, no permit or activation. [Detailed evidence](../verification/STUDIONET_V4_E2E.md).
- This catalog-ID deployment: 11 finalized calls; INVALID_SOURCE_REFERENCES; wrong-digest and proxy controls pass; forbidden proposal was interrupted before submission by a network error. [V5 record](../verification/STUDIONET_V5_E2E.md). Successful lifecycle and production/browser verification remain incomplete.

The contract authorizes only a GenLayer registry change. External Ethereum proxy ownership, historical runtime bytecode, storage safety, real treasury execution and production upgrade authority are outside the demonstrated consequence.
