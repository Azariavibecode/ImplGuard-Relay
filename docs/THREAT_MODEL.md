# Threat model

| Threat | Control |
|---|---|
| Self-authored disclosure claims behavior | Actual verified implementation sources and ABI are acquired independently |
| Mutable or substituted GitHub bytes | Full commit, tree, blob SHA-1, size, raw bytes, and contract-computed SHA-256 are checked |
| Wrong contract identity | Exact address and `is_contract`/`is_verified` checks |
| Prompt injection in source/evidence | Prompt labels evidence as untrusted data; result schema and cross-fields are deterministic |
| Invalid positive verdict | Downgraded to `INCONCLUSIVE` |
| Unauthorized candidate/activation | Authenticated sender must equal protocol sponsor |
| Permit replay | Terminal `ACTIVATED` state and `permit_consumed=true` |
| Stale base implementation | Exact implementation and revision rechecked at consumption |
| Validator disagreement | No state commit; proposal remains retryable and no permit exists |
| Source unavailable | `SOURCE_UNVERIFIED`; proposal remains `PROPOSED` |

This release demonstrates an internal activation registry. It does not claim to upgrade an external Ethereum proxy or prove production deployment behavior.
