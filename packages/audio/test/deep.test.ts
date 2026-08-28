import { describe, expect, it } from "bun:test";
import {
  judgeBand,
  SPEECH_BAND,
  spectrum,
  VOICE_BUDGET_SECONDS,
  voiceBandSeconds,
} from "../src/band.js";
import { DEEP_THEMES } from "../src/music/deep.js";
import { DEEP_CELLS } from "../src/music/deep-cells.js";
import { planTheme, type Theme, themeBandSeconds } from "../src/music/model.js";
import { THEMES } from "../src/music/themes.js";
import { planSound } from "../src/plan.js";

/**
 * The three deep-water pieces, held to the same budget as the six beside them
 * (`test/music.test.ts`) plus the two things that are particular to them: the
 * hole in the middle is checked *directly* rather than through a seconds
 * budget, and the drift is checked as arithmetic rather than by ear.
 */
const BAND_SECONDS_PER_MINUTE = 4;

/** The six that were here first, by id. None of them may change. */
const THE_SIX = [
  "music.pulseFloor",
  "music.deepCurrent",
  "music.driftBloom",
  "music.glassRain",
  "music.pressure",
  "music.ember",
];

describe("the deep cells", () => {
  for (const cell of DEEP_CELLS) {
    describe(cell.id, () => {
      it("is named for the family it is in, and says what it is for", () => {
        expect(cell.id.startsWith("music.")).toBe(true);
        expect(cell.family).toBe("music");
        expect(cell.blurb.length).toBeGreaterThan(12);
        expect(cell.use.length).toBeGreaterThan(12);
      });

      it("stays out of the speech band at its written pitch", () => {
        expect(judgeBand(cell, planSound(cell)).complaint ?? "").toBe("");
      });
    });
  }

  /**
   * The brief asked whether an oscillator's own pitch can glide before a piece
   * was designed around it. It can — `Layer.toFreq` survives into the plan and
   * `engine.ts` puts a real ramp on the node. This is that finding, asserted,
   * so the two cells that lean on it break loudly if it ever stops being true.
   */
  it("bends real pitches, not only filters", () => {
    const bending = DEEP_CELLS.filter((c) =>
      planSound(c).voices.some((v) => v.source !== "noise" && v.toFreq !== v.freq),
    );
    expect(bending.map((c) => c.id).sort()).toEqual(["music.glimmer", "music.surge"]);
  });
});

