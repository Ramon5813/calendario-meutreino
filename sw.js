// =====================================================
// 💪 Treinos - Ramon - Service Worker Avançado (v1.0)
// =====================================================

const CACHE_VERSION = "v1.0";
const CACHE_NAME = `treinos-ramon-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/segunda.html",
  "/terca.html",
  "/quarta.html",
  "/quinta.html",
  "/sexta.html",
  "/sabado-domingo.html",
  "/observacoes.html",
  "/dietas.html",
  "/bg-treinos.jpg",
  "/style.css",
  "/icons/ramon-192.png",
  "/icons/ramon-512.png",
  "/treino-segunda.jpeg",
  "/treino-terca.jpeg",
  "/treino-quarta.jpeg",
  "/treino-quinta.jpeg",
  "/treino-sexta.jpeg",
  "/treino-sabado.jpeg",
  OFFLINE_URL
];

// =====================================================
// 🧱 INSTALAÇÃO
// =====================================================
self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker Treinos - Ramon...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
      .catch((err) => console.error("❌ Erro ao armazenar cache:", err))
  );
  self.skipWaiting();
});

// =====================================================
// 🧹 ATIVAÇÃO
// =====================================================
self.addEventListener("activate", (event) => {
  console.log("🔁 Ativando nova versão do SW Treinos - Ramon...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🗑️ Removendo cache antigo:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// =====================================================
// 🌐 FETCH - Cache First + Atualização em BG
// =====================================================
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (!event.request.url.startsWith(self.location.origin)) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
              const clonedResponse = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
            }
            return networkResponse;
          })
          .catch(() => {
            if (cachedResponse) return cachedResponse;
            if (event.request.destination === "document" || event.request.mode === "navigate") {
              return caches.match(OFFLINE_URL);
            }
            return new Response("Conteúdo indisponível offline", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" }
            });
          });

        return cachedResponse || fetchPromise;
      })
  );
});

// =====================================================
// 🧩 Comunicação com página (atualização forçada)
// =====================================================
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    console.log("⏩ Atualização forçada do SW Treinos - Ramon.");
    self.skipWaiting().then(() => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage("UPDATE_READY"));
      });
    });
  }
});
