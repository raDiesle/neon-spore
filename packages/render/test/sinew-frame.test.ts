import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  hullRow,
  type SinewState,
  sinewBoss,
  startWave,
  step,
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
 * THE SINEW's tendon, mass, band and handles, on all three screens.
 *
 * The states are **set** rather than played to, `curtain-frame.test.ts`'s
 * arrangement: `sim/test/sinew.test.ts` proves the sum, the hold, the snap
 * and the fall, and what this file asks is whether every branch of the
 * picture is one a canvas accepts — hung, pulled, held in the zone, snapped
 * and swinging, slack, falling, out, crushed — and the two things nothing
 * else in the suite could catch: that the **zone** is on the pilot's screen
 * and the **sum** on the navigator's, and neither on the other; and that a
 * snap's flash is a transient the next run does not inherit.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("sinew");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function tendon(world: World): SinewState {
  const s = sinewBoss(world);
  if (s === null) throw new Error("the sinew wave hung no tendon");
  return s;
}

/** Both hands on, one deep and one shallow. */
function pulled(world: World): SinewState {
  const s = tendon(world);
  s.pullP1Milli = CFG.sinewReachMilli;
  s.pullP2Milli = Math.floor(CFG.sinewReachMilli / 2);
  return s;
}

/** The sum inside the zone with the hold two beats old. */
function heldInZone(world: World): SinewState {
  const s = pulled(world);
  s.zoneLowMilli = CFG.sinewReachMilli;
  s.holdBeat = world.beat - 1;
  return s;
}

/** Two fibres parted, the mass two rows lower. */
function worn(world: World): SinewState {
  const s = tendon(world);
  s.fibres = CFG.sinewFibres - 2;
  return s;
}

/** Enough fibres parted that the tendon is going slack, and slack taken. */
function slack(world: World): SinewState {
  const s = pulled(world);
  s.fibres = CFG.sinewFibres - CFG.sinewDecayFibres;
  s.slackMilli = CFG.sinewDecayMilli * 3;
  return s;
}

/** The last fibre parted a beat ago: the mass on its way down, both hands off
 * it. The sway is asked of a hand on or off (`sinew-word.ts`), so either state
 * draws the word; this is the one where the rings are also at their rest. */
function falling(world: World): SinewState {
  const s = tendon(world);
  s.fibres = 0;
  s.fallBeat = world.beat - 1;
  s.pullP1Milli = -1;
  s.pullP2Milli = -1;
  return s;
}

/** Landed at the wall, clear of the ship. */
function out(world: World): SinewState {
  const s = falling(world);
  s.fallBeat = world.beat - CFG.sinewFallBeats;
  s.massCol = CFG.cols - 1;
  s.outBeat = world.beat;
  return s;
}

