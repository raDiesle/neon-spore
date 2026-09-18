import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, midCol, type SimConfig, ticksPerBeat } from "../src/config.js";
import { type DiastoleState, diastoleChamberCol, diastoleContracts } from "../src/diastole.js";
import { diastoleCoincides } from "../src/diastole-open.js";
import { diastoleBoss, diastoleStruck } from "../src/diastole-step.js";
import { hashWorld } from "../src/hash.js";
import { NO_SLOW, slowing, slowRateMilli } from "../src/slow.js";
import { step } from "../src/step.js";
import type { Bullet, Color, TimedCommand } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, MILLI, type World } from "../src/world.js";

/**
 * THE DIASTOLE, and the sentence it is built to make true: **two hearts on two
 * cadences, one each, and the fight is the beat they coincide**
 * (`docs/spec/bosses-choreographed.md` §7).
 *
 * What is checked here is the arithmetic, because the arithmetic *is* the boss:
 * that three and five meet every fifteen beats and on no beat between, that a
 * chamber can only be hurt while it is contracting, that from the moment both
 * are beating nothing single lands at all, and that the beam in the bridge
 * takes both at once. And then THE SLOW, which this boss is the first thing in
 * the game to open: that a window is exactly as long as it was asked for, that
 * its boundaries are in the fingerprint, and that nothing else about the
 * simulation can tell one is open (`docs/decisions.md` #33).
 *
 * The alone chamber's beat has to be *held* as well as counted, by player
 * 1's thumb (`diastole-hand.ts`); the clamp's own receipts are in
 * `diastole-clamp.test.ts`, and here it is only what the tests below need to
 * reach the last chamber at all.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const BRIDGE = midCol(CFG);
const LEFT = diastoleChamberCol(CFG, -1);
const RIGHT = diastoleChamberCol(CFG, 1);
/** The wave it is installed on. Any number: it is a wave like any other. */
const WAVE = 9;

function open(seed = 5): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "diastole" });
  return world;
}

function lobe(world: World): DiastoleState {
  const boss = diastoleBoss(world);
  if (boss === null) throw new Error("no twin lobe installed");
  return boss;
}

/** Beats, in ticks, with nobody pressing anything. */
function beats(world: World, n: number): void {
  for (let i = 0; i < n * TPB; i++) step(world, []);
}

/**
 * A shot that has just left through the top of a column, handed straight to
 * the boss. That is the whole of what `bullets.ts` and `lance-burn.ts` do with
 * one at the top of the field, and building it here is what lets a test say
 * *this column, this colour, this beat* without also having to time a bolt's
 * flight up fourteen rows.
 */
function shot(world: World, col: number, color: Color, lance = false): Bullet {
  return {
    id: world.nextId++,
    col,
    row: 0,
    subMilli: 0,
    color,
    lance,
    driftMilli: 0,
    aimMilli: 0,
  };
}

/**
 * A shot handed to the boss on the beat the world is on — which is what
 * `bullets.ts` does, because a bolt is advanced *after* `onBeat` has counted
 * the beat. The beam is the other caller and it is one beat different on a
 * boundary tick; the end-to-end test at the bottom is the one that goes
 * through it rather than through here (`beamBeat` in `lance-burn.ts`).
 */
function strike(world: World, bullet: Bullet): void {
  diastoleStruck(world, bullet, world.beat);
}

/** Player 1's thumb on the alone chamber, down or lifted, on this tick. */
function clamp(world: World, on: boolean): void {
  const press: TimedCommand = {
    tick: world.tick,
    player: 1,
    command: { kind: "drag", target: "diastoleChamber", on, fromMilli: 0 },
  };
  step(world, [press]);
}

/**
 * The alone chamber's next contraction, with the thumb clamped on it: the
 * beat the beam can land on once the left is a hollow (`diastole-open.ts`).
 */
function toClampedBeat(world: World): void {
  while (!diastoleContracts(lobe(world), world.beat, 1)) beats(world, 1);
  clamp(world, true);
}

/** Take the left chamber the ordinary way, as often as phase `one` allows. */
function takeLeftOrdinary(world: World, times: number): void {
  for (let i = 0; i < times; i++) {
    while (!diastoleContracts(lobe(world), world.beat, -1)) beats(world, 1);
    strike(world, shot(world, LEFT, "red"));
    beats(world, 1);
  }
}

describe("THE DIASTOLE's two cadences", () => {
  it("beats the left every three and leaves the right still", () => {
    const world = open();
    const b = lobe(world);
    expect(b.phase).toBe("one");
    for (let beat = 0; beat < 16; beat++) {
      expect(diastoleContracts(b, b.phaseBeat + beat, -1)).toBe(beat % 3 === 0);
      // Standing but not beating: the whole of phase one is one count, so the
      // pair arrives at two counts having learned that a count is said aloud.
      expect(diastoleContracts(b, b.phaseBeat + beat, 1)).toBe(false);
    }
  });

  it("meets every fifteen beats once both are beating, and on no beat between", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    const b = lobe(world);
    expect(b.phase).toBe("two");
    expect(b.leftEvery).toBe(CFG.diastoleLeftBeats);
    expect(b.rightEvery).toBe(CFG.diastoleRightBeats);
    const met: number[] = [];
    for (let beat = 0; beat < 31; beat++) {
      if (diastoleCoincides(b, b.phaseBeat + beat)) met.push(beat);
    }
    expect(met).toEqual([0, 15, 30]);
  });

  it("re-anchors both counts on the phase it changes them in", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    const b = lobe(world);
    // The origin is the beat the phase began on and not the wave's start, so a
    // pair counting from the contraction they just watched is counting right.
    expect(diastoleContracts(b, b.phaseBeat, -1)).toBe(true);
    expect(diastoleContracts(b, b.phaseBeat, 1)).toBe(true);
  });
});

