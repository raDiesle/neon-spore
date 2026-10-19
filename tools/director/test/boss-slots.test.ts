import { describe, expect, test } from "bun:test";
import { controlSet, isRegularWave, mechanicsInWave, WAVES } from "@neon-spore/content";
import { biomeLineCount, biomeLines } from "../src/biome-lines.js";
import { BOSS_ABOUT } from "../src/boss-about.js";
import { bossOrder } from "../src/boss-slots.js";
import { isReviewHead, startsBlock } from "../src/compose-starts.js";
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
  // boss closing it, until the bosses run out; then the blocks with none, or
  // the bosses with no block left, waiting after the last.
  test("close a block each, exactly one, while there are bosses left", () => {
    const counts: { block: string; bosses: number }[] = [];
    WAVES.forEach((w, i) => {
      if (i <= finale) return;
      if (startsBlock(WAVES, i)) counts.push({ block: w.name, bosses: 0 });
      else if (w.boss && !waiting.has(w.id)) {
        const last = counts[counts.length - 1];
        if (last) last.bosses++;
      }
    });
    const ranOut = counts.findIndex((c) => c.bosses === 0);
    const expected = counts.map((c, k) => ({
      block: c.block,
      bosses: ranOut === -1 || k < ranOut ? 1 : 0,
    }));
    expect(counts).toEqual(expected);
    if (waiting.size > 0) expect(ranOut).toBe(-1);
  });

  // The owner, 15 October 2026: *I expect to follow from top to bottom
  // without spaces* — in the folded list, every boss under a block's waves:
  // its one regular wave, folded under the intro, or a review's one, which
  // heads a group of its own (19 October 2026).
  test("each come straight after a regular wave of its block", () => {
    WAVES.forEach((boss, at) => {
      if (!boss.boss || at <= finale || waiting.has(boss.id)) return;
      const before = WAVES[at - 1];
      expect({
        boss: boss.name,
        folded:
          (before?.variant === true || isReviewHead(WAVES, at - 1)) && isRegularWave(WAVES, at - 1),
      }).toEqual({ boss: boss.name, folded: true });
    });
  });

  // The owner, 17 October 2026: a boss closes the block whose new thing it
  // is about (`boss-about.ts`).
  test("close the block each is about", () => {
    const wrong: string[] = [];
    for (const [boss, about] of Object.entries(BOSS_ABOUT)) {
      // A block in the arc is closed by no boss past it: THE VISE, THE STARE,
      // THE SPLICE, THE FLUE and THE BATON are about bodies the owner moved
      // into the arc on 18 October 2026, and he chose the same day to leave
      // them past it — the arc's blocks get STANDARD 2 bosses of their own.
      if (WAVES.findIndex((w) => w.id === about) < finale) continue;
      const at = WAVES.findIndex((w) => w.id === boss);
      let head = at - 1;
      while (head > 0 && !startsBlock(WAVES, head)) head--;
      if (WAVES[head]?.id !== about) wrong.push(`${boss} closes ${WAVES[head]?.id}, not ${about}`);
    }
    expect(wrong).toEqual([]);
  });

  test("leave the tutorial arc's bosses where they were", () => {
    expect(WAVES.findIndex((w) => w.id === "theBrood")).toBeLessThan(finale);
    expect(WAVES.findIndex((w) => w.id === "bulbQueen")).toBeLessThan(finale);
    expect(WAVES.findIndex((w) => w.id === "theBastion")).toBeLessThan(finale);
  });

  test("THE SPLICE stands past the arc, behind a review", () => {
    // The owner, 17 October 2026: a boss on a panel of its own does not close
    // a block in the arc — it comes once the basics are taught. It closed THE
    // ECHO's block until THE ECHO moved into the arc (18 October 2026), and
    // waits at the end behind a review of its own since.
    const at = WAVES.findIndex((w) => w.id === "theSplice");
    expect(at).toBeGreaterThan(finale);
    expect(isReviewHead(WAVES, at - 1)).toBe(true);
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
