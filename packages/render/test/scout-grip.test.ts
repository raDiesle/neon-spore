import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type ScoutState,
  scoutLoad,
  scoutRound,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { scoutLineCircle, scoutPrimeCircle } from "../src/scout-grip.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Two real thumbs on THE SCOUT**, one per seat, both on the same little
 * ship (`sim/scout-hand.ts`, `docs/spec/interludes.md`).
 *
 * What this file asks is the half a simulation cannot: that a press on the
 * ring the picture draws is the press the round would accept, that each ring
 * belongs to the one seat that can see what it is for, and that neither is
 * offered while the ship is light enough not to need it.
 *
 * **The load is set rather than flown to**, which is `sim/scout-hand.ts`'s own
 * arrangement and for its reason: four motes aboard is most of an arena and a
 * minute of flying, and a test that got there by flying would be a test about
 * the flight. The round itself is stepped into `play` rather than posed —
 * that is the gate both handles are behind, and it costs four beats.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const STANDARD: ControlSet = controlSet("default");

const layout = (role: ViewRole = "p2"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function flying(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("scout");
  startWave(world, index, [], [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 40 * TPB; i++) {
    if (round(world).phase === "play") return world;
    step(world, []);
  }
  throw new Error("the round never reached play");
}

function round(world: World): ScoutState {
  const r = scoutRound(world);
  if (r === null) throw new Error("THE SCOUT's wave installed no round");
  return r;
}

/** Put `n` motes aboard without flying to them: the load is the subject here. */
function carry(world: World, n: number): ScoutState {
  const r = round(world);
  r.carrying = Array.from({ length: n }, (_, i) => i);
  return r;
}

const laden = (world: World): ScoutState => carry(world, CFG.scoutLadenMotes + 1);
const heavy = (world: World): ScoutState => carry(world, CFG.scoutHeavyMotes + 1);

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0.4,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

const pressLine = (world: World, seat: 1 | 2, role: ViewRole = "p2"): string | null => {
  const l = layout(role);
  const at = scoutLineCircle(l, CFG, round(world));
  return target(touchDown(l, at.x, at.y, field(world, seat)));
};

const pressPrime = (world: World, seat: 1 | 2, role: ViewRole = "p1"): string | null => {
  const l = layout(role);
  const at = scoutPrimeCircle(l, CFG, round(world));
  return target(touchDown(l, at.x, at.y, field(world, seat)));
};

describe("the navigator's line on a laden ship", () => {
  it("takes hold on the ship itself, where the ring is drawn", () => {
    const world = flying();
    laden(world);
    expect(scoutLoad(CFG, round(world))).toBe("laden");
    expect(pressLine(world, 2)).toBe("scoutLine");
  });

  it("is still there when the ship goes heavy: the line is what brings either home", () => {
    const world = flying();
    heavy(world);
    expect(pressLine(world, 2)).toBe("scoutLine");
  });

  it("is hers, and nothing at all from the pilot", () => {
    // He is flying it. A seat that could reel its own ship home would be one
    // phone playing this round.
    const world = flying();
    laden(world);
    expect(pressLine(world, 1, "p1")).not.toBe("scoutLine");
  });

  it("offers nothing while the ship is light", () => {
    const world = flying();
    expect(scoutLoad(CFG, round(world))).toBe("light");
    expect(pressLine(world, 2)).toBeNull();
  });
});

describe("the pilot's prime off a heavy ship's stern", () => {
  it("takes hold behind the ship, where the ring is drawn", () => {
    const world = flying();
    heavy(world);
    expect(scoutLoad(CFG, round(world))).toBe("heavy");
    expect(pressPrime(world, 1)).toBe("scoutPrime");
  });

  it("is his, and nothing at all from the navigator", () => {
    const world = flying();
    heavy(world);
    expect(pressPrime(world, 2, "p2")).not.toBe("scoutPrime");
  });

  it("offers nothing on a merely laden ship: its burn is not labouring yet", () => {
    const world = flying();
    laden(world);
    expect(pressPrime(world, 1)).toBeNull();
  });
});

describe("the two rings on one ship", () => {
  it("stand clear of each other, so neither thumb can land on both", () => {
    const l = layout("test");
    const world = flying();
    const r = heavy(world);
    const a = scoutLineCircle(l, CFG, r);
    const b = scoutPrimeCircle(l, CFG, r);
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(a.r + b.r);
  });

  it("go the moment the flight does", () => {
    // Both are read in `play` and nowhere else (`scout-round.ts`): a thumb on
    // a ship the round has stopped flying is a thumb on a picture.
    for (const phase of ["verdict", "spent"] as const) {
      const world = flying();
      heavy(world).phase = phase;
      expect(pressLine(world, 2), phase).toBeNull();
      expect(pressPrime(world, 1), phase).toBeNull();
    }
  });
});
