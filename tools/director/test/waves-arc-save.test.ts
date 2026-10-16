import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { WAVES } from "@neon-spore/content";
import { TUTORIAL_LAST_ID } from "../src/compose-steps.js";
import { ACT_LIST, actFilesIn, nameOf } from "../src/waves-act-files.js";
import { idsInAct } from "../src/waves-act-list.js";
import { REAL_FILES, type WaveFiles, writeWaves } from "../src/waves-acts.js";
import { arcActs, arcLength } from "../src/waves-recut-write.js";

/**
 * **A save that moves waves into the tutorial arc keeps the arc's acts
 * whole.** On 16 October 2026 THE BLISTER's nine were moved from act 8 into
 * the arc and saved: each kept the act it was in, and every arc wave after
 * them followed them into act 8, so acts 1b to 7 came back empty
 * (`ArcEnd` in `waves-act-list.ts`). Into a copy of the acts and their list,
 * in a directory of its own — the shard rule `wave-save.test.ts` explains.
 */

let dir = "";
let copy: WaveFiles;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "neon-spore-arc-"));
  const copied = async (from: URL, rel: string) => {
    const at = join(dir, rel);
    await mkdir(dirname(at), { recursive: true });
    await Bun.write(at, Bun.file(from));
    return pathToFileURL(at);
  };
  const list = { ...ACT_LIST, file: await copied(ACT_LIST.file, ACT_LIST.rel) };
  for (const act of actFilesIn(ACT_LIST)) await copied(act.file, act.rel);
  const boards = {
    ...REAL_FILES.boards,
    file: await copied(REAL_FILES.boards.file, REAL_FILES.boards.rel),
  };
  const arenas = [];
  for (const a of REAL_FILES.arenas) arenas.push({ ...a, file: await copied(a.file, a.rel) });
  const biome = (await Bun.file(join(REAL_FILES.root, "biome.json")).json()) as Record<
    string,
    unknown
  >;
  delete biome.vcs;
  await Bun.write(join(dir, "biome.json"), JSON.stringify(biome));
  copy = { root: dir, acts: actFilesIn(list), list, boards, arenas };
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

test("a block moved from after the arc into it leaves every arc act full and in play order", async () => {
  if (!copy.list) throw new Error("the copy has no list");
  const sources = await Promise.all(copy.acts.map((a) => Bun.file(a.file).text()));
  // The first act after the arc's, moved in after the arc's fifth wave: the
  // first that passes `untaughtKeys` there, and far enough up that four arc
  // acts stand between where it lands and where it came from.
  const from = copy.acts[arcActs(sources, copy.acts)];
  if (!from) throw new Error("no act after the arc");
  const ids = new Set(idsInAct(sources[copy.acts.indexOf(from)] ?? "", from.exportName));
  const moved = WAVES.filter((w) => ids.has(w.id));
  const rest = WAVES.filter((w) => !ids.has(w.id));
  const waves = [...rest.slice(0, 5), ...moved, ...rest.slice(5)];
  expect(moved.length).toBeGreaterThan(5);

  const { complaint } = await writeWaves(waves, copy);
  expect(complaint).toBeNull();

  const acts = actFilesIn(copy.list);
  const held = await Promise.all(
    acts.map(async (a) => idsInAct(await Bun.file(a.file).text(), a.exportName)),
  );
  const last = held.findIndex((h) => h.includes(TUTORIAL_LAST_ID));
  const arc = held.slice(0, last + 1);
  for (const [i, h] of arc.entries())
    expect({ act: nameOf(acts[i] as never), n: h.length > 0 }).toEqual({
      act: nameOf(acts[i] as never),
      n: true,
    });
  expect(arc.flat()).toEqual(waves.slice(0, arcLength(waves)).map((w) => w.id));
  expect(held.flat()).toEqual(waves.map((w) => w.id));
});
