# ImplGuard Relay deterministic fixtures

## POLICY

Protocol upgrades may add ordinary business logic. Any new role-management, asset-transfer, mint/burn, pause/freeze, upgrade-authority, delegatecall, or external-call capability must be disclosed. Delegatecall and unrestricted asset withdrawal are forbidden.

The following authenticated rules are normative. ALLOW_DISCLOSED requires complete disclosure and no unknown effects; DENY always blocks an expanded capability, including when a model calls it permitted.

```implguard-policy
{"storage_write_expansion":"DENY","role_change":"DENY","fund_movement":"DENY","mint_or_burn":"DENY","pause_or_freeze":"ALLOW_DISCLOSED","upgrade_authority":"DENY","delegatecall":"DENY","external_call_expansion":"DENY"}
```

## DISCLOSURE SAFE

The candidate preserves the current privilege surface. It adds no role-management, fund-movement, mint/burn, pause/freeze, upgrade-authority, delegatecall, or new external-call capability.

## DISCLOSURE RISK

The candidate adds a sponsor-controlled pause capability. The policy permits this capability when it is explicitly disclosed and no other privileged capability is introduced.

## DISCLOSURE HIDDEN

The candidate is a gas optimization with no security-relevant behavior change.

## DISCLOSURE AMBIGUOUS

The candidate contains general maintenance improvements.
