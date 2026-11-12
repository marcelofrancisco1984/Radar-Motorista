const CACHE='radar-motorista-v10';
const FILES=['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(FILES))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(
    caches.open(CACHE).then(cache=>
      cache.match(event.request).then(cached=>
        cached || fetch(event.request).then(response=>{
          if(response.ok && new URL(event.request.url).origin===self.location.origin){
            cache.put(event.request,response.clone());
          }
          return response;
        }).catch(()=>cache.match('./index.html'))
      )
    )
  );
});

// Push remoto em segundo plano será ativado quando houver servidor de push/FCM.
self.addEventListener('push',event=>{
  let data={title:'Radar Motorista',body:'Nova oportunidade estimada na sua região.'};
  try{if(event.data)data={...data,...event.data.json()}}catch(_){}
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'./icon-192.png',badge:'./icon-192.png'}));
});
