import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {parse} from 'node-html-parser';
const site=JSON.parse(fs.readFileSync(new URL('../src/data/site.json',import.meta.url)));
const mode=process.argv[2]??'local';
assert.ok(['local','staging','production'].includes(mode));
const origin=mode==='production'?site.url:mode==='staging'?'https://'+site.domain.replace('.','-')+'-astro-staging.timgabaree-com-astro.workers.dev':process.argv[3];
assert.ok(origin);
const headers={};
if(mode==='staging'){
 const credential=execFileSync('/usr/bin/security',['find-generic-password','-s',site.domain+'-astro-staging-basic-auth','-a','review','-w'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
 headers.Authorization='Basic '+Buffer.from('review:'+credential).toString('base64');
}
let checks=0;
async function get(path,status=200,options={}){
 const r=await fetch(new URL(path,origin),{headers,redirect:'manual',...options});assert.equal(r.status,status,path);checks++;return r;
}
const build=new URL(mode==='production'?'../dist-production/':'../dist/',import.meta.url);
const assets=new Set(['/favicon.ico','/css/style.css',site.image]);
for(const path of ['/','/privacy','/sitemap']){
 const r=await get(path);assert.match(r.headers.get('content-security-policy'),/default-src 'self'/);
 if(mode!=='production')assert.match(r.headers.get('x-robots-tag'),/noindex/);else assert.equal(r.headers.get('x-robots-tag'),null);
 const html=await r.text();const doc=parse(html);assert.equal(doc.querySelectorAll('h1').length,1);assert.equal(doc.querySelectorAll('style').length,0);
 assert.equal(doc.querySelector('link[rel="canonical"]').getAttribute('href'),site.url+path);
 if(path==='/'){assert.equal(doc.querySelector('h1').textContent,site.heading);assert.equal(doc.querySelector('.hero p').textContent,site.introduction);}
 for(const el of doc.querySelectorAll('link[rel="stylesheet"],script[src]')){
  const url=el.getAttribute('href')??el.getAttribute('src');if(url.startsWith('/'))assets.add(url);
 }
 checks+=5;
}
for(const asset of assets){
 const r=await get(asset);const bytes=Buffer.from(await r.arrayBuffer());
 assert.equal(createHash('sha256').update(bytes).digest('hex'),createHash('sha256').update(fs.readFileSync(new URL(asset.slice(1),build))).digest('hex'));checks++;
}
for(const path of ['/not-a-real-page','/.env','/src/data/site.json','/worker/index.ts','/_notes/dwsync.xml','/404.shtml'])await get(path,404);
await get('/',405,{method:'POST',body:'test'});
for(const path of ['/index.html','/index.php'])assert.equal((await get(path+'?test=1',301)).headers.get('location'),'/?test=1');
const xml=await (await get('/sitemap.xml')).text();assert.match(xml,/<image:loc>/);assert.doesNotMatch(xml,/xml-stylesheet|\.xsl/);checks+=2;
const robots=await (await get('/robots.txt')).text();
if(mode==='production'){assert.ok(robots.includes('Sitemap: '+site.url+'/sitemap.xml'));assert.match(robots,/User-agent: \*\s*\n(?:Content-Signal:[^\n]*\n)?Allow: \//);}
else assert.match(robots,/Disallow: \//);checks++;
if(mode==='staging')for(const path of ['/','/privacy','/favicon.ico','/robots.txt'])assert.equal((await fetch(origin+path)).status,401);
if(mode==='production')for(const host of ['http://'+site.domain,'https://www.'+site.domain,'http://www.'+site.domain]){
 const r=await fetch(host+'/privacy?test=1',{redirect:'manual'});assert.equal(r.status,308);assert.equal(r.headers.get('location'),site.url+'/privacy?test=1');checks++;
}
fs.mkdirSync(new URL('../.local/',import.meta.url),{recursive:true});
const report={checkedAt:new Date().toISOString(),domain:site.domain,mode,checks,assetsCompared:assets.size,emailSent:false};
fs.writeFileSync(new URL('../.local/'+mode+'-verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
