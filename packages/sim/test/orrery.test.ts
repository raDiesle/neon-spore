import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, type SimConfig, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import {
  ORRERY_RINGS,
  type OrreryState,
  orreryBoss,
  orreryCoreCol,
  orreryGapSlot,
  orreryNextOpen,
  orreryOrbit,
  orreryRingOpen,
  orreryShaftOpen,
} from "../src/orrery.js";
import { orreryGapCol } from "../src/orrery-gap.js";
import { orreryStruck } from "../src/orrery-shot.js";
import { slowing } from "../src/slow.js";
import { step } from "../src/step.js";
import type { Bullet, Color } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * THE ORRERY, and the sentence it is built to make true: **the one boss whose
 * answer is a beat neither of you can work out alone**
 * (`docs/spec/bosses-choreographed.md` §2, shipped as `docs/spec/bosses.md`
 * §11.21).
 *
 * What is checked here is the arithmetic, because the arithmetic *is* the
 * boss: that each ring comes round on its own count, that the anchors put the
 * first alignment where the configuration says — a boss that could install
 * itself unbeatable is not a boss — that the shaft is open only when every
 * unbroken ring is, that a shot on such a beat takes the outermost ring and
 * changes the colour the next one needs, that one off the beat costs nothing
 * at all, that the core spits but never down the column the pair has to fire
 * up, and that the naked core refuses a bolt and takes the beam.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const CORE = orreryCoreCol(CFG);
/** The wave it is installed on. Any number: it is a wave like any other. */
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

/** Beats, in ticks, with nobody pressing anything. */
function beats(world: World, n: number): void {
  for (let i = 0; i < n * TPB; i++) step(world, []);
}

/** A shot arriving at the top of a column, which is the only way anything reaches it. */
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

describe("the three orbits", () => {
  it("brings each ring's gap round on its own count", () => {
    const world = open();
    const b = rings(world);
    for (let ring = 0; ring < ORRERY_RINGS; ring++) {
      const orbit = orreryOrbit(CFG, ring);
      expect(orbit).toBeGreaterThan(1);
      const at = orreryGapSlot(CFG, b, ring, 30);
      // A whole orbit later it is exactly where it was, and not before.
      expect(orreryGapSlot(CFG, b, ring, 30 + orbit)).toBe(at);
      expect(orreryGapSlot(CFG, b, ring, 30 + 1)).not.toBe(at);
    }
  });

  it("puts the first alignment where the configuration says", () => {
    // The one thing the anchors exist for: three residues picked apart need
    // not ever come together, and with orbits that share factors they usually
    // do not (`orreryAnchors`).
    const world = open();
    const b = rings(world);
    const first = b.anchorBeat + CFG.orreryFirstBeats;
    expect(orreryShaftOpen(CFG, b, first)).toBe(true);
    expect(orreryNextOpen(CFG, b, b.anchorBeat, 64)).toBe(CFG.orreryFirstBeats);
  });

  it("opens the shaft only on a beat every unbroken ring is open on", () => {
    const world = open();
    const b = rings(world);
    let shut = 0;
    for (let beat = b.anchorBeat; beat < b.anchorBeat + 24; beat++) {
      const every = [0, 1, 2].every((ring) => orreryRingOpen(CFG, b, ring, beat));
      expect(orreryShaftOpen(CFG, b, beat)).toBe(every);
      if (!every) shut += 1;
    }
    // And it is shut for most of them, or there is no window to agree on.
    expect(shut).toBeGreaterThan(20);
  });

  it("asks less of the pair as the fight goes on, because the rings go outermost first", () => {
    const world = open();
    const b = rings(world);
    const whole = orreryNextOpen(CFG, b, b.anchorBeat + 1, 96);
    b.broken = 2;
    const last = orreryNextOpen(CFG, b, b.anchorBeat + 1, 96);
    expect(last).toBeGreaterThanOrEqual(0);
    expect(last).toBeLessThan(whole);
  });

  it("stands a gap over the core's own column at the bottom of its orbit and at the top", () => {
    // Which is why a column is never what the rules ask about: both ends of
    // the orbit are over the middle, and only one of them is a hole a shot can
    // pass (`orrery-gap.ts`).
    const world = open();
    const b = rings(world);
    for (let ring = 0; ring < ORRERY_RINGS; ring++) {
      const orbit = orreryOrbit(CFG, ring);
      const bottom = b.anchorBeat + CFG.orreryFirstBeats;
      expect(orreryGapCol(CFG, b, ring, bottom)).toBe(CORE);
      expect(orreryGapCol(CFG, b, ring, bottom + orbit / 2)).toBe(CORE);
      expect(orreryRingOpen(CFG, b, ring, bottom)).toBe(true);
      expect(orreryRingOpen(CFG, b, ring, bottom + orbit / 2)).toBe(false);
    }
  });

  it("keeps every gap inside the field", () => {
    const world = open();
    const b = rings(world);
    for (let ring = 0; ring < ORRERY_RINGS; ring++) {
      for (let beat = 0; beat < 32; beat++) {
        const col = orreryGapCol(CFG, b, ring, beat);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(CFG.cols);
      }
    }
  });
});

