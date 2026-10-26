import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {privateKeyToAccount} from 'viem/accounts';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';

const address=process.env.CONTRACT_ADDRESS||'0xcca30bE2F67210BDefDD2B8D51105BAc4bc60Ae4';
if(!/^0x[0-9a-fA-F]{40}$/.test(address))throw Error('Invalid contract address');
const keys=[process.env.TEST_WALLET_A_PRIVATE_KEY,process.env.TEST_WALLET_B_PRIVATE_KEY];
if(keys.some(x=>!x))throw Error('Missing auxiliary credentials');
const accounts=keys.map(k=>privateKeyToAccount(k.startsWith('0x')?k:`0x${k}`));
const expected=['0x67a1a08fc4cf7d05c859d0d3d8398a3a30b1677e','0x7c87b10a3d43f3b3551414401f8b26b9f662bab5'];
if(accounts.some((a,i)=>a.address.toLowerCase()!==expected[i]))throw Error('Auxiliary wallet identity mismatch; no transaction sent');
const client=createClient({chain:studionet});
const descriptors=JSON.parse(readFileSync('fixtures/v3-descriptors.json','utf8'));
const positive=descriptors.planned_positive;
const directory=address.toLowerCase()==='0xcca30be2f67210bdefdd2b8d51105bac4bc60ae4'?'verification/live/v3':`verification/live/${address.toLowerCase()}`,file=`${directory}/release-suite.json`;
mkdirSync(directory,{recursive:true});
const report=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{address,chain_id:61999,started_at:new Date().toISOString(),wallets:accounts.map(a=>a.address),transactions:[],cases:{},scope:'SDK-signed auxiliary-wallet lifecycle; browser signatures are separate'};
const save=()=>writeFileSync(file,JSON.stringify(report,null,2)+'\n');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function read(method,args=[]){return JSON.parse(await client.readContract({address,functionName:method,args}));}
async function tx(actor,method,args,label){
 let item=report.transactions.find(x=>x.label===label);
 if(!item){const hash=await createClient({chain:studionet,account:accounts[actor]}).writeContract({address,functionName:method,args});item={label,hash,actor:accounts[actor].address,method,args:args.map(x=>typeof x==='bigint'?x.toString():x),explorer_url:`https://explorer-studio.genlayer.com/transactions/${hash}`};report.transactions.push(item);save();console.log(label,hash);}
 if(item.status==='FINALIZED')return item.return_value;
 await client.waitForTransactionReceipt({hash:item.hash,status:'FINALIZED',interval:5000,retries:180});
 const transaction=await client.getTransaction({hash:item.hash});
 const leader=transaction.consensus_data?.leader_receipt?.find(x=>x.mode==='leader');
 if(transaction.result_name!=='MAJORITY_AGREE'||leader?.execution_result!=='SUCCESS'||leader?.result?.status!=='return')throw Error(`${label}: failed consensus/execution`);
 const returned=JSON.parse(leader.result.payload.readable);
 Object.assign(item,{status:'FINALIZED',consensus:transaction.result_name,execution:leader.execution_result,return_value:returned,validator_outcomes:transaction.consensus_data,consensus_history:transaction.consensus_history});save();console.log(label,'FINALIZED',returned);return returned;
}
async function snapshot(entry){return {protocol:await read('get_protocol',[BigInt(entry.protocol_id)]),proposal:await read('get_proposal',[BigInt(entry.proposal_id)]),counts:await read('get_counts')};}
const source=(marker='## DISCLOSURE SAFE',bad=false)=>JSON.stringify({...descriptors.disclosure,marker,...(bad?{digest:'0'.repeat(64)}:{})});
async function create(name,current,candidate,marker='## DISCLOSURE SAFE',bad=false){
 const e=report.cases[name]||{};report.cases[name]=e;save();
 if(e.protocol_id===undefined){const id=await tx(0,'register_protocol',[`v3-${name}`,current,JSON.stringify(descriptors.policy)],`${name}_register`);if(!Number.isSafeInteger(id))throw Error('Registration rejected');e.protocol_id=id;save();}
 if(e.proposal_id===undefined){const id=await tx(0,'propose_upgrade',[BigInt(e.protocol_id),candidate,source(marker,bad)],`${name}_propose`);if(!Number.isSafeInteger(id))throw Error('Proposal rejected');e.proposal_id=id;save();}return e;
}
async function unchanged(e,actor,method,args,label,expected){
 if(e[label]?.passed)return;
 const before=await snapshot(e),returned=await tx(actor,method,args,label),after=await snapshot(e);
 e[label]={expected,returned,before,after,passed:returned===expected&&JSON.stringify(before)===JSON.stringify(after)};save();
 if(!e[label].passed)throw Error(`${label}: rejected-call state invariant failed`);
}
async function execute(name,fn){try{await fn();report.cases[name].completed=true;save();}catch(error){report.cases[name]={...report.cases[name],error:error.message};save();console.log('CASE_INCOMPLETE',name,error.message);}}
await execute('happy',async()=>{
 const e=await create('happy',positive.current,positive.candidate);
 const grounded=await tx(1,'ground_sources',[BigInt(e.proposal_id)],'happy_ground');if(grounded!=='GROUNDED')throw Error(`Grounding: ${grounded}`);
 e.ground=await read('get_ground',[BigInt(e.proposal_id)]);save();
 await tx(1,'review_upgrade',[BigInt(e.proposal_id)],'happy_review');
 e.review=await read('get_proposal',[BigInt(e.proposal_id)]);save();
 if(!['PERMIT_READY','ACTIVATED'].includes(e.review.state))throw Error(`Positive review: ${e.review.state}/${e.review.reason_code}`);
 await unchanged(e,1,'consume_activation',[BigInt(e.proposal_id)],'wrong_actor_consume','SPONSOR_ONLY');
 await unchanged(e,1,'propose_upgrade',[BigInt(e.protocol_id),positive.current,source()],'wrong_actor_propose','SPONSOR_ONLY');
 const result=await tx(0,'consume_activation',[BigInt(e.proposal_id)],'happy_activate');if(result!=='ACTIVATED')throw Error(`Activation: ${result}`);
 e.final=await snapshot(e);save();if(e.final.proposal.activation_scope!=='GENLAYER_REGISTRY_ONLY')throw Error('Missing registry scope');
 await unchanged(e,0,'consume_activation',[BigInt(e.proposal_id)],'activation_replay','PERMIT_NOT_READY');
 await unchanged(e,1,'review_upgrade',[BigInt(e.proposal_id)],'review_replay','PROPOSAL_NOT_GROUNDED');
});
await execute('forbidden',async()=>{
 const e=await create('forbidden',positive.candidate,positive.current,'## DISCLOSURE HIDDEN');
 const grounded=await tx(1,'ground_sources',[BigInt(e.proposal_id)],'forbidden_ground');if(grounded!=='GROUNDED')throw Error(`Grounding: ${grounded}`);
 await tx(1,'review_upgrade',[BigInt(e.proposal_id)],'forbidden_review');e.review=await read('get_proposal',[BigInt(e.proposal_id)]);save();
 if(e.review.state!=='BLOCKED')throw Error(`Negative review: ${e.review.state}`);
 await unchanged(e,0,'consume_activation',[BigInt(e.proposal_id)],'forbidden_consume','PERMIT_NOT_READY');
});
for(const name of ['bad_digest','proxy'])await execute(name,async()=>{
 const target=name==='proxy'?'0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48':positive.candidate;
 const e=await create(name,positive.current,target,'## DISCLOSURE SAFE',name==='bad_digest');
 await unchanged(e,1,'ground_sources',[BigInt(e.proposal_id)],`${name}_ground`,'SOURCE_UNVERIFIED');
 e.ground=await read('get_ground',[BigInt(e.proposal_id)]);save();if(e.ground.error!=='GROUND_NOT_FOUND')throw Error('Rejected source persisted ground');
});
report.final_counts=await read('get_counts');report.finished_at=new Date().toISOString();report.all_cases_passed=Object.values(report.cases).every(x=>x.completed&&!x.error);save();console.log('SUITE_FINISHED',JSON.stringify({all_cases_passed:report.all_cases_passed,counts:report.final_counts}));
