interface Env { ASSETS: Fetcher; ENVIRONMENT?: string; SITE_HOST?: string; PRODUCTION_ENABLED?: string; STAGING_USER?: string; STAGING_PASSWORD?: string; }
const csp="default-src 'self'; object-src 'none'; script-src 'self' https://www.googletagmanager.com https://static.cloudflareinsights.com; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://cloudflareinsights.com; base-uri 'self'; form-action 'none'; frame-ancestors 'none'";
async function equal(a:string,b:string){const digest=(s:string)=>crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));const [x,y]=await Promise.all([digest(a),digest(b)]);let difference=0;const l=new Uint8Array(x),r=new Uint8Array(y);for(let i=0;i<l.length;i++)difference|=l[i]^r[i];return difference===0;}
async function route(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url);
 if(env.ENVIRONMENT==='local'&&['127.0.0.1','localhost','[::1]'].includes(url.hostname)){}
 else if(env.ENVIRONMENT==='production'){
  if(env.PRODUCTION_ENABLED!=='true'||!env.SITE_HOST)return new Response('Site not yet enabled.',{status:503});
  if(![env.SITE_HOST,'www.'+env.SITE_HOST].includes(url.hostname))return new Response('Not found',{status:404});
  if(url.protocol!=='https:'||url.hostname!==env.SITE_HOST){url.protocol='https:';url.hostname=env.SITE_HOST;url.port='';return Response.redirect(url.href,308);}
 }else if(env.ENVIRONMENT==='staging'){
  if(!env.STAGING_USER||!env.STAGING_PASSWORD||env.STAGING_PASSWORD.length<20)return new Response('Private staging is locked.',{status:503});
  if(url.protocol!=='https:'){url.protocol='https:';return Response.redirect(url.href,308);}
  const expected='Basic '+btoa(env.STAGING_USER+':'+env.STAGING_PASSWORD);
  if(!await equal(request.headers.get('Authorization')??'',expected))return new Response('Private staging site',{status:401,headers:{'WWW-Authenticate':'Basic realm="Astro staging", charset="UTF-8"'}});
 }else return new Response('Unavailable',{status:503});
 let path:string;try{path=decodeURIComponent(url.pathname);}catch{return new Response('Bad request',{status:400});}
 if(/(^|\/)(?:\.|_notes(?:\/|$)|error_log$)/i.test(path)||/^\/(?:src|worker|scripts|tests|node_modules|includes|archive)(?:\/|$)/i.test(path))return new Response('Not found',{status:404});
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 if(/^\/index\.(html|php)$/i.test(path))return new Response(null,{status:301,headers:{Location:'/'+url.search}});
 const page=/^\/(privacy|sitemap)(?:\.html|\/)$/.exec(path);
 if(page)return new Response(null,{status:301,headers:{Location:'/'+page[1]+url.search}});
 if(/\.(php|shtml)$/i.test(path))return new Response('Not found',{status:404});
 if(env.ENVIRONMENT!=='production'&&path==='/robots.txt')return new Response('User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain'}});
 return env.ASSETS.fetch(request);
}
export default {async fetch(request:Request,env:Env):Promise<Response>{
 let response:Response;try{response=await route(request,env);}catch{response=new Response('Temporarily unavailable',{status:503});}
 const result=new Response(response.body,response);
 result.headers.set('Content-Security-Policy',csp);result.headers.set('X-Content-Type-Options','nosniff');result.headers.set('X-Frame-Options','DENY');result.headers.set('Referrer-Policy','strict-origin-when-cross-origin');result.headers.set('Permissions-Policy','camera=(), geolocation=(), microphone=()');
 if(new URL(request.url).protocol==='https:')result.headers.set('Strict-Transport-Security','max-age=31536000');
 if(env.ENVIRONMENT!=='production'){result.headers.set('X-Robots-Tag','noindex, nofollow, noarchive');result.headers.set('Cache-Control','private, no-store');result.headers.append('Vary','Authorization');}
 else if(result.status>=400||/^\/404(?:\.|\/|$)/.test(new URL(request.url).pathname)){result.headers.set('X-Robots-Tag','noindex, nofollow');result.headers.set('Cache-Control','no-store');}
 else if(/text\/html|text\/css|javascript/.test(result.headers.get('Content-Type')??''))result.headers.set('Cache-Control','no-cache');
 return result;
}};