/** Landed on the hull. */
function crushed(world: World): SinewState {
  const s = out(world);
  s.massCol = Math.floor(CFG.cols / 2);
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

describe("THE SINEW's tendon", () => {
  it.each(ROLES)("draws the tendon, the mass, the collar and both handles, on %s", (role) => {
    const world = hung();
    const frame = drawn(world, role, 2 * TPB);
    expect(frame.calls).toBeGreaterThan(300);
    // The fibres and the mass name the hull's violet, the other seat's handle its grey.
    expect(frame.text).toContain(PALETTE.hull);
    expect(frame.text).toContain(PALETTE.dim);
  });

  it.each(ROLES)("draws the cords at the pull once both hands are on, on %s", (role) => {
    const loose = hung();
    const held = hung();
    pulled(held);
    // A held handle is drawn without its hint word and with its cord under
    // strain; the two frames are not the same picture.
    expect(drawn(held, role, 3).text).not.toBe(drawn(loose, role, 3).text);
  });

  it("puts the zone on the pilot's screen and not the navigator's", () => {
    // The zone's fill is an rgba the log does not name; its rim is the hex.
    const p1 = count(drawn(hung(), "p1", 3).text, PALETTE.goodRim);
    const p2 = count(drawn(hung(), "p2", 3).text, PALETTE.goodRim);
    const test = count(drawn(hung(), "test", 3).text, PALETTE.goodRim);
    expect(p1).toBeGreaterThan(p2);
    expect(test).toBeGreaterThan(p2);
  });

  it("puts the sum on the navigator's screen and not the pilot's", () => {
    // The sum's marker is stroked in the ember's rim, which nothing else on
    // a hung field names until a rock is shed.
    const navigator = hung();
    pulled(navigator);
    const p2 = count(drawn(navigator, "p2", 3).text, PALETTE.emberRim);
    const pilot = hung();
    pulled(pilot);
    const p1 = count(drawn(pilot, "p1", 3).text, PALETTE.emberRim);
    const both = hung();
    pulled(both);
    const test = count(drawn(both, "test", 3).text, PALETTE.emberRim);
    expect(p2).toBeGreaterThan(p1);
    expect(test).toBeGreaterThan(p1);
  });

  it.each(ROLES)("lights the hold's pips while the sum is in the zone, on %s", (role) => {
    const outside = hung();
    pulled(outside);
    const inside = hung();
    heldInZone(inside);
    // Lit pips name the text white; unlit ones the grey.
    expect(count(drawn(inside, role, 3).text, PALETTE.text)).toBeGreaterThan(
      count(drawn(outside, role, 3).text, PALETTE.text),
    );
  });

  it.each(ROLES)(
    "hangs the mass lower with fibres parted, and greys the slack tendon, on %s",
    (role) => {
      const whole = hung();
      const torn = hung();
      worn(torn);
      expect(drawn(torn, role, 3).text).not.toBe(drawn(whole, role, 3).text);
      const gone = hung();
      slack(gone);
      expect(drawn(gone, role, 3).calls).toBeGreaterThan(0);
    },
  );

  it.each(ROLES)("draws the handles swinging after a snap, with no hint word, on %s", (role) => {
    const world = hung();
    const s = tendon(world);
    s.snapBeat = world.beat;
    const frame = drawn(world, role, 3);
    expect(frame.text).toContain(PALETTE.ember);
    expect(frame.words.some((w) => w.includes("PULL"))).toBe(false);
  });

  it.each(ROLES)("draws the falling mass on its way to the hull, on %s", (role) => {
    const world = hung();
    for (let i = 0; i < 4 * TPB; i++) step(world, []);
    falling(world);
    const frame = drawn(world, role, 3);
    expect(frame.words.some((w) => w.includes("SWAY"))).toBe(true);
    expect(frame.text).toContain(PALETTE.hull);
  });

  it.each(ROLES)("fades the mass out over its last beats once landed clear, on %s", (role) => {
    const world = hung();
    for (let i = 0; i < 6 * TPB; i++) step(world, []);
    const s = out(world);
    const going = count(drawn(world, role, 3).text, PALETTE.hullRim);
    s.outBeat = world.beat - CFG.sinewOutBeats - 1;
    const gone = count(drawn(world, role, 3).text, PALETTE.hullRim);
    expect(going).toBeGreaterThan(gone);
  });

  it.each(ROLES)("reddens the mass that landed on the hull, on %s", (role) => {
    const world = hung();
    for (let i = 0; i < 6 * TPB; i++) step(world, []);
    crushed(world);
    const text = drawn(world, role, 3).text;
    expect(text).toContain(PALETTE.emberRim);
    expect(hullRow(CFG)).toBeGreaterThan(CFG.sinewMassRow);
  });

  it("keeps a snap's flash as a transient the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest([{ type: "sinewSnap", col: 5, rocks: 1 }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });

  it("throws a burst at the mass on a catch, and clears it on reset", () => {
    // The baseline is noted too, so the only difference the comparison can
    // catch is the burst the event itself throws — not the note.
    const baseline = new Effects();
    baseline.boss.sinew.note(10, 20);

    const fx = new Effects();
    fx.boss.sinew.note(10, 20);
    fx.ingest([{ type: "sinewCatch", col: 5 }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    expect(fx).not.toEqual(baseline);
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});

/**
 * **The handle's word is the field's one cue** (`docs/decisions.md` #34,
 * `render/src/boss-cue-text.ts`). Until 18 September 2026 it was a word of
 * `handle-draw.ts`'s own, in a second type at a second size, drawn under *both*
 * handles — yours bright and theirs dim — so a pair met two prompt systems in
 * one fight. It is a `BossCue` now, which brings the seat rule with it: an
 * instruction stands on the phone whose thumb can perform it, and the partner's
 * hand is read off the ring filling, which is what a ring is for.
 */
describe("THE SINEW's word", () => {
  /** How many handles each screen may be asked about: one each, both on the
   * rig, which is the screen that is nobody's hands. */
  const ASKED: Record<ViewRole, number> = { p1: 1, p2: 1, test: 2 };

  it.each(ROLES)("stands on this seat's handle and not on the other's, on %s", (role) => {
    const { words } = drawn(hung(), role, 3);
    expect(words.filter((w) => w === "PULL").length).toBe(ASKED[role]);
  });

  // No `CARRY` over it: the verb is the motion already (`saysKind`, the owner,
  // 24 September 2026).
  it.each(ROLES)("says the verb alone, in the cue's grey, on %s", (role) => {
    const { words, text } = drawn(hung(), role, 3);
    expect(words).not.toContain("CARRY");
    expect(text, "the cue is drawn in rock grey, never an ammunition colour").toContain(
      PALETTE.rock,
    );
  });

  it.each(ROLES)("changes the verb once the mass falls, on %s", (role) => {
    const world = hung();
    falling(world);
    const { words } = drawn(world, role, 3);
    expect(words.filter((w) => w === "SWAY").length).toBe(ASKED[role]);
    expect(words).not.toContain("PULL");
    expect(words).not.toContain("CARRY");
  });
});
