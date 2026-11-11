const CACHE='radar-motorista-v01';
const FILES=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).catch(()=>caches.match('./index.html'))));
});
// Push remoto em segundo plano será ativado quando houver servidor de push/FCM.
self.addEventListener('push',e=>{
 let data={title:'Radar Motorista',body:'Nova oportunidade estimada na sua região.'};
 try{if(e.data)data={...data,...e.data.json()}}catch(_){}
 e.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'./icon-192.png',badge:'./icon-192.png'}));
});