# Replacement StudioNet lifecycle evidence

Contract: [0x0af8c3Af2899b5D4e41Ba567C6f4E62B7668B341](https://explorer-studio.genlayer.com/address/0x0af8c3Af2899b5D4e41Ba567C6f4E62B7668B341)

Recorded 11 SDK-signed auxiliary-wallet transactions; 11 finalized. All-case success: **NOT COMPLETE**.

These are SDK signatures. The separate production browser-wallet journey is still required.

| Scenario | Hash | Consensus | Execution | Return |
|---|---|---|---|---|
| happy_register | [0xeed406ecd1b2dc782bfce0729e6c15e2fd36d1f7be4ed62dad6be85eff0fbb4a](https://explorer-studio.genlayer.com/transactions/0xeed406ecd1b2dc782bfce0729e6c15e2fd36d1f7be4ed62dad6be85eff0fbb4a) | MAJORITY_AGREE | SUCCESS | 0 |
| happy_propose | [0x00457ebd08463d27ca56da75b62b3fd4f3c00c656ff27bc2927cd58a115ace67](https://explorer-studio.genlayer.com/transactions/0x00457ebd08463d27ca56da75b62b3fd4f3c00c656ff27bc2927cd58a115ace67) | MAJORITY_AGREE | SUCCESS | 0 |
| happy_ground | [0xab75d2edf0eec88ad43f1b22d6a520e3c3d59def9522ad05d6c586e73ee09a28](https://explorer-studio.genlayer.com/transactions/0xab75d2edf0eec88ad43f1b22d6a520e3c3d59def9522ad05d6c586e73ee09a28) | MAJORITY_AGREE | SUCCESS | "GROUNDED" |
| happy_review | [0x82631ac986dffd3896fa4e2dc896bb0617d23cffe2ed5e63b26913fcfec23ea6](https://explorer-studio.genlayer.com/transactions/0x82631ac986dffd3896fa4e2dc896bb0617d23cffe2ed5e63b26913fcfec23ea6) | MAJORITY_AGREE | SUCCESS | "INCONCLUSIVE" |
| forbidden_register | [0x67f6fa22f5b11592ddf90b3db3cc5c004714673c6dbc991518e219448965632d](https://explorer-studio.genlayer.com/transactions/0x67f6fa22f5b11592ddf90b3db3cc5c004714673c6dbc991518e219448965632d) | MAJORITY_AGREE | SUCCESS | 1 |
| bad_digest_register | [0x9f598a8c54e0694b3b865bb1afb04ba0b88b3ccea4ca94d988bc9ae1663b8101](https://explorer-studio.genlayer.com/transactions/0x9f598a8c54e0694b3b865bb1afb04ba0b88b3ccea4ca94d988bc9ae1663b8101) | MAJORITY_AGREE | SUCCESS | 2 |
| bad_digest_propose | [0xe1d3b6160bc882a07d3316af4b43ce961fd780d7122886132c0b46914b526673](https://explorer-studio.genlayer.com/transactions/0xe1d3b6160bc882a07d3316af4b43ce961fd780d7122886132c0b46914b526673) | MAJORITY_AGREE | SUCCESS | 1 |
| bad_digest_ground | [0x97c9830641a51196308e7a11ef4ab7759976188e9fc5cfa1d87d000fe0f2d0ba](https://explorer-studio.genlayer.com/transactions/0x97c9830641a51196308e7a11ef4ab7759976188e9fc5cfa1d87d000fe0f2d0ba) | MAJORITY_AGREE | SUCCESS | "SOURCE_UNVERIFIED" |
| proxy_register | [0xba31b5f8f8cbb9b92e33dec95978a5eeb4e0683348b371f6c1b91d89db8427c9](https://explorer-studio.genlayer.com/transactions/0xba31b5f8f8cbb9b92e33dec95978a5eeb4e0683348b371f6c1b91d89db8427c9) | MAJORITY_AGREE | SUCCESS | 3 |
| proxy_propose | [0xfe734c505a2df7f2661a62d81c0ec3501780d3fde60553ab207c3f28cb36d859](https://explorer-studio.genlayer.com/transactions/0xfe734c505a2df7f2661a62d81c0ec3501780d3fde60553ab207c3f28cb36d859) | MAJORITY_AGREE | SUCCESS | 2 |
| proxy_ground | [0xc6bc9728bca4c8cdb3f7071c98e4eb90de5a4c3b97717dc15a3208c2a415926f](https://explorer-studio.genlayer.com/transactions/0xc6bc9728bca4c8cdb3f7071c98e4eb90de5a4c3b97717dc15a3208c2a415926f) | MAJORITY_AGREE | SUCCESS | "SOURCE_UNVERIFIED" |

## Authoritative readbacks

### happy

Completed: false; error: Positive review: INCONCLUSIVE/AMBIGUOUS_DELTA.

```json
{
  "analysis": {
    "delegatecall": false,
    "disclosure_complete": false,
    "external_call_expansion": false,
    "fund_movement": false,
    "mint_or_burn": false,
    "pause_or_freeze": false,
    "proposal_id": 0,
    "reason_code": "AMBIGUOUS_DELTA",
    "role_change": false,
    "storage_write_expansion": false,
    "unknown_effect": true,
    "upgrade_authority": false,
    "validation_error": "INVALID_SOURCE_REFERENCES",
    "verdict": "INCONCLUSIVE"
  },
  "base_implementation": "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
  "base_revision": 0,
  "candidate_implementation": "0x6810e776880c02933d47db1b9fc05908e5386b96",
  "disclosure_source": {
    "commit": "b27603129bafe7de97d3789c2d9cc7281eefd1c3",
    "digest": "6bc9f2f29f648006c810c5a8a77e938bc384092fe101713dfa765385d5f09f93",
    "marker": "## DISCLOSURE SAFE",
    "owner": "Azariavibecode",
    "path": "/fixtures/upgrade-evidence.md",
    "repo": "ImplGuard-Relay"
  },
  "permit_consumed": false,
  "proposal_id": 0,
  "protocol_id": 0,
  "reason_code": "AMBIGUOUS_DELTA",
  "sponsor": "0x67a1a08fc4cf7d05c859d0d3d8398a3a30b1677e",
  "state": "INCONCLUSIVE",
  "verdict": "INCONCLUSIVE"
}
```

### forbidden

Completed: false; error: An unknown RPC error occurred.

Details: fetch failed
Version: viem@2.57.7.

```json
{}
```

### bad_digest

Completed: true; error: none.

```json
{
  "error": "GROUND_NOT_FOUND"
}
```

- bad_digest_ground: PASS; expected SOURCE_UNVERIFIED; return SOURCE_UNVERIFIED; full before/after snapshots are in the raw report.
### proxy

Completed: true; error: none.

```json
{
  "error": "GROUND_NOT_FOUND"
}
```

- proxy_ground: PASS; expected SOURCE_UNVERIFIED; return SOURCE_UNVERIFIED; full before/after snapshots are in the raw report.

## Final counters

```json
{
  "activated_count": 0,
  "blocked_count": 0,
  "proposal_count": 3,
  "protocol_count": 4
}
```

Raw evidence: [release-suite.json](./release-suite.json). Source parity: [deployed-source.json](./deployed-source.json).

This is a project self-verification record. It does not establish external Ethereum upgrade authority or Ethereum execution.
