# ImplGuard Relay

Live dApp: [https://implguard-relay.pages.dev](https://implguard-relay.pages.dev). [Cloudflare deployment verification](verification/cloudflare-deployment.md).

StudioNet deployment: [0xF0271b6665c436638274229A6768b1dA4c950a33](https://explorer-studio.genlayer.com/address/0xF0271b6665c436638274229A6768b1dA4c950a33).

The v2 deployment contains the complete-source-bundle fix, with byte-for-byte deployed-source verification. See [the source bundle audit](verification/SOURCE_BUNDLE_AUDIT.md) and [deployment evidence](verification/live/v2/deployed-source.json). Fresh v2 lifecycle verification is recorded separately from historical v1 evidence.

ImplGuard Relay is a GenLayer dApp that compares the verified source and ABI surface of a current Ethereum implementation with a proposed replacement. It authenticates a commit-pinned upgrade policy and disclosure, asks GenLayer validators for a bounded semantic privilege delta, and permits activation only when deterministic policy gates pass.

## Why GenLayer

Hash comparison proves code changed but cannot explain whether the candidate adds asset movement, role control, pause/freeze, upgrade authority, delegatecall, mint/burn, or new external calls. ImplGuard Relay uses nondeterministic public-web acquisition plus semantic consensus for that exact judgment. Removing GenLayer removes the product's core safety decision.

## State machine

```text
ACTIVE protocol
  → PROPOSED candidate
  → GROUNDED verified source pair
  → PERMIT_READY | BLOCKED | INCONCLUSIVE
  → ACTIVATED (single use, exact base revision)
```

The deployment wallet receives no owner or admin capability. A protocol sponsor is bound to the authenticated transaction sender. Any reviewer can register a separate protocol namespace and exercise the public lifecycle with their own wallet.

## Evidence authorities

- GitHub commit/tree/blob/raw endpoints authenticate exact policy and disclosure bytes.
- Ethereum Blockscout authenticates contract identity, verified source, and ABI.
- GitHub prose is never treated as proof of implementation behavior.
- GenLayer evaluates the actual grounded source pair.
- Deterministic code validates cross-field consistency and controls the single-use activation transition.

## Local verification

```bash
python -m pytest -q -p no:cacheprovider
npm --prefix frontend install
npm --prefix frontend run build
```

After deploying, set `VITE_CONTRACT_ADDRESS` and rebuild. Live StudioNet evidence must be generated only after the public fixture commit and deployed contract address are frozen.

See [architecture](docs/ARCHITECTURE.md), [threat model](docs/THREAT_MODEL.md), [E2E plan](verification/E2E_PLAN.md), and [corrected deployment StudioNet evidence](verification/STUDIONET_V2_E2E.md).

The v2 live run completed 25 finalized SDK-signed transactions covering activation, complete source grounding, hidden privilege rejection, source failure, validator disagreement/rotation, wrong actors, stale base, and terminal replay. Local contract verification: `18 passed`. UI state was reconciled through SDK reads of the exact displayed IDs.
