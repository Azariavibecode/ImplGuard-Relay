import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
import {mkdirSync,writeFileSync} from "node:fs";

const address=process.env.CONTRACT_ADDRESS||"0xF0271b6665c436638274229A6768b1dA4c950a33";
const client=createClient({chain:studionet});
const read=async(functionName,args=[])=>JSON.parse(await client.readContract({address,functionName,args}));
const counts=await read("get_counts");
const records=[];
for(let id=0;id<counts.proposal_count;id++){
 const proposal=await read("get_proposal",[BigInt(id)]);
 const protocol=await read("get_protocol",[BigInt(proposal.protocol_id)]);
 const ground=await read("get_ground",[BigInt(id)]);
 if(proposal.proposal_id!==id||protocol.protocol_id!==proposal.protocol_id)throw Error("Selected ID mismatch");
 if(proposal.state==="ACTIVATED"&&!proposal.permit_consumed)throw Error("Consumed flag mismatch");
 if(["BLOCKED","INCONCLUSIVE","PROPOSED"].includes(proposal.state)&&proposal.permit_consumed)throw Error("Nonpositive proposal consumed");
 const stale=proposal.base_revision!==protocol.revision||proposal.base_implementation!==protocol.current_implementation;
 records.push({selected_proposal_id:id,selected_protocol_id:proposal.protocol_id,proposal,protocol,ground,display:{proposal_state:proposal.state,verdict:proposal.verdict,reason_code:proposal.reason_code,permit_consumed:proposal.permit_consumed,active_implementation:protocol.current_implementation,revision:protocol.revision,stale_base:stale},expected_action:proposal.state==="PROPOSED"?"ground_sources":proposal.state==="GROUNDED"?"review_upgrade":proposal.state==="PERMIT_READY"&&!stale?"consume_activation":"inspect"});
}
mkdirSync("verification/live",{recursive:true});
const folder=address.toLowerCase()==="0xf0271b6665c436638274229a6768b1da4c950a33"?"verification/live/v2":"verification/live";
mkdirSync(folder,{recursive:true});
writeFileSync(`${folder}/ui-sdk-readback.json`,JSON.stringify({generated_at:new Date().toISOString(),address,verification_scope:"SDK reads of the exact entrypoints and IDs displayed by UI; browser rendering and wallet popup were not exercised",counts,records},null,2)+"\n");
console.log(`Verified ${records.length} exact proposal/protocol mappings`);
