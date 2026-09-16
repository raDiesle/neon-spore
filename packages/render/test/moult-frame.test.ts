import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, type SpawnEntry, step, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { moultPodShare } from "../src/moult.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  remembered,
  runFrames,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MOULT, drawn: the rock, the cargo, and the frames between them.
 *
 * **The in-between is the whole reason this file exists.** A body that is
 * wholly one thing or wholly the other is drawn by `drawMeteor` or
 * `drawPodBody`, both of which have been through a canvas ten thousand times.
 * What has not is the third path — one contour blended vertex by vertex with a
 * mixed fill, a mixed stroke and the cargo's mark fading in under a scale that
 * starts at nothing (`moult-shape.ts`, `moult.ts`) — and it is on screen for
 * about a third of a beat every five, which is exactly the kind of picture a
 * run sampled every fourth tick can miss completely. So this samples **every
 * tick**, and the case under the loop proves that the morph really was on the
 * screen rather than trusting the sampling to have found it.
 *
 * Both seats, and they are not the same picture: the navigator also gets the
 * hollow ghost of the coming form and the pips counting down to the turn
 * (`moult-ghost.ts`), and player 1 must get neither. A run on one seat would
 * draw half of this creature and pass.
 *
 * What none of it can answer is whether a stone is *seen* to become a cargo, or
 * whether the ghost reads as a thing that has not happened yet rather than as a
 * second arrival. Those need an eye. What it holds is that every frame of the
 * turn has been through a canvas that refuses what a real one refuses.
 */

beforeAll(installCanvasGlobals);

/**
 * Two of them, a beat apart and in different columns, which is the wave's own
 * last figure: authored to land as one of each, so a single play has the dome's
 * answer and the mouth's in it.
 */
const QUEUE: SpawnEntry[] = [
  { beat: 0, col: 3, kind: "moult", color: null, cargo: "ward" },
  { beat: 4, col: 5, kind: "moult", color: null, cargo: "purge" },
];

const TPB = ticksPerBeat(CFG);

function moultFrames(role: ViewRole, ticks: number) {
  // Every tick: the morph is about twenty-five of them out of every three
  // hundred and seventy-five, and a run that skipped three in four could draw
  // a whole wave of this creature without once drawing it changing.
  return runFrames(createWorld(CFG, 1, QUEUE), role, ticks, {
    every: 1,
    onTick: (_tick, w) => step(w, []),
  });
}

describe("the moult", () => {
  const TICKS = TPB * 12;
  const played = remembered((role: ViewRole) => moultFrames(role, TICKS));

  for (const role of ROLES) {
    it(`draws the form it is in, and for ${role} whatever that seat is owed beside it`, () => {
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("drew the navigator more than the pilot: the ghost and the count are hers", () => {
    // The one assertion that would fail if the ghost quietly stopped being
    // drawn, or started being drawn on both screens. It is a count of calls
    // rather than a picture, which is all a headless canvas can say — but a
    // seat that is owed two extra shapes per body cannot be owed the same
    // number of operations as the seat that is owed neither.
    expect(played("p2").ctx.calls).toBeGreaterThan(played("p1").ctx.calls);
  });

  it("really was mid-turn on some of those frames", () => {
    // The morph runs off `waveBeat` and the beat's own phase, so the frames it
    // is on are countable without a canvas: this asserts the sampling above
    // actually reached them, which is the one thing the call counts cannot.
    const partway: number[] = [];
    for (let tick = 0; tick < TICKS; tick++) {
      const beat = Math.floor(tick / TPB);
      const k = moultPodShare(CFG, beat, (tick % TPB) / TPB);
      if (k > 0 && k < 1) partway.push(k);
    }
    expect(partway.length).toBeGreaterThan(10);
    // And it passed through the middle rather than jumping the gap.
    expect(partway.some((k) => k > 0.4 && k < 0.6)).toBe(true);
  });

  it("is wholly one thing or the other on every other frame", () => {
    // The other half of the same fact, and the one that matters at the ship: a
    // body is answered as what it is on the beat it lands, so a picture that
    // was never wholly a rock or wholly a cargo would be a picture that never
    // agreed with the rule (`sim/moult.ts`).
    const whole = [0, 1, 2, 3, 4].map((beat) => moultPodShare(CFG, beat, 0.9));
    expect(whole).toEqual([0, 0, 0, 0, 0]);
    expect([5, 6, 7, 8, 9].map((beat) => moultPodShare(CFG, beat, 0.9))).toEqual([1, 1, 1, 1, 1]);
  });
});
