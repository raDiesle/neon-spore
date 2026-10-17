import { describe, expect, test } from "bun:test";
import { isRegularWave, WAVES } from "@neon-spore/content";
import { FILLER_STEPS, fillerPrefix, nextFiller } from "../src/compose-filler.js";
import { isFiller, isFillerHead, isReviewHead } from "../src/compose-starts.js";
import { stepById, TUTORIAL_LAST_ID } from "../src/compose-steps.js";
import { introducesAt } from "../src/list-reading.js";
import { headOf, waveGroups } from "../src/rail-groups.js";

/**
 * THE OWNER, 17 OCTOBER 2026: *boss waves … should not be associated with a
 * parent wave list, which parent introduces something new. instead create
 * some new parent wave with maybe 3 number of waves, which just reuse what we
 * have so far then the boss.* Past the tutorial arc, every boss folds under a
 * group that teaches nothing: a filler's three waves (`compose-filler.ts`),
 * or a review block's eight.
 */

const finale = WAVES.findIndex((w) => w.id === TUTORIAL_LAST_ID);
const groups = waveGroups(WAVES);

describe("fillers (wave-curriculum §7)", () => {
  test("no boss past the arc folds under a group that teaches", () => {
    const wrong = WAVES.flatMap((w, i) => {
      if (!w.boss || i <= finale) return [];
      const head = headOf(groups, i);
      return isFillerHead(WAVES, head) || isReviewHead(WAVES, head)
        ? []
        : [`${i + 1} ${w.name} under ${WAVES[head]?.name}`];
    });
    expect(wrong).toEqual([]);
  });

  test("every boss has its filler: `waves:fillers` would write nothing", () => {
    expect(nextFiller(WAVES)).toBe("every boss has its filler");
  });

  test("a filler is three regular waves, Breathe to Bend, named for its boss, teaching nothing", () => {
    const steps = FILLER_STEPS.map((id) => stepById(id).name);
    WAVES.forEach((_, i) => {
      if (!isFillerHead(WAVES, i)) return;
      const run = WAVES.slice(i, i + steps.length);
      const boss = WAVES[i + steps.length];
      expect(boss?.boss).toBeDefined();
      expect(run.map((r) => r.id)).toEqual(steps.map((s) => `${fillerPrefix(boss?.id ?? "")}${s}`));
      run.forEach((_, k) => {
        expect(isRegularWave(WAVES, i + k)).toBe(true);
        expect(introducesAt(WAVES, i + k)).toEqual([]);
      });
    });
  });

  test("no filler stands in the arc", () => {
    expect(WAVES.slice(0, finale + 1).filter((w) => isFiller(w.id))).toEqual([]);
  });
});
