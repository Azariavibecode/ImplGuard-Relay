# StudioNet E2E plan

Expected outcomes must be frozen in a public commit before live execution.

## Wallet separation

- Main wallet: deploy contract only.
- Auxiliary wallet A: register protocol and propose candidates.
- Auxiliary wallet B: ground sources and request semantic review.
- Auxiliary wallet A: consume an eligible permit.

## Required cases

| Case | Expected result | Required proof |
|---|---|---|
| No privilege expansion | `SAFE → PERMIT_READY → ACTIVATED` | finality, exact readback, revision increment |
| Disclosed policy-allowed pause | `RISK_DISCLOSED → PERMIT_READY` | semantic flags and disclosure binding |
| Hidden asset-withdraw authority | `BLOCKED` | no permit, blocked counter increments |
| Ambiguous candidate | `INCONCLUSIVE` | no permit or activation |
| Wrong GitHub digest | `SOURCE_UNVERIFIED` | proposal and counters unchanged |
| Unverified Blockscout candidate | `SOURCE_UNVERIFIED` | no ground persisted |
| Wrong actor proposes | `SPONSOR_ONLY` | complete pre/post equality |
| Wrong actor consumes | `SPONSOR_ONLY` | protocol, proposal, counts unchanged |
| Stale base revision | `STALE_BASE` | exact state unchanged |
| Permit replay | `PERMIT_NOT_READY` | exact state and counters unchanged |
| Terminal review replay | `PROPOSAL_NOT_GROUNDED` | terminal history unchanged |
| Validator disagreement | nonterminal grounded state | no permit and no positive counter |

Each evidence JSON must include deployed address, source commit/digests, actor addresses, expected outcome declared before execution, transaction hashes, finality/consensus/execution results, and full relevant pre/post readbacks.
