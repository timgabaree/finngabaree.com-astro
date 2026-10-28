import type { APIRoute } from 'astro';
import site from '../data/site.json';
const escape=(s:string)=>s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export const GET: APIRoute = () => new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${['/','/privacy','/sitemap'].map(path=>`<url><loc>${escape(site.url+path)}</loc>${path==='/'?`<image:image><image:loc>${escape(site.url+site.image)}</image:loc></image:image>`:''}</url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
