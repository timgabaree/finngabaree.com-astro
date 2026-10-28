import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.ts';
const ASSETS={fetch:async r=>new Response(new URL(r.url).pathname==='/'?'<main>Site</main>':'Asset',{headers:{'Content-Type':'text/html'}})};
const env={ASSETS,ENVIRONMENT:'production',SITE_HOST:'example.com',PRODUCTION_ENABLED:'true'};
const req=(path='/',options={})=>new Request('https://example.com'+path,options);
test('production fails closed and accepts only canonical hostnames',async()=>{
 for(const change of [{PRODUCTION_ENABLED:undefined},{PRODUCTION_ENABLED:'false'},{PRODUCTION_ENABLED:'TRUE'},{SITE_HOST:''},{ENVIRONMENT:'unknown'}])assert.equal((await worker.fetch(req(),{...env,...change})).status,503);
 assert.equal((await worker.fetch(new Request('https://other.example/'),env)).status,404);
 assert.equal((await worker.fetch(req(),env)).status,200);
});
test('canonical redirects preserve path, query and method semantics',async()=>{
 for(const origin of ['http://example.com','https://www.example.com','http://www.example.com']){const r=await worker.fetch(new Request(origin+'/privacy?x=1'),env);assert.equal(r.status,308);assert.equal(r.headers.get('location'),'https://example.com/privacy?x=1');}
});
test('staging protects pages, assets and robots before serving content',async()=>{
 const staging={...env,ENVIRONMENT:'staging',STAGING_USER:'review',STAGING_PASSWORD:'synthetic-strong-test-password'};
 for(const path of ['/','/favicon.ico','/robots.txt'])assert.equal((await worker.fetch(req(path),staging)).status,401);
 const r=await worker.fetch(req('/robots.txt',{headers:{Authorization:'Basic '+btoa(staging.STAGING_USER+':'+staging.STAGING_PASSWORD)}}),staging);
 assert.equal(r.status,200);assert.match(await r.text(),/Disallow: \//);assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.match(r.headers.get('cache-control'),/no-store/);
 assert.equal((await worker.fetch(req(),{...staging,STAGING_PASSWORD:undefined})).status,503);
});
test('local bypass cannot open remote previews',async()=>{
 assert.equal((await worker.fetch(new Request('http://127.0.0.1/'),{...env,ENVIRONMENT:'local'})).status,200);
 assert.equal((await worker.fetch(req(),{...env,ENVIRONMENT:'local'})).status,503);
});
test('legacy paths, private files, methods and headers',async()=>{
 for(const path of ['/index.html','/index.php']){const r=await worker.fetch(req(path+'?x=1'),env);assert.equal(r.status,301);assert.equal(r.headers.get('location'),'/?x=1');}
 for(const path of ['/.env','/src/data/site.json','/_notes/dwsync.xml','/archive/old.png','/404.shtml','/missing.php'])assert.equal((await worker.fetch(req(path),env)).status,404);
 assert.equal((await worker.fetch(req('/',{method:'POST',body:'hello'}),env)).status,405);
 const r=await worker.fetch(req(),env);assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.equal(r.headers.get('x-robots-tag'),null);
});
