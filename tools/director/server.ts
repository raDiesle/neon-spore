import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Wave } from "@neon-spore/content";
import type { InterludeEntry } from "@neon-spore/sim";
import gameHtml from "../../apps/game/index.html";
import { claimPort, DIRECTOR_BAND, treeKey } from "../ports.js";
import indexHtml from "./index.html";
import { backlogState } from "./src/backlog-api.js";
import { checksClean, checksDecide, checksRun, checksState } from "./src/checks-api.js";
import { serializeGaps } from "./src/interlude-serialize.js";
import { serializeWaves } from "./src/serialize.js";

/**
 * The director's server. It exists for one reason the game's preview does not
 * have: a browser cannot write a file, and the whole point of the editor is
 * that what you place ends up in `packages/content/src/waves.ts` as a diff you
 * can read.
 *
 * It borrows the preview server's hygiene, and for the same reasons: a port
 * fixed per tree so a second start in the same tree collides instead of
 * quietly moving, a collision resolved by asking an older copy to quit rather
 * than by killing a process we did not recognise, and an idle exit so a leaked
 * one dies without help. A worktree derives a port of its own — see
 * `tools/ports.ts` — so two sessions editing two trees do not fight over one
 * socket, and neither ever answers with the other's waves.
 *
 * Run it through `bun run dev`, from the repository root.
 */

const repoRoot = new URL("../../", import.meta.url);
const repoRootPath = Bun.fileURLToPath(repoRoot);
const given =
  process.env.DIRECTOR_PORT === undefined ? undefined : Number(process.env.DIRECTOR_PORT);
/** Which checkout's `waves.ts` this one reads and writes. */
const treeId = treeKey(repoRootPath);
const wavesFile = new URL("../../packages/content/src/waves.ts", import.meta.url);
const interludesFile = new URL("../../packages/content/src/interludes.ts", import.meta.url);
const specDir = new URL("../../docs/spec/", import.meta.url);
const marker = "neon-spore-director";
// Longer than the preview's 30 seconds: this one is left open while a
// person thinks about a wave, which is not the same as an agent forgetting it.
const idleMs = Number(process.env.DIRECTOR_IDLE_MS ?? 60 * 60 * 1000);

interface DirectorHotState {
  booted: boolean;
  signalsBound: boolean;
  idle: ReturnType<typeof setTimeout> | undefined;
  /** Settled once per process, not once per hot reload — see below. */
  port: number | undefined;
}

const globalDirector = globalThis as unknown as { __director?: DirectorHotState };
globalDirector.__director ??= {
  booted: false,
  signalsBound: false,
  idle: undefined,
  port: undefined,
};
const hot = globalDirector.__director;

if (!hot.booted) {
  hot.booted = true;
  hot.port = await claimPort({
    base: 4174,
    band: DIRECTOR_BAND,
    tree: repoRootPath,
    marker,
    probePath: "/__director",
    quitPath: "/__director/quit",
    given,
  }).catch((err: Error) => {
    console.error(err.message);
    process.exit(1);
  });
}
// `bun --hot` re-evaluates this file in the same process, and the port was
// settled the first time round. Claiming it again would find this very server
// and ask it to quit.
const port = hot.port ?? 4174;

function resetIdle(): void {
  clearTimeout(hot.idle);
  hot.idle = setTimeout(() => {
    console.log(`director idle for ${Math.round(idleMs / 60000)} min — exiting.`);
    process.exit(0);
  }, idleMs);
}

const noCache = { "cache-control": "no-store, must-revalidate" } as const;

function withIdle<T extends (req: Request) => Response | Promise<Response>>(handler: T): T {
  return ((req: Request) => {
    resetIdle();
    return handler(req);
  }) as T;
}

/** The waves as they are on disk right now, not as they were bundled. */
async function readWaves(): Promise<Wave[]> {
  const mod = (await import(`${wavesFile.href}?t=${Date.now()}`)) as { WAVES: Wave[] };
  return mod.WAVES;
}

/**
 * Write the array back into the file, then let Biome have the last word on
 * formatting. The serializer already aims at Biome's output — the round-trip
 * test holds it to that — but a wave nobody has written yet may wrap in a way
 * the test never saw, and a save that turns the tree red is not a save.
 */
async function writeWaves(waves: Wave[]): Promise<string | null> {
  const source = await Bun.file(wavesFile).text();
  const next = serializeWaves(source, waves);
  await Bun.write(wavesFile, next);

  const rel = "packages/content/src/waves.ts";
  const proc = Bun.spawn([process.execPath, "x", "biome", "check", "--write", rel], {
    cwd: repoRootPath,
    stdout: "pipe",
    stderr: "pipe",
  });
  const code = await proc.exited;
  if (code === 0) return null;
  return await new Response(proc.stderr).text();
}

/** `GAPS` as it is on disk right now, not as it was bundled — same reasoning as `readWaves`. */
async function readGaps(): Promise<Record<number, InterludeEntry>> {
  const mod = (await import(`${interludesFile.href}?t=${Date.now()}`)) as {
    GAPS: Record<number, InterludeEntry>;
  };
  return mod.GAPS;
}

