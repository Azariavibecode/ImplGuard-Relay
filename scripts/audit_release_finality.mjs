import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {readFileSync,writeFileSync} from 'node:fs';
const address=process.argv[2];
if(!/^0x[0-9a-fA-F]{40}$/.test(address||''))throw Error('Supply deployment address');
const folder=`verification/live/${address.toLowerCase()}`;
const run=JSON.parse(readFileSync(`${folder}/release-suite.json`,'utf8'));
const client=createClient({chain:studionet});
const checks=[];
for(const entry of run.transactions){
 const tx=await client.getTransaction({hash:entry.hash});
 const leader=tx.consensus_data?.leader_receipt?.find(x=>x.mode==='leader');
 const value=JSON.parse(leader?.result?.payload?.readable||'null');
 const status=tx.status_name||tx.status;
 const actor=String(tx.from_address||tx.from||'').toLowerCase(),target=String(tx.to_address||tx.to||'').toLowerCase();
 const passed=['FINALIZED',7].includes(status)&&tx.result_name==='MAJORITY_AGREE'&&leader?.execution_result==='SUCCESS'&&leader?.result?.status==='return'&&actor===entry.actor.toLowerCase()&&target===address.toLowerCase()&&JSON.stringify(value)===JSON.stringify(entry.return_value);
 checks.push({hash:entry.hash,label:entry.label,status,consensus:tx.result_name,execution:leader?.execution_result,actor,target,return_value:value,passed});
 if(!passed)throw Error(`Independent audit failed: ${entry.label}`);
}
const counts=JSON.parse(await client.readContract({address,functionName:'get_counts',args:[]}));
const report={audited_at:new Date().toISOString(),address,passed:checks.every(x=>x.passed),checks,current_counts:counts,scope:'Independent re-read of finality, execution, identity and return. Does not turn SDK signatures into browser signatures.'};
writeFileSync(`${folder}/finality-audit.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({checks:checks.length,passed:report.passed,counts}));
