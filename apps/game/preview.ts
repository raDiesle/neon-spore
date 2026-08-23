// The server Claude verifies against. Not `bun --hot`: that serves a
// transform of the source, keeps state across edits and outlives the session
// that started it. This serves `dist/` — the same bundle that ships — and it
// cannot linger:
//
//   * the port is fixed, so a second start collides instead of quietly
//     moving to 3001 and leaving the stale one running;
//   * a collision with an older preview is resolved by asking it to quit,
//     never by killing a process we did not recognise;
//   * an idle preview exits on its own, so a leaked one dies without help.
//
// Run it through `bun run preview`, which builds first.

const port = Number(process.env.PREVIEW_PORT ?? 3000);
const root = new URL("./dist/", import.meta.url);
const marker = "neon-spore-preview";
const idleMs = Number(process.env.PREVIEW_IDLE_MS ?? 15 * 60 * 1000);

/**
 * Both loopback families, because they are separate listeners: a ghost on
 * `::1` leaves `127.0.0.1` free, and a browser asking for `localhost` may
 * resolve to either. Binding next to such a ghost is how a "fresh" preview
 * ends up serving last week's bundle.
 */
const loopbacks = ["127.0.0.1", "[::1]"] as const;

async function probe(host: string): Promise<{ app?: string } | null> {
  let res: Response;
  try {
    res = await fetch(`http://${host}:${port}/__preview`, {
      signal: AbortSignal.timeout(700),
    });
  } catch {
    return null; // nothing listening, or not speaking HTTP
  }
  // Anything that answers but does not answer *this* is a stranger. A dev
  // server handing back index.html for an unknown path lands here.
  try {
    const body = (await res.json()) as { app?: string };
    return res.ok && typeof body.app === "string" ? body : {};
  } catch {
    return {};
  }
}

/** Ask an older preview to stand down. Fails loudly on a stranger. */
async function reclaim(host: string): Promise<void> {
  const found = await probe(host);
  if (found === null) return;

  if (found.app !== marker) {
    console.error(
      `port ${port} on ${host} is held by something that is not the preview server.
Stop it yourself, or set PREVIEW_PORT — this script will not kill an unknown process.`,
    );
    process.exit(1);
  }

  await fetch(`http://${host}:${port}/__preview/quit`).catch(() => {});
  for (let i = 0; i < 40; i++) {
    if ((await probe(host)) === null) return;
    await Bun.sleep(50);
  }
  console.error(`the previous preview on ${host}:${port} did not exit.`);
  process.exit(1);
}

for (const host of loopbacks) await reclaim(host);

let idle: ReturnType<typeof setTimeout>;
function resetIdle(): void {
  clearTimeout(idle);
  idle = setTimeout(() => {
    console.log(`preview idle for ${Math.round(idleMs / 1000)}s — exiting.`);
    process.exit(0);
  }, idleMs);
}

/** A built asset is content-hashed, but index.html is not — never cache either. */
const noCache = {
  "cache-control": "no-store, must-revalidate",
} as const;

const server = Bun.serve({
  port,
  hostname: process.env.PREVIEW_HOST ?? "::",
  async fetch(req) {
    resetIdle();
    const path = new URL(req.url).pathname;

    if (path === "/__preview") {
      return Response.json({ app: marker, pid: process.pid, port });
    }
    if (path === "/__preview/quit") {
      setTimeout(() => process.exit(0), 30);
      return new Response("bye", { headers: noCache });
    }

    // Resolving against `root` keeps `..` inside dist/.
    const rel = path === "/" ? "index.html" : path.replace(/^\/+/, "");
    const target = new URL(rel, root);
    if (!target.href.startsWith(root.href)) {
      return new Response("no", { status: 403, headers: noCache });
    }

    const file = Bun.file(target);
    if (await file.exists()) {
      return new Response(file, { headers: noCache });
    }
    return new Response("not found", { status: 404, headers: noCache });
  },
});

resetIdle();
console.log(`preview (built) on http://localhost:${server.port} — pid ${process.pid}`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.stop(true);
    process.exit(0);
  });
}
