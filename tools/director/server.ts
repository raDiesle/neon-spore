import type { Wave } from "@neon-spore/content";
import indexHtml from "./index.html";
import { parseConcepts } from "./src/concepts.js";
import { parseRoster } from "./src/roster.js";
import { serializeWaves } from "./src/serialize.js";

/**
 * The director's server. It exists for one reason the game's preview does not
 * have: a browser cannot write a file, and the whole point of the editor is
 * that what you place ends up in `packages/content/src/waves.ts` as a diff you
 * can read.
 *
 * It borrows the preview server's hygiene, and for the same reasons: a fixed
 * port so a second start collides instead of quietly moving, a collision
 * resolved by asking an older copy to quit rather than by killing a process we
 * did not recognise, and an idle exit so a leaked one dies without help.
 *
 * Run it through `bun run dev`, from the repository root.
 */

const port = Number(process.env.DIRECTOR_PORT ?? 4174);
const wavesFile = new URL("../../packages/content/src/waves.ts", import.meta.url);
const bestiaryFile = new URL("../../docs/spec/bestiary.md", import.meta.url);
const bossesFile = new URL("../../docs/spec/bosses.md", import.meta.url);
const couplingsFile = new URL("../../docs/spec/couplings.md", import.meta.url);
const assistsFile = new URL("../../docs/spec/assists.md", import.meta.url);
const systemsFile = new URL("../../docs/spec/systems.md", import.meta.url);
const ideasFile = new URL("../../docs/spec/ideas.md", import.meta.url);
const repoRoot = new URL("../../", import.meta.url);
const marker = "neon-spore-director";
// Longer than the preview's 30 seconds: this one is left open while a
// person thinks about a wave, which is not the same as an agent forgetting it.
const idleMs = Number(process.env.DIRECTOR_IDLE_MS ?? 60 * 60 * 1000);

const loopbacks = ["127.0.0.1", "[::1]"] as const;

interface DirectorHotState {
  booted: boolean;
  signalsBound: boolean;
  idle: ReturnType<typeof setTimeout> | undefined;
}

const globalDirector = globalThis as unknown as { __director?: DirectorHotState };
globalDirector.__director ??= { booted: false, signalsBound: false, idle: undefined };
const hot = globalDirector.__director;

async function probe(host: string): Promise<{ app?: string } | null> {
  let res: Response;
  try {
    res = await fetch(`http://${host}:${port}/__director`, { signal: AbortSignal.timeout(700) });
  } catch {
    return null;
  }
  try {
    const body = (await res.json()) as { app?: string };
    return res.ok && typeof body.app === "string" ? body : {};
  } catch {
    return {};
  }
}

async function reclaim(host: string): Promise<void> {
  const found = await probe(host);
  if (found === null) return;
  if (found.app !== marker) {
    console.error(
      `port ${port} on ${host} is held by something that is not the director.
Stop it yourself, or set DIRECTOR_PORT — this script will not kill an unknown process.`,
    );
    process.exit(1);
  }
  await fetch(`http://${host}:${port}/__director/quit`).catch(() => {});
  for (let i = 0; i < 40; i++) {
    if ((await probe(host)) === null) return;
    await Bun.sleep(50);
  }
  console.error(`the previous director on ${host}:${port} did not exit.`);
  process.exit(1);
}

if (!hot.booted) {
  hot.booted = true;
  for (const host of loopbacks) await reclaim(host);
}

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
    cwd: Bun.fileURLToPath(repoRoot),
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

    "/__director": {
      GET: withIdle(() => Response.json({ app: marker, pid: process.pid, port })),
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

    "/api/roster": {
      GET: withIdle(async () => {
        const bestiary = await Bun.file(bestiaryFile).text();
        const bosses = await Bun.file(bossesFile).text();
        return Response.json(parseRoster(bestiary, bosses), { headers: noCache });
      }),
    },

    "/api/concepts": {
      GET: withIdle(async () => {
        const [couplings, assists, systems, ideas] = await Promise.all([
          Bun.file(couplingsFile).text(),
          Bun.file(assistsFile).text(),
          Bun.file(systemsFile).text(),
          Bun.file(ideasFile).text(),
        ]);
        return Response.json(parseConcepts(couplings, assists, systems, ideas), {
          headers: noCache,
        });
      }),
    },
  },
  fetch() {
    return new Response("not found", { status: 404, headers: noCache });
  },
});

resetIdle();
console.log(`director on http://localhost:${server.port} — pid ${process.pid}`);

if (!hot.signalsBound) {
  hot.signalsBound = true;
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      server.stop(true);
      process.exit(0);
    });
  }
}
