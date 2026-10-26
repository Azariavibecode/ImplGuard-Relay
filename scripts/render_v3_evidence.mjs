import {readFileSync,writeFileSync} from 'node:fs';
const r=JSON.parse(readFileSync('verification/live/v3/release-suite.json','utf8'));
const text=[
 '# V3 StudioNet lifecycle — incomplete release',
 '',
 `Contract: [${r.address}](https://explorer-studio.genlayer.com/address/${r.address})`,
 '',
 `${r.transactions.filter(x=>x.status==='FINALIZED').length}/${r.transactions.length} transactions finalized with majority agreement and successful leader execution. Auxiliary wallets: ${r.wallets.join(', ')}.`,
 '',
 'Both direct-source grounding calls succeeded. The candidate positive and forbidden-change reviews returned INCONCLUSIVE, so no permit or activation was created. Wrong-digest and proxy candidates returned SOURCE_UNVERIFIED with exact before/after equality. This run does not satisfy the positive lifecycle release gate.',
 '',
 '| Scenario | Transaction | Status | Return |',
 '|---|---|---|---|',
 ...r.transactions.map(t=>`| ${t.label} | [${t.hash}](${t.explorer_url}) | ${t.status} | ${JSON.stringify(t.return_value)} |`),
 '',
 '## Recorded state',
 '',
 '```json',JSON.stringify(r.final_counts,null,2),'```',
 '',
 '## Diagnosis and replacement',
 '',
 'Code inspection found contradictory model instructions: evidence was specified as an array, while a following sentence incorrectly required all fields other than ID/verdict/reason to be booleans. Both observed reviews used the generic fallback, which did not preserve its specific validation failure; consequently the raw model cause cannot be proven from this deployment. The working source corrects the contradiction and adds bounded validation diagnostics. Regression tests cover the explicit reference-array instruction and invalid-reference diagnostic. A replacement deployment and fresh lifecycle remain required.',
 '',
 'The Cloudflare V3 build is published at https://implguard-relay.pages.dev. All five production assets matched the local build; [asset record](live/v3/cloudflare.json). It is an observable V3 deployment, not a completed remediation release.',
 '',
 'Raw transaction and state evidence: [release-suite.json](live/v3/release-suite.json). Source parity before the follow-up source correction: [deployed-source.json](live/v3/deployed-source.json).',
 '',
 'These transactions were SDK-signed. Browser-wallet lifecycle, successful registry activation, live policy-blocked verdict, stale-base and replay tests on the replacement deployment are still pending.',
 ''
].join('\n');
writeFileSync('verification/STUDIONET_V3_E2E.md',text);
console.log(`Rendered ${r.transactions.length} transactions with incomplete-release status`);
