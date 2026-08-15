// Service worker do Sistema Gefoscal.
// O sistema depende o tempo todo do banco (Supabase), então não dá pra
// funcionar "offline de verdade" — o que esse arquivo faz é só o
// necessário pra virar um app instalável (ícone na tela, tela cheia,
// sem barra de navegador) e guardar em cache o "esqueleto" da página,
// pra abrir mais rápido e não ficar em branco se a internet cair um
// instante.
const CACHE = 'gefoscal-v1'
const ARQUIVOS_ESQUELETO = ['./index.html', './manifest.json']

self.addEventListener('install', (evento) => {
  self.skipWaiting()
  evento.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS_ESQUELETO).catch(() => {}))
  )
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Rede primeiro (dado sempre atualizado); só usa o cache se estiver
// sem internet mesmo, e só pro esqueleto da página.
self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return
  evento.respondWith(
    fetch(evento.request).catch(() => caches.match(evento.request))
  )
})
