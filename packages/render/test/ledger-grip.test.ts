import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type LedgerState,
  ledgerBoss,
  ledgerPhase,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { ledgerRootCircle } from "../src/ledger-grip.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The navigator's two thumbs on THE LEDGER's root** (`sim/ledger-hand.ts`,
 * `docs/spec/bosses.md` §11.27).
 *
 * The half a simulation cannot ask: that a press on the circle the picture
 * draws is the press the fight would accept, that the pilot gets nothing from
 * it, and — the one this boss is arranged around — that **one circle answers
 * as the foot before the cord is in and as the plug after**, never as both and
 * never as neither while one of them is offered.
 *
 * The movement is **set** rather than played to, `ledger-frame.test.ts`'
 * arrangement: `ledgerPhase` reads counters, and reaching `whipping` by
 * shooting would make every case here a test about the cannon. What is not
 * set is the gate — every press goes through `touchDown`, so what answers is
 * the hit test the game runs.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const STANDARD: ControlSet = controlSet("default");

const layout = (role: ViewRole = "test"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The cord going in: a wave one beat old, still inside `ledgerRootBeats`. */
function open(): World {
  const world = createWorld(CFG, 7);
  const index = waveWith("ledger");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function cord(world: World): LedgerState {
  const t = ledgerBoss(world);
  if (t === null) throw new Error("the ledger wave paid out no cord");
  return t;
}

/** The cord in, and the fight in the movement it is mostly played in. */
function rooted(world: World): LedgerState {
  const t = cord(world);
  t.rootBeat = world.beat - CFG.ledgerRootBeats;
  expect(ledgerPhase(t, CFG, world.beat)).toBe("paying");
  return t;
}

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

function at(world: World): { x: number; y: number } {
  return ledgerRootCircle(layout(), CFG, cord(world));
}

function hold(world: World, seat: 1 | 2, p: { x: number; y: number } = at(world)) {
  const touch = touchDown(layout(), p.x, p.y, field(world, seat));
  return touch?.hold?.kind === "drag" ? touch.hold : null;
}

function target(world: World, seat: 1 | 2, p?: { x: number; y: number }): string | null {
  return hold(world, seat, p ?? at(world))?.target ?? null;
}

describe("the foot, while the cord is still paying out", () => {
  it("takes hold on the root, in the column the cord is going into", () => {
    const world = open();
    expect(ledgerPhase(cord(world), CFG, world.beat)).toBe("rooting");
    expect(target(world, 2)).toBe("ledgerFoot");
  });

  it("follows the root when she has already walked it", () => {
    // `foot` writes `t.socket` on the tick it reads the carry, so the circle
    // is somewhere else the moment the walk starts. A ring left at the column
    // the cord *began* in would be a handle for one move only.
    const world = open();
    const t = cord(world);
    t.socket = t.socket === 0 ? 2 : 0;
    expect(target(world, 2)).toBe("ledgerFoot");
    const stale = ledgerRootCircle(layout(), CFG, { ...t, socket: t.socket === 0 ? 2 : 0 });
    expect(target(world, 2, stale)).toBeNull();
  });

  it("is hers, and nothing at all from the pilot", () => {
    // The root is the half of the cord his screen fades out: a seat that
    // could walk it would be choosing a column it cannot see.
    const world = open();
    expect(target(world, 1)).toBeNull();
  });

  it("goes the moment the cord is in", () => {
    const world = open();
    rooted(world);
    expect(target(world, 2)).not.toBe("ledgerFoot");
  });
});

describe("the plug, once the cord is in", () => {
  it("takes hold on the same circle the foot did", () => {
    const world = open();
    rooted(world);
    expect(target(world, 2)).toBe("ledgerSocket");
  });

  it("is still offered while the cord whips", () => {
    const world = open();
    const t = rooted(world);
    t.seam = CFG.ledgerWhipSeam;
    expect(ledgerPhase(t, CFG, world.beat)).toBe("whipping");
    expect(target(world, 2)).toBe("ledgerSocket");
  });

  it("is refused on the taut cord, which is the movement it exists against", () => {
    // The last return is the one return nobody is meant to answer, and a plug
    // there would be the pair warding it with a thumb (`ledgerPlugs`).
    const world = open();
    const t = rooted(world);
    t.seam = CFG.ledgerSeamHits;
    expect(ledgerPhase(t, CFG, world.beat)).toBe("taut");
    expect(target(world, 2)).toBeNull();
  });

  it("goes when the grace is spent, because there is nothing left to buy", () => {
    const world = open();
    rooted(world).plugBeats = 0;
    expect(target(world, 2)).toBeNull();
  });

  it("is hers, and nothing at all from the pilot", () => {
    const world = open();
    rooted(world);
    expect(target(world, 1)).toBeNull();
  });
});

describe("the one circle between them", () => {
  it("is never both at once, whatever the cord is doing", () => {
    // Swept over every state this fight has, so what is asked is that the
    // circle has **one** meaning at a time rather than that one press answers
    // once. The two gates are exclusive by construction; this is what says so.
    const seen: string[] = [];
    for (const build of [
      (w: World) => cord(w),
      (w: World) => rooted(w),
      (w: World) => {
        const t = rooted(w);
        t.seam = CFG.ledgerWhipSeam;
        return t;
      },
      (w: World) => {
        const t = rooted(w);
        t.seam = CFG.ledgerSeamHits;
        return t;
      },
    ]) {
      const world = open();
      build(world);
      const hit = target(world, 2);
      if (hit !== null) seen.push(hit);
    }
    expect(seen).toEqual(["ledgerFoot", "ledgerSocket", "ledgerSocket"]);
  });

  it("goes the beat the cord tears out of the ship", () => {
    // `ledgerHandsHeard` drops every command past `outBeat`, so a circle left
    // standing there would be a handle answering nothing.
    const world = open();
    cord(world).outBeat = world.beat;
    expect(target(world, 2)).toBeNull();
  });

  it("stands clear of the plating, where the lock and the chevron are", () => {
    // A ring fills opaquely and that lock is the one mark naming the column
    // the plate has to be in — the fight's whole instruction (`ledger-read.ts`).
    const l = layout();
    const c = ledgerRootCircle(l, CFG, cord(open()));
    expect(c.y + c.r).toBeLessThan(l.hullY);
    expect(c.y - c.r).toBeGreaterThan(l.gridTop);
  });
});
