import { describe, expect, it } from "bun:test";
import { judgeBand, VOICE_BUDGET_SECONDS, voiceBandSeconds } from "../src/band.js";
import { CATALOGUE } from "../src/catalogue.js";
import { CELLS } from "../src/music/cells.js";
import { planTheme, themeBandSeconds } from "../src/music/model.js";
import { THEMES } from "../src/music/themes.js";
import { planSound } from "../src/plan.js";

/**
 * Music is the one thing that could quietly undo the speech-band rule. A sound
 * is over in a third of a second and covers at most one word; a piece runs for
 * half a minute and covers the whole conversation. So the budget here is per
 * minute of music rather than per play — four seconds is about seven per cent
 * of the time the piece is playing, which is a bell and a tick, not a body.
 */
const BAND_SECONDS_PER_MINUTE = 4;

/** Long enough to judge, short enough to sit through six of them. */
const MIN_SECONDS = 15;
const MAX_SECONDS = 45;

describe("the music cells", () => {
  it("are not in the catalogue", () => {
    // `spare` there means "something could claim this tomorrow". Half a chord
    // is not a sound the game will ever trigger, and putting it in the list
    // would make two thirds of the SOUND tab furniture.
    const ids = new Set(CATALOGUE.map((s) => s.id));
    for (const cell of CELLS) expect(ids.has(cell.id)).toBe(false);
  });

  for (const cell of CELLS) {
    describe(cell.id, () => {
      it("is named for the family it is in", () => {
        expect(cell.id.startsWith("music.")).toBe(true);
        expect(cell.family).toBe("music");
      });

      it("says what it is and what it is for", () => {
        expect(cell.blurb.length).toBeGreaterThan(12);
        expect(cell.use.length).toBeGreaterThan(12);
      });

      it("stays out of the speech band at its written pitch", () => {
        expect(judgeBand(cell, planSound(cell)).complaint ?? "").toBe("");
      });
    });
  }
});

describe("the themes", () => {
  it("are several, and none of them twice", () => {
    expect(THEMES.length).toBeGreaterThanOrEqual(5);
    const ids = THEMES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const t of THEMES) {
    describe(t.id, () => {
      const plan = planTheme(t);

      it("says what it is, and where it would sit", () => {
        expect(t.id.startsWith("music.")).toBe(true);
        expect(t.title.length).toBeGreaterThan(2);
        expect(t.blurb.length).toBeGreaterThan(20);
        expect(t.use.length).toBeGreaterThan(20);
      });

      it("is long enough to judge and short enough to sit through", () => {
        expect(plan.duration).toBeGreaterThanOrEqual(MIN_SECONDS);
        expect(plan.duration).toBeLessThanOrEqual(MAX_SECONDS);
        expect(plan.loopSeconds).toBeGreaterThan(0);
      });

      it("plans to real numbers, in time order", () => {
        let last = -1;
        for (const p of plan.plans) {
          expect(Number.isFinite(p.start)).toBe(true);
          expect(p.start).toBeGreaterThanOrEqual(last);
          last = p.start;
          for (const v of p.plan.voices) {
            expect(Number.isFinite(v.freq)).toBe(true);
            expect(v.freq).toBeGreaterThan(0);
            expect(v.gain).toBeGreaterThan(0);
          }
        }
      });

      /**
       * A pitch multiplier moves a cell's filters and sidebands with it, so a
       * bell walked down seven semitones lands in the middle of the voice even
       * though the cell it came from is clean. This is that mistake, per note.
       */
      it("keeps every note where its cell was, band-wise", () => {
        const over = plan.plans
          .filter((p) => voiceBandSeconds(p.plan) > VOICE_BUDGET_SECONDS)
          .map((p) => `${p.plan.id} at ${p.start.toFixed(2)}s`);
        expect(over).toEqual([]);
      });

      it("leaves the conversation room across a whole minute of it", () => {
        expect(themeBandSeconds(plan)).toBeLessThanOrEqual(BAND_SECONDS_PER_MINUTE);
      });

      it("has notes in it", () => {
        expect(plan.plans.length).toBeGreaterThan(8);
        expect(plan.voices).toBeGreaterThanOrEqual(plan.plans.length);
      });
    });
  }

  /**
   * The engine stops building at 64 live voices, so a piece handed over in one
   * call would play its first bars and drop the rest in silence. Not every
   * theme is that dense — `ember` is thirty voices spread over half a minute —
   * but the ones that would run under a wave are, and that is what makes the
   * player's lookahead necessary rather than superstition.
   */
  it("has at least one piece too dense for a single call to the engine", () => {
    const densest = Math.max(...THEMES.map((t) => planTheme(t).voices));
    expect(densest).toBeGreaterThan(64);
  });

  it("offers something for a wave and something for a screen nobody talks over", () => {
    const forWaves = THEMES.filter((t) => t.use.toLowerCase().includes("wave"));
    expect(forWaves.length).toBeGreaterThanOrEqual(2);
  });
});
