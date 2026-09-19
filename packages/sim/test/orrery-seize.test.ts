import { describe, expect, it } from "bun:test";
import { NO_BEARING, TURN } from "../src/bearing.js";
import { DEFAULT_CONFIG, type SimConfig, ticksPerBeat } from "../src/config.js";
import {
  ORRERY_PHASES,
  ORRERY_RINGS,
  type OrreryState,
  orreryBoss,
  orreryCoreCol,
  orreryOrbit,
  orrerySeized,
} from "../src/orrery.js";
import { orreryGapSlot, orreryNextOpen, orreryShaftOpen } from "../src/orrery-beat.js";
import { orreryRingHeard } from "../src/orrery-hand.js";
import { orreryStruck } from "../src/orrery-shot.js";
import { step } from "../src/step.js";
import type { Bullet, Color } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * **THE ORRERY's second gesture**: a shot does not take a ring off, it cracks
 * it, and the pilot has to turn it home (`.claude/skills/new-boss` §6.2, the
 * states this boss was given on 19 September 2026).
 *
 * The whole of it is one sentence a pair can say to each other — *shoot it,
 * then turn it home* — and what is checked here is that the sentence is true
 * in that order and in no other. That a landed shot puts the boss in `seized`
 * and takes no ring; that the cracked ring **stops drifting**, so the shaft
 * is shut and a second shot is worth nothing while the first is unanswered;
 * that the thumb winding the gap to the bottom is what takes the ring off,
 * and that it cannot overshoot; and that the fight is that pair of things
 * three times over, with the core throwing rocks through the second and the
 * third and silent through the first.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const CORE = orreryCoreCol(CFG);
const WAVE = 9;

function open(seed = 5): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "orrery" });
  return world;
}

function rings(world: World): OrreryState {
  const boss = orreryBoss(world);
  if (boss === null) throw new Error("no orrery installed");
  return boss;
}

