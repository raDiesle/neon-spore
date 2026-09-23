import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type LedgerBead,
  type LedgerState,
  ledgerBoss,
  ledgerPhase,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type Circle, computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { ledgerHaulCircle } from "../src/ledger-haul.js";
import { ledgerBeadCircle } from "../src/ledger-pull.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The pilot's two thumbs on THE LEDGER's cord** (`sim/ledger-hand.ts`,
 * `docs/spec/bosses.md` §11.27).
 *
 * The half a simulation cannot ask: that a press on the circle the picture
 * draws is the press the fight would accept, that the navigator gets nothing
 * from either, and — the two this pair is arranged around — that **the ring
 * is on the return the press would actually move**, and that **neither of them
 * stands in the stretch of cord his own screen fades out**, which is the whole
 * reason they are where they are rather than on the root with hers.
 *
 * The movement is **set** rather than played to, `ledger-grip.test.ts`'
 * arrangement: `ledgerPhase` reads counters, and reaching `whipping` by
 * shooting would make every case here a test about the cannon. What is not set
 * is the gate — every press goes through `touchDown`, so what answers is the
 * hit test the game runs.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const STANDARD: ControlSet = controlSet("default");
/** Where the cord fades out on his screen, from `render/ledger-cord.ts`. */
const FADE_FROM = 0.58;

