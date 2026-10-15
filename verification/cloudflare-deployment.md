# Cloudflare Pages production deployment

- Production URL: [https://implguard-relay.pages.dev](https://implguard-relay.pages.dev)
- Project: `implguard-relay`
- Branch: `main`
- Build commit: `0412c1aaee8c31e32fa9d65835c021d5bb4e9e35`
- Cloudflare deployment ID: `6acc8b9a-5221-4053-a25c-dd4bdaafe582`
- Deployment URL: `https://6acc8b9a.implguard-relay.pages.dev`
- Cloudflare API deployment stage: `success`
- Active StudioNet contract: [`0xF0271b6665c436638274229A6768b1dA4c950a33`](https://explorer-studio.genlayer.com/address/0xF0271b6665c436638274229A6768b1dA4c950a33)
- Verification date: 2026-10-15

The production endpoint returns HTTP 200. All five deployed files (HTML, CSS, two JavaScript chunks, and the supplied logo) were fetched over HTTPS and their SHA-256 hashes exactly match the local Vite production build. The JavaScript bundle contains the corrected v2 contract address. See [machine-readable deployment evidence](cloudflare-deployment.json).

Cloudflare reports the immutable deployment as successful. Its preview hostname encountered a TLS handshake failure from this verification host; verification of the production hostname and every production asset succeeded independently. Use the production URL above for submission.

The Cloudflare API token was supplied only to the deployment process and is not stored in this repository or the deployed static assets.

Contract lifecycle evidence is documented in [STUDIONET_V2_E2E.md](STUDIONET_V2_E2E.md), including 25 finalized SDK-signed transactions, complete source bundle verification, validator conflict, rejection snapshots, and UI/SDK state reconciliation.
