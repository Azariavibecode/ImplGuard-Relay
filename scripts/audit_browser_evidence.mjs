import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";

const file=process.argv[2],address=process.argv[3];
if(!file||!/^0x[0-9a-fA-F]{40}$/.test(address||""))throw Error("Usage: node scripts/audit_browser_evidence.mjs <browser-export.json> <replacement-address>");
const data=JSON.parse(readFileSync(file,"utf8"));
if(data.origin!=="https://implguard-relay.pages.dev"||!Array.isArray(data.entries))throw Error("Invalid production-origin export");
const client=createClient({chain:studionet});
const entries=[...new Map(data.entries.filter(x=>x.hash&&x.status==="FINALIZED").map(x=>[x.hash,x])).values()];
if(entries.length===0)throw Error("No finalized browser observations supplied");
const report={audited_at:new Date().toISOString(),address,origin:data.origin,checks:[],scope:"RPC verifies transaction facts and current state. Browser origin and signing context are client observations; retain screenshots and manual witness alongside this report."};
for(const entry of entries){
 if(entry.origin!==data.origin||entry.contract.toLowerCase()!==address.toLowerCase())throw Error("Origin/deployment mismatch");
 const tx=await client.getTransaction({hash:entry.hash});
 const leader=tx.consensus_data?.leader_receipt?.find(x=>x.mode==="leader");
 const returned=JSON.parse(leader?.result?.payload?.readable||"null");
 const sender=String(tx.from_address||tx.from||"").toLowerCase();
 const target=String(tx.to_address||tx.to||"").toLowerCase();
 const status=tx.status_name||tx.status;
 if(!["FINALIZED",7].includes(status)||tx.result_name!=="MAJORITY_AGREE"||leader?.execution_result!=="SUCCESS"||leader?.result?.status!=="return")throw Error(`Unverified finality/execution: ${entry.hash}`);
 if(sender!==entry.actor.toLowerCase()||target!==address.toLowerCase()||JSON.stringify(returned)!==JSON.stringify(entry.return_value))throw Error(`Identity/return mismatch: ${entry.hash}`);
 report.checks.push({hash:entry.hash,method_observed:entry.method,status,consensus:tx.result_name,execution:leader.execution_result,actor:sender,return_value:returned,ids:entry.ids||null,observed_before:entry.before,observed_after:entry.after,validator_receipts:tx.consensus_data?.validators||tx.consensus_data?.votes||null});
}
report.current_counts=JSON.parse(await client.readContract({address,functionName:"get_counts",args:[]}));
const folder=`verification/live/${address.toLowerCase()}`;
mkdirSync(folder,{recursive:true});
writeFileSync(`${folder}/browser-rpc-audit.json`,JSON.stringify(report,null,2)+"\n");
console.log(`Audited ${report.checks.length} finalized browser-observed transactions`);
