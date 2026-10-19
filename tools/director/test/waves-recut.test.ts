import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { WAVES, type Wave } from "@neon-spore/content";
import { lineCount } from "../../hooks/file-size.ts";
import { CUT_BY_ORDER } from "../../index/refresh.ts";
import { biomeLineCount } from "../src/biome-lines.js";
import { ACT_LIST, actFilesIn, nameOf } from "../src/waves-act-files.js";
import { CUT_AT, idsInAct, knownImports } from "../src/waves-act-list.js";
import { recutActs } from "../src/waves-recut.js";
import { arcActs, arcLength, numberAfter } from "../src/waves-recut-write.js";

/**
 * **The acts after the tutorial arc, cut in the order they are played**
 * (`waves-recut.ts`): whole blocks to a file under the ceiling, a header that
 * says which waves of the game a file holds and whose, and a reorder that
 * re-cuts rather than piling the moved waves onto the end.
 */

const acts = actFilesIn(ACT_LIST);
const sources = acts.map((a) => readFileSync(a.file, "utf8"));
const known = knownImports(sources);
const arc = arcLength(WAVES);
/** How many acts the arc keeps, and the number the first act after it takes. */
const kept = arcActs(sources, acts);
const last = acts[kept - 1];
if (!last) throw new Error("the arc keeps no act");
const first = numberAfter(last);

/** The ids of each piece, and its header's sentence. */
const read = (pieces: { act: { exportName: string }; text: string }[]) =>
  pieces.map((p) => ({
    ids: idsInAct(p.text, p.act.exportName),
    said: /Waves (\d+) to (\d+) of the game/.exec(p.text),
    text: p.text,
  }));

describe("the acts after the arc, cut in play order", () => {
  const pieces = recutActs(WAVES, arc, first, known);
  const got = read(pieces);

  test("hold every wave after the arc, in order, none empty, each under the ceiling", () => {
    expect(got.flatMap((g) => g.ids)).toEqual(WAVES.slice(arc).map((w) => w.id));
    for (const g of got) {
      expect(g.ids.length).toBeGreaterThan(0);
      expect(biomeLineCount(g.text)).toBeLessThanOrEqual(CUT_AT);
    }
    expect(pieces.map((p) => p.act.name)).toEqual(pieces.map((_, i) => `act-${first + i}`));
  });

  test("say in their header which waves of the game they hold", () => {
    let at = arc;
    for (const g of got) {
      expect(Number(g.said?.[1])).toBe(at + 1);
      expect(Number(g.said?.[2])).toBe(at + g.ids.length);
      at += g.ids.length;
    }
    // And that the recut wrote it, which is what makes `bun run index` take
    // the row from it every time (`tools/index/refresh.ts`).
    for (const g of got) expect(g.text.replace(/\n \* /g, " ")).toContain(CUT_BY_ORDER);
    const lance = got.find((g) => g.ids.includes("theLance"));
    // The header wraps at eighty columns, so it is read as one line.
    expect(lance?.text.replace(/\n \* /g, " ")).toContain("THE LANCE's block");
  });

  test("are what the tree holds: every act after the arc", () => {
    const after = acts.slice(kept);
    expect(after.map(nameOf)).toEqual(pieces.map((p) => p.act.name));
    expect(after.map((a, i) => idsInAct(sources[kept + i] ?? "", a.exportName))).toEqual(
      got.map((g) => g.ids),
    );
    for (const s of sources) expect(lineCount(s)).toBeLessThanOrEqual(CUT_AT + 10);
  });

  test("cut again after a reorder, rather than piling the moved waves at the end", () => {
    // The first block after the arc moved to the end, the way a reorder moves one.
    const ownIds = new Set(got[0]?.ids);
    const moved: Wave[] = [
      ...WAVES.slice(0, arc),
      ...WAVES.slice(arc).filter((w) => !ownIds.has(w.id)),
      ...WAVES.slice(arc).filter((w) => ownIds.has(w.id)),
    ];
    const again = read(recutActs(moved, arc, first, known));
    expect(again.flatMap((g) => g.ids)).toEqual(moved.slice(arc).map((w) => w.id));
    // Cut again under the ceiling, not piled onto the last file: the moved
    // waves may share files with whatever room the old last act left.
    for (const g of again) expect(biomeLineCount(g.text)).toBeLessThanOrEqual(CUT_AT);
    expect(Math.abs(again.length - got.length)).toBeLessThanOrEqual(1);
  });
});
