/* GenshinTrack service worker: offline-first shell + cached fonts/images. Bump V to force an update. */
const V="gt-v2",SHELL=["./","index.html","manifest.webmanifest","icon.svg"],MAX=400;
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;
 const u=new URL(r.url);
 // page: network first so updates show up, cache as offline fallback
 if(r.mode==="navigate"){
  e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put("index.html",cp));return res}).catch(()=>caches.match("index.html")));
  return}
 const ok=u.origin===location.origin||/(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.genshintrack\.com)$/.test(u.hostname);
 if(!ok)return;
 // everything else: cache first, refresh in the background
 e.respondWith(caches.match(r).then(hit=>{
  const net=fetch(r).then(res=>{
   if(res&&(res.ok||res.type==="opaque")){const cp=res.clone();caches.open(V).then(c=>{c.put(r,cp);c.keys().then(k=>{if(k.length>MAX)c.delete(k[SHELL.length])})})}
   return res}).catch(()=>hit);
  return hit||net}))});
