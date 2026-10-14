/**
 * The act files, and the save that writes a wave list back across them.
 *
 * Split from `waves-api.ts` when the read side grew a memo: that file holds
 * the two routes and the base-revision guard, and this holds where the waves
 * live on disk and how a flat list is cut up to reach them. Nothing here
 * imports the route file, so the two read one way round.
 */

import { join } from "node:path";
import type { Wave } from "@neon-spore/content";
import type { PinballRound } from "@neon-spore/sim";
import { SCOUT_LISTS, type ScoutList } from "./scout-lists.js";
import { serializeWaveArray } from "./serialize.js";
import { serializePinballRounds } from "./serialize-pinball.js";
import { serializeScoutArenas } from "./serialize-scout.js";
import {
  ACT_FILES,
  ACT_LIST,
  type ActFile,
  type ActList,
  actFilesIn,
  beside,
  nameOf,
} from "./waves-act-files.js";
import {
  type ActName,
  actListSource,
  assignToActs,
  cutAct,
  fixImports,
  idsInAct,
  knownImports,
  pageRoot,
} from "./waves-act-list.js";

export { ACT_FILES, ACT_LIST, type ActFile, type ActList };

export const repoRootPath = Bun.fileURLToPath(new URL("../../../", import.meta.url));

/**
 * PINBALL's boards, which are the one piece of authored boss content that does
 * not live in an act file (`serialize-pinball.ts` says why). It is hashed
 * into the token (`wavesToken`) and written on a save exactly like an act, so
 * a board painted in the editor lands somewhere and a board changed
 * underneath refuses — the first half of that sentence was untrue until
 * 14 September 2026, and `wave-save.test.ts` holds it now.
 */
const pinballFile = new URL("../../../packages/content/src/pinball-rounds.ts", import.meta.url);
const pinballRel = "packages/content/src/pinball-rounds.ts";

/**
 * THE SCOUT's levels, the second such file and for the same reason
 * (`serialize-scout.ts`) — one list a scout wave, each in its own file
 * (`scout-lists.ts`).
 */
const SCOUT_FILES: readonly ScoutFile[] = SCOUT_LISTS.map((l) => ({
  ...l,
  file: new URL(`../../../${l.rel}`, import.meta.url),
}));

/**
 * The files a save reads and writes, and the tree Biome runs in.
 *
 * One object with the real tree as its default, rather than three module
 * constants, because the save test hands in a copy. `tools/check/shard.ts`
 * runs the suite as eight processes on the premise that every writer takes a
 * `mkdtemp` of its own, and until 14 September 2026 this was the one writer
 * that did not: `wave-save.test.ts` saved into the checked-in act files, and
 * `waves-memo.test.ts` in another shard hashed them between two of the
 * writes, saw a token that had moved, and read the barrel a second time.
 */
export interface WaveFiles {
  /** What every `rel` is relative to, and Biome's working directory. */
  readonly root: string;
  readonly acts: readonly ActFile[];
  /** The list of act files (`acts.ts`). With it, a save reads its acts off
   * the list, and may cut a full act into a new file and list it; without
   * it, `acts` is taken as given and never grows. */
  readonly list?: ActList;
  /** PINBALL's board file, written beside the acts when the list holds a pinball wave. */
  readonly boards: { readonly file: URL; readonly rel: string };
  /** THE SCOUT's arena files, one a scout wave, written the same way when the list holds it. */
  readonly arenas: readonly ScoutFile[];
}

/** A scout wave's arena list (`scout-lists.ts`), and where this save finds it. */
export interface ScoutFile extends ScoutList {
  readonly file: URL;
}

/** The checkout this director is running in — what a save writes unless told otherwise. */
export const REAL_FILES: WaveFiles = {
  root: repoRootPath,
  // Read off the list each time it is asked, so the token hashes an act the
  // last save cut (`wavesToken`).
  get acts() {
    return actFilesIn(ACT_LIST);
  },
  list: ACT_LIST,
  boards: { file: pinballFile, rel: pinballRel },
  arenas: SCOUT_FILES,
};

const BIOME = join(repoRootPath, "node_modules", "@biomejs", "biome", "bin", "biome");

/**
 * Write the array back across the act files, then let Biome have the
 * last word on formatting. The serializer already aims at Biome's output —
 * the round-trip test holds it to that — but a wave nobody has written yet
 * may wrap in a way the test never saw, and a save that turns the tree red is
 * not a save.
 */
export interface Written {
  /** What Biome said, when it refused. */
  complaint: string | null;
  /** The files this save touched, repository-relative — what gets committed. */
  rels: string[];
}

