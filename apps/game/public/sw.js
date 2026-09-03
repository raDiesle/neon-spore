/**
 * The service worker. It exists so the icon on the home screen opens something
 * rather than a spinner, and for no other reason.
 *
 * `__SW_VERSION__` is replaced at build time (`apps/game/build.ts`). It is the
 * cache's name, so every deploy gets a fresh one and the old one is deleted on
 * activation — a cache keyed by a name that never changes is how a game ships
 * a fix that nobody receives.
 *
 * Two rules, and the split between them is the whole design:
 *
 *   * **the page is fetched from the network first.** The bundle it names is
 *     content-hashed, so a shell served from cache while a newer one exists on
 *     the server is a page asking for files that are no longer there. Cache is
 *     the answer only when the network does not answer at all;
 *   * **everything the page names is fetched from cache first.** Those names
 *     carry a hash, so a hit is not a guess about freshness — it is the same
 *     bytes by definition.
 *
 * The relay is never touched. A WebSocket upgrade does not come through here at
 * all, but `/net/health` does, and a cached answer about whether a room is
 * reachable is worse than no answer.
 */

const CACHE = "neon-spore-__SW_VERSION__";

self.addEventListener("install", (event) => {
  // The shell is warmed rather than precached from a list: the bundle's file
  // names are content-hashed and unknown to this file, so a hard-coded list
  // would be wrong the first time anything is rebuilt.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add("./"))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // The room and its health check belong to the relay and to this moment.
  if (url.pathname.startsWith("/room/") || url.pathname.startsWith("/net/")) return;

  if (request.mode === "navigate") {
    event.respondWith(pageFirstFromNetwork(request));
    return;
  }
  event.respondWith(assetFirstFromCache(request));
});

/** The shell. Network wins; the cache is what standing in a lift looks like. */
async function pageFirstFromNetwork(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(CACHE);
    // `./` and not the request: a room link carries a query string, and one
    // cache entry per room would fill the store with copies of one page.
    await cache.put("./", fresh.clone());
    return fresh;
  } catch {
    const cached = await caches.match("./", { ignoreSearch: true });
    if (cached) return cached;
    throw new Error("offline and nothing cached");
  }
}

/** Everything the shell names. The name carries a hash, so a hit is the truth. */
async function assetFirstFromCache(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh.ok && fresh.type === "basic") {
    const cache = await caches.open(CACHE);
    await cache.put(request, fresh.clone());
  }
  return fresh;
}
