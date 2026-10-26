# StudioNet deployment

## V4 observed deployment — incomplete semantic lifecycle

`0x9049AbF4D9256BEfE621C71303151c6748A51930` matched the corrected-prompt source on 2026-10-26. [V4 evidence](STUDIONET_V4_E2E.md) records 14 finalized calls and INVALID_SOURCE_REFERENCES. The prepared catalog-ID source differs from this deployment and must be deployed again. No successful activation or completed remediation release is claimed.

## Replacement deployment (v3)

Contract: `0xcca30bE2F67210BDefDD2B8D51105BAc4bc60Ae4`

The deployed source exactly matched the remediation contract on 2026-10-26, SHA-256 `53964a14a5a7f34d17f4121396065ceafa603554fa96a53206355ea248faf794`. Initial counts were zero. Machine-readable comparison: [v3/deployed-source.json](live/v3/deployed-source.json). Fresh lifecycle testing is in progress; browser-wallet evidence is pending.

## Superseded deployment (v2)

Contract: `0xF0271b6665c436638274229A6768b1dA4c950a33`

Explorer: https://explorer-studio.genlayer.com/address/0xF0271b6665c436638274229A6768b1dA4c950a33

`gen_getContractCode` returned source byte-for-byte equal to `contracts/ImplGuardRelay.py` on 2026-10-15. SHA-256: `b6e1927fb66b3d557efac1fb596b54ec4f0c56fad192d101bd312f5e334bf6c3`. Initial counts were all zero. The production frontend now targets this address.

## Historical v1 deployment

Contract: `0x11aA1f375b2765Bf7757Ca3eB554c6dEF0F127f7`

Explorer: https://explorer-studio.genlayer.com/address/0x11aA1f375b2765Bf7757Ca3eB554c6dEF0F127f7

On 2026-10-15, an independent `get_counts` RPC read succeeded:

```json
{"activated_count":0,"blocked_count":0,"proposal_count":0,"protocol_count":0}
```

This confirms the public read entrypoint is available. It does not establish deployed-source equality or wallet-signing E2E completion.

This historical v1 address is retained for its evidence links. The production frontend uses the current v2 address above.
