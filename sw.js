// İki Ses, Bir Yön — Service Worker
const CACHE = 'iks-v1';
const FILES = ['/iki-ses-bir-yon/', '/iki-ses-bir-yon/index.html'];

// Kurulum — dosyaları cache'e al
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// Aktivasyon — eski cache'leri temizle
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — önce cache, yoksa network
self.addEventListener('fetch', e => {
  // Unsplash ve ElevenLabs isteklerini cache'leme
  if (e.request.url.includes('unsplash.com') || 
      e.request.url.includes('elevenlabs.io') ||
      e.request.url.includes('fonts.googleapis.com')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        // Başarılı cevabı cache'e ekle
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});

// Bildirime tıklanınca uygulamayı aç
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) {
        if (c.url.includes('iki-ses-bir-yon') && 'focus' in c) return c.focus();
      }
      return clients.openWindow('/iki-ses-bir-yon/');
    })
  );
});
