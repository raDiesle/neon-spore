import { describe, expect, test } from "bun:test";
import { controlSet, isRegularWave, mechanicsInWave, WAVES } from "@neon-spore/content";
import { biomeLineCount, biomeLines } from "../src/biome-lines.js";
import { bossOrder } from "../src/boss-slots.js";
import { startsBlock } from "../src/compose-review.js";
import { TUTORIAL_LAST_ID } from "../src/compose-steps.js";

const finale = WAVES.findIndex((w) => w.id === TUTORIAL_LAST_ID);

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

  test("close a block each, at most one, until the blocks run out", () => {
    let between = 0;
    let last = -1;
    WAVES.forEach((w, i) => {
      if (i <= finale) return;
      if (startsBlock(WAVES, i)) {
        expect(between).toBeLessThanOrEqual(1);
        between = 0;
        last = i;
      } else if (w.boss) between++;
    });
    // After the last block, one boss closes it and any left wait for theirs.
    expect(WAVES.slice(last).filter((w) => w.boss).length).toBeGreaterThanOrEqual(1);
  });

  // The owner, 15 October 2026: *I expect to follow from top to bottom
  // without spaces* — in the folded list, every boss under a block's waves.
  test("each come straight after a regular wave folded into its block", () => {
    WAVES.forEach((boss, at) => {
      if (!boss.boss || at <= finale) return;
      const before = WAVES[at - 1];
      expect({
        boss: boss.name,
        folded: before?.variant === true && isRegularWave(WAVES, at - 1),
      }).toEqual({ boss: boss.name, folded: true });
    });
  });

  test("leave the tutorial arc's bosses where they were", () => {
    expect(WAVES.findIndex((w) => w.id === "theInstar")).toBeLessThan(finale);
    expect(WAVES.findIndex((w) => w.id === "theBastion")).toBeLessThan(finale);
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