describe("the deep themes", () => {
  it("sit beside the six rather than replacing one", () => {
    const ids = THEMES.map((t) => t.id);
    for (const id of THE_SIX) expect(ids).toContain(id);
    for (const t of DEEP_THEMES) expect(ids).toContain(t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("are three, and are the ones the brief asked for", () => {
    expect(DEEP_THEMES.map((t) => t.id)).toEqual(["music.tide", "music.cavern", "music.silt"]);
  });

  for (const t of DEEP_THEMES) {
    describe(t.id, () => {
      const plan = planTheme(t);

      it("says what it is, and where it would sit", () => {
        expect(t.title.length).toBeGreaterThan(2);
        expect(t.blurb.length).toBeGreaterThan(20);
        expect(t.use.length).toBeGreaterThan(20);
      });

      it("is long enough to judge and short enough to sit through", () => {
        expect(plan.duration).toBeGreaterThanOrEqual(15);
        expect(plan.duration).toBeLessThanOrEqual(45);
        expect(plan.plans.length).toBeGreaterThan(8);
      });

      it("plans to real numbers", () => {
        for (const p of plan.plans) {
          expect(Number.isFinite(p.start)).toBe(true);
          for (const v of p.plan.voices) {
            expect(Number.isFinite(v.freq)).toBe(true);
            expect(v.freq).toBeGreaterThan(0);
            expect(v.gain).toBeGreaterThan(0);
            expect(Math.abs(v.pan)).toBeLessThanOrEqual(1);
          }
        }
      });

      it("keeps every note inside the per-sound budget", () => {
        const over = plan.plans
          .filter((p) => voiceBandSeconds(p.plan) > VOICE_BUDGET_SECONDS)
          .map((p) => `${p.plan.id} at ${p.start.toFixed(2)}s`);
        expect(over).toEqual([]);
      });

      it("leaves the conversation room across a whole minute of it", () => {
        expect(themeBandSeconds(plan)).toBeLessThanOrEqual(BAND_SECONDS_PER_MINUTE);
      });

      /**
       * The piece the band rule and the mood agree about: a low body and a high
       * glitter with a hole between them. Not a budget — no voice may put its
       * energy in 300–3000 Hz at all, at any moment of its life, at any of the
       * pitches the arrangement asks for.
       */
      it("is a low half and a high half with nothing in the middle", () => {
        const inside = plan.plans.flatMap((p) =>
          p.plan.voices
            .map((v) => ({ v, s: spectrum(v) }))
            .filter(({ s }) => s.high > SPEECH_BAND.low && s.low < SPEECH_BAND.high)
            .map(
              ({ v, s }) => `${p.plan.id} ${v.source} ${s.low.toFixed(0)}-${s.high.toFixed(0)}Hz`,
            ),
        );
        expect(inside).toEqual([]);
      });

      /**
       * Drift, as arithmetic. Every gap between one note and the next, rounded
       * to a hundredth of a beat: if the piece were metrical those gaps would
       * be a handful of grid values. A piece that wanders has many, and no one
       * of them is most of the piece.
       */
      it("does not lay its notes on a grid", () => {
        const beats = [...new Set(t.notes.map((n) => Math.round(n.at * 100)))].sort(
          (a, b) => a - b,
        );
        const gaps = new Map<number, number>();
        for (let i = 1; i < beats.length; i++) {
          const g = (beats[i] as number) - (beats[i - 1] as number);
          gaps.set(g, (gaps.get(g) ?? 0) + 1);
        }
        const commonest = Math.max(...gaps.values());
        expect(gaps.size).toBeGreaterThanOrEqual(8);
        expect(commonest / (beats.length - 1)).toBeLessThan(0.5);
      });

      /**
       * And drift as the thing a listener would hear: the piece must not settle
       * into the same handful of moments. Every onset, folded onto one beat,
       * should land all over it rather than on two or three phases.
       */
      it("puts its notes all over the beat rather than on it", () => {
        const phases = new Set(t.notes.map((n) => Math.round((n.at % 1) * 20)));
        expect(phases.size).toBeGreaterThanOrEqual(6);
      });

      /**
       * The other half of hiding a loop, and the one the arithmetic above says
       * nothing about. A piece whose last tail dies before the player comes
       * back to the top has a hole in it, and a hole is exactly as good a mark
       * of where the loop is as a repeat would be. So the tails have to cross
       * the seam and overlap the piece's own opening.
       */
      it("runs past its own loop point, so the seam has sound over it", () => {
        expect(plan.duration).toBeGreaterThan(plan.loopSeconds);
      });
    });
  }

  /**
   * TIDE's job is to be the bed: nothing lands often enough to be counted
   * along with, and nothing stops for long enough to notice either. `worstGap`
   * folds the piece round its own loop — every note also counted one loop
   * earlier — so the seam is measured like any other moment rather than
   * exempted from the question.
   */
  it("leaves TIDE no silent gap long enough to hear the loop in", () => {
    const plan = planTheme(THEMES.find((x) => x.id === "music.tide") as Theme);
    const spans = plan.plans
      .flatMap((x): [number, number][] => [
        [x.start, x.start + x.plan.duration],
        [x.start - plan.loopSeconds, x.start + x.plan.duration - plan.loopSeconds],
      ])
      .sort((a, b) => a[0] - b[0]);
    let reach = 0;
    let worst = 0;
    for (const [from, to] of spans) {
      if (from > plan.loopSeconds) break;
      if (from > reach) {
        worst = Math.max(worst, from - reach);
        reach = to;
      } else reach = Math.max(reach, to);
    }
    worst = Math.max(worst, plan.loopSeconds - reach);
    expect(worst).toBeLessThanOrEqual(1);
  });
});
