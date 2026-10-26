import {readFileSync,writeFileSync} from 'node:fs';
const address=process.argv[2];
if(!/^0x[0-9a-fA-F]{40}$/.test(address||''))throw Error('Supply deployment address');
const folder=`verification/live/${address.toLowerCase()}`;
const report=JSON.parse(readFileSync(`${folder}/release-suite.json`,'utf8'));
const txs=report.transactions;
const lines=['# Replacement StudioNet lifecycle evidence','',`Contract: [${address}](https://explorer-studio.genlayer.com/address/${address})`,'',`Recorded ${txs.length} SDK-signed auxiliary-wallet transactions; ${txs.filter(t=>t.status==='FINALIZED').length} finalized. All-case success: **${report.all_cases_passed===true?'PASS':'NOT COMPLETE'}**.`,'','These are SDK signatures. The separate production browser-wallet journey is still required.','','| Scenario | Hash | Consensus | Execution | Return |','|---|---|---|---|---|',...txs.map(t=>`| ${t.label} | [${t.hash}](${t.explorer_url}) | ${t.consensus||'pending'} | ${t.execution||'pending'} | ${JSON.stringify(t.return_value)} |`),'','## Authoritative readbacks',''];
for(const [name,c] of Object.entries(report.cases)){
 lines.push(`### ${name}`,'',`Completed: ${c.completed===true}; error: ${c.error||'none'}.`,'','```json',JSON.stringify(c.review||c.final||c.ground||{},null,2),'```','');
 for(const [label,assertion] of Object.entries(c))if(assertion&&typeof assertion==='object'&&'passed'in assertion)lines.push(`- ${label}: ${assertion.passed?'PASS':'FAIL'}; expected ${assertion.expected}; return ${assertion.returned}; full before/after snapshots are in the raw report.`);
}
lines.push('','## Final counters','','```json',JSON.stringify(report.final_counts||{},null,2),'```','','Raw evidence: [release-suite.json](./release-suite.json). Source parity: [deployed-source.json](./deployed-source.json).','','This is a project self-verification record. It does not establish external Ethereum upgrade authority or Ethereum execution.','');
writeFileSync(`${folder}/STUDIONET_E2E.md`,lines.join('\n'));console.log(`Rendered ${txs.length} transaction rows`);
