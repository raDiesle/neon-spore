import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

/**
 * The service worker, run.
 *
 * `sw.js` ships to every phone that puts the game on its home screen and no
 * harness had ever executed a line of it — which is how a `cache.put` with no
 * `ok` check survived: a 503 from the origin mid-deploy replaced the shell, and
 * every offline open afterwards served the error page. It is plain `.js` with
 * no imports, so it can simply be evaluated with the three globals it reaches
 * for handed in.
 */
const SOURCE = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");

type Handler = (event: FakeEvent) => void;

interface FakeEvent {
  request: { method: string; url: string; mode: string };
  respondWith: (answer: Promise<Response>) => void;
  waitUntil: (work: Promise<unknown>) => void;
}

const ORIGIN = "https://neon-spore.example";

/** One cache, and the `caches` object over it. Enough for what `sw.js` asks of it. */
function cacheStore() {
  const entries = new Map<string, Response>();
  const key = (k: unknown): string =>
    typeof k === "string"
      ? new URL(k, `${ORIGIN}/`).href
      : new URL(String((k as { url: string }).url)).href;
  const cache = {
    async add(k: string) {
      entries.set(key(k), new Response("added"));
    },
    async put(k: unknown, value: Response) {
      entries.set(key(k), value);
    },
    async match(k: unknown) {
      return entries.get(key(k));
    },
  };
  return {
    entries,
    caches: {
      async open() {
        return cache;
      },
      async match(k: unknown) {
        return entries.get(key(k));
      },
      async keys() {
        return [];
      },
      async delete() {
        return true;
      },
    },
  };
}

/** Evaluate `sw.js` with its globals supplied, and hand back its listeners. */
function loadWorker(fetch: (request: unknown) => Promise<Response>) {
  const store = cacheStore();
  const handlers = new Map<string, Handler>();
  const self = {
    addEventListener: (type: string, fn: Handler) => handlers.set(type, fn),
    skipWaiting: () => {},
    clients: { claim: async () => {} },
    location: { origin: ORIGIN },
  };
  new Function("self", "caches", "fetch", SOURCE)(self, store.caches, fetch);
  return { store, handlers };
}

/** A navigation to the page — what opening the icon on the home screen is. */
const NAVIGATE = { method: "GET", url: `${ORIGIN}/?room=ACDE`, mode: "navigate" };

/** Drive one fetch event and return what the worker answered with. */
async function answer(handlers: Map<string, Handler>, request: FakeEvent["request"]) {
  let given: Promise<Response> | null = null;
  handlers.get("fetch")?.({
    request,
    respondWith: (a) => {
      given = a;
    },
    waitUntil: () => {},
  });
  return given === null ? null : await (given as Promise<Response>);
}

describe("the page, fetched from the network first", () => {
  test("a good page is served and becomes the offline shell", async () => {
    const { store, handlers } = loadWorker(async () => new Response("the shell"));
    const res = await answer(handlers, NAVIGATE);
    expect(await res?.text()).toBe("the shell");
    expect(await store.entries.get(`${ORIGIN}/`)?.text()).toBe("the shell");
  });

  test("a failed page is served and never becomes the shell", async () => {
    const { store, handlers } = loadWorker(async () => new Response("the shell"));
    await answer(handlers, NAVIGATE);

    // A deploy in progress, or a Cloudflare error page. It is a real answer and
    // is handed back — but it must not replace the shell behind it.
    const broken = loadWorker(async () => new Response("gateway error", { status: 503 }));
    broken.store.entries.set(`${ORIGIN}/`, new Response("the shell"));
    const res = await answer(broken.handlers, NAVIGATE);
    expect(res?.status).toBe(503);
    expect(await broken.store.entries.get(`${ORIGIN}/`)?.text()).toBe("the shell");
    expect(store.entries.size).toBe(1);
  });

  test("no network at all is what the cache is for", async () => {
    const { store, handlers } = loadWorker(async () => {
      throw new Error("offline");
    });
    store.entries.set(`${ORIGIN}/`, new Response("the shell"));
    const res = await answer(handlers, NAVIGATE);
    expect(await res?.text()).toBe("the shell");
  });

  test("no network and nothing cached is an error, not a blank page", async () => {
    const { handlers } = loadWorker(async () => {
      throw new Error("offline");
    });
    await expect(answer(handlers, NAVIGATE)).rejects.toThrow("offline and nothing cached");
  });
});

describe("what the shell names, fetched from the cache first", () => {
  test("the relay is never touched", async () => {
    const { handlers } = loadWorker(async () => new Response("no"));
    for (const path of ["/room/ACDE", "/net/health"]) {
      expect(await answer(handlers, { method: "GET", url: `${ORIGIN}${path}`, mode: "cors" })).toBe(
        null,
      );
    }
  });

  test("a hit is the truth, because the name carries a hash", async () => {
    let calls = 0;
    const { store, handlers } = loadWorker(async () => {
      calls++;
      return new Response("bundle");
    });
    const asset = { method: "GET", url: `${ORIGIN}/main-abc123.js`, mode: "cors" };
    // Nothing cached: the network answers, and the answer is kept.
    expect(await (await answer(handlers, asset))?.text()).toBe("bundle");
    expect(calls).toBe(1);
    store.entries.set(`${ORIGIN}/main-abc123.js`, new Response("bundle"));
    expect(await (await answer(handlers, asset))?.text()).toBe("bundle");
    expect(calls).toBe(1);
  });
});
