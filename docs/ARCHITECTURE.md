# Architecture

## Authoritative records

`protocols` binds sponsor, current implementation, policy descriptor, and monotonically increasing revision. `proposals` binds an exact base implementation/revision to one candidate and disclosure. `grounds` stores authenticated public evidence acquired atomically by validator consensus.

## Semantic boundary

The model returns only bounded booleans plus a verdict and reason code. `prompt_comparative` compares semantic results. Deterministic code rejects inconsistent positive outcomes and converts malformed output to `INCONCLUSIVE`.

## Downstream consequence

`consume_activation` is the enforcement consumer. It rechecks sender, permit state, exact base implementation, and revision immediately before changing the active implementation. Consumption and activation are atomic and cannot replay.

## Roles

- Deployment wallet: deploy only; no stored authority.
- Sponsor: transaction sender that registers a protocol; proposes and consumes its upgrades.
- Grounder/reviewer: any wallet may ground and review public evidence.
- Independent reviewer: may register a fresh namespace and reproduce all actions with their own wallet.
