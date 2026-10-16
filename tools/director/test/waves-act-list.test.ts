import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { WAVES, type Wave } from "@neon-spore/content";
import { lineCount } from "../../hooks/file-size.ts";
import { ACT_LIST, actFilesIn } from "../src/waves-act-files.js";
import {
  actListSource,
  assignToActs,
  CUT_AT,
  exportNameFor,
  freshActName,
  idsInAct,
  parseActList,
} from "../src/waves-act-list.js";
import { REAL_FILES, type WaveFiles, writeWaves } from "../src/waves-acts.js";

/**
 * The act list and the save that keeps a wave in its own act and cuts a full
 * one (`waves-act-list.ts`), for a game heading for a thousand waves.
 */

const plain = (id: string): Wave => ({ id, name: id.toUpperCase(), entries: [] });

describe("the list of act files", () => {
  test("reads the real list, every act in it, in the game's order", async () => {
    const source = await Bun.file(ACT_LIST.file).text();
    const acts = parseActList(source);
    expect(acts[0]).toEqual({ name: "act-1", exportName: "WAVES_ACT_1" });
    // `act-1b` plays after act one's last page, whatever its name says.
    const names = acts.map((a) => a.name);
    const pages = names.filter((n) => n === "act-1" || n.startsWith("act-1-p"));
    expect(names.indexOf("act-1b")).toBe(names.indexOf(pages[pages.length - 1] ?? "") + 1);
    let total = 0;
    for (const act of actFilesIn(ACT_LIST)) {
      total += idsInAct(await Bun.file(act.file).text(), act.exportName).length;
    }
    expect(total).toBe(WAVES.length);
  });

  test("writes back what it read, byte for byte", async () => {
    const source = await Bun.file(ACT_LIST.file).text();
    expect(actListSource(source, parseActList(source))).toBe(source);
  });

  test("names a cut file after the act it came from", () => {
    expect(freshActName("act-1", new Set(["act-1"]))).toBe("act-1-p2");
    expect(freshActName("act-1-p2", new Set(["act-1", "act-1-p2"]))).toBe("act-1-p3");
    expect(exportNameFor("act-1-p2")).toBe("WAVES_ACT_1_P2");
  });
});

describe("which act a saved wave goes to", () => {
  const ids = [
    ["a", "b"],
    ["c", "d"],
  ];

  test("keeps every wave in the act that holds it", () => {
    const out = assignToActs(["a", "b", "c", "d"].map(plain), ids);
    expect(out.map((act) => act.map((w) => w.id))).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  test("puts a new wave in the act of the wave before it, and moves nothing else", () => {
    const out = assignToActs(["a", "new1", "new2", "b", "c", "d"].map(plain), ids);
    expect(out.map((act) => act.map((w) => w.id))).toEqual([
      ["a", "new1", "new2", "b"],
      ["c", "d"],
    ]);
  });

  test("never goes back: a wave dragged up joins the act it was dropped in", () => {
    const out = assignToActs(["a", "d", "b", "c"].map(plain), ids);
    expect(out.map((act) => act.map((w) => w.id))).toEqual([["a"], ["d", "b", "c"]]);
  });
});

/** A save into a copy of the real acts and their list, in a directory of its
 * own — the shard rule `wave-save.test.ts` explains. */
describe("a save that fills an act", () => {
  let dir = "";
  let copy: WaveFiles;

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "neon-spore-acts-"));
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

  test("fills the act's own pages in order, cuts the last, and touches no other act", async () => {
    if (!copy.list) throw new Error("the copy has no list");
    const second = copy.acts.find((a) => !/\/act-1(-p\d+)?\.ts$/.test(a.rel));
    if (!second) throw new Error("no second act");
    const before = await Bun.file(second.file).text();

    // More than act one and every page it has can hold, whatever they hold now
    // — on the first wave's panel, so they use nothing it has not taught
    // (`untaughtKeys`, which every save refuses a list for).
    const added = Array.from({ length: 120 }, (_, i) => ({
      id: `added${i}`,
      name: `ADDED ${i}`,
      entries: [{ beat: 0, col: 5, color: "red" as const }],
      controls: WAVES[0]?.controls,
    }));
    const waves = [WAVES[0] as Wave, ...added, ...WAVES.slice(1)];
    const { complaint, rels } = await writeWaves(waves, copy);
    expect(complaint).toBeNull();

    // Act one and its pages, in page order, with one new page at their end.
    const acts = actFilesIn(copy.list);
    const pages = acts.map((a) => a.exportName).filter((n) => /^WAVES_ACT_1(_P\d+)?$/.test(n));
    const had = copy.acts.filter((a) => /\/act-1(-p\d+)?\.ts$/.test(a.rel)).length;
    expect(pages.length).toBeGreaterThan(had);
    expect(pages).toEqual(pages.map((_, i) => (i === 0 ? "WAVES_ACT_1" : `WAVES_ACT_1_P${i + 1}`)));
    expect(acts.slice(0, pages.length).map((a) => a.exportName)).toEqual(pages);
    expect(rels).toContain(copy.list.rel);
    expect(await Bun.file(second.file).text()).toBe(before);

    const order: string[] = [];
    for (const act of acts) {
      const text = await Bun.file(act.file).text();
      expect(lineCount(text)).toBeLessThanOrEqual(CUT_AT + 10);
      order.push(...idsInAct(text, act.exportName));
    }
    expect(order).toEqual(waves.map((w) => w.id));
  });
});
