import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
import {privateKeyToAccount} from "viem/accounts";
import {mkdirSync,readFileSync,writeFileSync,existsSync} from "node:fs";

const address="0xF0271b6665c436638274229A6768b1dA4c950a33";
const accounts=[process.env.TEST_WALLET_A_PRIVATE_KEY,process.env.TEST_WALLET_B_PRIVATE_KEY].map(key=>{if(!key)throw Error("Missing auxiliary key");return privateKeyToAccount(key.startsWith("0x")?key:`0x${key}`)});
if(accounts[0].address===accounts[1].address)throw Error("Distinct auxiliary wallets required");
const client=createClient({chain:studionet});
const folder="verification/live/v2";
const path=`${folder}/release-suite.json`;
mkdirSync(folder,{recursive:true});
const fixture={owner:"Azariavibecode",repo:"ImplGuard-Relay",commit:"9283e9f5797abb8ac72cade7b17496f89b412bfd",path:"/fixtures/upgrade-evidence.md",digest:"96f84a7d4702aa46388664071d846330758b5944d70bf59db3aa57232caf1bdf"};
const current="0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",candidate="0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c",token="0xdAC17F958D2ee523a2206206994597C13D831ec7";
const source=(marker,bad=false)=>JSON.stringify({...fixture,marker,...(bad?{digest:"0".repeat(64)}:{})});
const report=existsSync(path)?JSON.parse(readFileSync(path,"utf8")):{address,network:"StudioNet",chain_id:61999,started_at:new Date().toISOString(),fixture,wallets:accounts.map(a=>a.address),expected_before_execution:{happy:"SAFE or RISK_DISCLOSED; activation then replay unchanged",hidden:"BLOCKED; no activation",ambiguous:"BLOCKED/INCONCLUSIVE or conflict-safe GROUNDED; no permit",source_failure:"SOURCE_UNVERIFIED, no ground",authorization:"SPONSOR_ONLY; complete snapshot equality",stale:"STALE_BASE; complete snapshot equality"},transactions:[],cases:{}};
const save=()=>writeFileSync(path,JSON.stringify(report,null,2)+"\n");save();
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function retry(fn){for(let n=0;;n++){try{return await fn()}catch(e){if(n>=6)throw e;console.log("RPC retry",n+1);await delay(15000)}}}
async function read(name,args=[]){await delay(2200);return JSON.parse(await retry(()=>client.readContract({address,functionName:name,args})))}
async function tx(actor,method,args,label){
 let item=report.transactions.find(t=>t.label===label);
 if(!item){const hash=await retry(()=>createClient({chain:studionet,account:accounts[actor]}).writeContract({address,functionName:method,args}));item={label,hash,actor:accounts[actor].address,method,explorer_url:`https://explorer-studio.genlayer.com/transactions/${hash}`};report.transactions.push(item);save();console.log(label,hash)}
 if(item.finalized)return item.return_value;
 await retry(()=>client.waitForTransactionReceipt({hash:item.hash,status:"FINALIZED",interval:15000,retries:100}));
 const transaction=await retry(()=>client.getTransaction({hash:item.hash}));
 const leader=transaction.consensus_data?.leader_receipt?.find(r=>r.mode==="leader");
 const readable=leader?.result?.payload?.readable;
 let returned;try{returned=JSON.parse(readable)}catch{returned=readable}
 Object.assign(item,{finalized:true,status:"FINALIZED",consensus:transaction.result_name,execution:leader?.execution_result,return_value:returned,rounds:(transaction.consensus_history?.consensus_results||[]).map(r=>({round:r.consensus_round,status_changes:r.status_changes,validators:r.validator_results?.map(v=>({vote:v.vote,execution:v.execution_result}))}))});save();
 console.log(label,item.consensus,item.execution,returned);
 return returned;
}
function expect(value,expected,label){if(value!==expected)throw Error(`${label}: expected ${expected}, got ${value}`)}
async function create(label,marker,target=candidate,bad=false){
 let entry=report.cases[label]||{};report.cases[label]=entry;save();
 if(entry.protocol_id===undefined){const id=await tx(0,"register_protocol",[label,current,source("## POLICY")],`${label}_register`);if(!Number.isSafeInteger(id))throw Error(`Invalid protocol return ${id}`);entry.protocol_id=id;save()}
 if(entry.proposal_id===undefined){const id=await tx(0,"propose_upgrade",[BigInt(entry.protocol_id),target,source(marker,bad)],`${label}_propose`);if(!Number.isSafeInteger(id))throw Error(`Invalid proposal return ${id}`);entry.proposal_id=id;save()}
 return entry;
}
async function snap(entry,extra=[]){return{protocol:await read("get_protocol",[BigInt(entry.protocol_id)]),proposals:await Promise.all([entry.proposal_id,...extra].map(id=>read("get_proposal",[BigInt(id)]))),counts:await read("get_counts")}}
async function unchanged(entry,actor,method,args,label,expected,extra=[]){
 if(entry[label]?.passed)return;
 const before=await snap(entry,extra);const returned=await tx(actor,method,args,label);const after=await snap(entry,extra);
 const passed=JSON.stringify(before)===JSON.stringify(after)&&returned===expected;
 entry[label]={before,after,expected,returned,passed};save();if(!passed)throw Error(`${label}: state mutation or unexpected return`);
}
async function ground(entry,label,expected="GROUNDED"){
 expect(await tx(1,"ground_sources",[BigInt(entry.proposal_id)],`${label}_ground`),expected,label);
 entry.ground=await read("get_ground",[BigInt(entry.proposal_id)]);save();
 if(expected==="GROUNDED"&&(!entry.ground.current.source_files||!entry.ground.candidate.source_files))throw Error("Deployment missing source-bundle inventory");
}
async function review(entry,label){
 for(let n=1;n<=3;n++){
  const p=await read("get_proposal",[BigInt(entry.proposal_id)]);if(p.state!=="GROUNDED"){entry.review=p;save();return p}
  await tx(1,"review_upgrade",[BigInt(entry.proposal_id)],`${label}_review_${n}`);
 }
 entry.review=await read("get_proposal",[BigInt(entry.proposal_id)]);save();return entry.review;
}

