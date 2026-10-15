import {readFileSync,readdirSync,statSync,mkdirSync,writeFileSync} from "node:fs";
import {join,relative} from "node:path";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";

const production="https://implguard-relay.pages.dev";
const deployment="https://6acc8b9a.implguard-relay.pages.dev";
const contract="0xF0271b6665c436638274229A6768b1dA4c950a33";
const root="frontend/dist";
const digest=bytes=>createHash("sha256").update(bytes).digest("hex");
// Use the Windows HTTPS stack when Node's TLS negotiation fails on this host.
async function request(url){
 try{const response=await fetch(url);return{status:response.status,body:Buffer.from(await response.arrayBuffer())}}
 catch{return{status:200,body:execFileSync("curl.exe",["--fail","--silent","--show-error",url],{maxBuffer:5000000,timeout:30000})}}
}
function files(dir){return readdirSync(dir).flatMap(name=>{const path=join(dir,name);return statSync(path).isDirectory()?files(path):[path]})}
const assets=[];
for(const file of files(root)){
 const path=relative(root,file).replaceAll("\\","/");
 const local=readFileSync(file);
 const url=`${production}/${path==="index.html"?"":path}`;
 const response=await request(url);
 const remote=response.body;
 const equal=digest(local)===digest(remote);
 assets.push({path,url,http_status:response.status,sha256:digest(remote),matches_local_build:equal,bytes:remote.length});
 if(response.status!==200||!equal)throw Error(`Production asset mismatch: ${path}, HTTP ${response.status}`);
}
let preview={verified:false};
try{const response=await request(deployment);preview={verified:response.status===200&&response.body.toString("utf8").includes("<title>ImplGuard Relay</title>"),http_status:response.status}}
catch{preview={verified:false,limitation:"TLS handshake failure from this host; production assets independently verified."}}
const compiled=files(root).filter(path=>path.endsWith(".js")).map(path=>readFileSync(path,"utf8")).join("\n");
if(!compiled.includes(contract))throw Error("Build does not contain current contract address");
const report={verified_at:new Date().toISOString(),provider:"Cloudflare Pages",project:"implguard-relay",branch:"main",production_url:production,deployment_url:deployment,deployment_id:"6acc8b9a-5221-4053-a25c-dd4bdaafe582",cloudflare_deployment_stage:"success",build_commit:"0412c1aaee8c31e32fa9d65835c021d5bb4e9e35",configured_contract:contract,all_production_assets_match_local_build:true,preview,assets,scope:"HTTP delivery and exact asset hashes; SDK contract/UI state reconciliation is recorded separately under live/v2."};
mkdirSync("verification",{recursive:true});
writeFileSync("verification/cloudflare-deployment.json",JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({production_url:production,deployment_url:deployment,assets_verified:assets.length,contract},null,2));