describe("what reaches a chamber", () => {
  it("takes the left on one of its own contractions, in its own colour", () => {
    const world = open();
    while (!diastoleContracts(lobe(world), world.beat, -1)) beats(world, 1);
    strike(world, shot(world, LEFT, "red"));
    expect(lobe(world).leftHits).toBe(CFG.diastoleChamberHits - 1);
  });

  it("takes nothing while the chamber is slack", () => {
    const world = open();
    while (diastoleContracts(lobe(world), world.beat, -1)) beats(world, 1);
    const before = lobe(world).leftHits;
    strike(world, shot(world, LEFT, "red"));
    expect(lobe(world).leftHits).toBe(before);
    // And it is not charged for, THE VANE's shut housing exactly: the window is
    // visibly not open on the screen of the seat that owns it.
    expect(world.balance.colorMisses).toBe(0);
  });

  it("counts the wrong colour inside the window as a colour miss and nothing else", () => {
    const world = open();
    while (!diastoleContracts(lobe(world), world.beat, -1)) beats(world, 1);
    strike(world, shot(world, LEFT, "cyan"));
    expect(lobe(world).leftHits).toBe(CFG.diastoleChamberHits);
    expect(world.balance.colorMisses).toBe(1);
  });

  it("never takes the right chamber the ordinary way, in any colour", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    for (let beat = 0; beat < 16; beat++) {
      for (const color of ["red", "cyan"] as const) {
        strike(world, shot(world, RIGHT, color));
      }
      beats(world, 1);
    }
    expect(lobe(world).rightHits).toBe(CFG.diastoleChamberHits);
  });

  it("stops taking single chambers the moment the right wakes", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    const b = lobe(world);
    for (let beat = 0; beat < 16; beat++) {
      strike(world, shot(world, LEFT, "red"));
      beats(world, 1);
    }
    expect(b.leftHits).toBe(1);
  });
});

describe("the bridge", () => {
  function toCoincidence(world: World): void {
    while (!diastoleCoincides(lobe(world), world.beat)) beats(world, 1);
  }

  it("is not reached by an ordinary bolt", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    toCoincidence(world);
    strike(world, shot(world, BRIDGE, "red"));
    expect(lobe(world).leftHits).toBe(1);
    expect(lobe(world).rightHits).toBe(CFG.diastoleChamberHits);
  });

  it("is not reached by a beam standing anywhere else", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    toCoincidence(world);
    strike(world, shot(world, LEFT, "red", true));
    expect(lobe(world).leftHits).toBe(1);
  });

  it("takes nothing on a beat the two do not meet", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    toCoincidence(world);
    beats(world, 1);
    expect(diastoleCoincides(lobe(world), world.beat)).toBe(false);
    strike(world, shot(world, BRIDGE, "red", true));
    expect(lobe(world).leftHits).toBe(1);
    expect(lobe(world).rightHits).toBe(CFG.diastoleChamberHits);
  });

  it("takes one off both chambers at once on the beat they meet", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    toCoincidence(world);
    // Whichever trigger loaded it: the bridge is violet vessels and carries
    // neither ammunition colour, which is why it is the only answer to two
    // chambers that carry different ones.
    strike(world, shot(world, BRIDGE, "cyan", true));
    const b = lobe(world);
    expect(b.leftHits).toBe(0);
    expect(b.rightHits).toBe(CFG.diastoleChamberHits - 1);
    expect(b.struckSide).toBe(0);
    expect(b.struckBeat).toBe(world.beat);
  });

  it("leaves one chamber standing and moves its count to sevens", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    toCoincidence(world);
    strike(world, shot(world, BRIDGE, "red", true));
    beats(world, 1);
    const b = lobe(world);
    expect(b.phase).toBe("alone");
    expect(b.rightEvery).toBe(CFG.diastoleRightAloneBeats);
    // And the collapse is forever: the left is a hollow and no beat of it
    // comes round again.
    for (let beat = 0; beat < 21; beat++) {
      expect(diastoleContracts(b, b.phaseBeat + beat, -1)).toBe(false);
      expect(diastoleContracts(b, b.phaseBeat + beat, 1)).toBe(beat % 7 === 0);
    }
  });

  it("finishes the last chamber on its own beat, and the coincidence is that beat", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    toCoincidence(world);
    strike(world, shot(world, BRIDGE, "red", true));
    beats(world, 1);
    for (let i = 0; i < CFG.diastoleChamberHits - 1; i++) {
      toClampedBeat(world);
      expect(diastoleCoincides(lobe(world), world.beat)).toBe(true);
      strike(world, shot(world, BRIDGE, "red", true));
      clamp(world, false);
      beats(world, 1);
    }
    expect(lobe(world).rightHits).toBe(0);
    expect(lobe(world).phase).toBe("burst");
  });

  it("holds its wave open for the whole burst and then lets go", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    toCoincidence(world);
    strike(world, shot(world, BRIDGE, "red", true));
    beats(world, 1);
    for (let i = 0; i < CFG.diastoleChamberHits - 1; i++) {
      toClampedBeat(world);
      strike(world, shot(world, BRIDGE, "red", true));
      clamp(world, false);
      beats(world, 1);
    }
    expect(world.boss).not.toBeNull();
    beats(world, CFG.diastoleBurstBeats);
    expect(world.boss).toBeNull();
  });
});

