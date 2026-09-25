import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GorgeState,
  gorgeBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GORGE, and the column nobody was telling the pilot**
 * (`render/src/boss-cue-read-n.ts`).
 *
 * Three cases stood in `boss-cue.test.ts` until 19 September 2026 and between
 * them they said the fight was `PIERCE` and `PINCH` over a full intake and
 * `BURN` or `PRY` over the mouth. Every one of those words is right and stands
 * below; what was missing is that **a shot only counts from the cannon's own
 * column** (`fire.ts`, `gorgeStruck`), so the pilot held a whole fight with one
 * word on his screen and nothing at all on the two moments it cannot be
 * finished without him.
 *
 * Two of the old cases therefore assert something new. The pierce one had the
 * full intake over column 4 and the cannon at 5, so its `PIERCE` was a word
 * about a lane the shot could not reach the intake from; the pry one had the
 * mouth empty, and a pry taken there clenches at `gorgePryBeats` and spits a
 * bead for nothing (`gorge-pry.ts`).
 *
 * The states are set rather than played into:
 * the vent, the spit and the mouth's own clock are all proved in
 * `sim/test/gorge*.test.ts`, and a test that fed an intake through
 * `gorgeStruck` to find it full would be that suite's second copy.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(beats = 1): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gorge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < beats * TPB; i++) step(world, []);
  return world;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

function word(world: World, role: ViewRole): string | null {
  return cue(world, role)?.word ?? null;
}

/** The boss this wave installed. */
function installed(world: World): GorgeState {
  const g = gorgeBoss(world);
  if (g === null) throw new Error("the gorge wave installed no gorge");
  return g;
}

/** Intake `i`, full in `color` on this beat. */
function fill(world: World, g: GorgeState, i: number, color: "red" | "cyan" = "red"): number {
  const k = g.intakes[i];
  if (k === undefined) throw new Error(`no intake ${i}`);
  k.beads = CFG.gorgeFullBeads;
  k.color = color;
  k.fullBeat = world.beat;
  return g.col + i;
}

/** The mouth over intake `i`, with the sack gorged and the mouth's own colour. */
function gorged(g: GorgeState, i: number, full = false): number {
  const k = g.intakes[i];
  if (k === undefined) throw new Error(`no intake ${i}`);
  g.mouth = i;
  g.ruptures = CFG.gorgeMouthRuptures;
  k.color = "red";
  k.beads = full ? CFG.gorgeFullBeads : 1;
  return g.col + i;
}

/** A column that is not this one, wherever in the field it sits. */
const other = (col: number): number => (col === 0 ? 1 : col - 1);

describe("THE GORGE", () => {
  it("is silent while it is being fed — the fight is not shooting", () => {
    const world = opened();
    installed(world);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("asks the pilot for the pinch first, because the vent is the clock", () => {
    const world = opened();
    const g = installed(world);
    world.cannonCol = fill(world, g, 2);
    expect(word(world, "p1")).toBe("PINCH");
    expect(cue(world, "p1")?.kind).toBe("HOLD");
    g.pinch = 2;
    expect(word(world, "p1")).toBeNull();
  });

  it("asks the navigator for the pierce once the cannon is under the intake", () => {
    const world = opened();
    const g = installed(world);
    world.cannonCol = fill(world, g, 2);
    g.pinch = 2;
    expect(word(world, "p2")).toBe("PIERCE");
    expect(cue(world, "p2")?.kind).toBe("PRESS");
  });

  it("asks him for the column instead, and says nothing to her, while he is off it", () => {
    const world = opened();
    const g = installed(world);
    const col = fill(world, g, 2);
    g.pinch = 2;
    world.cannonCol = other(col);
    const his = cue(world, "p1");
    expect(his?.word).toBe("MOVE");
    expect(his?.kind).toBe("CARRY");
    // On the cannon, on the hull — never on the intake, which would be the
    // column read out to the seat whose own decision it is.
    expect(his?.y).toBe(LAYOUT.p1.hullY);
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing about the column while an intake is only filling", () => {
    const world = opened();
    const g = installed(world);
    const k = g.intakes[2];
    if (k === undefined) throw new Error("no intake 2");
    k.beads = CFG.gorgeFullBeads - 1;
    k.color = "red";
    world.cannonCol = other(g.col + 2);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("asks for the beam once it is gorged, and for the column before that", () => {
    const world = opened();
    const g = installed(world);
    const col = gorged(g, 3);
    world.cannonCol = other(col);
    expect(word(world, "p1")).toBe("MOVE");
    expect(word(world, "p2")).toBeNull();
    world.cannonCol = col;
    expect(word(world, "p2")).toBe("BURN");
    expect(cue(world, "p2")?.kind).toBe("HOLD");
    expect(word(world, "p1")).toBeNull();
  });

  it("keeps the pry back until the mouth is full, and gives it back on the clench", () => {
    const world = opened();
    const g = installed(world);
    world.cannonCol = gorged(g, 3);
    world.prime = { tick: world.tick, color: "red", spent: false };
    // A pry on a mouth short of full is a bead thrown away: `gorgeStruck` ends
    // the fight on `bullet.lance && gorgeFull` and nothing else.
    expect(word(world, "p2")).toBe("BURN");
    gorged(g, 3, true);
    expect(word(world, "p2")).toBe("PRY");
    g.pry = 3;
    g.pryBeat = world.beat;
    expect(word(world, "p2")).toBe("BURN");
  });

  it("still asks for a full intake's pinch and pierce once the sack is gorged", () => {
    const world = opened();
    const g = installed(world);
    gorged(g, 3, true);
    // The reading returned the mouth's cue and nothing else until 19 September
    // 2026, and `vent()` goes on torching a full intake in this phase: both
    // seats lost the one answer to it.
    world.cannonCol = fill(world, g, 0);
    expect(word(world, "p1")).toBe("PINCH");
    expect(word(world, "p2")).toBe("PIERCE");
    // And he is never told to leave the column the pierce is owed in: the word
    // comes back the beat she takes it and the mouth is all that is left.
    g.pinch = 0;
    expect(word(world, "p1")).toBeNull();
    const k = g.intakes[0];
    if (k === undefined) throw new Error("no intake 0");
    k.ruptured = true;
    k.beads = 0;
    expect(word(world, "p1")).toBe("MOVE");
  });

  it("says nothing at all once the beam has ended it", () => {
    const world = opened();
    const g = installed(world);
    world.cannonCol = gorged(g, 3, true);
    g.outBeat = world.beat;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});
