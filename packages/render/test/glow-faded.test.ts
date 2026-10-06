import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { flueBoss, governorBoss, midCol, type World } from "@neon-spore/sim";
import { drawFlue } from "../src/flue-draw.js";
import { FlueFx } from "../src/flue-fx.js";
import { strokeGlowFaded } from "../src/glow.js";
import { drawGovernor } from "../src/governor-draw.js";
import { GovernorFx } from "../src/governor-fx.js";
import { drawLamprey } from "../src/lamprey-draw.js";
import { LampreyFx } from "../src/lamprey-fx.js";
import { computeLayout } from "../src/layout.js";
import { drawMimic } from "../src/mimic-draw.js";
import { MimicFx } from "../src/mimic-fx.js";
import { STROKE } from "../src/palette.js";
import { stood as flueStood } from "./flue-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { marks } from "./glow-marks.js";
import { stood as governorStood } from "./governor-harness.js";
import { GULLET, posed as lampreyPosed, stood as lampreyStood } from "./lamprey-harness.js";
import { CORE, posed as mimicPosed, stood as mimicStood } from "./mimic-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * `strokeGlowFaded` (`glow.ts`): a glow inside a body that fades itself by
 * `ctx.globalAlpha` is faded with it and leaves the fade behind — and THE
 * FLUE, THE GOVERNOR, THE LAMPREY and THE MIMIC, spent and at half alpha with their
 * last hit's flash, its red and a tap's receipt still up, draw nothing
 * brighter than that half.
 * Before, THE FLUE's first glow put the alpha back at 1 and the rest of the
 * body was drawn whole, and a blow's red (`drawHurt`) did the same to a plate.
 */

beforeAll(installCanvasGlobals);

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
      { type: "flueMiss", shots: 1, why: "wide", col },
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
      { type: "governorTick", side: 1, mark: 1, markMilli: 750, taps: 1, col },
      { type: "governorHub", col },
    ] as const;
    fx.ingest(thrown, l, CFG, 0.5, () => {});
    // A touch's verdict ring is its receipt and stands whole over the fade
    // (`governor-verdicts.ts` puts the fade back after each), so it is not asked.
    fx.verdicts.clear();
    const clock = { beat: world.beat, beatPhase: 0, time: 0, lead: 0 };
    const { at } = marks((c) => drawGovernor(c, l, world, s, clock, fx));
    expect(at.length).toBeGreaterThan(10);
    expect(Math.max(...at)).toBeLessThanOrEqual(0.5 + 1e-9);
  });

  it("THE LAMPREY draws nothing brighter than its fade", () => {
    const world = lampreyStood();
    const s = lampreyPosed(world, "spent", GULLET, (t) => {
      t.phaseBeat = world.beat - CFG.lampreySpentBeats - 1;
      t.hits = 3;
    });
    const fx = new LampreyFx();
    const col = midCol(CFG);
    const thrown = [
      { type: "lampreyRear", color: "red", col },
      { type: "lampreyHit", hits: 3, col },
      { type: "lampreyCrack", side: 1, tooth: 2, col },
      { type: "lampreySnap", tooth: 4, side: 1, col },
    ] as const;
    fx.ingest(thrown, l, CFG, 0.5, () => {});
    fx.verdicts.clear();
    const { at } = marks((c) => drawLamprey(c, l, world, s, world.beat, 0, 0, fx));
    expect(at.length).toBeGreaterThan(10);
    expect(Math.max(...at)).toBeLessThanOrEqual(0.5 + 1e-9);
  });

  it("THE MIMIC draws nothing brighter than its fade", () => {
    const world = mimicStood();
    const s = mimicPosed(world, "spent", CORE, (t) => {
      t.phaseBeat = world.beat - CFG.mimicSpentBeats - 1;
      t.hits = 1;
    });
    const fx = new MimicFx();
    const col = midCol(CFG);
    const thrown = [
      { type: "mimicCore", color: "red", col },
      { type: "mimicHit", hits: 1, col },
      { type: "mimicPeel", side: 1, sign: 0, ink: 1, at: 40, peels: 1, col },
    ] as const;
    fx.ingest(thrown, l, CFG, 0.5, () => {});
    const { at } = marks((c) => drawMimic(c, l, world, s, world.beat, 0, 0, fx));
    expect(at.length).toBeGreaterThan(10);
    expect(Math.max(...at)).toBeLessThanOrEqual(0.5 + 1e-9);
  });
});
