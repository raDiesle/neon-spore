import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SurgeState,
  startWave,
  step,
  surgeBoss,
  surgeNotchMilli,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE SURGE's bulb, its seam, its grips and its end, on all three screens.
 *
 * The states are **set** rather than played to, `sinew-frame.test.ts`'s
 * arrangement: `sim/test/surge.test.ts` proves the charge, the band, the
 * vent and the burst, and what this file asks is whether every branch of
 * the picture is one a canvas accepts — hung, held, in the band, notched,
 * sealing, everting, out — and the two things nothing else in the suite
 * could catch: that the **notches** are on the pilot's screen and the
 * **pressure** on the navigator's, and neither on the other; and that a
 * vent's sink is a transient the next run does not inherit.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("surge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function bulb(world: World): SurgeState {
  const s = surgeBoss(world);
  if (s === null) throw new Error("the surge wave hung no bulb");
  return s;
}

/** Both thumbs on. */
function heldBoth(world: World): SurgeState {
  const s = bulb(world);
  s.heldP1 = true;
  s.heldP2 = true;
  return s;
}

/** The pressure exactly on the next notch. */
function inBand(world: World): SurgeState {
  const s = heldBoth(world);
  s.pressureMilli = surgeNotchMilli(s, CFG);
  return s;
}

/** Two notches vented and the charge kept: the bulb hangs lower and glows. */
function notched(world: World): SurgeState {
  const s = bulb(world);
  s.notches = 2;
  return s;
}

/** Burst this beat: pinched, dim, refusing every thumb. */
function sealing(world: World): SurgeState {
  const s = bulb(world);
  s.burstBeat = world.beat;
  return s;
}

/** Two beats into the fold. */
function everting(world: World): SurgeState {
  const s = bulb(world);
  s.notches = CFG.surgeNotches;
  s.evertBeat = world.beat - 2;
  return s;
}

/** Folded through and on its way out. */
function out(world: World): SurgeState {
  const s = everting(world);
  s.evertBeat = world.beat - CFG.surgeEvertBeats - 1;
  s.outBeat = world.beat - 1;
  return s;
}

function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
): { calls: number; text: string; words: string[] } {
  const log: string[] = [];
  const texts: TextBox[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
      c.texts = texts;
    },
  });
  return { calls: ctx.calls, text: log.join("|"), words: texts.map((t) => t.text) };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

const holdWord = (words: string[]): boolean => words.some((w) => w.includes("HOLD"));

describe("THE SURGE's bulb", () => {
  it.each(ROLES)("draws the bulb, its seam and both grips, with the word, on %s", (role) => {
    const world = hung();
    const frame = drawn(world, role, 2 * TPB);
    expect(frame.calls).toBeGreaterThan(300);
    // The body is the hull's violet and its rim the hull's rim.
    expect(frame.text).toContain(PALETTE.hull);
    expect(frame.text).toContain(PALETTE.hullRim);
    expect(holdWord(frame.words)).toBe(true);
  });

  it.each(ROLES)(
    "draws the grips held once both thumbs are on, without the word, on %s",
    (role) => {
      const loose = hung();
      const held = hung();
      heldBoth(held);
      const frame = drawn(held, role, 3);
      expect(frame.text).not.toBe(drawn(loose, role, 3).text);
      expect(holdWord(frame.words)).toBe(false);
    },
  );

  it("puts the notches on the pilot's screen and not the navigator's", () => {
    // The next notch's band, its mark and the later ticks name the text
    // white; the one grip that is the seat's own names it too, on both.
    const p1 = count(drawn(hung(), "p1", 3).text, PALETTE.text);
    const p2 = count(drawn(hung(), "p2", 3).text, PALETTE.text);
    const test = count(drawn(hung(), "test", 3).text, PALETTE.text);
    expect(p1).toBeGreaterThan(p2);
    expect(test).toBeGreaterThan(p2);
  });

  it("puts the pressure on the navigator's screen and not the pilot's", () => {
    // The pressure mark is stroked in the hull's rim, over the one rim
    // stroke the body itself has on every screen.
    const navigator = hung();
    inBand(navigator);
    const p2 = count(drawn(navigator, "p2", 3).text, PALETTE.hullRim);
    const pilot = hung();
    inBand(pilot);
    const p1 = count(drawn(pilot, "p1", 3).text, PALETTE.hullRim);
    const both = hung();
    inBand(both);
    const test = count(drawn(both, "test", 3).text, PALETTE.hullRim);
    expect(p2).toBeGreaterThan(p1);
    expect(test).toBeGreaterThan(p1);
  });

  it.each(ROLES)("hangs the bulb lower and lit once notches are vented, on %s", (role) => {
    const whole = hung();
    const vented = hung();
    notched(vented);
    expect(drawn(vented, role, 3).text).not.toBe(drawn(whole, role, 3).text);
  });

  it.each(ROLES)("pinches the bulb dim and shut while it seals, with no word, on %s", (role) => {
    const world = hung();
    sealing(world);
    const frame = drawn(world, role, 3);
    expect(frame.text).toContain(PALETTE.dim);
    expect(holdWord(frame.words)).toBe(false);
  });

  it.each(ROLES)("folds the bulb through its equator and fades it out, on %s", (role) => {
    const folding = hung();
    for (let i = 0; i < 4 * TPB; i++) step(folding, []);
    everting(folding);
    const mid = drawn(folding, role, 3);
    expect(mid.calls).toBeGreaterThan(0);
    expect(holdWord(mid.words)).toBe(false);
    const leaving = hung();
    for (let i = 0; i < 6 * TPB; i++) step(leaving, []);
    const s = out(leaving);
    const going = drawn(leaving, role, 3);
    expect(going.text).not.toBe(mid.text);
    s.outBeat = leaving.beat - CFG.surgeOutBeats - 1;
    const gone = count(drawn(leaving, role, 3).text, PALETTE.hullRim);
    expect(count(going.text, PALETTE.hullRim)).toBeGreaterThan(gone);
  });

  it("keeps a vent's sink as a transient the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest([{ type: "surgeVent", col: 5, notches: 1, row: 4 }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});

/**
 * **The grip's word is the field's one cue** (`docs/decisions.md` #34,
 * `render/src/boss-cue-text.ts`), for `sinew-frame.test.ts`' reason: one voice
 * for every boss that asks for a gesture, and a word on the seat that can
 * perform it. The bulb is the one handle both seats take, so each screen is
 * asked about its own mark and shown the other's filling.
 */
describe("THE SURGE's word", () => {
  /** How many marks each screen may be asked about: one each, both on the rig,
   * which is the screen that is nobody's hands. */
  const ASKED: Record<ViewRole, number> = { p1: 1, p2: 1, test: 2 };
  /** A cue is two lines, the verb and its kind — but on this boss they are the
   * same word, which is what the fight is: the only thing asked of either thumb
   * is that it stays. The kind line is dropped rather than saying it twice
   * (`boss-cue-text.ts`), so each mark carries exactly one. */
  const LINES = 1;

  it.each(ROLES)("stands once on this seat's mark and not on the other's, on %s", (role) => {
    const { words } = drawn(hung(), role, 3);
    expect(words.filter((w) => w === "HOLD").length).toBe(ASKED[role] * LINES);
  });

  it.each(ROLES)("is drawn in the cue's grey, never an ammunition colour, on %s", (role) => {
    expect(drawn(hung(), role, 3).text).toContain(PALETTE.rock);
  });
});
