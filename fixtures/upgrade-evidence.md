# ImplGuard Relay deterministic fixtures

## POLICY

Protocol upgrades may add ordinary business logic. Any new role-management, asset-transfer, mint/burn, pause/freeze, upgrade-authority, delegatecall, or external-call capability must be disclosed. Delegatecall and unrestricted asset withdrawal are forbidden.

## DISCLOSURE SAFE

The candidate preserves the current privilege surface. It adds no role-management, fund-movement, mint/burn, pause/freeze, upgrade-authority, delegatecall, or new external-call capability.

## DISCLOSURE RISK

The candidate adds a sponsor-controlled pause capability. The policy permits this capability when it is explicitly disclosed and no other privileged capability is introduced.

## DISCLOSURE HIDDEN

The candidate is a gas optimization with no security-relevant behavior change.

## DISCLOSURE AMBIGUOUS

The candidate contains general maintenance improvements.
