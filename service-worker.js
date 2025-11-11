
const CACHE = "rotary-phone-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/ui.js",
  "./js/state.js",
  "./js/dtmf.js",
  "./manifest.json",
  "./assets/sounds/click.wav",
  "./assets/sounds/ring.wav",
  "./assets/sounds/busy.wav",
];
self.addEventListener("install", (e)=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); });
self.addEventListener("activate", (e)=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); });
self.addEventListener("fetch", (e)=>{
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(res=> res || fetch(e.request).then(net => {
      const copy = net.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy)).catch(()=>{});
      return net;
    }).catch(()=> caches.match("./index.html")))
  );
});
