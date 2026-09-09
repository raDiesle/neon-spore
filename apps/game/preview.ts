// The server Claude verifies against. Not `bun --hot`: that serves a
// transform of the source, keeps state across edits and outlives the session
// that started it. This serves `dist/` — the same bundle that ships — and it
// cannot linger:
//
//   * the port is its own: 4173, never the 3000 that `bun --hot` takes. A
//     human dev server and this one cannot want the same socket, so a
//     preview that fails to start leaves an empty port rather than a dev
//     server that answers happily with the wrong bundle;
//   * it does not wander to get away from a stale copy of itself in this same
//     tree — that one is asked to quit, and never killed;
//   * it *does* step aside for a preview of a **different** checkout, onto a
//     port derived from this tree's path (`tools/ports.ts`). Retiring that one
//     would take down a server another session is verifying against;
//   * an idle preview exits on its own, so a leaked one dies without help.
//
// **The idle window is ten minutes, and the startup line says so.** It was
// thirty seconds, which is shorter than one turn of work: a lane took a
// picture, edited a source file, asked for the page again and got `curl` exit 7
// — which the browser reports as a navigation being denied, so it reads as a
// permission problem rather than as nothing listening. Three times in one
// sitting, each costing a launch and a rebuild. Ten minutes still kills a
// leaked server without anybody's help, and it outlives the edit-and-look cycle
// the preview exists for. `PREVIEW_IDLE_MS` overrides it.
//
// Run it through `bun run preview`, which builds first.

import { claimPort, treeKey } from "../../tools/ports.js";
import { SERVERS } from "../../tools/servers.js";

const tree = Bun.fileURLToPath(new URL("../../", import.meta.url));
const given = process.env.PREVIEW_PORT === undefined ? undefined : Number(process.env.PREVIEW_PORT);
const root = new URL("./dist/", import.meta.url);
/** The base, the band, the marker and the two paths, from the one table. */
const spec = SERVERS.preview;
const marker = spec.marker;
/** Which checkout this one serves. Two trees, two previews, two ports. */
const treeId = treeKey(tree);
const idleMs = Number(process.env.PREVIEW_IDLE_MS ?? 10 * 60 * 1000);

// PREVIEW_PORT=0 asks the OS for a free port: there is nothing to reclaim and
// nothing to collide with. That is the mode for a one-shot check, or for a
// second preview running beside this one in the same tree.
const port =
  given === 0
    ? 0
    : await claimPort({ ...spec, tree, given }).catch((err: Error) => {
        console.error(err.message);
        process.exit(1);
      });

/** How long it answers for with nothing asked of it, said the way a person reads it. */
const idleWindow =
  idleMs >= 60_000 ? `${Math.round(idleMs / 60_000)} min` : `${Math.round(idleMs / 1000)}s`;

let idle: ReturnType<typeof setTimeout>;
function resetIdle(): void {
  clearTimeout(idle);
  idle = setTimeout(() => {
    console.log(`preview idle for ${idleWindow} — exiting. bun run preview starts another.`);
    process.exit(0);
  }, idleMs);
}

/** A built asset is content-hashed, but index.html is not — never cache either. */
const noCache = {
  "cache-control": "no-store, must-revalidate",
} as const;

// The return type is spelled out because `fetch` reads `server.port` — without
// it the handler's type and the server's each wait on the other, and `tsc`
// gives up on both.
const server = Bun.serve({
  port,
  hostname: process.env.PREVIEW_HOST ?? "::",
  async fetch(req): Promise<Response> {
    resetIdle();
    const path = new URL(req.url).pathname;

    if (path === "/__preview") {
      return Response.json({ app: marker, pid: process.pid, port: server.port, tree: treeId });
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
console.log(`serving ${treeId}`);
console.log(`answers until ${idleWindow} pass with no request — every request resets that`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.stop(true);
    process.exit(0);
  });
}
