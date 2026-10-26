import {readFileSync,readdirSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const production='https://implguard-relay.pages.dev';
const address='0xcca30bE2F67210BDefDD2B8D51105BAc4bc60Ae4';
const root='frontend/dist';
const files=dir=>readdirSync(dir).flatMap(name=>{const path=join(dir,name);return statSync(path).isDirectory()?files(path):[path]});
const sha=x=>createHash('sha256').update(x).digest('hex');
const assets=[];
for(const file of files(root)){
 const path=relative(root,file).replaceAll('\\','/'),url=`${production}/${path==='index.html'?'':path}`;
 const output=execFileSync('curl.exe',['--fail','--silent','--show-error','--location','--write-out','\nHTTP_STATUS:%{http_code}',url],{maxBuffer:5000000,timeout:30000});
 const marker=output.lastIndexOf(Buffer.from('\nHTTP_STATUS:'));
 if(marker<0)throw Error('Missing HTTP status');
 const body=output.subarray(0,marker),status=Number(output.subarray(marker+13).toString());
 const matches=sha(body)===sha(readFileSync(file));
 assets.push({path,url,status,sha256:sha(body),matches_local_build:matches});
 if(status!==200||!matches)throw Error(`Asset mismatch ${path}`);
}
if(!files(root).filter(x=>x.endsWith('.js')).map(x=>readFileSync(x,'utf8')).join('\n').includes(address))throw Error('Compiled address mismatch');
const report={verified_at:new Date().toISOString(),production_url:production,deployment_url:'https://aa03d714.implguard-relay.pages.dev',source_commit:'f8689d8ecd7f3d8bc7dd474c5c5a99ddd21128d8',address,all_assets_match:true,assets,scope:'HTTP asset delivery and contract configuration. V3 semantic lifecycle is incomplete; browser signatures remain pending.'};
mkdirSync('verification/live/v3',{recursive:true});writeFileSync('verification/live/v3/cloudflare.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({url:production,address,assets:assets.length,all_match:true}));
