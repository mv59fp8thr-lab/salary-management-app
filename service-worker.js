// 給料管理アプリ v4 - パスワードロック + キャッシュ更新版
const CACHE_NAME='salary-management-v4-password-lock-20261005';
const APP_FILES=['./','./index.html','./manifest.json'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const request=event.request;
  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request,{cache:'no-store'})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));
          return response;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    fetch(request,{cache:'no-store'})
      .then(response=>{
        if(response&&response.ok){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
        }
        return response;
      })
      .catch(()=>caches.match(request))
  );
});