function shot(world: World, col: number, color: Color): Bullet {
  return {
    id: world.nextId++,
    col,
    row: 0,
    subMilli: 0,
    color,
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

function send(world: World, at: number): void {
  orreryRingHeard(world, 1, { kind: "drag", target: "orreryRing", on: true, fromMilli: at });
}

/** A thumb going on the ring: no reference, then the sample that becomes one. */
function grab(world: World): void {
  send(world, NO_BEARING);
  send(world, 0);
}

/** The thumb carried `milli` clockwise, in samples of a quarter of a turn. */
function turn(world: World, milli: number): void {
  const b = rings(world);
  let at = b.handAtMilli === NO_BEARING ? 0 : b.handAtMilli;
  let left = milli;
  while (left > 0) {
    const chunk = Math.min(250, left);
    left -= chunk;
    at += chunk;
    send(world, ((at % TURN) + TURN) % TURN);
  }
}

/** Beats, in ticks, with nobody pressing anything. */
function beats(world: World, n: number): void {
  for (let i = 0; i < n * TPB; i++) step(world, []);
}

/** The first beat every unbroken ring's gap is at the bottom, from `beat`. */
function aligned(b: OrreryState, beat: number): number {
  const ahead = orreryNextOpen(CFG, b, beat, 256);
  if (ahead < 0) throw new Error("no alignment inside the cap");
  return beat + ahead;
}

/** The shot that cracks the outermost standing ring, on a beat that lands. */
function crack(world: World, b: OrreryState): void {
  orreryStruck(world, shot(world, CORE, b.color), aligned(b, world.beat));
}

/** Enough thumb to pay every detent the crack owes, and a little over. */
function home(world: World): void {
  grab(world);
  turn(world, CFG.orreryHandMilliPerOrgan * (CFG.orreryCrackOrgans + 1));
}

describe("the shot cracks the ring", () => {
  it("seizes rather than breaking, and takes nothing yet", () => {
    const world = open();
    const b = rings(world);
    const was = b.color;
    crack(world, b);
    expect(b.phase).toBe("seized");
    expect(b.broken).toBe(0);
    // The colour is what the pair reads *rings left* off, so it turns when a
    // ring actually comes away and not when one is hit (`orreryCrack`).
    expect(b.color).toBe(was);
    expect(b.brokeBeat).toBe(-1);
  });

  it("knocks the gap exactly `orreryCrackOrgans` short of the bottom", () => {
    const world = open();
    const b = rings(world);
    crack(world, b);
    const orbit = orreryOrbit(CFG, 0);
    expect(orreryGapSlot(CFG, b, 0, world.beat)).toBe(orbit - CFG.orreryCrackOrgans);
  });

  it("jams that ring: its gap is the same slot on every beat", () => {
    const world = open();
    const b = rings(world);
    crack(world, b);
    expect(orrerySeized(b, 0)).toBe(true);
    const at = orreryGapSlot(CFG, b, 0, world.beat);
    for (let ahead = 1; ahead < 64; ahead++) {
      expect(orreryGapSlot(CFG, b, 0, world.beat + ahead)).toBe(at);
    }
    // And the rings behind it go on turning: the jam is one ring, not a pause
    // button on the boss.
    const inner = orreryGapSlot(CFG, b, 2, world.beat);
    expect(orreryGapSlot(CFG, b, 2, world.beat + 1)).not.toBe(inner);
  });

  it("shuts the shaft until the ring is wound home, so a second shot is nothing", () => {
    const world = open();
    const b = rings(world);
    crack(world, b);
    for (let ahead = 0; ahead < 128; ahead++) {
      expect(orreryShaftOpen(CFG, b, world.beat + ahead)).toBe(false);
    }
    expect(orreryNextOpen(CFG, b, world.beat, 128)).toBe(-1);
    const before = world.events.length;
    orreryStruck(world, shot(world, CORE, b.color), world.beat);
    expect(b.broken).toBe(0);
    expect(world.events.length).toBe(before);
  });
});

describe("the thumb takes the ring", () => {
  it("brings the gap home and the ring comes off on the detent that lands it", () => {
    const world = open();
    const b = rings(world);
    const was = b.color;
    crack(world, b);
    home(world);
    expect(b.broken).toBe(1);
    expect(b.phase).toBe("spitting");
    expect(b.color).not.toBe(was);
    expect(b.brokeBeat).toBe(world.beat);
  });

  it("takes exactly the detents the crack owes, and not one fewer", () => {
    const world = open();
    const b = rings(world);
    crack(world, b);
    grab(world);
    // One detent short: the ring is still on the boss and still jammed.
    turn(world, CFG.orreryHandMilliPerOrgan * (CFG.orreryCrackOrgans - 1));
    expect(b.broken).toBe(0);
    expect(b.phase).toBe("seized");
    turn(world, CFG.orreryHandMilliPerOrgan);
    expect(b.broken).toBe(1);
  });

  it("cannot be wound past the bottom: one sample is never more than an organ", () => {
    const world = open();
    const b = rings(world);
    crack(world, b);
    grab(world);
    // Half a turn is the most a bearing step can be read as (`MAX_BEARING_STEP`)
    // and a detent costs one and a half, so the gap is put on slot 0 and the
    // break is caught there however coarsely the thumb is sampled.
    for (let i = 0; i < 12 && b.phase === "seized"; i++) send(world, (i * 500) % TURN);
    expect(b.broken).toBe(1);
  });

  it("does nothing for the navigator's thumb", () => {
    const world = open();
    const b = rings(world);
    crack(world, b);
    for (let i = 0; i < 12; i++) {
      orreryRingHeard(world, 2, {
        kind: "drag",
        target: "orreryRing",
        on: true,
        fromMilli: (i * 250) % TURN,
      });
    }
    expect(b.phase).toBe("seized");
    expect(b.broken).toBe(0);
  });
});

describe("the fight it makes", () => {
  it("is shoot-then-turn three times, and the last one leaves the core naked", () => {
    const world = open();
    const b = rings(world);
    for (let i = 0; i < ORRERY_RINGS; i++) {
      crack(world, b);
      expect(b.phase).toBe("seized");
      expect(b.broken).toBe(i);
      home(world);
      expect(b.broken).toBe(i + 1);
      beats(world, 1);
    }
    expect(b.phase).toBe("naked");
  });

  it("is silent through the first crack and throwing rocks through the next", () => {
    const world = open();
    const b = rings(world);
    crack(world, b);
    // The pair meets the gesture on an empty field and learns it there.
    beats(world, CFG.orrerySpitBeats * 3);
    expect(world.creatures).toHaveLength(0);
    home(world);
    beats(world, CFG.orreryDebris + 1);
    crack(world, b);
    const before = world.creatures.length;
    beats(world, CFG.orrerySpitBeats * 3);
    expect(world.creatures.length).toBeGreaterThan(before);
    // Never down the column the cannon has to stand in, seized or not.
    for (const rock of world.creatures) expect(rock.col).not.toBe(CORE);
  });

  it("has `seized` between `rings` and `spitting` in the numbering", () => {
    // The phases are a wire value (`orrery-hash.ts`), and the order is the
    // order the fight goes in: the crack is behind the rings and in front of
    // the core's own fire.
    expect([...ORRERY_PHASES]).toEqual(["rings", "seized", "spitting", "naked", "out"]);
  });
});
