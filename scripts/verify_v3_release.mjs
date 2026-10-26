import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
import {readFileSync, mkdirSync, writeFileSync} from "node:fs";
import {createHash} from "node:crypto";

const address=process.argv[2];
if(!/^0x[0-9a-fA-F]{40}$/.test(address||"")) throw Error("Usage: node scripts/verify_v3_release.mjs <replacement-contract-address>");
const client=createClient({chain:studionet});
const local=readFileSync("contracts/ImplGuardRelay.py","utf8");
const deployed=await client.getContractCode(address);
if(deployed!==local) throw Error("DEPLOYED_SOURCE_MISMATCH: release verification stopped");
const counts=JSON.parse(await client.readContract({address,functionName:"get_counts",args:[]}));
const report={verified_at:new Date().toISOString(),address,chain_id:61999,exact_source_match:true,sha256:createHash("sha256").update(local).digest("hex"),counts,scope:"Source parity and current counters only. Browser signatures require separate evidence."};
const folder=address.toLowerCase()==='0xcca30be2f67210bdefdd2b8d51105bac4bc60ae4'?'verification/live/v3':`verification/live/${address.toLowerCase()}`;
mkdirSync(folder,{recursive:true});
writeFileSync(`${folder}/deployed-source.json`,JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
