import {readFile,stat,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {parse} from 'node-html-parser';
const site=JSON.parse(await readFile(new URL('../src/data/site.json',import.meta.url)));
const root=new URL('../dist-production/',import.meta.url);
const pages=new Map();let checks=0;
for(const route of ['/','/privacy','/sitemap','/404']){
 const html=await readFile(new URL(route==='/'?'index.html':route.slice(1)+'.html',root),'utf8');const doc=parse(html);pages.set(route,doc);
 assert.equal(doc.querySelectorAll('main').length,1);assert.equal(doc.querySelectorAll('h1').length,1);assert.ok(doc.querySelector('html[lang="en"]'));assert.ok(doc.querySelector('title').textContent);assert.equal(doc.querySelector('link[rel="canonical"]').getAttribute('href'),site.url+route);
 assert.equal(doc.querySelectorAll('style').length,0,'CSP requires external CSS');assert.ok(doc.querySelector('link[rel="stylesheet"]'));
 for(const script of doc.querySelectorAll('script[type="application/ld+json"]'))JSON.parse(script.textContent);
 assert.ok(!doc.querySelectorAll('script[src]').some(s=>s.getAttribute('src').includes('googletagmanager')));checks+=7;
}
assert.equal(pages.get('/').querySelector('h1').textContent,site.heading);assert.equal(pages.get('/').querySelector('.hero p').textContent,site.introduction);checks+=2;
for(const [route,doc] of pages){for(const el of doc.querySelectorAll('[href], [src]')){const value=el.getAttribute('href')??el.getAttribute('src');if(/^(mailto:|tel:|data:)/.test(value))continue;const url=new URL(value,site.url+route);if(url.origin!==site.url)continue;if(pages.has(url.pathname)){if(url.hash)assert.ok(pages.get(url.pathname).querySelectorAll('[id]').some(x=>x.id===decodeURIComponent(url.hash.slice(1))));}else assert.ok((await stat(new URL(url.pathname.slice(1),root))).isFile());checks++;}}
const xml=await readFile(new URL('sitemap.xml',root),'utf8');assert.doesNotMatch(xml,/xml-stylesheet|\.xsl|\/404/);assert.match(xml,/<image:loc>/);checks+=2;
for(const loc of xml.matchAll(/<(?:loc|image:loc)>(.*?)<\/(?:loc|image:loc)>/g)){const url=new URL(loc[1]);assert.equal(url.origin,site.url);if(!pages.has(url.pathname))assert.ok((await stat(new URL(url.pathname.slice(1),root))).isFile());checks++;}
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){assert.ok(!e.isSymbolicLink());assert.ok(!/^(?:\.|_notes|archive)/.test(e.name));assert.ok(!/\.(php|shtml)$/.test(e.name));if(e.isDirectory())await walk(new URL(e.name+'/',dir));checks++;}}
await walk(root);console.log(`${checks} page, asset, metadata, content parity, sitemap and publication-safety checks passed.`);