/** The `GAPS` counterpart of `writeWaves`: serialize, write, then let Biome format it. */
async function writeGaps(gaps: Record<number, InterludeEntry>): Promise<string | null> {
  const source = await Bun.file(interludesFile).text();
  const next = serializeGaps(source, gaps);
  await Bun.write(interludesFile, next);

  const rel = "packages/content/src/interludes.ts";
  const proc = Bun.spawn([process.execPath, "x", "biome", "check", "--write", rel], {
    cwd: repoRootPath,
    stdout: "pipe",
    stderr: "pipe",
  });
  const code = await proc.exited;
  if (code === 0) return null;
  return await new Response(proc.stderr).text();
}

const server = Bun.serve({
  port,
  hostname: process.env.DIRECTOR_HOST ?? "::",
  development: true,
  routes: {
    "/": indexHtml,

    /**
     * The game itself, from this tree's source, so the main menu has a door
     * that does not depend on a preview server being up. It is the only door:
     * the menu stays out of the way of a plain game URL, and this link carries
     * `?menu` (see `apps/game/src/menu.ts`).
     *
     * Never the bundle a *check* is read off. This is a hot bundle of the
     * working tree, like `bun run dev:game`; `bun run preview` on its own port
     * is what an agent verifies against, and `/__preview` is still the only
     * thing that can say which server answered.
     */
    "/game": gameHtml,

    "/__director": {
      GET: withIdle(() => Response.json({ app: marker, pid: process.pid, port, tree: treeId })),
    },

    "/__director/quit": {
      GET: withIdle(() => {
        setTimeout(() => process.exit(0), 30);
        return new Response("bye", { headers: noCache });
      }),
    },

    "/api/waves": {
      GET: withIdle(async () => Response.json(await readWaves(), { headers: noCache })),
      PUT: withIdle(async (req) => {
        try {
          const waves = (await req.json()) as Wave[];
          const complaint = await writeWaves(waves);
          if (complaint) return Response.json({ error: complaint }, { status: 500 });
          console.log(`wrote ${waves.length} waves`);
          return Response.json({ ok: true }, { headers: noCache });
        } catch (err) {
          return Response.json({ error: String(err) }, { status: 400 });
        }
      }),
    },

    /**
     * `GAPS`: which wave's gap, if any, carries an interlude. The counterpart
     * of `/api/waves` for the one authored table a wave's own fields do not
     * cover — see `interlude-panel.ts`.
     */
    "/api/interludes": {
      GET: withIdle(async () => Response.json(await readGaps(), { headers: noCache })),
      PUT: withIdle(async (req) => {
        try {
          const gaps = (await req.json()) as Record<number, InterludeEntry>;
          const complaint = await writeGaps(gaps);
          if (complaint) return Response.json({ error: complaint }, { status: 500 });
          console.log(`wrote ${Object.keys(gaps).length} interludes`);
          return Response.json({ ok: true }, { headers: noCache });
        } catch (err) {
          return Response.json({ error: String(err) }, { status: 400 });
        }
      }),
    },

    /**
     * The backlog: what the design has agreed to and the game does not have,
     * grouped by what each thing would become — spec, queue and design
     * documents alike. See `backlog-api.ts`, split out for the same reason
     * the TO CHECK routes below are: a request handler is not the file where
     * a server binds its port.
     */
    "/api/backlog": {
      GET: withIdle(() => backlogState(repoRootPath)),
    },

    /**
     * TO CHECK: what landed on `main` that only this machine can look at.
     *
     * The list is derived from `Check:` trailers in the history — a cloud
     * session cannot open a shape sheet or watch a wave at tempo, so it names
     * what it left unlooked-at in the commit itself. `docs/verified.md` holds
     * the other half, which nothing can derive: whether somebody looked.
     */
    "/api/checks": {
      GET: withIdle(() => checksState(repoRootPath)),
    },

    "/api/checks/decide": {
      POST: withIdle((req) => checksDecide(repoRootPath, req)),
    },

    "/api/checks/run": {
      POST: withIdle((req) => checksRun(repoRootPath, req)),
    },

    /** Deleting a branch is a button, never a consequence of loading a page. */
    "/api/checks/clean": {
      POST: withIdle((req) => checksClean(repoRootPath, req)),
    },

    /**
     * Every spec file, verbatim. The roster and concept endpoints parse the
     * design into entries, and a parse is a choice about what to keep — the
     * naming rules, the categories, the rejected names and the ceiling are
     * none of them an entry. This is the catch-all that makes "what does the
     * spec say" answerable in the editor rather than in a text editor beside
     * it: the directory is read, so a new file appears here without being
     * added to a list.
     */
    "/api/spec": {
      GET: withIdle(async () => {
        const dir = Bun.fileURLToPath(specDir);
        const names = (await readdir(dir)).filter((n) => n.endsWith(".md")).sort();
        const files = await Promise.all(
          names.map(async (name) => ({ name, text: await Bun.file(join(dir, name)).text() })),
        );
        return Response.json({ files }, { headers: noCache });
      }),
    },
  },
  fetch() {
    return new Response("not found", { status: 404, headers: noCache });
  },
});

resetIdle();
console.log(`director on http://localhost:${server.port} — pid ${process.pid}`);
console.log(`editing ${treeId}`);

if (!hot.signalsBound) {
  hot.signalsBound = true;
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      server.stop(true);
      process.exit(0);
    });
  }
}
