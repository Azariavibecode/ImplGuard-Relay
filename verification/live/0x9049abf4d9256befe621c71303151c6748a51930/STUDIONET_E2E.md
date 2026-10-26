# Replacement StudioNet lifecycle evidence

Contract: [0x9049AbF4D9256BEfE621C71303151c6748A51930](https://explorer-studio.genlayer.com/address/0x9049AbF4D9256BEfE621C71303151c6748A51930)

Recorded 14 SDK-signed auxiliary-wallet transactions; 14 finalized. All-case success: **NOT COMPLETE**.

These are SDK signatures. The separate production browser-wallet journey is still required.

| Scenario | Hash | Consensus | Execution | Return |
|---|---|---|---|---|
| happy_register | [0x6ef0ecd17af943a243e9cd6a1aea27f320878759d235d3b06c3b8c112911024d](https://explorer-studio.genlayer.com/transactions/0x6ef0ecd17af943a243e9cd6a1aea27f320878759d235d3b06c3b8c112911024d) | MAJORITY_AGREE | SUCCESS | 0 |
| happy_propose | [0xa6111e713e5348c3a87650fa3baaad51c6675218bc85d67188ae66fa8f245044](https://explorer-studio.genlayer.com/transactions/0xa6111e713e5348c3a87650fa3baaad51c6675218bc85d67188ae66fa8f245044) | MAJORITY_AGREE | SUCCESS | 0 |
| happy_ground | [0xd82e8f0e4cd590c9ebfe496498ca1572c7da4b954216385245193ba7e2c6d461](https://explorer-studio.genlayer.com/transactions/0xd82e8f0e4cd590c9ebfe496498ca1572c7da4b954216385245193ba7e2c6d461) | MAJORITY_AGREE | SUCCESS | "GROUNDED" |
| happy_review | [0x747cae8d8502e8cefb9c6ed6ddd842ce7f22afaeff89f2b894f770e742567612](https://explorer-studio.genlayer.com/transactions/0x747cae8d8502e8cefb9c6ed6ddd842ce7f22afaeff89f2b894f770e742567612) | MAJORITY_AGREE | SUCCESS | "INCONCLUSIVE" |
| forbidden_register | [0xac7d5d868e75e3f2928438920d1922b7e0f7a0d6f03f565e8a241de8c0e02027](https://explorer-studio.genlayer.com/transactions/0xac7d5d868e75e3f2928438920d1922b7e0f7a0d6f03f565e8a241de8c0e02027) | MAJORITY_AGREE | SUCCESS | 1 |
| forbidden_propose | [0xff185aa5b90a6a7ace79441c71b98809f9139159ac1ab9fa221c20e0e5669acb](https://explorer-studio.genlayer.com/transactions/0xff185aa5b90a6a7ace79441c71b98809f9139159ac1ab9fa221c20e0e5669acb) | MAJORITY_AGREE | SUCCESS | 1 |
| forbidden_ground | [0xa3b38aa45de8cde7fa797f7892b97bb44102f9412aa2c376a682fa54738d9e08](https://explorer-studio.genlayer.com/transactions/0xa3b38aa45de8cde7fa797f7892b97bb44102f9412aa2c376a682fa54738d9e08) | MAJORITY_AGREE | SUCCESS | "GROUNDED" |
| forbidden_review | [0xa24d80831860ad1aa3750eb1a323cb64462e507ec3ee941d8a05b932deb09d4a](https://explorer-studio.genlayer.com/transactions/0xa24d80831860ad1aa3750eb1a323cb64462e507ec3ee941d8a05b932deb09d4a) | MAJORITY_AGREE | SUCCESS | "INCONCLUSIVE" |
| bad_digest_register | [0xf2a616eb5f2998e8f2d276ce6b3e944256e925f1c33d57b1018b20454089e119](https://explorer-studio.genlayer.com/transactions/0xf2a616eb5f2998e8f2d276ce6b3e944256e925f1c33d57b1018b20454089e119) | MAJORITY_AGREE | SUCCESS | 2 |
| bad_digest_propose | [0xfc7d1b1ca79c83e15eaa2ef7a09d6cb0e40e8b6bf054e10d2894cd452cb70ca5](https://explorer-studio.genlayer.com/transactions/0xfc7d1b1ca79c83e15eaa2ef7a09d6cb0e40e8b6bf054e10d2894cd452cb70ca5) | MAJORITY_AGREE | SUCCESS | 2 |
| bad_digest_ground | [0xe18e0e9f0a178e77c80f36c3b120821bc28a1a21299b85af93c5eebe62f003c4](https://explorer-studio.genlayer.com/transactions/0xe18e0e9f0a178e77c80f36c3b120821bc28a1a21299b85af93c5eebe62f003c4) | MAJORITY_AGREE | SUCCESS | "SOURCE_UNVERIFIED" |
| proxy_register | [0xca8f5ff399a102e06cdd0d5fff70e53013a92d0d42c2bc453e3768d530bf016e](https://explorer-studio.genlayer.com/transactions/0xca8f5ff399a102e06cdd0d5fff70e53013a92d0d42c2bc453e3768d530bf016e) | MAJORITY_AGREE | SUCCESS | 3 |
| proxy_propose | [0x6482bde60cf1101f63e406425c1422b0ca513f94f67983dcbe613b342e750446](https://explorer-studio.genlayer.com/transactions/0x6482bde60cf1101f63e406425c1422b0ca513f94f67983dcbe613b342e750446) | MAJORITY_AGREE | SUCCESS | 3 |
| proxy_ground | [0x9797b49b573a4e1e84edc29367dd143ee936c3ccf437fdd8399c0fe9dc9a5141](https://explorer-studio.genlayer.com/transactions/0x9797b49b573a4e1e84edc29367dd143ee936c3ccf437fdd8399c0fe9dc9a5141) | MAJORITY_AGREE | SUCCESS | "SOURCE_UNVERIFIED" |

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

Completed: false; error: Negative review: INCONCLUSIVE.

```json
{
  "analysis": {
    "delegatecall": false,
    "disclosure_complete": false,
    "external_call_expansion": false,
    "fund_movement": false,
    "mint_or_burn": false,
    "pause_or_freeze": false,
    "proposal_id": 1,
    "reason_code": "AMBIGUOUS_DELTA",
    "role_change": false,
    "storage_write_expansion": false,
    "unknown_effect": true,
    "upgrade_authority": false,
    "validation_error": "INVALID_SOURCE_REFERENCES",
    "verdict": "INCONCLUSIVE"
  },
  "base_implementation": "0x6810e776880c02933d47db1b9fc05908e5386b96",
  "base_revision": 0,
  "candidate_implementation": "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
  "disclosure_source": {
    "commit": "b27603129bafe7de97d3789c2d9cc7281eefd1c3",
    "digest": "6bc9f2f29f648006c810c5a8a77e938bc384092fe101713dfa765385d5f09f93",
    "marker": "## DISCLOSURE HIDDEN",
    "owner": "Azariavibecode",
    "path": "/fixtures/upgrade-evidence.md",
    "repo": "ImplGuard-Relay"
  },
  "permit_consumed": false,
  "proposal_id": 1,
  "protocol_id": 1,
  "reason_code": "AMBIGUOUS_DELTA",
  "sponsor": "0x67a1a08fc4cf7d05c859d0d3d8398a3a30b1677e",
  "state": "INCONCLUSIVE",
  "verdict": "INCONCLUSIVE"
}
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
  "proposal_count": 4,
  "protocol_count": 4
}
```

Raw evidence: [release-suite.json](./release-suite.json). Source parity: [deployed-source.json](./deployed-source.json).

This is a project self-verification record. It does not establish external Ethereum upgrade authority or Ethereum execution.