const layout = (role: ViewRole = "test"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function open(): World {
  const world = createWorld(CFG, 7);
  const index = waveWith("ledger");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

/** The one return these cases put on the cord, past the index check. */
function only(t: LedgerState): LedgerBead {
  const b = t.beads[0];
  if (b === undefined) throw new Error("the cord was set with no return on it");
  return b;
}

function cord(world: World): LedgerState {
  const t = ledgerBoss(world);
  if (t === null) throw new Error("the ledger wave paid out no cord");
  return t;
}

/** The cord whipping, with one return four beats down it and no other. */
function whipping(world: World): LedgerState {
  const t = cord(world);
  t.rootBeat = world.beat - CFG.ledgerRootBeats;
  t.seam = CFG.ledgerWhipSeam;
  t.beads = [{ beat: world.beat + 4, span: 5, last: false, pulled: false }];
  expect(ledgerPhase(t, CFG, world.beat)).toBe("whipping");
  return t;
}

/** The cord taut, with the one return nobody is meant to answer on it. */
function taut(world: World): LedgerState {
  const t = cord(world);
  t.rootBeat = world.beat - CFG.ledgerRootBeats;
  t.seam = CFG.ledgerSeamHits;
  t.beads = [{ beat: world.beat + 3, span: 5, last: true, pulled: false }];
  expect(ledgerPhase(t, CFG, world.beat)).toBe("taut");
  return t;
}

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
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

function target(world: World, seat: 1 | 2, p: { x: number; y: number }): string | null {
  const touch = touchDown(layout(), p.x, p.y, field(world, seat));
  const hold = touch?.hold?.kind === "drag" ? touch.hold : null;
  return hold?.target ?? null;
}

function bead(world: World): Circle {
  const c = ledgerBeadCircle(layout(), CFG, cord(world), world.beat, 0);
  if (c === null) throw new Error("no return on the cord to take hold of");
  return c;
}

describe("the pull, on the soonest return", () => {
  it("takes hold where the bead is drawn", () => {
    const world = open();
    whipping(world);
    expect(target(world, 1, bead(world))).toBe("ledgerBead");
  });

  it("rides the bead down the cord rather than waiting at one place", () => {
    // The ring is read off the bead's own landing beat and span, so a circle
    // fixed anywhere on the cord would answer the return for one beat of five.
    const world = open();
    const t = whipping(world);
    const early = bead(world);
    only(t).beat = world.beat + 2;
    const late = bead(world);
    expect(Math.hypot(late.x - early.x, late.y - early.y)).toBeGreaterThan(late.r);
    expect(target(world, 1, early)).toBeNull();
    expect(target(world, 1, late)).toBe("ledgerBead");
  });

  it("is his, and nothing at all from the navigator", () => {
    const world = open();
    whipping(world);
    expect(target(world, 2, bead(world))).toBeNull();
  });

  it("is not offered on the last return, which nobody is meant to answer", () => {
    const world = open();
    const t = whipping(world);
    only(t).last = true;
    expect(ledgerBeadCircle(layout(), CFG, t, world.beat, 0)).toBeNull();
  });

  it("goes once that return has been hauled, because it is once per bead", () => {
    const world = open();
    const t = whipping(world);
    const was = bead(world);
    only(t).pulled = true;
    expect(ledgerBeadCircle(layout(), CFG, t, world.beat, 0)).toBeNull();
    expect(target(world, 1, was)).toBeNull();
  });

  it("goes on the return's own last beat, which has nothing left to haul", () => {
    // A bill arriving on the next beat cannot be brought forward onto this one
    // (`ledgerPullable`).
    const world = open();
    const t = whipping(world);
    only(t).beat = world.beat + 1;
    expect(ledgerBeadCircle(layout(), CFG, t, world.beat, 0)).toBeNull();
  });

  it("is not offered before the cord whips", () => {
    const world = open();
    const t = whipping(world);
    t.seam = CFG.ledgerWhipSeam - 1;
    expect(ledgerPhase(t, CFG, world.beat)).toBe("paying");
    expect(ledgerBeadCircle(layout(), CFG, t, world.beat, 0)).toBeNull();
  });
});

describe("the haul, on the taut cord", () => {
  it("takes hold in the middle of the cord", () => {
    const world = open();
    taut(world);
    expect(target(world, 1, ledgerHaulCircle(layout(), CFG, cord(world)))).toBe("ledgerCord");
  });

  it("is his, and nothing at all from the navigator", () => {
    const world = open();
    taut(world);
    expect(target(world, 2, ledgerHaulCircle(layout(), CFG, cord(world)))).toBeNull();
  });

  it("is refused while the cord is still whipping", () => {
    const world = open();
    whipping(world);
    expect(target(world, 1, ledgerHaulCircle(layout(), CFG, cord(world)))).toBeNull();
  });

  it("is offered whatever the plate is covering, and says so with its dial", () => {
    // The tear is refused while she stands in the socket's column and that
    // refusal is **silent on purpose**: he cannot see the column he is being
    // refused for and she can, so the handle stands and the dial does not fill
    // (`sim/ledger-gates.ts`).
    const world = open();
    const t = taut(world);
    world.shieldCol = t.socket;
    expect(target(world, 1, ledgerHaulCircle(layout(), CFG, cord(world)))).toBe("ledgerCord");
  });

  it("goes the beat the cord tears out of the ship", () => {
    const world = open();
    taut(world).outBeat = world.beat;
    expect(target(world, 1, ledgerHaulCircle(layout(), CFG, cord(world)))).toBeNull();
  });
});

describe("where the two of them stand", () => {
  it("are both above the stretch of cord his own screen fades out", () => {
    // Which is the whole placement: a ring is a mark, and one drawn in the
    // faded stretch would put back the rooted column the fade takes away
    // (`ledger-cord.ts`). Measured down the cord's own line rather than in
    // pixels, because that is what the fade is a function of.
    const l = layout();
    const world = open();
    const t = whipping(world);
    const fade = down(l, CFG, t, FADE_FROM);
    expect(bead(world).y).toBeLessThan(fade);
    taut(world);
    expect(ledgerHaulCircle(l, CFG, cord(world)).y).toBeLessThan(fade);
  });

  it("leaves the carry room below it that the tear costs", () => {
    // `ledgerHaulMilli` is 1.9 tiles of downward carry, and a handle with less
    // cord under it than that would be a gesture the screen cannot finish.
    const l = layout();
    const world = open();
    taut(world);
    const c = ledgerHaulCircle(l, CFG, cord(world));
    expect(l.hullY - c.y).toBeGreaterThan((l.tile * CFG.ledgerHaulMilli) / 1000);
  });
});

/** How far down the screen a share `u` of the cord has got, on a taut line. */
function down(l: Layout, cfg: typeof CFG, t: LedgerState, u: number): number {
  const c = ledgerHaulCircle(l, cfg, t);
  const top = c.y - (l.hullY - c.y) * (0.42 / (1 - 0.42));
  return top + (l.hullY - top) * u;
}
