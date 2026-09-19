import { describe, expect, it } from "bun:test";
import { NO_BEARING, TURN } from "../src/bearing.js";
import { DEFAULT_CONFIG, type SimConfig } from "../src/config.js";
import { ORRERY_RINGS, type OrreryState, orreryBoss, orreryOrbit } from "../src/orrery.js";
import { orreryAdrift, orreryCycle, orreryNextOpen, orreryShaftOpen } from "../src/orrery-beat.js";
import { orreryHandRing, orreryRingHeard } from "../src/orrery-hand.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * **THE ORRERY's parity**: the states the pilot's own thumb can put the rings
 * into, in which no beat ahead opens the shaft at all.
 *
 * Its own file rather than another block in `orrery-hand.test.ts`, which is
 * already past the 250-line ceiling — and the seam is real: everything here
 * is about an arrangement of anchors and nothing about the gesture that
 * reaches one. The gesture is next door.
 *
 * The fact under all of it is that the orbits share factors on purpose
 * (`config-orrery.ts`): an alignment exists only when the anchors agree
 * modulo what the orbits share, and a hand writes an anchor. So the boss can
 * be wound into an arrangement with no window in it — which is not a bug and
 * is checked here to be one the field names and the same hand can undo.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
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

/** The hand carried one organ round its own ring, written straight to the anchor. */
function windOne(cfg: SimConfig, b: OrreryState, ring: number): void {
  const orbit = orreryOrbit(cfg, ring);
  b.from[ring] = ((((b.from[ring] ?? 0) + 1) % orbit) + orbit) % orbit;
}

describe("the cycle is the horizon", () => {
  it("is the least common multiple of the orbits still on the boss", () => {
    const world = open();
    const b = rings(world);
    // 8, 6 and 4, which `config-orrery.ts` picked for this number.
    expect(orreryCycle(CFG, b)).toBe(24);
    b.broken = 1;
    expect(orreryCycle(CFG, b)).toBe(12);
    b.broken = 2;
    expect(orreryCycle(CFG, b)).toBe(4);
    // Nothing left in the way: the shaft is open on every beat there is, so
    // the picture repeats every beat.
    b.broken = ORRERY_RINGS;
    expect(orreryCycle(CFG, b)).toBe(1);
  });

  it("is a horizon past which nothing new can happen", () => {
    const world = open();
    const b = rings(world);
    const cycle = orreryCycle(CFG, b);
    // Every ring's gap is back where it was, so every beat's answer is too.
    // This is the whole licence `orreryAdrift` takes to read `-1` as *never*.
    for (let beat = 0; beat < 3 * cycle; beat++) {
      expect(orreryShaftOpen(CFG, b, beat + cycle)).toBe(orreryShaftOpen(CFG, b, beat));
    }
  });
});

describe("a thumb can wind the rings into a parity with no window in it", () => {
  it("and six of the outer ring's eight positions are one", () => {
    const world = open();
    const b = rings(world);
    const base = [...b.from];
    let adrift = 0;
    for (let organs = 0; organs < orreryOrbit(CFG, 0); organs++) {
      b.from[0] = ((base[0] ?? 0) + organs) % orreryOrbit(CFG, 0);
      if (orreryAdrift(CFG, b, world.beat)) adrift++;
    }
    // Not a round number chosen to be alarming: 8 and the two rings behind it
    // share a factor of two, so only the positions that agree modulo it can
    // ever bring three gaps to the bottom together.
    expect(adrift).toBe(6);
  });

  it("says so rather than showing nothing — the readout is a fact, not a cap", () => {
    const world = open();
    const b = rings(world);
    windOne(CFG, b, 0);
    expect(orreryAdrift(CFG, b, world.beat)).toBe(true);
    // The old reading of this state: a search that ran out. Both are `-1` and
    // only one of them is something a pair can be told.
    expect(orreryNextOpen(CFG, b, world.beat, 256)).toBe(-1);
  });

  it("is false where the fight starts, so the word is not the fight's whole length", () => {
    const world = open();
    const b = rings(world);
    expect(orreryAdrift(CFG, b, world.beat)).toBe(false);
    expect(orreryNextOpen(CFG, b, world.beat, 24)).toBeGreaterThanOrEqual(0);
  });

  it("is false with the core naked: there is nothing left to line up", () => {
    const world = open();
    const b = rings(world);
    b.broken = ORRERY_RINGS;
    b.phase = "naked";
    expect(orreryAdrift(CFG, b, world.beat)).toBe(false);
  });

  it("is true while a ring is cracked, which is that state and not this one", () => {
    const world = open();
    const b = rings(world);
    b.phase = "seized";
    b.from[0] = orreryOrbit(CFG, 0) - CFG.orreryCrackOrgans;
    // A jammed gap short of the bottom shuts the shaft on every beat there is.
    // The reading asks about `seized` first and answers it with its own word,
    // so this sentence stays true rather than carrying an exception.
    expect(orreryAdrift(CFG, b, world.beat)).toBe(true);
  });
});

describe("the word it puts on the field is never a lie", () => {
  it("can always be answered by turning the ring the hand is on", () => {
    const world = open();
    const b = rings(world);
    for (let broken = 0; broken < ORRERY_RINGS; broken++) {
      b.broken = broken;
      b.phase = "rings";
      const ring = orreryHandRing(b);
      const orbit = orreryOrbit(CFG, ring);
      // Every arrangement this ring can be wound into, from every one it can
      // be wound out of: at least one of them aligns. That is what makes
      // `TURN` an instruction rather than a shrug — the ring under the thumb
      // runs through every residue of its own orbit while the ones behind it
      // hold still, so a parity it can reach is always there to reach.
      for (let start = 0; start < orbit; start++) {
        b.from[ring] = start;
        let found = false;
        for (let organs = 0; organs < orbit && !found; organs++) {
          if (!orreryAdrift(CFG, b, world.beat)) found = true;
          else windOne(CFG, b, ring);
        }
        expect(found).toBe(true);
      }
    }
  });

  it("goes out under the hand that answers it, one organ at a time", () => {
    const world = open();
    const b = rings(world);
    windOne(CFG, b, 0);
    expect(orreryAdrift(CFG, b, world.beat)).toBe(true);
    // The real control rather than a written anchor: the thumb going on, then
    // carried round in quarter-turn samples until the field stops asking.
    orreryRingHeard(world, 1, {
      kind: "drag",
      target: "orreryRing",
      on: true,
      fromMilli: NO_BEARING,
    });
    let at = 0;
    orreryRingHeard(world, 1, { kind: "drag", target: "orreryRing", on: true, fromMilli: at });
    for (let i = 0; i < 64 && orreryAdrift(CFG, b, world.beat); i++) {
      at = (at + 250) % TURN;
      orreryRingHeard(world, 1, { kind: "drag", target: "orreryRing", on: true, fromMilli: at });
    }
    expect(orreryAdrift(CFG, b, world.beat)).toBe(false);
    expect(orreryNextOpen(CFG, b, world.beat, orreryCycle(CFG, b))).toBeGreaterThanOrEqual(0);
  });
});
