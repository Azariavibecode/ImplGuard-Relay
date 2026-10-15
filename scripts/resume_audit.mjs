import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
import {privateKeyToAccount} from "viem/accounts";
import {mkdirSync,writeFileSync,readFileSync,existsSync} from "node:fs";

const address="0x11aA1f375b2765Bf7757Ca3eB554c6dEF0F127f7";
const accounts=[process.env.TEST_WALLET_A_PRIVATE_KEY,process.env.TEST_WALLET_B_PRIVATE_KEY].map(k=>{if(!k)throw Error("Missing auxiliary wallet key");return privateKeyToAccount(k.startsWith("0x")?k:`0x${k}`)});
const client=createClient({chain:studionet});
const path="verification/live/audit-resumed.json";
const report=existsSync(path)?JSON.parse(readFileSync(path,"utf8")):{address,started_at:new Date().toISOString(),scope:"Current deployed v1; source-bundle audit fix requires a new deployment",cases:[],transactions:[]};
mkdirSync("verification/live",{recursive:true});
const save=()=>writeFileSync(path,JSON.stringify(report,null,2)+"\n");
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function retry(fn){for(let n=0;;n++){try{return await fn()}catch(e){if(n>=5)throw e;console.log("RPC retry",n+1);await delay(15000)}}}
const read=async(name,args=[])=>JSON.parse(await retry(()=>client.readContract({address,functionName:name,args})));
async function snapshot(){return{protocol:await read("get_protocol",[3n]),active:await read("get_proposal",[3n]),stale:await read("get_proposal",[4n]),blocked:await read("get_proposal",[2n]),counts:await read("get_counts")}}
async function submit(actor,method,args,label){
 let item=report.transactions.find(t=>t.label===label);
 if(!item){const hash=await createClient({chain:studionet,account:accounts[actor]}).writeContract({address,functionName:method,args});item={label,hash,actor:accounts[actor].address,explorer_url:`https://explorer-studio.genlayer.com/transactions/${hash}`};report.transactions.push(item);save();console.log(label,hash)}
 await retry(()=>client.waitForTransactionReceipt({hash:item.hash,status:"FINALIZED",interval:15000,retries:120}));
 const tx=await retry(()=>client.getTransaction({hash:item.hash}));
 const leader=tx.consensus_data?.leader_receipt?.find(r=>r.mode==="leader");
 Object.assign(item,{status:"FINALIZED",consensus:tx.result_name,execution:leader?.execution_result,returned:leader?.result?.payload?.readable,rounds:(tx.consensus_history?.consensus_results||[]).map(r=>({round:r.consensus_round,validators:r.validator_results?.map(v=>({vote:v.vote,execution:v.execution_result}))}))});save();
 return item;
}
async function unchanged(actor,method,args,label,expected){
 if(report.cases.some(c=>c.label===label&&c.passed))return;
 const before=await snapshot();
 const tx=await submit(actor,method,args,label);
 const after=await snapshot();
 const passed=JSON.stringify(before)===JSON.stringify(after)&&tx.consensus==="MAJORITY_AGREE"&&tx.execution==="SUCCESS"&&JSON.parse(tx.returned)===expected;
 report.cases.push({label,expected,before,after,passed,hash:tx.hash});save();if(!passed)throw Error(`Failed ${label}`);console.log(label,"PASS");await delay(4000);
}
await unchanged(0,"consume_activation",[4n],"stale_base_rejected","STALE_BASE");
await unchanged(1,"consume_activation",[4n],"wrong_actor_consume_rejected","SPONSOR_ONLY");
await unchanged(1,"propose_upgrade",[3n,"0xdAC17F958D2ee523a2206206994597C13D831ec7",JSON.stringify({owner:"Azariavibecode",repo:"ImplGuard-Relay",commit:"9283e9f5797abb8ac72cade7b17496f89b412bfd",path:"/fixtures/upgrade-evidence.md",digest:"96f84a7d4702aa46388664071d846330758b5944d70bf59db3aa57232caf1bdf",marker:"## DISCLOSURE HIDDEN"})],"wrong_actor_propose_rejected","SPONSOR_ONLY");
await unchanged(1,"review_upgrade",[3n],"terminal_review_rejected","PROPOSAL_NOT_GROUNDED");
await unchanged(0,"consume_activation",[3n],"terminal_consume_rejected","PERMIT_NOT_READY");
await unchanged(0,"consume_activation",[2n],"blocked_consume_rejected","PERMIT_NOT_READY");

const source={owner:"Azariavibecode",repo:"ImplGuard-Relay",commit:"9283e9f5797abb8ac72cade7b17496f89b412bfd",path:"/fixtures/upgrade-evidence.md",digest:"96f84a7d4702aa46388664071d846330758b5944d70bf59db3aa57232caf1bdf"};
if(report.ambiguous_protocol_id===undefined){report.ambiguous_protocol_id=(await read("get_counts")).protocol_count;save()}
await submit(0,"register_protocol",["ambiguity-audit","0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",JSON.stringify({...source,marker:"## POLICY"})],"ambiguous_register");
if(report.ambiguous_proposal_id===undefined){report.ambiguous_proposal_id=(await read("get_counts")).proposal_count;save()}
const id=BigInt(report.ambiguous_proposal_id);
await submit(0,"propose_upgrade",[BigInt(report.ambiguous_protocol_id),"0xdAC17F958D2ee523a2206206994597C13D831ec7",JSON.stringify({...source,marker:"## DISCLOSURE AMBIGUOUS"})],"ambiguous_propose");
await submit(1,"ground_sources",[id],"ambiguous_ground");
for(let attempt=1;attempt<=3;attempt++){
 const p=await read("get_proposal",[id]);if(p.state!=="GROUNDED")break;
 await submit(1,"review_upgrade",[id],`ambiguous_review_${attempt}`);
}
report.ambiguous=await read("get_proposal",[id]);
report.ambiguous_fail_closed=["BLOCKED","INCONCLUSIVE"].includes(report.ambiguous.state)||(report.ambiguous.state==="GROUNDED"&&report.ambiguous.verdict==="PENDING");
report.completed_at=new Date().toISOString();save();
if(!report.ambiguous_fail_closed)throw Error("Ambiguous source produced a permit");
console.log("Audit completed",report.ambiguous.state);
