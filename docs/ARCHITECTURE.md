# Architecture

## Authoritative records

`protocols` binds sponsor, current implementation, policy descriptor, and monotonically increasing revision. `proposals` binds an exact base implementation/revision to one candidate and disclosure. `grounds` stores authenticated public evidence acquired atomically by validator consensus.

## Semantic boundary

The model returns bounded booleans, a verdict, a reason code and authenticated source references. `prompt_comparative` requires independent assessment of source and policy relevance. Deterministic code checks exact quoted bytes, path and digest, rejects inconsistent positive outcomes and converts malformed output to `INCONCLUSIVE`. After consensus, authenticated machine-policy DENY rules override any positive semantic permission. See [supported source scope](SOURCE_SUPPORT.md).

## Downstream consequence

`consume_activation` is the enforcement consumer. It rechecks sender, permit state, exact base implementation, and revision immediately before changing the approved implementation inside the GenLayer registry. Consumption and registry activation are atomic and cannot replay. The record explicitly carries GENLAYER_REGISTRY_ONLY. External Ethereum ownership, upgrade authorization and execution require a separate adapter and confirmed chain receipts.

## Roles

- Deployment wallet: deploy only; no stored authority.
- Sponsor: transaction sender that registers a protocol; proposes and consumes its upgrades.
- Grounder/reviewer: any wallet may ground and review public evidence.
- Independent reviewer: may register a fresh namespace and reproduce all actions with their own wallet.
