# ImplGuard Relay — corrected deployment E2E

## Deployment and immutable inputs

- Network: GenLayer StudioNet, chain ID `61999`.
- Current contract: [`0xF0271b6665c436638274229A6768b1dA4c950a33`](https://explorer-studio.genlayer.com/address/0xF0271b6665c436638274229A6768b1dA4c950a33).
- Corrected contract source commit: [`e0687d1`](https://github.com/Azariavibecode/ImplGuard-Relay/commit/e0687d1).
- Source fetched through `gen_getContractCode` equals the submitted local file byte for byte: SHA-256 `b6e1927fb66b3d557efac1fb596b54ec4f0c56fad192d101bd312f5e334bf6c3`.
- Source comparison evidence: [deployed-source.json](live/v2/deployed-source.json).
- Policy/disclosure fixture commit: `9283e9f5797abb8ac72cade7b17496f89b412bfd`.
- Fixture path: `/fixtures/upgrade-evidence.md`.
- Fixture SHA-256: `96f84a7d4702aa46388664071d846330758b5944d70bf59db3aa57232caf1bdf`.
- Test wallet A, sponsor: `0x67A1A08Fc4cf7D05c859d0d3D8398a3A30B1677e`.
- Test wallet B, grounder/reviewer and unauthorized actor: `0x7C87B10a3d43F3b3551414401F8b26B9F662bAB5`.

The main wallet deployed only. Every transaction below was signed through the SDK by auxiliary A or B. Reviewers may register their own namespace using their own wallet; the deployment account has no stored administrative power.

Expected outcomes are declared in `scripts/run_v2_release.mjs` and in the report before the first submission. The fixture bytes were publicly committed before execution.

## Sources and scope

Current contract: [USDC FiatTokenProxy](https://eth.blockscout.com/address/0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48).

Candidate: [EURC FiatTokenProxy](https://eth.blockscout.com/address/0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c).

Hidden-privilege candidate: [TetherToken](https://eth.blockscout.com/address/0xdAC17F958D2ee523a2206206994597C13D831ec7).

These public contracts are source-comparison fixtures. Registering them does not assert ownership over those external contracts or execute an Ethereum proxy upgrade. The consequential action demonstrated here is the GenLayer registry's atomic implementation activation.

V2 grounds the complete verified compiler source bundle. The candidate inventory contains five files:

1. `contracts/v1/FiatTokenProxy.sol`
2. `contracts/upgradeability/AdminUpgradeabilityProxy.sol`
3. `contracts/upgradeability/Proxy.sol`
4. `contracts/upgradeability/UpgradeabilityProxy.sol`
5. `@openzeppelin/contracts/utils/Address.sol`

Full explorer paths, individual SHA-256 hashes, callable surfaces, and bundle digests are preserved in [release-suite.json](live/v2/release-suite.json). Missing imports, duplicate source paths and oversized bundles fail closed in direct contract regression tests.

## Results

| Proposal | Protocol | Scenario | Result |
|---:|---:|---|---|
| 0 | 0 | Complete disclosure, equivalent privilege surface | `SAFE → PERMIT_READY → ACTIVATED`; revision `0 → 1` |
| 1 | 0 | Sibling proposal reviewed before proposal 0 activates | `SAFE/PERMIT_READY`; subsequent consume returns `STALE_BASE` |
| 2 | 1 | Hidden token/admin privilege expansion | `BLOCKED / UNDISCLOSED_PRIVILEGE_EXPANSION`; consume rejected |
| 3 | 2 | Syntactically valid descriptor with all-zero digest | `SOURCE_UNVERIFIED`; remains `PROPOSED/PENDING`, no ground persisted |
| 4 | 3 | Ambiguous maintenance disclosure for expanded privileges | `BLOCKED / UNDISCLOSED_PRIVILEGE_EXPANSION`; no permit |

All 25 transactions finalized with `MAJORITY_AGREE` and leader execution `SUCCESS`. A rejected operation is a successful contract execution returning a rejection code; it is not described as a VM rollback.

Final counts: `protocol_count=4`, `proposal_count=5`, `activated_count=1`, `blocked_count=2`.

## Transaction ledger

Every link targets the exact StudioNet transaction. A = auxiliary sponsor, B = auxiliary reviewer/adversary.

| Step | Actor | Contract return | Explorer |
|---|---|---|---|
| Register happy protocol | A | `0` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x0627a20917a0910d7ac43f68b29222c1ceef35a7d3b5e5d6710289ee193f8705) |
| Propose happy candidate | A | `0` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x2c453cb15316305b1c2751a7e80b611ff838f95fed6e764a3dc39f01e886078d) |
| Ground full happy bundle | B | `GROUNDED` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x22637a46972f18b0c97efce373ca24c64e8897e21a0c4cbc6e6110b1d7550d57) |
| Review happy proposal | B | `SAFE` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x45471157ff7640a3de8e45c6fcd6cc3ad258b13ec8377d90b49da80278816822) |
| Propose sibling candidate | A | `1` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x371e574dff8ebe684c1672d40f129b4c127f165ab4ea8dbf5c6b2725813d7ac2) |
| Ground sibling bundle | B | `GROUNDED` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x6b92bef53abf9e8a198c1cfc53ecd4d6d9d2c732a46ea6d472b935404c7c580f) |
| Review sibling | B | `SAFE` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x4d5d03a47362717e8f0622b13097578854ad203bd3e476ea448ea7346b89523c) |
| Unauthorized propose | B | `SPONSOR_ONLY` | [Transaction](https://explorer-studio.genlayer.com/transactions/0xf0dec139249a67611f47002a73d6842b144715a09ccc265a238d176b0868a8d9) |
| Unauthorized consume | B | `SPONSOR_ONLY` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x5a1bde97a78a7d80fdf08dc03ec4c93a52c365723f3a62b5b4c13085dcc5c375) |
| Activate proposal 0 | A | `ACTIVATED` | [Transaction](https://explorer-studio.genlayer.com/transactions/0xb673113279c6fc15acf2eaa127e7f2335fd0bc4cb02be37b277a080d21a9179d) |
| Consume stale sibling | A | `STALE_BASE` | [Transaction](https://explorer-studio.genlayer.com/transactions/0xb571bfc833919908c882d5a901f2dd8f9ea433c543caf73eba6a51d81d4a3cc0) |
| Replay activated permit | A | `PERMIT_NOT_READY` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x11ab4a08f5cfa09bb8be1ace09501c80ad360a57a48c7f60965ce130d2c68599) |
| Review terminal proposal | B | `PROPOSAL_NOT_GROUNDED` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x83788d7fc1b6414a2288c524d6e216bd3915e53706056af881bcbc69ff0c3320) |
| Register hidden control | A | `1` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x825b902a8c5032d26587533517cda731ea14baf36543d687a6aaa01450e57efb) |
| Propose hidden candidate | A | `2` | [Transaction](https://explorer-studio.genlayer.com/transactions/0xe1eaa038a36b84234e25ee69838510153e37e72e5a0d06a72e452946c1ef8af8) |
| Ground hidden candidate | B | `GROUNDED` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x3166020aa92c9ea3e5abb1409bd502199a0b2bfbd2c87000bfcadc781bd4059a) |
| Review hidden privileges | B | `BLOCKED` | [Transaction](https://explorer-studio.genlayer.com/transactions/0xf89a26ba3d0ed8b8e447a6249a98a1a8f67b18b648a357f7ba25b39b2b160ea7) |
| Consume blocked proposal | A | `PERMIT_NOT_READY` | [Transaction](https://explorer-studio.genlayer.com/transactions/0xfaf18f75fee3acf0d7a8fe678f2289b3ab5e341e6be0e59f9cdcd1605b49f1b6) |
| Register bad-source control | A | `2` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x4cac7608241449221c947c2264c26cbb47bc43afc91c4c69b9afb51bc13b4113) |
| Propose invalid digest | A | `3` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x4ababf456f79fe7d5b6f70b56993b6e1dcd801c3bc199019bcfb67e27177e8b8) |
| Attempt invalid grounding | B | `SOURCE_UNVERIFIED` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x8338e0359b8a41109e81635307553552af04085838c1772e0b4256f1460e7196) |
| Register ambiguous control | A | `3` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x9a964d72ac96656e7fcf69018626957f2d6f7c9de12d0cfdee345807578331fc) |
| Propose ambiguous disclosure | A | `4` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x6ee7341f83681db39507bd9da22f94342327acc19baa36a76211aeaabc1d2849) |
| Ground ambiguous comparison | B | `GROUNDED` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x4d8b87b04777bc7b00d8f4f2e4944f546b3312bbeb87c69ad5cffc0a531e3477) |
| Review ambiguous disclosure | B | `BLOCKED` | [Transaction](https://explorer-studio.genlayer.com/transactions/0x0baf56c69ca5915f830762a2ad8c17222ecebad03411c41f8b0678f86e321644) |

## Conflict, rejection and replay proof

The hidden-privilege review records four consensus rounds, including validator disagree votes and leader rotation, before final acceptance. This is actual disagreement observed in the v2 network run, rather than a fabricated disagreement fixture. The report preserves the votes and status transitions per round. It does not establish permanent-disagreement recovery; this transaction eventually reached consensus.

Every wrong-actor, stale, terminal-replay and blocked-consume test captures protocol, relevant proposals and counters before and after submission. Exact equality is asserted alongside the expected contract return. The invalid-grounding test also confirms `GROUND_NOT_FOUND` and equality of relevant state/counters. Full snapshots appear under the corresponding case keys in [release-suite.json](live/v2/release-suite.json).

The ambiguous disclosure reached `BLOCKED`, not `INCONCLUSIVE`. `RISK_DISCLOSED` and malformed-positive-to-`INCONCLUSIVE` are covered by direct contract tests; they are not claimed as live outcomes of this run.

## UI reconciliation and local checks

[ui-sdk-readback.json](live/v2/ui-sdk-readback.json) reads exact proposal IDs `0–4` and each proposal's exact parent protocol, using the same `get_proposal`, `get_protocol`, `get_ground` and `get_counts` entrypoints consumed by the frontend. It verifies state, verdict, permit flag, current implementation, revision and stale-base status. These are SDK readback checks; browser rendering and wallet popups were not exercised, as SDK signing was accepted for this task.

Frontend writes require finalized consensus, leader execution success, an allowed contract return, and successful authoritative readback. Creation IDs come from transaction returns. Selection changes clear cached state. Consumption is disabled for a different protocol selection, a stale base, or a non-sponsor wallet. The known v1 default saved in browser storage migrates to v2; custom deployment overrides remain supported.

Local verification: `18 passed`; production frontend build succeeds. The release evidence validator checks finality, execution, rejection returns, snapshot equality, full source inventory and activation revision.

## Reproduction

Run `node scripts/verify_deployment.mjs` and `python -m pytest -q -p no:cacheprovider`. For live transactions, supply only the two auxiliary keys as environment variables and run `node scripts/run_v2_release.mjs`. It checkpoints transaction hashes before waiting; rerunning resumes the same report. A new independent run should use its own report path and a newly registered namespace. Never commit wallet keys.
