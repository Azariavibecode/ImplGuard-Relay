# Browser-wallet evidence for the replacement release

Status: pending a replacement contract deployment and publication of the matching frontend. SDK signatures do not satisfy this browser requirement.

Use the live Cloudflare origin https://implguard-relay.pages.dev, StudioNet (61999), and an auxiliary wallet. The main wallet deploys only. Independent reviewers can register their own namespace without deployer permission.

1. Confirm the replacement contract address in the deployment panel. Connect a funded auxiliary wallet.
2. Register a protocol with current direct implementation BAT, `0x0D8775F648430679A709E98d2b0Cb6250d2887EF`, and the release's commit-pinned machine policy descriptor. Record the returned protocol ID.
3. Propose direct candidate GNO, `0x6810e776880C02933D47DB1b9fc05908e5386b96`, with the release's complete disclosure descriptor. Record the returned proposal ID. These are source comparison fixtures, not a claim that either issuer approved a migration or that storage layouts are compatible.
4. Ground sources. Confirm GROUNDED, both exact address inventories and authenticated policy rules. Any unavailable source must stop the journey.
5. Review the delta. Inspect current/candidate source references and policy clauses. Continue only on a consensus-supported PERMIT_READY; do not change the expected result after a failed review.
6. Consume the permit using the same sponsor wallet. Confirm ACTIVATED, activation_scope GENLAYER_REGISTRY_ONLY, exact candidate in the registry and revision +1.
7. To record a rejected call through the normal UI, create a separate proposal using the USDC proxy `0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` as candidate and attempt grounding. Expect SOURCE_UNVERIFIED with unchanged proposal and protocol state. A blocked grounding attempt appears with its hash and canonical after-state in the export.
8. Export browser transaction evidence. Preserve every submitted hash, finalized result, origin, actor, exact IDs and before/after readbacks. The JSON is a browser observation, not an independently verified network audit.
9. Reload the page, choose the exact recorded IDs, refresh state and inspect Explorer. A reload must not resubmit any write. Retain a screenshot showing the production URL and resulting state.

The BAT-to-GNO direction is a candidate positive control based on observed direct verified sources; its replacement-deployment consensus result is still untested. The reverse direction introduces sale/mint/refund/fund movement logic and is the planned negative control under DENY rules. A live failure must remain reported as a failure.
