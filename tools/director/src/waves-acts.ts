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
import { countWaveArray, serializeWaveArray } from "./serialize.js";
import { serializePinballRounds } from "./serialize-pinball.js";

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

export interface ActFile {
  file: URL;
  rel: string;
  exportName: string;
}

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
  /** PINBALL's board file, written beside the acts when the list holds a pinball wave. */
  readonly boards: { readonly file: URL; readonly rel: string };
}

/**
 * The act files, **in the order `waves.ts` concatenates them** — which is the
 * order of the game and not of the names: `act-3b.ts` is the second half of act
 * three and stands between act three and act four, because a file is cut where
 * it fills up rather than where the game changes subject.
 *
 * A save splits the incoming flat list back across them at
 * each act's *current* length, except the last, which takes whatever is left
 * over — so a wave appended in the editor lands in the newest act
 * without either act needing to say which waves are its own.
 */
export const ACT_FILES: readonly ActFile[] = [
  {
    file: new URL("../../../packages/content/src/waves/act-1.ts", import.meta.url),
    rel: "packages/content/src/waves/act-1.ts",
    exportName: "WAVES_ACT_1",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-1b.ts", import.meta.url),
    rel: "packages/content/src/waves/act-1b.ts",
    exportName: "WAVES_ACT_1B",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-2.ts", import.meta.url),
    rel: "packages/content/src/waves/act-2.ts",
    exportName: "WAVES_ACT_2",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-3.ts", import.meta.url),
    rel: "packages/content/src/waves/act-3.ts",
    exportName: "WAVES_ACT_3",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-3b.ts", import.meta.url),
    rel: "packages/content/src/waves/act-3b.ts",
    exportName: "WAVES_ACT_3B",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-4.ts", import.meta.url),
    rel: "packages/content/src/waves/act-4.ts",
    exportName: "WAVES_ACT_4",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-4b.ts", import.meta.url),
    rel: "packages/content/src/waves/act-4b.ts",
    exportName: "WAVES_ACT_4B",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-5.ts", import.meta.url),
    rel: "packages/content/src/waves/act-5.ts",
    exportName: "WAVES_ACT_5",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-6.ts", import.meta.url),
    rel: "packages/content/src/waves/act-6.ts",
    exportName: "WAVES_ACT_6",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7.ts",
    exportName: "WAVES_ACT_7",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7a.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7a.ts",
    exportName: "WAVES_ACT_7A",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7b.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7b.ts",
    exportName: "WAVES_ACT_7B",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7c.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7c.ts",
    exportName: "WAVES_ACT_7C",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7d.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7d.ts",
    exportName: "WAVES_ACT_7D",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7e.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7e.ts",
    exportName: "WAVES_ACT_7E",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7f.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7f.ts",
    exportName: "WAVES_ACT_7F",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7g.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7g.ts",
    exportName: "WAVES_ACT_7G",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-8.ts", import.meta.url),
    rel: "packages/content/src/waves/act-8.ts",
    exportName: "WAVES_ACT_8",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-9.ts", import.meta.url),
    rel: "packages/content/src/waves/act-9.ts",
    exportName: "WAVES_ACT_9",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-10.ts", import.meta.url),
    rel: "packages/content/src/waves/act-10.ts",
    exportName: "WAVES_ACT_10",
  },
];

/** The checkout this director is running in — what a save writes unless told otherwise. */
export const REAL_FILES: WaveFiles = {
  root: repoRootPath,
  acts: ACT_FILES,
  boards: { file: pinballFile, rel: pinballRel },
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
  let offset = 0;
  const acts = files.acts;
  for (let i = 0; i < acts.length; i++) {
    const act = acts[i]!;
    const isLast = i === acts.length - 1;
    // Counted in the source rather than imported: the file is read a line
    // later anyway, and importing it once per act per save was the other half
    // of the module leak `lastRead` above describes.
    const source = await Bun.file(act.file).text();
    const currentLen = countWaveArray(source, act.exportName);
    const remaining = waves.length - offset;
    const count = isLast ? remaining : Math.min(currentLen, remaining);
    const slice = waves.slice(offset, offset + count);
    offset += slice.length;

    const next = serializeWaveArray(source, slice, act.exportName);
    await Bun.write(act.file, next);
  }

  const rels = [...acts.map((act) => act.rel), ...(await writeBoards(waves, files))];
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
