# StudioNet deployment

Contract: `0x11aA1f375b2765Bf7757Ca3eB554c6dEF0F127f7`

Explorer: https://explorer-studio.genlayer.com/address/0x11aA1f375b2765Bf7757Ca3eB554c6dEF0F127f7

On 2026-10-15, an independent `get_counts` RPC read succeeded:

```json
{"activated_count":0,"blocked_count":0,"proposal_count":0,"protocol_count":0}
```

This confirms the public read entrypoint is available. It does not establish deployed-source equality or wallet-signing E2E completion.

Production frontend configuration points to this address. Public fixture repository/commit and verified Ethereum source pairs must be frozen before live E2E.
