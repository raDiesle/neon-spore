import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, startWave, step, TO_THE_END, ticksPerBeat } from "@neon-spore/sim";
import {
  dangerColor,
  dangerGlow,
  drawHarpoonDanger,
  harpoonDanger,
} from "../src/harpoon-danger.js";
import { frame } from "../src/hull-frame.js";
import type { ViewRole } from "../src/layout.js";
import { computeLayout } from "../src/layout.js";
import { P1_SKIN, P2_SKIN } from "../src/seat-skin.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

beforeAll(installCanvasGlobals);

/**
 * **The control heating up under a harpoon** — the owner's point 6 of 14
 * September 2026, and the two halves of it worth proving without a canvas: the
 * ramp is the simulation's count and nothing of this file's, and the colour is
 * the seat's own.
 */

const TPB = ticksPerBeat(CFG);

/** A world on a wave placing this fault, stepped `ticks` with nobody moving. */
function stuck(kind: "leech" | "limpet", ticks: number) {
  const world = createWorld({ ...CFG, hullInvulnerable: true }, 3);
  startWave(world, 0, [], [], null, false, 0, [{ kind, at: 0, beats: TO_THE_END }]);
  for (let t = 0; t < ticks; t++) step(world, []);
  return world;
}

/** The same wave with no pencil on it at all. */
function quiet() {
  const world = createWorld({ ...CFG, hullInvulnerable: true }, 3);
  startWave(world, 0, [], [], null, false, 0, []);
  return world;
}

describe("how near the round is to being lost", () => {
  it("is nothing at all on a wave that placed no such pencil", () => {
    const world = quiet();
    for (let t = 0; t < TPB * 2; t++) step(world, []);
    expect(harpoonDanger(world)).toBeUndefined();
  });

  it("climbs while the control stands still, and names the control it is on", () => {
    const early = harpoonDanger(stuck("leech", TPB + 1));
    const late = harpoonDanger(stuck("leech", TPB + 8));
    expect(early?.cannon).toBeGreaterThan(0);
    expect(late?.cannon).toBeGreaterThan(early?.cannon ?? 1);
    // The dome is untouched: a leech is on the cannon and on nothing else.
    expect(late?.shield).toBe(0);
  });

  it("does the same for the dome when the pencil was a limpet", () => {
    const late = harpoonDanger(stuck("limpet", TPB + 8));
    expect(late?.shield).toBeGreaterThan(0);
    expect(late?.cannon).toBe(0);
  });

  it("goes back to the beginning on the tick the control moves", () => {
    // Which is the owner's own wording, and it is proved here rather than in
    // this file's code because the restart is the simulation's: the number is
    // the count of still ticks, and the count is what a move clears.
    const world = stuck("leech", TPB + 8);
    const hot = harpoonDanger(world)?.cannon ?? 0;
    expect(hot).toBeGreaterThan(0);
    world.cannonCol = world.cannonCol === 2 ? 4 : 2;
    step(world, []);
    expect(harpoonDanger(world)?.cannon ?? 0).toBe(0);
  });
});

describe("the colour a control goes", () => {
  it("is the seat's own rim carried toward its brightest thread, and never a palette red", () => {
    // Nothing at nought, the brightest thread at one — each seat in its own
    // hue, which is the whole of why this is not a shared warning colour.
    expect(dangerColor(P1_SKIN.hull, 0)).toBe(P1_SKIN.hull.rim.toLowerCase());
    expect(dangerColor(P1_SKIN.hull, 1)).toBe(P1_SKIN.hull.edge.toLowerCase());
    expect(dangerColor(P2_SKIN.hull, 1)).toBe(P2_SKIN.hull.edge.toLowerCase());
    // And the two seats never arrive at the same colour on the way up.
    expect(dangerColor(P1_SKIN.hull, 0.5)).not.toBe(dangerColor(P2_SKIN.hull, 0.5));
  });
});

describe("the pulse", () => {
  it("is nothing when nothing is stuck and never goes dark near the end", () => {
    expect(dangerGlow(0, 0)).toBe(0);
    // Sampled across a second at the top of the ramp: the dip shallows as the
    // count runs down, so the last of it stays lit rather than blinking out on
    // the tick before the round is lost.
    let lowest = 1;
    for (let i = 0; i < 60; i++) lowest = Math.min(lowest, dangerGlow(0.95, i / 60));
    expect(lowest).toBeGreaterThan(0.9);
  });

  it("quickens: a second of it holds more peaks at the end than at the start", () => {
    const peaks = (danger: number) => {
      let n = 0;
      for (let i = 1; i < 599; i++) {
        const a = dangerGlow(danger, (i - 1) / 600);
        const b = dangerGlow(danger, i / 600);
        const c = dangerGlow(danger, (i + 1) / 600);
        if (b > a && b >= c) n++;
      }
      return n;
    };
    expect(peaks(0.9)).toBeGreaterThan(peaks(0.1));
  });
});

describe("the same heat through a canvas that refuses what a real one does", () => {
  /** A wave with no pencil on it, for the same seed and the same tempo — the
   * one number worth comparing a stuck control against. The halo is blitted
   * (`glow.ts` keeps `shadowBlur` off mobile), so what a heated lobe adds to a
   * frame is `drawImage` calls and nothing else. */
  function blits(kind: "leech" | "limpet" | null, role: ViewRole, ticks: number): number {
    const world = kind === null ? quiet() : stuck(kind, 0);
    const { ctx } = runFrames(world, role, ticks);
    return ctx.tally.get("drawImage") ?? 0;
  }

  for (const role of ROLES) {
    it(`heats the cannon under a leech for ${role}, and a quiet wave stays cold`, () => {
      // Long enough for the count to run out, so the whole of the ramp goes
      // through the canvas — including its top, which is the frame with the
      // largest halo and the brightest colour.
      expect(blits("leech", role, TPB * 4)).toBeGreaterThan(blits(null, role, TPB * 4));
    });
  }

  it("heats the dome under a limpet too", () => {
    expect(blits("limpet", "p2", TPB * 4)).toBeGreaterThan(blits(null, "p2", TPB * 4));
  });

  it("puts a light on every bump of the dome rather than one over the middle", () => {
    // Asked of the pass directly rather than off a whole frame: a dome spread
    // across four columns with one light over its centre leaves both of its
    // ends cold, and the difference between one halo and four is invisible in
    // a frame's total once the ship's own passes are in it.
    const { ctx } = stubCanvas();
    const l = computeLayout(VIEWPORT, CFG, "p2");
    const shield = [0, 1, 2, 3].map((i) => ({ col: 2 + i, weight: 0.25, halfMul: 1 }));
    drawHarpoonDanger(
      ctx as unknown as CanvasRenderingContext2D,
      l,
      { cannon: 0, shield: 0.8 },
      0,
      frame(l, 0, { armed: 0, intake: 0, chew: 0, charge: 0 }, { cannon: 3, shield }),
      { cannon: 3, shield },
      (x) => ({ x, y: l.hullY }),
      P2_SKIN.hull,
    );
    expect(ctx.tally.get("drawImage")).toBe(shield.length);
  });
});