const happy=await create("v2-happy","## DISCLOSURE SAFE");
await ground(happy,"happy");
if(happy.ground.candidate.source_files.length!==5)throw Error("Candidate must include primary plus four verified dependencies");
const hp=await review(happy,"happy");
if(!["PERMIT_READY","ACTIVATED"].includes(hp.state))throw Error(`Happy path nonpositive: ${hp.state}/${hp.verdict}`);
if(happy.sibling_id===undefined){const id=await tx(0,"propose_upgrade",[BigInt(happy.protocol_id),candidate,source("## DISCLOSURE SAFE")],"sibling_propose");if(!Number.isSafeInteger(id))throw Error("Sibling create failed");happy.sibling_id=id;save()}
const sibling={protocol_id:happy.protocol_id,proposal_id:happy.sibling_id};report.cases.sibling=sibling;
await ground(sibling,"sibling");
const sp=await review(sibling,"sibling");if(sp.state!=="PERMIT_READY")throw Error(`Sibling nonpositive ${sp.state}`);
await unchanged(happy,1,"propose_upgrade",[BigInt(happy.protocol_id),token,source("## DISCLOSURE HIDDEN")],"wrong_actor_propose","SPONSOR_ONLY",[happy.sibling_id]);
await unchanged(happy,1,"consume_activation",[BigInt(happy.proposal_id)],"wrong_actor_consume","SPONSOR_ONLY",[happy.sibling_id]);
expect(await tx(0,"consume_activation",[BigInt(happy.proposal_id)],"happy_activate"),"ACTIVATED","happy_activate");
happy.activated=await snap(happy,[happy.sibling_id]);save();
await unchanged(happy,0,"consume_activation",[BigInt(happy.sibling_id)],"stale_base","STALE_BASE",[happy.sibling_id]);
await unchanged(happy,0,"consume_activation",[BigInt(happy.proposal_id)],"consume_replay","PERMIT_NOT_READY",[happy.sibling_id]);
await unchanged(happy,1,"review_upgrade",[BigInt(happy.proposal_id)],"review_replay","PROPOSAL_NOT_GROUNDED",[happy.sibling_id]);

const hidden=await create("v2-hidden","## DISCLOSURE HIDDEN",token);await ground(hidden,"hidden");
const bp=await review(hidden,"hidden");expect(bp.state,"BLOCKED","hidden verdict");
await unchanged(hidden,0,"consume_activation",[BigInt(hidden.proposal_id)],"blocked_consume","PERMIT_NOT_READY");

const bad=await create("v2-bad-source","## DISCLOSURE SAFE",candidate,true);
bad.before_ground=await snap(bad);save();await ground(bad,"bad_source","SOURCE_UNVERIFIED");bad.after_ground=await snap(bad);
if(JSON.stringify(bad.before_ground)!==JSON.stringify(bad.after_ground)||bad.ground.error!=="GROUND_NOT_FOUND")throw Error("Bad source mutated state");save();

const ambiguous=await create("v2-ambiguous","## DISCLOSURE AMBIGUOUS",token);await ground(ambiguous,"ambiguous");
const ap=await review(ambiguous,"ambiguous");if(!["BLOCKED","INCONCLUSIVE","GROUNDED"].includes(ap.state))throw Error(`Ambiguity gave permit: ${ap.state}`);
report.conflict_observed=report.transactions.some(t=>t.rounds?.some(r=>r.round==="Leader Rotation"||r.validators?.some(v=>v.vote==="disagree")));
report.final_counts=await read("get_counts");report.completed_at=new Date().toISOString();save();console.log("RELEASE SUITE COMPLETE",JSON.stringify(report.final_counts));
