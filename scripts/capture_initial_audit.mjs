import{createClient}from"genlayer-js";
import{studionet}from"genlayer-js/chains";
import{mkdirSync,writeFileSync}from"node:fs";
const client=createClient({chain:studionet});
const address="0x11aA1f375b2765Bf7757Ca3eB554c6dEF0F127f7";
const hashes=[
 ["blocked_register","0x17da3978ae879f13c5a75c008bef208b222011b896687c9f995d48b1d1711355"],
 ["blocked_propose","0x17b9fe33fc1fe23a5f7f0c90adf83279d1e7eb2b5ee6bb577023e875595e03f6"],
 ["blocked_ground","0xbabaaa91b4cdb6a383e0d7b8dffb08b16caf8be0c1f763816e155460835453c0"],
 ["blocked_review","0xe18c4888b2088ddcedf318d35cdba76612bb33794c0b282430c1ad62735300e7"],
 ["sibling_register","0x0c9c959781fb572444ea6f05bad48f49031a0aa4425262bd81c5d98c1f0d48c0"],
 ["first_wrong_actor_propose","0x9dedae8522a72350bd4db06527755bdf74b09a8dee15a63d6a0439bf7b7049d4"],
 ["sibling_propose_first","0x50b033aa0e7f0ad012c1bd4edc9f001897a7040f7f4f8a0c992bc8d54fcc31c4"],
 ["sibling_propose_second","0x48f5dade4e7d3d081f91c8811befd8a45b8190b21218f433690fb6b091f47ca2"],
 ["sibling_ground_first","0xc88dc65ad652c0e7510310f771485c110398edf01f423444443e7e5971833b63"],
 ["sibling_ground_second","0xd5152f9ee400d4e61844d36ccb04ac3d2b17af9278049c3d1db3f3a36a0ad0ad"],
 ["sibling_review_first","0xa6c1e2b00e844b95ef83b324581aae7b5e9e9cd63f9db07891eadfe5f7a24a8f"],
 ["sibling_review_second","0x61c37539067e0bb03406183df23ba162f42c7bc7744edb3a7ed096068752d570"],
 ["first_wrong_actor_consume","0x1ae0dbc9c3d742586a99aabbf7364552df73e538999cfde72f917fb822d243ce"],
 ["sibling_activate_first","0xa79758946e7f6f651eb3ceb24ff6f6e7ab3497275f05fdc137cda201f2ac9124"],
];
const transactions=[];
for(const[label,hash]of hashes){
 const tx=await client.getTransaction({hash});
 const leader=tx.consensus_data?.leader_receipt?.find(r=>r.mode==="leader");
 transactions.push({label,hash,actor:tx.from_address,status:tx.status,consensus:tx.result_name,execution:leader?.execution_result,returned:leader?.result?.payload?.readable,explorer_url:`https://explorer-studio.genlayer.com/transactions/${hash}`,rounds:(tx.consensus_history?.consensus_results||[]).map(r=>({round:r.consensus_round,status_changes:r.status_changes,validators:r.validator_results?.map(v=>({vote:v.vote,execution:v.execution_result}))}))});
 await new Promise(r=>setTimeout(r,4500));
}
const proposals=[];
for(const id of[2n,3n,4n]){proposals.push(JSON.parse(await client.readContract({address,functionName:"get_proposal",args:[id]})));await new Promise(r=>setTimeout(r,4500))}
mkdirSync("verification/live",{recursive:true});
writeFileSync("verification/live/initial-adversarial-transactions.json",JSON.stringify({address,captured_at:new Date().toISOString(),transactions,proposals,conflict_observed:transactions.some(t=>t.rounds.some(r=>r.round==="Leader Rotation"))},null,2)+"\n");
console.log("Captured original adversarial transactions and rotation history");