export async function writeWaves(waves: Wave[], files: WaveFiles = REAL_FILES): Promise<Written> {
  // The list is read again rather than trusted: the last save may have cut an
  // act this module has never heard of (`waves-act-list.ts`).
  const acts = files.list ? actFilesIn(files.list) : [...files.acts];
  const sources = await Promise.all(acts.map((act) => Bun.file(act.file).text()));
  const homes = assignToActs(
    waves,
    acts.map((act, i) => idsInAct(sources[i] ?? "", act.exportName)),
  );
  const taken = new Set(acts.map(nameOf));
  const known = knownImports(sources);
  const written: ActFile[] = [];
  const order: ActName[] = [];
  for (const [i, act] of acts.entries()) {
    const own: ActName = { name: nameOf(act), exportName: act.exportName };
    const source = sources[i] ?? "";
    const mine = homes[i] ?? [];
    // Only a save that can rewrite the list may cut a new act: a file nobody
    // lists is a file the game never loads.
    let pieces = files.list
      ? cutAct(own, source, mine, taken)
      : [{ act: own, text: serializeWaveArray(source, mine, act.exportName) }];
    // What does not fit goes on into the act's own next page when it has one,
    // and only the last page cuts a new file — otherwise a second cut of act
    // one became `act-1-p3` and played before `act-1-p2`.
    const next = acts[i + 1];
    const [first, ...rest] = pieces;
    if (first && rest.length > 0 && next && pageRoot(nameOf(next)) === pageRoot(own.name)) {
      homes[i + 1] = [
        ...rest.flatMap((p) => ("waves" in p ? p.waves : [])),
        ...(homes[i + 1] ?? []),
      ];
      for (const p of rest) taken.delete(p.act.name);
      pieces = [first];
    }
    for (const piece of pieces) {
      const file = piece.act.name === own.name ? act : beside(act, piece.act);
      await Bun.write(file.file, fixImports(piece.text, known));
      written.push(file);
      order.push(piece.act);
    }
  }
  const listed: string[] = [];
  if (files.list && order.length !== acts.length) {
    const source = await Bun.file(files.list.file).text();
    await Bun.write(files.list.file, actListSource(source, order));
    listed.push(files.list.rel);
  }

  const rels = [
    ...written.map((act) => act.rel),
    ...listed,
    ...(await writeBoards(waves, files)),
    ...(await writeArenas(waves, files)),
  ];
  // The repository's own Biome by path, not `bun x biome`: run from a tree
  // that has no `node_modules`, the latter resolves the package from the
  // network first — ten seconds, on the day this was measured.
  const proc = Bun.spawn([process.execPath, BIOME, "check", "--write", ...rels], {
    cwd: files.root,
    stdout: "pipe",
    stderr: "pipe",
  });
  const code = await proc.exited;
  if (code === 0) return { complaint: null, rels };
  return { complaint: await new Response(proc.stderr).text(), rels };
}

/**
 * PINBALL's boards, if the list holds a pinball wave. Returns the files it
 * wrote, so the caller's Biome pass covers them.
 *
 * **Exactly one pinball wave may own the list.** Two would both be serialized
 * into `PINBALL_ROUNDS` and the second would win silently, which is the
 * failure mode this whole route was rewritten to make impossible — so a second
 * one is left alone and says so in the log rather than being written. A
 * second pinball wave wants a second list, and that is an authoring decision
 * rather than something a save should make on its own.
 */
async function writeBoards(waves: readonly Wave[], files: WaveFiles): Promise<string[]> {
  const owners = waves.filter((w) => w.boss?.kind === "pinball");
  if (owners.length === 0) return [];
  if (owners.length > 1) {
    console.log(`${owners.length} pinball waves share one board list — none written`);
    return [];
  }
  const boss = owners[0]?.boss;
  if (boss === undefined || boss.kind !== "pinball") return [];
  const rounds: readonly PinballRound[] = boss.rounds;
  const source = await Bun.file(files.boards.file).text();
  await Bun.write(files.boards.file, serializePinballRounds(source, rounds));
  return [files.boards.rel];
}

/**
 * THE SCOUT's arenas: each scout wave's levels into its own list, under
 * `writeBoards`' rule — exactly one wave may own a list, so a second wave of
 * the same id, or a scout wave with no list in `scout-lists.ts`, is left alone
 * and says so.
 */
async function writeArenas(waves: readonly Wave[], files: WaveFiles): Promise<string[]> {
  const rels: string[] = [];
  const scouts = waves.filter((w) => w.boss?.kind === "scout");
  for (const w of scouts) {
    if (!files.arenas.some((a) => a.wave === w.id))
      console.log(`scout wave ${w.id} has no arena list — its levels not written`);
  }
  for (const list of files.arenas) {
    const owners = scouts.filter((w) => w.id === list.wave);
    if (owners.length > 1) console.log(`${owners.length} waves own ${list.name} — none written`);
    const boss = owners.length === 1 ? owners[0]?.boss : undefined;
    if (boss === undefined || boss.kind !== "scout") continue;
    const source = await Bun.file(list.file).text();
    await Bun.write(list.file, serializeScoutArenas(source, boss.arenas, list.name));
    rels.push(list.rel);
  }
  return rels;
}
