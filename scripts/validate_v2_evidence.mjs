import {readFileSync,writeFileSync} from "node:fs";
const path="verification/live/v2/release-suite.json";
const report=JSON.parse(readFileSync(path,"utf8"));
if(!report.completed_at)throw Error("Suite incomplete");
for(const tx of report.transactions){
 if(tx.status!=="FINALIZED"||tx.execution!=="SUCCESS")throw Error(`Execution incomplete: ${tx.label}`);
 if(!["MAJORITY_AGREE","MAJORITY_DISAGREE"].includes(tx.consensus))throw Error(`Consensus unknown: ${tx.label}`);
}
const happy=report.cases["v2-happy"];
for(const label of ["wrong_actor_propose","wrong_actor_consume","stale_base","consume_replay","review_replay"]){
 const check=happy[label],tx=report.transactions.find(t=>t.label===label);
 if(!check?.passed||JSON.stringify(check.before)!==JSON.stringify(check.after)||tx.consensus!=="MAJORITY_AGREE"||tx.return_value!==check.expected)throw Error(`Rejection not proven: ${label}`);
}
if(happy.ground.candidate.source_files.length!==5)throw Error("Incomplete source inventory");
if(happy.activated.proposals[0].state!=="ACTIVATED"||happy.activated.protocol.revision!==1)throw Error("Activation missing");
if(report.cases["v2-hidden"].review.state!=="BLOCKED")throw Error("Hidden privilege not blocked");
const failure=report.cases["v2-bad-source"];
if(JSON.stringify(failure.before_ground)!==JSON.stringify(failure.after_ground)||failure.ground.error!=="GROUND_NOT_FOUND")throw Error("Failure mutation");
report.verification={checked_at:new Date().toISOString(),finality_execution_and_expected_returns:true,all_rejection_snapshots_equal:true,complete_candidate_source_files:5};
writeFileSync(path,JSON.stringify(report,null,2)+"\n");
console.log("V2 release evidence validated",report.transactions.length,"transactions");
