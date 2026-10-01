/**
 * `GET /api/waves` and `PUT /api/waves` — the only route in the director that
 * writes source files, and therefore the only one that can destroy work.
 *
 * It used to be last-write-wins over the whole list: the page sent the array it
 * had loaded, the server wrote it across the three act files, and a wave added
 * to a later act by anything else in between was gone. No error, no conflict,
 * nothing to see until `git diff` — which is the failure mode this repo takes
 * least kindly to, because the loss is silent and arrives hours later.
 *
 * The guard is a base revision, not a merge. `GET` answers with a token — a
 * hash of the three act files as they are on disk — and `PUT` will only write
 * if the files still hash to the token the page was given. If they do not, it
 * refuses with 409 and writes nothing at all; the page says so and the author
 * reloads. Merging two wave arrays is a great deal of machinery for a
 * repository one person works on, and refusing to clobber is the property that
 * actually matters.
 *
 * A successful `PUT` answers with the *new* token, so a page can go on saving
 * without a reload after each save. Biome runs after the write and may change
 * the bytes, so that token is taken after it, not before.
 *
 * A successful write is also a commit, of exactly the files it wrote — see
 * `waves-commit.ts` for why authoring lands as authoring rather than as one
 * shapeless diff at the end of an afternoon — and before the commit the perf
 * baseline is brought up to the waves as saved (`waves-baseline.ts`), so a
 * save cannot leave `main` red over a row for a wave that no longer exists.
 *
 * Split out of `server.ts` for the reason the backlog and notes routes were: a
 * request handler is not the file where a server binds its port, and that file
 * is at its line limit. `waves-acts.ts` was split out of *this* one for the
 * same reason: where the waves live on disk and how a flat list is cut back
 * across the acts is not the routes, the guard, or the read.
 */

import type { Wave } from "@neon-spore/content";
import { REAL_FILES, type WaveFiles, writeWaves } from "./waves-acts.js";
import { BASELINE_REL, markBaseline } from "./waves-baseline.js";
import { commitWaves } from "./waves-commit.js";

export { ACT_FILES, type ActFile, REAL_FILES, type WaveFiles } from "./waves-acts.js";

/**
 * The barrel — read for the current wave list, never written to. It only
 * concatenates the acts, so a save never touches it.
 */
const wavesFile = new URL("../../../packages/content/src/waves.ts", import.meta.url);

const noCache = { "cache-control": "no-store, must-revalidate" } as const;

/** What `GET /api/waves` answers, and what the page keeps until it saves. */
export interface WavesView {
  waves: Wave[];
  /** The act files as they were when this list was read — see `wavesToken`. */
  token: string;
}

/**
 * A fingerprint of the act files' contents, and the board file's with them.
 *
 * The board file — and THE SCOUT's arena file beside it, since 29 September
 * 2026 — is in the hash because a save writes it (`waves-acts.ts`),
 * and a file a save writes is a file a save can overwrite: from the day the
 * director began writing boards, 2 September 2026, its comment said the file
 * was "read into the token" while only the acts were, so a board edited on
 * disk under an open page was lost to that page's next save without a word —
 * the one loss the token exists to refuse. Found 14 September 2026.
 *
 * Contents rather than mtime: a checkout, a stash pop or a rebase moves an
 * mtime without changing a wave, and would refuse a save that was never in
 * danger. `Bun.hash` is wyhash and not a cryptographic digest, which is the
 * right size of tool — this is here to catch an edit nobody meant to lose, not
 * an adversary. The length is folded in so a file that loses its tail and a
 * file that gains an identical one cannot collide.
 */
export async function wavesToken(files: WaveFiles = REAL_FILES): Promise<string> {
  const hashed = [
    ...files.acts.map((act) => act.file),
    files.boards.file,
    ...files.arenas.map((a) => a.file),
  ];
  const texts = await Promise.all(hashed.map((file) => Bun.file(file).text()));
  const joined = texts.map((t) => `${t.length}\0${t}`).join("\0");
  return Bun.hash(joined).toString(16);
}

/**
 * The last list read, and the token of the files it came from.
 *
 * The read is a dynamic `import()`, and Bun keeps one module record per
 * distinct URL for the life of the process. The cache-buster used to be
 * `Date.now()`, so every `GET /api/waves` leaked one — one per twenty-five
 * seconds, in a server a beating tab holds up all afternoon — and two GETs in
 * the same millisecond shared a URL, so one could answer with a list from
 * before a save. The token fixes both, being a hash of the files themselves:
 * unchanged content answers from memory and cannot be stale, changed content
 * is a URL the loader has not seen, and the records are bounded by edits
 * rather than by uptime.
 *
 * The array is handed out by reference and read, never written.
 */
let lastRead: { token: string; waves: Wave[] } | null = null;
let imports = 0;

/** How many times the barrel was actually imported — for the memo's test. */
export function wavesImportCount(): number {
  return imports;
}

/**
 * The waves as they are on disk right now, not as they were bundled. Takes the
 * token when the caller has one, so a `GET` hashes the act files once.
 */
export async function readWaves(token?: string): Promise<Wave[]> {
  const key = token ?? (await wavesToken());
  if (lastRead?.token === key) return lastRead.waves;
  imports++;
  const mod = (await import(`${wavesFile.href}?t=${key}`)) as { WAVES: Wave[] };
  lastRead = { token: key, waves: mod.WAVES };
  return mod.WAVES;
}

/** What the page is told when the act files moved under it. */
export const STALE_MESSAGE =
  "the act files changed on disk since this page loaded — nothing was written. Reload before saving.";

export async function wavesState(): Promise<Response> {
  // The token first, and the read given it: side by side, the list and the
  // fingerprint came from two different reads of the same files.
  const token = await wavesToken();
  const waves = await readWaves(token);
  return Response.json({ waves, token } satisfies WavesView, { headers: noCache });
}

/**
 * The write, guarded. The token is checked before anything is serialized, so a
 * refusal leaves every act file byte for byte as it was.
 */
export async function saveWaves(req: Request, files: WaveFiles = REAL_FILES): Promise<Response> {
  let body: { waves?: Wave[]; token?: string };
  try {
    body = (await req.json()) as { waves?: Wave[]; token?: string };
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 400, headers: noCache });
  }
  const waves = body.waves;
  if (!Array.isArray(waves)) {
    return Response.json({ error: "expected { waves, token }" }, { status: 400, headers: noCache });
  }
  if ((await wavesToken(files)) !== body.token) {
    return Response.json({ error: STALE_MESSAGE }, { status: 409, headers: noCache });
  }
  try {
    const { complaint, rels } = await writeWaves(waves, files);
    if (complaint) return Response.json({ error: complaint }, { status: 500, headers: noCache });
    console.log(`wrote ${waves.length} waves`);
    // After the write and after Biome, so the commit holds the bytes the page
    // is now based on. Never in front of the response: see `waves-commit.ts`.
    // The baseline first, so its row for a wave this save changed lands in
    // the same commit; offered to the commit, it is taken only if it moved.
    const unmarked = await markBaseline(files.root);
    if (unmarked) console.log(`baseline not marked — ${unmarked}`);
    const refused = await commitWaves([...rels, BASELINE_REL], waves.length, files.root);
    if (refused) console.log(`not committed — ${refused}`);
    return Response.json({ ok: true, token: await wavesToken(files) }, { headers: noCache });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 400, headers: noCache });
  }
}