describe("the shot that takes a ring", () => {
  it("takes the outermost ring still standing and changes the core's colour", () => {
    const world = open();
    const b = rings(world);
    const beat = b.anchorBeat + CFG.orreryFirstBeats;
    const was = b.color;
    orreryStruck(world, shot(world, CORE, was), beat);
    expect(b.broken).toBe(1);
    expect(b.color).not.toBe(was);
    expect(b.brokeBeat).toBe(world.beat);
    expect(b.phase).toBe("spitting");
  });

  it("costs nothing at all off the beat", () => {
    const world = open();
    const b = rings(world);
    const beat = b.anchorBeat + CFG.orreryFirstBeats + 1;
    expect(orreryShaftOpen(CFG, b, beat)).toBe(false);
    const before = world.events.length;
    orreryStruck(world, shot(world, CORE, b.color), beat);
    expect(b.broken).toBe(0);
    // Not even a reject: it is armour both screens were drawing.
    expect(world.events.length).toBe(before);
  });

  it("charges the wrong colour as a colour miss and takes no ring", () => {
    const world = open();
    const b = rings(world);
    const beat = b.anchorBeat + CFG.orreryFirstBeats;
    const wrong: Color = b.color === "red" ? "cyan" : "red";
    orreryStruck(world, shot(world, CORE, wrong), beat);
    expect(b.broken).toBe(0);
    expect(world.events.some((e) => e.type === "reject")).toBe(true);
  });

  it("ignores a shot up any other column", () => {
    const world = open();
    const b = rings(world);
    const beat = b.anchorBeat + CFG.orreryFirstBeats;
    orreryStruck(world, shot(world, CORE + 1, b.color), beat);
    orreryStruck(world, shot(world, 0, b.color), beat);
    expect(b.broken).toBe(0);
  });

  it("sheds organs as ordinary rocks when a ring comes off", () => {
    const world = open();
    const b = rings(world);
    orreryStruck(world, shot(world, CORE, b.color), b.anchorBeat + CFG.orreryFirstBeats);
    const rocks = world.creatures.filter((c) => c.kind === "meteor");
    expect(rocks).toHaveLength(CFG.orreryDebris);
    // Never in the column the cannon has to stand in: an organ was out at the
    // ring's radius, and the middle of a ring is where none of them ever was.
    for (const rock of rocks) expect(rock.col).not.toBe(CORE);
  });
});

describe("the naked core", () => {
  function naked(world: World, b: OrreryState): void {
    b.broken = ORRERY_RINGS;
    b.phase = "naked";
    b.phaseBeat = world.beat;
  }

  it("is spent on by an ordinary bolt and takes the beam", () => {
    const world = open();
    const b = rings(world);
    naked(world, b);
    orreryStruck(world, shot(world, CORE, b.color), world.beat);
    expect(b.phase).toBe("naked");
    orreryStruck(world, shot(world, CORE, b.color, true), world.beat);
    expect(b.phase).toBe("out");
    expect(slowing(world)).toBe(true);
  });

  it("goes out and takes the boss with it", () => {
    const world = open();
    const b = rings(world);
    naked(world, b);
    orreryStruck(world, shot(world, CORE, b.color, true), world.beat);
    beats(world, CFG.orreryOutBeats + 2);
    expect(orreryBoss(world)).toBeNull();
  });
});

describe("the core's own fire", () => {
  it("says nothing while every ring is up", () => {
    const world = open();
    beats(world, CFG.orreryFirstBeats);
    expect(world.creatures).toHaveLength(0);
  });

  it("spits once a ring is off, and never down the column the pair fires up", () => {
    const world = open();
    const b = rings(world);
    orreryStruck(world, shot(world, CORE, b.color), b.anchorBeat + CFG.orreryFirstBeats);
    const shed = world.creatures.length;
    beats(world, CFG.orrerySpitBeats * 4);
    const spat = world.creatures.filter((c) => c.kind === "meteor").length;
    expect(spat).toBeGreaterThan(shed);
    for (const rock of world.creatures) expect(rock.col).not.toBe(CORE);
  });
});

describe("the same run twice", () => {
  it("fingerprints the same way", () => {
    const one = open(11);
    const two = open(11);
    beats(one, 20);
    beats(two, 20);
    expect(hashWorld(one)).toBe(hashWorld(two));
  });

  it("carries the anchors in the fingerprint", () => {
    const world = open(11);
    const other = open(11);
    const b = rings(other);
    b.from[0] = (b.from[0] ?? 0) + 1;
    expect(hashWorld(other)).not.toBe(hashWorld(world));
  });
});
