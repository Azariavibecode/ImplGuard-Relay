# V3 StudioNet lifecycle — incomplete release

Contract: [0xcca30bE2F67210BDefDD2B8D51105BAc4bc60Ae4](https://explorer-studio.genlayer.com/address/0xcca30bE2F67210BDefDD2B8D51105BAc4bc60Ae4)

14/14 transactions finalized with majority agreement and successful leader execution. Auxiliary wallets: 0x67A1A08Fc4cf7D05c859d0d3D8398a3A30B1677e, 0x7C87B10a3d43F3b3551414401F8b26B9F662bAB5.

Both direct-source grounding calls succeeded. The candidate positive and forbidden-change reviews returned INCONCLUSIVE, so no permit or activation was created. Wrong-digest and proxy candidates returned SOURCE_UNVERIFIED with exact before/after equality. This run does not satisfy the positive lifecycle release gate.

| Scenario | Transaction | Status | Return |
|---|---|---|---|
| happy_register | [0x28d918aa693fea05c584546bfc9ef2e5c8eec9e063e650369214deb844a78d5a](https://explorer-studio.genlayer.com/transactions/0x28d918aa693fea05c584546bfc9ef2e5c8eec9e063e650369214deb844a78d5a) | FINALIZED | 0 |
| happy_propose | [0xc6a97caf00c6308d017d066b4ca5af98c0cbad2cf5900bf6a9c8e8b1af14fa7f](https://explorer-studio.genlayer.com/transactions/0xc6a97caf00c6308d017d066b4ca5af98c0cbad2cf5900bf6a9c8e8b1af14fa7f) | FINALIZED | 0 |
| happy_ground | [0x7b6f96d05c11e156111c230824b5a7c9a2faf7d68638ce6ac38b02327136e717](https://explorer-studio.genlayer.com/transactions/0x7b6f96d05c11e156111c230824b5a7c9a2faf7d68638ce6ac38b02327136e717) | FINALIZED | "GROUNDED" |
| happy_review | [0x020956cab3ccffbdc30ac82e28afd18e097b8ee88d65a06c5251b235eca1a38d](https://explorer-studio.genlayer.com/transactions/0x020956cab3ccffbdc30ac82e28afd18e097b8ee88d65a06c5251b235eca1a38d) | FINALIZED | "INCONCLUSIVE" |
| forbidden_register | [0xa1d9d2a456d542c77e61a0dbc01d6cc25d85eaa38a0a56712e589cb8233464bc](https://explorer-studio.genlayer.com/transactions/0xa1d9d2a456d542c77e61a0dbc01d6cc25d85eaa38a0a56712e589cb8233464bc) | FINALIZED | 1 |
| forbidden_propose | [0x8d159d42b1e3b8c44e19303673ac07797000832a60d64cf6e34bafcb9ee2d22c](https://explorer-studio.genlayer.com/transactions/0x8d159d42b1e3b8c44e19303673ac07797000832a60d64cf6e34bafcb9ee2d22c) | FINALIZED | 1 |
| forbidden_ground | [0xee19831c4462d602a518ca876f685b30d745326f44fa0318ef0945bdee2125f1](https://explorer-studio.genlayer.com/transactions/0xee19831c4462d602a518ca876f685b30d745326f44fa0318ef0945bdee2125f1) | FINALIZED | "GROUNDED" |
| forbidden_review | [0x9b324f860998570e424365c2831d808e54166956236a03aa5dffaf75ab31d59e](https://explorer-studio.genlayer.com/transactions/0x9b324f860998570e424365c2831d808e54166956236a03aa5dffaf75ab31d59e) | FINALIZED | "INCONCLUSIVE" |
| bad_digest_register | [0x01d8711d5cffdcf9503419f163f9508068d6c3d3f05d614efa14b63c22baebfe](https://explorer-studio.genlayer.com/transactions/0x01d8711d5cffdcf9503419f163f9508068d6c3d3f05d614efa14b63c22baebfe) | FINALIZED | 2 |
| bad_digest_propose | [0xcd6c0a66769ef2023120a53b5148589b0e5ea349232f6d90c93cab22baac95a3](https://explorer-studio.genlayer.com/transactions/0xcd6c0a66769ef2023120a53b5148589b0e5ea349232f6d90c93cab22baac95a3) | FINALIZED | 2 |
| bad_digest_ground | [0x3bdbcc4672761f7b32646abb6f1471294d26b18e7dfbbe0cd24c8c6346239e6b](https://explorer-studio.genlayer.com/transactions/0x3bdbcc4672761f7b32646abb6f1471294d26b18e7dfbbe0cd24c8c6346239e6b) | FINALIZED | "SOURCE_UNVERIFIED" |
| proxy_register | [0x0a8db9f4b50aab18ffdf8c5664c1cbbfd1ef8a4560751416012068d832b2fcc3](https://explorer-studio.genlayer.com/transactions/0x0a8db9f4b50aab18ffdf8c5664c1cbbfd1ef8a4560751416012068d832b2fcc3) | FINALIZED | 3 |
| proxy_propose | [0x344ea5c0f0bb88886d19552b040f1d0136d76bf4217ffc2b12c02e29071579c4](https://explorer-studio.genlayer.com/transactions/0x344ea5c0f0bb88886d19552b040f1d0136d76bf4217ffc2b12c02e29071579c4) | FINALIZED | 3 |
| proxy_ground | [0xa64fa1bd6e2102587def6f064648378341b9f0a2e97094704eba6869a90af008](https://explorer-studio.genlayer.com/transactions/0xa64fa1bd6e2102587def6f064648378341b9f0a2e97094704eba6869a90af008) | FINALIZED | "SOURCE_UNVERIFIED" |

## Recorded state

```json
{
  "activated_count": 0,
  "blocked_count": 0,
  "proposal_count": 4,
  "protocol_count": 4
}
```

## Diagnosis and replacement

Code inspection found contradictory model instructions: evidence was specified as an array, while a following sentence incorrectly required all fields other than ID/verdict/reason to be booleans. Both observed reviews used the generic fallback, which did not preserve its specific validation failure; consequently the raw model cause cannot be proven from this deployment. The working source corrects the contradiction and adds bounded validation diagnostics. Regression tests cover the explicit reference-array instruction and invalid-reference diagnostic. A replacement deployment and fresh lifecycle remain required.

The Cloudflare V3 build is published at https://implguard-relay.pages.dev. All five production assets matched the local build; [asset record](live/v3/cloudflare.json). It is an observable V3 deployment, not a completed remediation release.

Raw transaction and state evidence: [release-suite.json](live/v3/release-suite.json). Source parity before the follow-up source correction: [deployed-source.json](live/v3/deployed-source.json).

These transactions were SDK-signed. Browser-wallet lifecycle, successful registry activation, live policy-blocked verdict, stale-base and replay tests on the replacement deployment are still pending.
