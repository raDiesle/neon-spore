import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CurtainState,
  createWorld,
  curtainBody,
  curtainBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
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
 * THE CURTAIN's fabric and core, on all three screens.
 *
 * The states are **set** rather than played to, `gorge-frame.test.ts`'s
 * arrangement: `sim/test/curtain.test.ts` proves the shove, the soft lobe
 * and the tear, and what this file asks is whether every branch of the
 * picture is one a canvas accepts — covered, bare, torn, going out, held —
 * and the two things nothing else in the suite could catch: that the soft
 * lobes are lit on the pilot's screen and the core's shadow is on the
 * navigator's, and neither on the other; and that the torn sheet is a
 * transient the next run does not inherit.
 *
 * The jammed state is set the same way, and it is the one that draws a handle:
 * a bar along the rail running down with the jam, and the hem's ring on the
 * fabric's bottom edge. What only a frame can catch there is that a hem held
 * at the top opens the core to the **pilot** — the seat that is shown nothing
 * of it in every other state (`render/curtain-grip.ts`).
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("curtain");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function fabric(world: World): CurtainState {
  const c = curtainBoss(world);
  if (c === null) throw new Error("the curtain wave hung no fabric");
  return c;
}

/** Two lobes gone, two soft, the core red and covered under the middle. */
function worn(world: World): CurtainState {
  const c = fabric(world);
  c.lobes[1] = false;
  c.lobes[5] = false;
  c.soft = [2, 3];
  c.coreColor = "red";
  const body = curtainBody(world, c);
  if (body === undefined) throw new Error("the fabric is gone already");
  c.coreCol = body.col + 3;
  return c;
}

/** The rail jammed by a hit, the core still covered: the hem's own state. */
function pinned(world: World): CurtainState {
  const c = worn(world);
  c.phase = "pinned";
  c.phaseBeat = world.beat;
  return c;
}

/** The fabric shoved off the wall until the core is out from under it. */
function bared(world: World): CurtainState {
  const c = worn(world);
  const body = curtainBody(world, c);
  if (body === undefined) throw new Error("the fabric is gone already");
  body.fromCol = body.col;
  body.col = c.coreCol + 1;
  return c;
}

function drawn(world: World, role: ViewRole, ticks: number): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

