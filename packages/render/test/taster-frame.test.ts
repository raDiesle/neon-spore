import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  type TasterState,
  tasterBoss,
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
 * THE TASTER's crest and fan, on all three screens.
 *
 * The states are **set** rather than played to, `curtain-frame.test.ts`'s
 * arrangement: `sim/test/taster.test.ts` proves the inverted rule, the
 * re-edge and the interlock, and what this file asks is whether every state
 * of the picture is one a canvas accepts — growing, edged, thickened, shorn,
 * cut through, interlocked, going out — and the three things nothing else in
 * the suite could catch: that the ledger is on the navigator's screen and the
 * next column on the pilot's, and neither on the other; that the interlock is
 * drawn in both colours at once; and that a blade shorn off is a transient the
 * next run does not inherit.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

function standing(): World {
  const world = createWorld(CFG, 7);
  const index = waveWith("taster");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

/**
 * The same fan a few beats in, for the states that are counted **backwards**
 * from the beat: an `outBeat` two beats before the first beat of the wave is a
 * negative number, which is not *out* at all but `-1`'s own meaning.
 */
function late(): World {
  const world = standing();
  for (let i = 0; i < 5 * TPB; i++) step(world, []);
  return world;
}

function fan(world: World): TasterState {
  const t = tasterBoss(world);
  if (t === null) throw new Error("the taster wave grew no fan");
  return t;
}

/** Every blade set, in one colour, with one of them thickened. */
function edged(world: World, color: "red" | "cyan"): TasterState {
  const t = fan(world);
  for (const k of t.blades) {
    k.edge = color;
    k.layers = 1;
    k.growBeat = world.beat - CFG.tasterGrowBeats;
    k.setBeat = world.beat;
    k.shorn = false;
  }
  const first = t.blades[0];
  if (first !== undefined) first.layers = 2;
  return t;
}

/** Three blades struck off, the crest cut twice, and one blade still growing. */
function worn(world: World): TasterState {
  const t = edged(world, "red");
  for (const i of [0, 4, 9]) {
    const k = t.blades[i];
    if (k === undefined) continue;
    k.shorn = true;
    k.edge = null;
    k.layers = 0;
  }
  t.shorn = 3;
  t.crest = 2;
  const growing = t.blades[2];
  if (growing !== undefined) {
    growing.edge = null;
    growing.setBeat = -1;
    growing.growBeat = world.beat - 1;
  }
  return t;
}

/** The last two blades interlocked over the body: nine gone. */
function closed(world: World): TasterState {
  const t = edged(world, "red");
  for (let i = 0; i < t.blades.length - CFG.tasterClosedBlades; i++) {
    const k = t.blades[i];
    if (k === undefined) continue;
    k.shorn = true;
    k.edge = null;
    k.layers = 0;
  }
  t.shorn = t.blades.length - CFG.tasterClosedBlades;
  return t;
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

/** The same state drawn on each of the three screens, as counts of one hex. */
function perSeat(build: (w: World) => unknown, colour: string): Record<ViewRole, number> {
  const out = {} as Record<ViewRole, number>;
  for (const role of ROLES) {
    const world = standing();
    build(world);
    out[role] = count(drawn(world, role, 3).text, colour);
  }
  return out;
}

describe("THE TASTER's fan", () => {
  it.each(ROLES)("draws the crest and a grown fan, on %s", (role) => {
    const world = standing();
    edged(world, "cyan");
    const frame = drawn(world, role, 2 * TPB);
    expect(frame.calls).toBeGreaterThan(300);
    // The blades are metal and the edge alone carries the colour.
    expect(frame.text).toContain(PALETTE.rock);
    expect(frame.text).toContain(PALETTE.cyanRim);
  });

  it.each(ROLES)("draws the gaps, the growing blade and the cut crest, on %s", (role) => {
    const whole = standing();
    edged(whole, "red");
    const cut = standing();
    const t = worn(cut);
    t.liftBeat = cut.beat;
    const before = drawn(whole, role, 3);
    const after = drawn(cut, role, 3);
    // A fan with gaps in it names fewer of its colour's rim than a whole one,
    // and the seam across the crest is the hull's own white.
    expect(count(after.text, PALETTE.redRim)).toBeLessThan(count(before.text, PALETTE.redRim));
    expect(after.text).toContain(PALETTE.hullRim);
  });

  it("shows the ledger to the navigator and not the pilot", () => {
    // Every blade cyan, so the red on the screen is the tally's own: the count
    // of red the pair has spent, which is hers to read and say.
    const spend = (w: World) => {
      edged(w, "cyan");
      w.spend[w.beat % w.spend.length] = { beat: w.beat, red: 9, cyan: 4 };
    };
    const seen = perSeat(spend, PALETTE.red);
    expect(seen.p2).toBeGreaterThan(seen.p1);
    expect(seen.test).toBeGreaterThan(seen.p1);
  });

  it("marks the column the crest opens next for the pilot and not the navigator", () => {
    // Two blades grown and the rest untouched, so there is a next column to
    // mark; the chevron is the hull's violet, which both screens draw
    // elsewhere, so this is a count rather than a presence.
    const partial = (w: World) => {
      const t = fan(w);
      for (const i of [5, 6]) {
        const k = t.blades[i];
        if (k === undefined) continue;
        k.edge = "red";
        k.layers = 1;
        k.growBeat = w.beat - CFG.tasterGrowBeats;
        k.setBeat = w.beat;
      }
    };
    const seen = perSeat(partial, PALETTE.hull);
    expect(seen.p1).toBeGreaterThan(seen.p2);
    expect(seen.test).toBeGreaterThan(seen.p2);
  });

  it.each(ROLES)("edges the interlock in both colours at once, on %s", (role) => {
    const world = standing();
    closed(world);
    const text = drawn(world, role, 3).text;
    // Every standing blade grew red, and the closed fan carries cyan as well:
    // no single bolt of either is the right one, and the shape says so.
    expect(text).toContain(PALETTE.redRim);
    expect(text).toContain(PALETTE.cyanRim);
  });

  it.each(ROLES)("fades the fan over its last beats and then has none, on %s", (role) => {
    // The blade's own fill alpha at full strength. Counting a hex cannot see
    // a fade — the same colour is named either way — so what is asked here is
    // whether anything is still drawn at full strength, which is the fade.
    const FULL = "globalAlpha=0.55";
    const standingFan = late();
    closed(standingFan);
    const held = drawn(standingFan, role, 3);
    expect(count(held.text, FULL)).toBeGreaterThan(0);

    const going = late();
    closed(going).outBeat = going.beat - 1;
    const fading = drawn(going, role, 3);
    expect(count(fading.text, FULL)).toBe(0);
    expect(fading.text).toContain(PALETTE.redRim);

    // And past its last beat the simulation nulls it, so there is no crest on
    // the screen at all (`taster-step.ts`): fewer ops than the fan standing.
    const gone = late();
    closed(gone).outBeat = gone.beat - CFG.tasterOutBeats - 1;
    expect(drawn(gone, role, 3).calls).toBeLessThan(held.calls);
  });

  it("keeps a shorn blade falling as a transient the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest(
      [
        { type: "tasterRise", col: 0, width: CFG.tasterBlades },
        { type: "tasterSet", col: 3, color: "red" },
        { type: "tasterShear", col: 3, left: 7 },
        { type: "tasterTaste", color: "cyan" },
      ],
      L,
      0,
      () => 0,
      CFG,
    );
    fx.update(1 / 60, L);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});