describe("THE SLOW, which this boss is the first thing to open", () => {
  function toCoincidence(world: World): void {
    while (!diastoleCoincides(lobe(world), world.beat)) beats(world, 1);
  }

  it("opens nothing at all until something dramatic happens", () => {
    const world = open();
    expect(world.slowFromBeat).toBe(NO_SLOW);
    expect(world.slowToBeat).toBe(NO_SLOW);
    expect(slowing(world)).toBe(false);
    expect(slowRateMilli(world)).toBe(MILLI);
    takeLeftOrdinary(world, 2);
    // Not on the ordinary hits of the learning phase: a slow on every shot
    // would be the brief's own refusal (`docs/decisions.md` #33).
    expect(slowing(world)).toBe(false);
  });

  it("opens on the beat the two rhythms stop together, for exactly as long as asked", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    toCoincidence(world);
    strike(world, shot(world, BRIDGE, "red", true));
    expect(world.slowFromBeat).toBe(world.beat);
    expect(world.slowToBeat).toBe(world.beat + CFG.slowBeats);
    expect(slowing(world)).toBe(true);
    expect(slowRateMilli(world)).toBe(CFG.slowRateMilli);
    // Half-open: the beat it closes on is the first ordinary beat again.
    beats(world, CFG.slowBeats - 1);
    expect(slowing(world)).toBe(true);
    beats(world, 1);
    expect(slowing(world)).toBe(false);
    expect(slowRateMilli(world)).toBe(MILLI);
  });

  it("opens over the burst for the length of the burst", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    toCoincidence(world);
    strike(world, shot(world, BRIDGE, "red", true));
    beats(world, 1);
    for (let i = 0; i < CFG.diastoleChamberHits - 1; i++) {
      toClampedBeat(world);
      strike(world, shot(world, BRIDGE, "red", true));
      clamp(world, false);
      beats(world, 1);
    }
    expect(lobe(world).phase).toBe("burst");
    expect(world.slowToBeat).toBe(lobe(world).phaseBeat + CFG.diastoleBurstBeats);
    expect(slowing(world)).toBe(true);
  });

  it("puts its boundaries in the fingerprint", () => {
    const world = open();
    const before = hashWorld(world);
    world.slowFromBeat = world.beat;
    world.slowToBeat = world.beat + CFG.slowBeats;
    expect(hashWorld(world)).not.toBe(before);
  });

  it("is cleared by the next wave rather than inherited", () => {
    const world = open();
    world.slowFromBeat = world.beat;
    world.slowToBeat = world.beat + 40;
    startWave(world, WAVE + 1, [], []);
    expect(world.slowFromBeat).toBe(NO_SLOW);
    expect(slowing(world)).toBe(false);
  });
});

describe("the lance, all the way through", () => {
  /**
   * The one end-to-end pass, and it is the load-bearing path: the beam is the
   * only shot that reaches the bridge, it resolves the column on the tick the
   * fill comes full rather than travelling, and the pair's whole problem is
   * that the fill has to *finish* on a beat neither of them can see alone.
   */
  it("takes both chambers when the fill comes full on the coincidence beat", () => {
    const world = open();
    takeLeftOrdinary(world, 2);
    // The next coincidence with room to start a fill before it.
    let target = world.beat;
    while (
      !diastoleCoincides(lobe(world), target) ||
      target - world.beat < CFG.lancePrimeBeats + 1
    ) {
      target += 1;
    }
    beats(world, target - world.beat - CFG.lancePrimeBeats);
    world.cannonCol = BRIDGE;
    const press: TimedCommand = {
      tick: world.tick,
      player: 2,
      command: { kind: "prime", on: true, color: "red" },
    };
    step(world, [press]);
    // Held, with the cannon standing still, until the lobe comes full.
    for (let i = 0; i < CFG.lancePrimeBeats * TPB; i++) step(world, []);
    expect(world.beam).not.toBeNull();
    expect(world.beam?.col).toBe(BRIDGE);
    const b = lobe(world);
    expect(b.struckBeat).toBe(target);
    expect(b.leftHits).toBe(0);
    expect(b.rightHits).toBe(CFG.diastoleChamberHits - 1);
    expect(slowing(world)).toBe(true);
  });
});
