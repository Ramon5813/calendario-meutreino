// sw.js - Service Worker X-Men Treinos
const CACHE_NAME = 'xmen-treinos-v1';
const URLS_TO_CACHE = [
  '/', // index.html
  '/index.html',
  '/segunda.html',
  '/terca.html',
  '/quarta.html',
  '/quinta.html',
  '/sexta.html',
  '/sabado-domingo.html',
  '/observacoes.html',
  '/dietas.html',
  '/style.css',
  '/xmen-bg.jpg',
  '/icons/xmen-192.png',
  '/icons/xmen-512.png'
];

// Instalando Service Worker e cacheando arquivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Arquivos em cache');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker e limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Deletando cache antigo:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Interceptando requisições para servir do cache ou da rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // retorna do cache
        }
        // busca da rede e adiciona ao cache
        return fetch(event.request).then(networkResponse => {
          if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        });
      })
      .catch(() => {
        // fallback se offline e página não estiver no cache
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
