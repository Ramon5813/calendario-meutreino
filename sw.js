// =====================================================
// 🧠 X-Men Treinos - Service Worker Avançado (v2.1)
// =====================================================

const CACHE_VERSION = "v2.1";
const CACHE_NAME = `xmen-treinos-${CACHE_VERSION}`;
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
  "/xmen-bg.jpg",
  "/style.css",
  "/icons/xmen-192.png",
  "/icons/xmen-512.png",
  OFFLINE_URL
];

// =====================================================
// 🧱 INSTALAÇÃO - Armazena arquivos essenciais
// =====================================================
self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
      .catch((err) => console.error("❌ Erro ao armazenar cache:", err))
  );
  self.skipWaiting();
  self.clients.claim();
});

// =====================================================
// 🧹 ATIVAÇÃO - Remove caches antigos
// =====================================================
self.addEventListener("activate", (event) => {
  console.log("🔁 Ativando nova versão do SW...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
          console.log("🗑️ Removendo cache antigo:", key);
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});

// =====================================================
// 🌐 FETCH - Estratégia Cache First + Atualização BG
// =====================================================
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Ignora requisições externas (CDNs, APIs)
  if (!event.request.url.startsWith(self.location.origin)) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clonedResponse = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
            }
            return networkResponse;
          })
          .catch(() => {
            if (cachedResponse) return cachedResponse;
            if (event.request.mode === "navigate") {
              return caches.match(OFFLINE_URL);
            }
            return new Response("", { status: 503, statusText: "Offline" });
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
    console.log("⏩ Atualização forçada do SW.");
    self.skipWaiting();
  }
});
