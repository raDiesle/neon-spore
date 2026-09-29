import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { flueBoss, governorBoss, midCol, type World } from "@neon-spore/sim";
import { drawFlue } from "../src/flue-draw.js";
import { FlueFx } from "../src/flue-fx.js";
import { strokeGlowFaded } from "../src/glow.js";
import { drawGovernor } from "../src/governor-draw.js";
import { GovernorFx } from "../src/governor-fx.js";
import { computeLayout } from "../src/layout.js";
import { STROKE } from "../src/palette.js";
import { stood as flueStood } from "./flue-harness.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";
import { stood as governorStood } from "./governor-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * `strokeGlowFaded` (`glow.ts`): a glow inside a body that fades itself by
 * `ctx.globalAlpha` is faded with it and leaves the fade behind — and THE
 * FLUE and THE GOVERNOR, spent and at half alpha with their last hit's flash,
 * its red and a tap's receipt still up, draw nothing brighter than that half.
 * Before, THE FLUE's first glow put the alpha back at 1 and the rest of the
 * body was drawn whole, and a blow's red (`drawHurt`) did the same to a plate.
 */

beforeAll(installCanvasGlobals);

/** The alpha of every mark a draw makes, and the alpha it leaves. */
function marks(draw: (c: CanvasRenderingContext2D) => void, start = 1) {
  const { ctx } = stubCanvas();
  const c = ctx as unknown as CanvasRenderingContext2D;
  const at: number[] = [];
  for (const name of ["stroke", "fill", "fillRect", "drawImage", "fillText"] as const) {
    const was = (c[name] as (...a: unknown[]) => void).bind(c);
    (c as unknown as Record<string, unknown>)[name] = (...a: unknown[]) => {
      at.push(c.globalAlpha);
      was(...a);
    };
  }
  c.globalAlpha = start;
  draw(c);
  return { at, after: c.globalAlpha };
}

describe("strokeGlowFaded", () => {
  it("fades the glow and the core by the alpha it finds, and leaves it", () => {
    const glow = (c: CanvasRenderingContext2D) =>
      strokeGlowFaded(c, new Path2D(), "#ffffff", 2, 1, 0.8);
    const whole = marks(glow);
    const half = marks(glow, 0.5);
    expect(half.at).toHaveLength(STROKE.glowPasses + 1);
    for (const [i, a] of half.at.entries()) expect(a).toBeCloseTo((whole.at[i] ?? 0) / 2, 9);
    expect(half.after).toBe(0.5);
    expect(whole.after).toBe(1);
  });
});

/** A world `beats` past its boss's spent fade, so the fade stands at its floor. */
function spent(world: World, beats: number): World {
  const s = world.boss;
  if (s === null) throw new Error("no boss stood");
  if (s.kind !== "flue" && s.kind !== "governor") throw new Error("not a fading boss");
  s.phase = "spent";
  s.phaseBeat = world.beat - beats - 1;
  return world;
}

describe("a spent boss at half alpha", () => {
  const l = computeLayout(VIEWPORT, CFG, "test");

  it("THE FLUE draws nothing brighter than its fade", () => {
    const world = spent(flueStood(), CFG.flueSpentBeats);
    const s = flueBoss(world);
    if (s === null) throw new Error("no flue");
    const fx = new FlueFx();
    const col = midCol(CFG);
    const thrown = [
      { type: "flueHit", hits: 3, col },
      { type: "flueTick", side: 1, taps: 1, col },
    ] as const;
    fx.ingest(thrown, l, CFG, 0.5, () => {});
    const { at } = marks((c) => drawFlue(c, l, world, s, world.beat, 0, 0, fx));
    expect(at.length).toBeGreaterThan(10);
    expect(Math.max(...at)).toBeLessThanOrEqual(0.5 + 1e-9);
  });

  it("THE GOVERNOR draws nothing brighter than its fade", () => {
    const world = spent(governorStood(), CFG.governorSpentBeats);
    const s = governorBoss(world);
    if (s === null) throw new Error("no governor");
    const fx = new GovernorFx();
    const col = midCol(CFG);
    const thrown = [
      { type: "governorHit", hits: 3, col },
      { type: "governorTick", side: 1, taps: 1, col },
      { type: "governorHub", col },
    ] as const;
    fx.ingest(thrown, l, CFG, 0.5, () => {});
    // A touch's verdict ring is its receipt and stands whole over the fade
    // (`governor-verdicts.ts` puts the fade back after each), so it is not asked.
    fx.verdicts.clear();
    const { at } = marks((c) => drawGovernor(c, l, world, s, world.beat, 0, 0, fx));
    expect(at.length).toBeGreaterThan(10);
    expect(Math.max(...at)).toBeLessThanOrEqual(0.5 + 1e-9);
  });
});
