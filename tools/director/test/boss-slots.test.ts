import { describe, expect, test } from "bun:test";
import { controlSet, isRegularWave, mechanicsInWave, WAVES } from "@neon-spore/content";
import { biomeLineCount, biomeLines } from "../src/biome-lines.js";
import { bossOrder } from "../src/boss-slots.js";
import { startsBlock } from "../src/compose-starts.js";
import { TUTORIAL_LAST_ID } from "../src/compose-steps.js";

const finale = WAVES.findIndex((w) => w.id === TUTORIAL_LAST_ID);
/** The bosses with no block left, waiting at the end in order (`boss-slots.ts`). */
const waiting = new Set(
  bossOrder(WAVES)
    .slots.filter((s) => s.closes === undefined && s.from > finale)
    .map((s) => s.id),
);

describe("the bosses' places (wave-curriculum §7)", () => {
  test("are the ones the game ships: `waves:bosses` would move nothing", () => {
    expect(bossOrder(WAVES).order.map((w) => w.id)).toEqual(WAVES.map((w) => w.id));
  });

  test("put every boss after a wave that taught each thing it needs", () => {
    WAVES.forEach((boss, at) => {
      if (!boss.boss || at <= finale) return;
      const set = controlSet(boss.controls);
      for (const id of mechanicsInWave(boss)) {
        const first = WAVES.findIndex((w) => !w.boss && mechanicsInWave(w).has(id));
        if (first !== -1)
          expect({ boss: boss.name, id, first: first < at }).toEqual({
            boss: boss.name,
            id,
            first: true,
          });
      }
      const panel = WAVES.findIndex((w) => !w.boss && controlSet(w.controls).id === set.id);
      if (panel !== -1)
        expect({ boss: boss.name, panel: panel < at }).toEqual({ boss: boss.name, panel: true });
    });
  });

  // Every block past the arc — an intro's, a lesson's, a review — and one
  // boss closing it, until the bosses run out; then the ones with no block
  // left, waiting after the last.
  test("close a block each, exactly one, while there are bosses left", () => {
    let between = 0;
    let started = false;
    WAVES.forEach((w, i) => {
      if (i <= finale) return;
      if (startsBlock(WAVES, i)) {
        if (started)
          expect({ before: WAVES[i]?.name, bosses: between }).toEqual({
            before: WAVES[i]?.name,
            bosses: 1,
          });
        between = 0;
        started = true;
      } else if (w.boss && !waiting.has(w.id)) between++;
    });
    expect(between).toBe(1);
  });

  // The owner, 15 October 2026: *I expect to follow from top to bottom
  // without spaces* — in the folded list, every boss under a block's waves.
  test("each come straight after a regular wave folded into its block", () => {
    WAVES.forEach((boss, at) => {
      if (!boss.boss || at <= finale || waiting.has(boss.id)) return;
      const before = WAVES[at - 1];
      expect({
        boss: boss.name,
        folded: before?.variant === true && isRegularWave(WAVES, at - 1),
      }).toEqual({ boss: boss.name, folded: true });
    });
  });

  test("leave the tutorial arc's bosses where they were", () => {
    expect(WAVES.findIndex((w) => w.id === "theBrood")).toBeLessThan(finale);
    expect(WAVES.findIndex((w) => w.id === "bulbQueen")).toBeLessThan(finale);
    expect(WAVES.findIndex((w) => w.id === "theBastion")).toBeLessThan(finale);
  });

  test("THE INSTAR comes after the arc, once every basic thing is taught", () => {
    // The owner, 16 October 2026: *"the instar" is a boss, it should come
    // as a separate new concept wave later when all basic concepts are
    // introduced.* It takes the first block after FINALE that THE SWINDLE
    // has not: the husk's boss closes the husk's block, which comes first.
    const at = WAVES.findIndex((w) => w.id === "theInstar");
    expect(at).toBeGreaterThan(finale);
    expect(WAVES.slice(finale + 1, at).flatMap((w) => (w.boss ? [w.id] : []))).toEqual([
      "theSwindle",
    ]);
  });

  test("THE SWINDLE closes THE HUSK's block, the first after the arc", () => {
    // The owner, 16 October 2026: *after root wave of "real" … "hollow", then
    // again some boss for it*. FINALE is the real pod's exam; this is both's.
    const slot = bossOrder(WAVES).slots.find((s) => s.id === "theSwindle");
    expect(slot?.closes).toBe("theHusk");
  });
});

describe("biomeLines", () => {
  test("a line that fits is one line", () => {
    expect(biomeLines('    name: "THE SEAM",')).toBe(1);
  });

  test("a line too wide breaks its outer bracket, an item to a line, and each again", () => {
    const step = '{ ask: "point", color: "red", offset: 0, seals: false }';
    const line = `    boss: { kind: "seam", steps: [${Array(13).fill(step).join(", ")}] },`;
    // boss: {  kind,  steps: [  13 steps  ],  },
    expect(biomeLines(line)).toBe(1 + 1 + 1 + 13 + 1 + 1);
  });

  test("a comma or a bracket inside a string is not a cut", () => {
    const line = `      { beat: 0, col: 5, say: "${"a, b [c] ".repeat(12)}" },`;
    expect(biomeLines(line)).toBe(5);
  });

  test("counts a text as lineCount counts it, a final newline included", () => {
    expect(biomeLineCount("a\nb\n")).toBe(2);
  });
});
