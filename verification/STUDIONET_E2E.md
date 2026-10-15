# StudioNet E2E evidence

Release caveat: these transactions executed v1. The [source bundle audit](SOURCE_BUNDLE_AUDIT.md) found an evidence-completeness gap and the corrected contract requires a fresh deployment. Registry lifecycle evidence remains valid; it is not live verification of the corrected source collector.

## Frozen inputs

- Contract: [`0x11aA1f375b2765Bf7757Ca3eB554c6dEF0F127f7`](https://explorer-studio.genlayer.com/address/0x11aA1f375b2765Bf7757Ca3eB554c6dEF0F127f7)
- Network: GenLayer StudioNet (`61999`)
- Fixture commit: [`9283e9f5797abb8ac72cade7b17496f89b412bfd`](https://github.com/Azariavibecode/ImplGuard-Relay/commit/9283e9f5797abb8ac72cade7b17496f89b412bfd)
- Fixture: `fixtures/upgrade-evidence.md`
- Fixture SHA-256: `96f84a7d4702aa46388664071d846330758b5944d70bf59db3aa57232caf1bdf`
- Current verified Ethereum contract: [`0xA0b8…eB48`](https://eth.blockscout.com/address/0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)
- Candidate verified Ethereum contract: [`0x1aBa…C33c`](https://eth.blockscout.com/address/0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c)
- Auxiliary wallet A: `0x67A1A08Fc4cf7D05c859d0d3D8398a3A30B1677e`
- Auxiliary wallet B: `0x7C87B10a3d43F3b3551414401F8b26B9F662bAB5`

The fixture and expected outcome were committed before live execution. The main wallet only deployed the contract. Wallet A registered/proposed/consumed; wallet B grounded and reviewed.

## Happy path

Expected before execution: the two public contracts expose the same five proxy administration functions, so the semantic result should be `SAFE` or, conservatively, `RISK_DISCLOSED`; an eligible result should create a single-use permit and activate revision `1`.

| Step | Actor | Consensus | Transaction |
|---|---|---|---|
| Register protocol | A | `MAJORITY_AGREE` | [`0x49db…b485`](https://explorer-studio.genlayer.com/transactions/0x49db32a3bd91ac3119ca9ed546a6d9aa6ccb27b25e1557d59d2bd86a2f7ab485) |
| Propose candidate | A | `MAJORITY_AGREE` | [`0x2a80…c563`](https://explorer-studio.genlayer.com/transactions/0x2a803d1c3d4e8616cf51c17ecce14d0586c8dc76a2f16d1540b09d6c3facc563) |
| Ground sources | B | `MAJORITY_AGREE` | [`0xa171…a313`](https://explorer-studio.genlayer.com/transactions/0xa171124b604fdeaa7acf32f08bfea3c3ef298df9e1d0ee94d63875126b9ba313) |
| Review delta | B | `MAJORITY_AGREE` | [`0xe164…7810`](https://explorer-studio.genlayer.com/transactions/0xe164a37765783c0d73fc55f03d156d89f3d28cb2eddf0da07b2fb1a7c5ae7810) |
| Consume permit | A | `MAJORITY_AGREE` | [`0x28a1…075d`](https://explorer-studio.genlayer.com/transactions/0x28a130a4c75de2fe1d990ae659e4fb428a518167a1348541beeac60099b1075d) |
| Replay consumed permit | A | `MAJORITY_AGREE` | [`0xf475…f7ba`](https://explorer-studio.genlayer.com/transactions/0xf4751846e840f6683859e969b8fa185022d2f102957d829d2ab7a8e7b7a5f7ba) |

Authoritative readback returned `SAFE / NO_PRIVILEGE_EXPANSION`, proposal state `ACTIVATED`, `permit_consumed=true`, protocol revision `1`, and the exact candidate address as current implementation. Replay finalized without changing protocol, proposal, or counters. Full evidence: [`live/proposal-0.json`](live/proposal-0.json).

## Source-authentication failure

Expected before execution: an all-zero disclosure digest must return `SOURCE_UNVERIFIED`, persist no ground, and create no activation or blocked outcome.

| Step | Actor | Consensus | Transaction |
|---|---|---|---|
| Register negative-control protocol | A | `MAJORITY_AGREE` | [`0x10d8…15dc`](https://explorer-studio.genlayer.com/transactions/0x10d8d4c2e0c94ba5b5ad697a7356c2653b4207ed253804894dd85d4024fb15dc) |
| Propose invalid descriptor | A | `MAJORITY_AGREE` | [`0xd341…2021`](https://explorer-studio.genlayer.com/transactions/0xd341ff40909a4e0674baf7c1958a0e8fda9d35885de5968ba2936f6311d02021) |
| Attempt grounding | B | `MAJORITY_AGREE` | [`0xb337…b27e`](https://explorer-studio.genlayer.com/transactions/0xb3377216360f39e4a03bf288ca4f87ae8f84704214be66fe68dbb97d6225b27e) |

Readback remained `PROPOSED/PENDING`, `get_ground` returned `GROUND_NOT_FOUND`, and consequential counters stayed `activated_count=1`, `blocked_count=0`. Full evidence: [`live/proposal-1-source-failure.json`](live/proposal-1-source-failure.json).

## Verification boundary

## Extended adversarial run (2026-10-15)

The SDK-signed extended run is preserved in [initial transaction history](live/initial-adversarial-transactions.json) and [resumed audit with complete before/after snapshots](live/audit-resumed.json).

| Case | Authoritative result |
|---|---|
| Hidden privilege expansion, proposal 2 | `BLOCKED / UNDISCLOSED_PRIVILEGE_EXPANSION`; no permit |
| Validator conflict | First blocked review had disagree votes and `Leader Rotation`; later round finalized `MAJORITY_AGREE` |
| Two sibling proposals 3 and 4 | Both reached `SAFE/PERMIT_READY`; proposal 3 activated |
| Consume sibling 4 after activation | `STALE_BASE`; complete relevant pre/post state equal |
| Wrong actor consume | `SPONSOR_ONLY`; complete relevant pre/post state equal |
| Wrong actor propose | `SPONSOR_ONLY`; complete relevant pre/post state equal |
| Terminal review replay | `PROPOSAL_NOT_GROUNDED`; complete relevant pre/post state equal |
| Terminal consume replay | `PERMIT_NOT_READY`; complete relevant pre/post state equal |
| Consume blocked proposal | `PERMIT_NOT_READY`; complete relevant pre/post state equal |
| Ambiguous disclosure, proposal 5 | `BLOCKED`; no permit. This does not demonstrate an `INCONCLUSIVE` live verdict |

Each resumed rejection records FINALIZED status, `MAJORITY_AGREE`, leader `SUCCESS`, exact returned rejection code, and complete relevant state equality. The first runner hit the public RPC rate limit after the first sibling activation; a checkpointed runner resumed the remaining checks at a slower polling interval. It did not repeat completed activation.

The UI was corrected to check consensus and leader execution, derive newly created IDs from transaction return values, propagate readback failure, and clear cached selection state. [SDK/UI readback evidence](live/ui-sdk-readback.json) checks the exact IDs and read methods consumed by the UI. This is SDK reconciliation evidence, not a browser rendering or wallet-popup test.

Local corrected-source verification: `18 passed`. See [source bundle audit](SOURCE_BUNDLE_AUDIT.md) for the release-blocking issue discovered during the audit and the required fresh deployment.

This run demonstrates the internal activation registry and its single-use permit. It does not claim that an external Ethereum proxy was upgraded. The public pair is a reproducible verified-source fixture; its five-function callable surfaces match, while source digests differ and are preserved in evidence.
