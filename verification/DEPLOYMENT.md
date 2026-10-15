# StudioNet deployment

## Current corrected deployment (v2)

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
