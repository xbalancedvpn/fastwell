const CACHE="fastwell-offline-v4";
const SDK="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.86.0/dist/umd/supabase.min.js";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon.svg","./assessment.js","./assessment.css","./account.js","./account.css"];
self.addEventListener("install",event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(ASSETS);
  try{const request=new Request(SDK,{mode:"no-cors"});const response=await fetch(request);if(response)await cache.put(request,response);}catch(err){console.warn("Account sign-in SDK will require connectivity",err);}
  await self.skipWaiting();
})()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith("fastwell-offline-")&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  const same=url.origin===self.location.origin;
  if(!same&&url.href!==SDK)return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request,{ignoreSearch:same});
    if(cached)return cached;
    try{
      const response=await fetch(event.request);
      if(response&&response.ok||response&&response.type==="opaque"){
        const cache=await caches.open(CACHE);await cache.put(event.request,response.clone());
      }
      return response;
    }catch(err){
      if(same&&event.request.mode==="navigate"){
        const fallback=await caches.match("./index.html");if(fallback)return fallback;
      }
      throw err;
    }
  })());
});
