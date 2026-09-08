import { describe, expect, it } from "bun:test";
import { asymmetry, cuesOf, placedAt, reveal, turnsOf } from "../src/depth-cues.js";
import {
  APPROACH,
  CANT,
  MOTIONS,
  PITCH,
  SWELL,
  TURN,
  TURN_IN_DEPTH,
} from "../src/motions/index.js";

/**
 * The cues that decide whether a thing reads as depth, held to their numbers.
 *
 * `docs/dimensional.md` and `docs/style-guide.md` both make measurable claims
 * about these four motions, and until this file every one of them was a
 * sentence that could stop being true without anything going red. A motion is
 * allowed to be a squash — most of the eleven are, honestly and on purpose.
 * What it may not do is be a squash while the document beside it says it turns.
 */

/** One revolution of TURN IN DEPTH: its own `SPIN` of 0.34375 rad per beat. */
const REVOLUTION = (Math.PI * 2) / 0.34375;

describe("what a pose can and cannot do", () => {
  it("never brings anything out from behind, whatever the motion", () => {
    // The ceiling, and the reason `packages/content/src/surface.ts` exists. A
    // pose scales the picture about one centre, so there is no setting of any
    // number in `{ dx, dy, rot, sx, sy }` that hides a part of a body.
    for (const m of MOTIONS) expect(cuesOf(m, 16).reveal).toBe(0);
  });

  it("is answered by a placed surface, which takes the whole body round", () => {
    expect(
      reveal(
        placedAt((t) => t * 0.34375),
        REVOLUTION,
      ),
    ).toBe(1);
  });
});

describe("the four that claim depth", () => {
  it("turns TURN IN DEPTH's width twice for every sideways swing", () => {
    // The cue a squash cannot fake: width repeats twice per revolution and the
    // swing once, because the body's centre stands off the axis it turns
    // about. One period on each would be a body being squeezed.
    const c = cuesOf(TURN_IN_DEPTH, REVOLUTION, 360);
    expect(c.widthTurns).toBe(2);
    expect(c.swayTurns).toBe(1);
    // TURN itself is the same rotation in the picture plane and says neither.
    const flat = cuesOf(TURN, REVOLUTION, 360);
    expect(flat.widthTurns).toBe(0);
    expect(flat.swayTurns).toBe(0);
  });

  it("keeps APPROACH and PITCH asymmetric where their originals are not", () => {
    // Foreshortening is a cosine of angle plus lens, so going away and coming
    // toward are not mirror images. A lean is symmetric by construction.
    expect(cuesOf(APPROACH, 16, 360).asymmetry).toBeGreaterThan(cuesOf(SWELL, 16, 360).asymmetry);
    expect(cuesOf(PITCH, 16, 360).asymmetry).toBeGreaterThan(0.5);
    expect(cuesOf(CANT, 16, 360).asymmetry).toBe(0);
  });

  it("moves drawn aspect by the factors the bestiary was warned about", () => {
    // `docs/dimensional.md` says 1.82 and 1.77, and that those two figures are
    // why these are card motions: the nameability gate's first axis is drawn
    // aspect across a beat, and the round kinds sit within a whisker of each
    // other on it. If either number moves, that warning is about a different
    // motion than the one it names.
    const turn = cuesOf(TURN_IN_DEPTH, REVOLUTION, 360);
    expect(turn.aspectHi / turn.aspectLo).toBeCloseTo(1.82, 2);
    const pitch = cuesOf(PITCH, 16, 360);
    expect(pitch.aspectHi / pitch.aspectLo).toBeCloseTo(1.77, 2);
  });
});

describe("the measurements themselves", () => {
  it("counts no period in a channel that never moves", () => {
    expect(turnsOf([1, 1, 1, 1, 1, 1])).toBe(0);
    expect(asymmetry([1, 1, 1, 1])).toBe(0);
  });

  it("finds one period in a sine and two in its double", () => {
    const n = 240;
    const wave = (k: number) =>
      Array.from({ length: n }, (_, i) => Math.sin((k * 2 * Math.PI * i) / n));
    expect(turnsOf(wave(1))).toBe(1);
    expect(turnsOf(wave(2))).toBe(2);
    // A sine is its own mirror about its peak, which is the baseline every
    // asymmetry above is measured against.
    expect(asymmetry(wave(1))).toBeCloseTo(0, 3);
  });
});
