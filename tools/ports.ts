import { statSync } from "node:fs";

/**
 * Which port a server listens on, and which tree it belongs to.
 *
 * Both servers used to take one fixed port each — the preview 4173, the
 * director 4174 — and that was right while there was one checkout. It stops
 * being right the moment a session works in a worktree: two copies of the same
 * server, serving two different trees, wanting the same socket. The one that
 * starts second recognised the marker, decided the first was "an older copy of
 * itself", and retired it — taking down a server that was serving someone
 * else's code, and answering afterwards from a tree the other session was not
 * looking at. That is the same failure the fixed ports were chosen to prevent,
 * arriving through the other door.
 *
 * So a port belongs to a tree. The main checkout keeps the number that is
 * written down everywhere; every worktree derives its own from its path, the
 * same one every time, so a session can `curl` twice and get the same server.
 */

/** FNV-1a over the path, so the same worktree always lands on the same port. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * The repository root as a key: case-folded and forward-slashed, because the
 * same worktree is reached by both spellings on Windows and must not be given
 * two ports for it.
 */
export function treeKey(root: string): string {
  return root.replaceAll("\\", "/").replace(/\/+$/, "").toLowerCase();
}

/**
 * A worktree's `.git` is a *file* pointing at the real git directory; a normal
 * checkout's is a directory. Nothing else about a worktree is visible from
 * inside it without running git, and running git to pick a port would make
 * starting a server depend on a subprocess.
 */
export function isWorktree(root: string): boolean {
  try {
    return statSync(`${treeKey(root)}/.git`).isFile();
  } catch {
    // No `.git` at all — a tarball, or a checkout someone moved. Treat it as
    // the main tree: it is the only one, so the base port is free.
    return false;
  }
}

/**
 * The port a tree gets inside its server's band. Pure: the same path gives the
 * same number on both machines, which is what makes the number worth writing
 * down in a log and curling twice.
 */
export function derivePort(band: number, root: string): number {
  return band + (hash(treeKey(root)) % 100);
}

/**
 * `base` in the main checkout, a port of the tree's own inside a worktree.
 * `band` is the start of a hundred ports reserved for that one server, so the
 * preview and the director can never derive the same number.
 */
export function portFor(base: number, band: number, root: string): number {
  return isWorktree(root) ? derivePort(band, root) : base;
}

/** The hundred ports each server owns. Written down once, here. */
export const PREVIEW_BAND = 4200;
export const DIRECTOR_BAND = 4300;
/**
 * The relay's band. Its base is 8787 rather than a number of ours, because
 * that is wrangler's default and the one a person will type from memory.
 * `claimPort` is no use here — wrangler is not our server and answers no
 * marker — so the port is simply derived and handed to it with `--port`.
 */
export const RELAY_BAND = 8800;
export const RELAY_BASE = 8787;

/**
 * A port the operating system is not using, settled now rather than at bind
 * time. `port: 0` is the usual way to ask for one, and it answers a *different*
 * number every time it is asked — which is fine for a server that starts once
 * and wrong for one that may be restarted under an open tab. Asking here, and
 * handing the number down, is what lets a throwaway server keep its address
 * across a restart.
 */
export async function freePort(): Promise<number> {
  const probe = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch: () => new Response(null) });
  const { port } = probe;
  probe.stop(true);
  // Only a server bound to a unix socket has no port, and this one is not.
  if (port === undefined) throw new Error("asked for a free port and was given none");
  return port;
}

/** The port this tree's relay takes. Both the server and the check call it. */
export function relayPort(root: string): number {
  return portFor(RELAY_BASE, RELAY_BAND, root);
}

/**
 * Taking a port, with the hygiene both servers used to carry a copy of each.
 *
 * The order matters and is the whole design: the base port first, so a single
 * server in a single tree still answers where every document, launch config
 * and `curl` line says it does; the tree's derived port second, so a session
 * in a worktree steps aside from a server that is already serving another
 * tree instead of retiring it. An older copy of *this* tree's server is still
 * asked to stand down — that one really is a stale copy of itself.
 *
 * Throws rather than exiting, so the caller keeps the last word on its own
 * error message.
 */
export interface ClaimRequest {
  /** The port written down everywhere. Tried first, always. */
  base: number;
  /** The hundred ports this server owns, for the fallback. */
  band: number;
  /** Absolute path of the checkout being served. */
  tree: string;
  /** The `app` value this server's identity endpoint answers with. */
  marker: string;
  /** e.g. `/__preview`. */
  probePath: string;
  /** e.g. `/__preview/quit`. */
  quitPath: string;
  /** An explicit port from the environment. Then it is that port or nothing. */
  given?: number;
}

/** Both loopback families: a ghost on `::1` leaves `127.0.0.1` free. */
const LOOPBACKS = ["127.0.0.1", "[::1]"] as const;

type Verdict = "free" | "mine" | "other" | "stranger";

async function identify(
  host: string,
  port: number,
  path: string,
): Promise<{ app?: string; tree?: string } | null> {
  let res: Response;
  try {
    res = await fetch(`http://${host}:${port}${path}`, { signal: AbortSignal.timeout(700) });
  } catch {
    return null; // nothing listening, or not speaking HTTP
  }
  try {
    const body = (await res.json()) as { app?: string; tree?: string };
    // Anything that answers but does not answer *this* is a stranger — a dev
    // server handing back index.html for an unknown path lands here.
    return res.ok && typeof body.app === "string" ? body : {};
  } catch {
    return {};
  }
}

async function survey(req: ClaimRequest, port: number): Promise<Verdict> {
  const key = treeKey(req.tree);
  let worst: Verdict = "free";
  const rank: Record<Verdict, number> = { free: 0, mine: 1, other: 2, stranger: 3 };
  for (const host of LOOPBACKS) {
    const found = await identify(host, port, req.probePath);
    const verdict: Verdict =
      found === null
        ? "free"
        : found.app !== req.marker
          ? "stranger"
          : found.tree === key
            ? "mine"
            : "other";
    if (rank[verdict] > rank[worst]) worst = verdict;
  }
  return worst;
}

async function retire(req: ClaimRequest, port: number): Promise<void> {
  for (const host of LOOPBACKS) {
    if ((await survey(req, port)) !== "mine") continue;
    await fetch(`http://${host}:${port}${req.quitPath}`).catch(() => {});
    for (let i = 0; i < 40; i++) {
      if ((await identify(host, port, req.probePath)) === null) break;
      await Bun.sleep(50);
    }
    if ((await identify(host, port, req.probePath)) !== null) {
      throw new Error(`the previous ${req.marker} on ${host}:${port} did not exit.`);
    }
  }
}

/** The port to bind, having settled with whatever was already there. */
export async function claimPort(req: ClaimRequest): Promise<number> {
  const candidates =
    req.given === undefined ? [req.base, derivePort(req.band, req.tree)] : [req.given];

  for (const port of candidates) {
    const verdict = await survey(req, port);
    if (verdict === "stranger") {
      throw new Error(
        `port ${port} is held by something that is not the ${req.marker}.
Stop it yourself, or name a port in the environment — this script will not kill
a process it does not recognise.`,
      );
    }
    if (verdict === "mine") await retire(req, port);
    if (verdict !== "other") return port;
  }

  throw new Error(
    `both ${req.base} and ${derivePort(req.band, req.tree)} are held by a ${req.marker}
serving another checkout. Name a port in the environment to run beside them.`,
  );
}
