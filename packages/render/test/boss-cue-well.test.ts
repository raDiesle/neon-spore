import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { bossCue, type CueKind } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { radarBlips } from "../src/radar-blip.js";
import { showsWell } from "../src/well.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE WELL, and the finding that it may be told nothing at all**
 * (`render/src/boss-cue-read-r.ts`).
 *
 * It is the second boss in the game read against `docs/decisions.md` #34 and
 * left silent — THE PULSE was the first (`boss-cue-pulse.test.ts`). It was
 * once the boss that *could not* have said anything, because it had no state
 * to say it about; on 20 September 2026 it gained three phases and a handle,
 * and every case below stayed green, which is the point of reading it again.
 *
 * The reason moved and the answer did not. On this clock a mark's own angle
 * **is** its hour, because `well-face.ts` prints that lane's numeral on the
 * ring just outside the rim — so every word this boss could say would carry a
 * column, which is the first thing #34 forbids outright, and the columns on
 * this seat's face are precisely the ones that have walked away from where
 * they were. The seam slipping is the signal, drawn rather than said.
 *
 * **So the whole file is silences, and that is what it is for.** The cases
 * below are what would catch a later lane making this boss "clearer" by
 * writing `HOLD` on the seam or `MOVE` on the hand of the clock: a cue drawn
 * on the lane the cannon should be
 * in is the answer, and one drawn on the lane it is not in is the answer by
 * subtraction (THE LEAD's finding, `boss-cue-clocks.test.ts`).
 *
 * **The frames case is the one that matters**, and it is inverted from every
 * other file in this set: instead of proving a word paints on the right seat's
 * canvas and not the other's, it proves that *neither* canvas is ever handed
 * one, while proving in the same breath that the pictures really were drawn —
 * the pilot's clock paints its numerals and the navigator's flat field does
 * not, so an empty assertion could not pass by drawing nothing.
 *
 * **The last case is not about the cue at all**, and it is here because the
 * briefing now rests on it: every body a well wave sends is announced on the
 * navigator's strip and on nothing the pilot is shown, so his clock carries no
 * warning marks. That is `showsRadar` meeting `showsWell`, two predicates that
 * have never been asked about each other, and it is the fact the pilot's half
 * of `waves/act-8.ts` opens on. A lane that moved a `radar` owner would take
 * the guide's first sentence away without touching it.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** Every word that may stand on the kind line, so a case below fails whatever
 * a later lane decides this boss should say (`CueKind`). */
const KINDS: readonly CueKind[] = ["PRESS", "HOLD", "CARRY", "TURN", "STILL"];

function opened(beats = 0): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("well");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < beats * TPB; i++) step(world, []);
  if (world.boss?.kind !== "well") throw new Error("the well's wave installed no well");
  return world;
}

function silent(world: World): void {
  for (const role of ["p1", "p2", "test"] as const) {
    const l = LAYOUT[role];
    expect(bossCue(l, world, 0, () => l.hullY)).toBeNull();
  }
}

/** Every string this seat's canvas was handed over three frames. */
function drawn(world: World, role: ViewRole): string[] {
  const texts: TextBox[] = [];
  runFrames(world, role, 3, {
    every: 3,
    onCanvas: (c) => {
      c.texts = texts;
    },
  });
  return texts.map((t) => t.text);
}

describe("THE WELL", () => {
  it("says nothing on either seat, on every beat of its own wave", () => {
    const world = opened();
    // The whole script, so no beat of it is the one that speaks: the seven
    // arrivals are authored out to beat 58 (`waves/act-8.ts`).
    for (let beat = 0; beat < 70; beat++) {
      silent(world);
      for (let i = 0; i < TPB; i++) step(world, []);
    }
  });

  it("says nothing with the cannon at either end of the rail", () => {
    const world = opened(4);
    // One o'clock and eleven o'clock — the two lanes the seam stands between,
    // which look like neighbours on the clock and are the whole width of the
    // rail apart. If this boss were ever going to say a word it would be here,
    // and the word would be the lane (`docs/decisions.md` #34).
    for (const col of [0, CFG.cols - 1, Math.floor(CFG.cols / 2)]) {
      world.cannonCol = col;
      world.shieldCol = CFG.cols - 1 - col;
      silent(world);
    }
  });

  it("hands neither canvas a cue, while both are drawing their own picture", () => {
    const pilot = drawn(opened(3), "p1");
    const navigator = drawn(opened(3), "p2");
    // The frames are real: the pilot's clock prints a numeral per column on the
    // ring outside its rim (`well-face.ts`), and the navigator is drawn the
    // flat field, which has no such ring. So the silence below is a silence and
    // not an empty canvas.
    expect(pilot).toContain("11");
    expect(navigator).not.toContain("11");
    for (const kind of KINDS) {
      expect(pilot, `the pilot's clock was handed ${kind}`).not.toContain(kind);
      expect(navigator, `the navigator's field was handed ${kind}`).not.toContain(kind);
    }
    // And the two words a lane "helping" this boss would reach for first.
    for (const word of ["MOVE", "FIRE"]) {
      expect(pilot).not.toContain(word);
      expect(navigator).not.toContain(word);
    }
  });

  it("warns the pilot of nothing: every arrival in this wave is the navigator's", () => {
    const world = opened();
    let onTheClock = 0;
    let onTheStrip = 0;
    for (let beat = 0; beat < 70; beat++) {
      onTheClock += radarBlips(LAYOUT.p1, world).length;
      onTheStrip += radarBlips(LAYOUT.p2, world).length;
      for (let i = 0; i < TPB; i++) step(world, []);
    }
    // `showsWell` is `showsCannon`, so the ring `well-arrivals.ts` bends round
    // the rim is the pilot's alone — and `radarBlips` gates on `showsRadar`,
    // which hands a `slick` and a `bulb` to the navigator. Between them the
    // pilot's clock is never warned of anything this wave sends, which is what
    // his half of the briefing opens on.
    expect(showsWell("p1")).toBe(true);
    expect(onTheClock).toBe(0);
    expect(onTheStrip).toBeGreaterThan(0);
  });
});