describe("THE CURTAIN's fabric", () => {
  it.each(ROLES)("draws the fabric, its hem and the covered core, on %s", (role) => {
    const world = hung();
    worn(world);
    const frame = drawn(world, role, 2 * TPB);
    expect(frame.calls).toBeGreaterThan(300);
    // The sheet and its folds name the hull's violet, the standing lobes its grey.
    expect(frame.text).toContain(PALETTE.hull);
    expect(frame.text).toContain(PALETTE.dim);
  });

  it("lights the soft lobes on the pilot's screen and not the navigator's", () => {
    const pilot = hung();
    worn(pilot);
    const p1 = count(drawn(pilot, "p1", 3).text, PALETTE.hullRim);
    const navigator = hung();
    worn(navigator);
    const p2 = count(drawn(navigator, "p2", 3).text, PALETTE.hullRim);
    const both = hung();
    worn(both);
    const test = count(drawn(both, "test", 3).text, PALETTE.hullRim);
    expect(p1).toBeGreaterThan(p2);
    expect(test).toBeGreaterThan(p2);
  });

  it("casts the covered core's shadow on the navigator's screen and not the pilot's", () => {
    // The field names red elsewhere — the cannon's own colour — so the shadow
    // is the red the navigator's screen has over the pilot's.
    const navigator = hung();
    worn(navigator);
    const p2 = count(drawn(navigator, "p2", 3).text, PALETTE.red);
    const pilot = hung();
    worn(pilot);
    const p1 = count(drawn(pilot, "p1", 3).text, PALETTE.red);
    const both = hung();
    worn(both);
    const test = count(drawn(both, "test", 3).text, PALETTE.red);
    expect(p2).toBeGreaterThan(p1);
    expect(test).toBeGreaterThan(p1);
  });

  it.each(ROLES)("shows the bare core to %s, rimmed in its colour", (role) => {
    const world = hung();
    bared(world);
    const text = drawn(world, role, TPB).text;
    expect(text).toContain(PALETTE.redRim);
    expect(text).toContain(PALETTE.redDark);
  });

  it.each(ROLES)("draws the hand ring over the sheet while a hand is on it, on %s", (role) => {
    const held = hung();
    const c = worn(held);
    held.gripP1 = c.creatureId;
    held.gripP2 = c.creatureId;
    const loose = hung();
    worn(loose);
    expect(drawn(held, role, 3).calls).toBeGreaterThan(drawn(loose, role, 3).calls);
  });

  it("draws the core alone once the sheet is torn, and the sheet falling as a transient", () => {
    const hanging = hung();
    worn(hanging);
    const before = drawn(hanging, "p1", 3).text;
    const world = hung();
    const c = worn(world);
    world.creatures = world.creatures.filter((b) => b.id !== c.creatureId);
    c.phase = "torn";
    c.phaseBeat = world.beat;
    const text = drawn(world, "p1", 3).text;
    // The core's rim, which the pilot never saw while it was covered, and
    // fewer of the hem's grey than a hanging sheet names.
    expect(count(text, PALETTE.redRim)).toBeGreaterThan(count(before, PALETTE.redRim));
    expect(count(text, PALETTE.dim)).toBeLessThan(count(before, PALETTE.dim));

    const fx = new Effects();
    fx.ingest([{ type: "curtainTear", col: 5 }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });

  it.each(ROLES)("fades the core out over its last beats, on %s", (role) => {
    const world = hung();
    // Far enough in that a beat before the out is still a beat of the fight.
    for (let i = 0; i < 4 * TPB; i++) step(world, []);
    const c = bared(world);
    c.phase = "out";
    c.phaseBeat = world.beat;
    const going = count(drawn(world, role, 3).text, PALETTE.redRim);
    c.phaseBeat = world.beat - CFG.curtainOutBeats - 1;
    const gone = count(drawn(world, role, 3).text, PALETTE.redRim);
    expect(going).toBeGreaterThan(gone);
  });

  it.each(ROLES)("lays the jam bar on the rail and hangs the hem's ring, on %s", (role) => {
    const jammed = hung();
    pinned(jammed);
    const loose = hung();
    worn(loose);
    // The bar's own glow, and not the grey it is stroked in: `PALETTE.rock` is
    // also the cue word's fill and its target lock's (`boss-cue-text.ts`,
    // `boss-cue-draw.ts`), and the cue is a different one in each of these two
    // states, so counting that grey would be counting the word. The dark is the
    // bar and nothing else on this sheet.
    expect(count(drawn(jammed, role, 3).text, PALETTE.rockDark)).toBeGreaterThan(
      count(drawn(loose, role, 3).text, PALETTE.rockDark),
    );
    expect(drawn(jammed, role, 3).calls).toBeGreaterThan(drawn(loose, role, 3).calls);
  });

  it("opens the core to the pilot while the hem is held at the top", () => {
    const shut = hung();
    pinned(shut);
    const open = hung();
    pinned(open).liftMilli = CFG.curtainLiftMilli;
    // The rim is the bare core's and the pilot has never seen it: the gap his
    // own thumb is holding is the one frame of this fight that shows it to him.
    expect(count(drawn(open, "p1", 3).text, PALETTE.redRim)).toBeGreaterThan(
      count(drawn(shut, "p1", 3).text, PALETTE.redRim),
    );
  });

  it.each(ROLES)("fills the hem's channel green as the lift comes in, on %s", (role) => {
    // The channel fills behind the knob (`pull-track.ts`), and a hem nobody
    // has lifted has nothing behind it.
    const half = hung();
    pinned(half).liftMilli = Math.round(CFG.curtainLiftMilli / 2);
    const none = hung();
    pinned(none);
    expect(count(drawn(half, role, 3).text, PALETTE.good)).toBeGreaterThan(
      count(drawn(none, role, 3).text, PALETTE.good),
    );
  });
});
