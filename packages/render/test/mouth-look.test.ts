import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, type SimEvent } from "@neon-spore/sim";
import { LAY_LOOK } from "../src/cannon-maw.js";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { MOUTH_LOOK, type MouthFrame } from "../src/muzzle.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The fire opening, now that it is a record two things patch rather than four
 * literals one function owned.
 *
 * The lift it came from claimed one thing above all: **no frame moved.** That
 * was proved once, outside the tree, by tracing every canvas call `drawHull`
 * and a whole renderer make over every mood the mouth can be in — 363,260
 * calls, byte-identical before and after. A trace cannot be committed and
 * would rot if it were, so what stayed here was the part of the claim that
 * could go stale: the numbers the ellipse was drawn from, and the rule that
 * kept the shipped mouth out of the half of the phase that was added under it.
 *
 * A frame *did* move after that: the owner asked for the `egg` candidate by
 * name (`docs/queue.md`'s exemption for a look asked for directly), and
 * `MOUTH_LOOK`/`LAY_LOOK` are the adopted cloaca rather than the old round
 * port and tightening rim. What is pinned below is the new shipped truth —
 * the numbers the egg strains from, and the rule that the body itself is now
 * drawn on every frame the maw is not busy swallowing a pod, follow-through
 * included, because the whole point of the adoption was a mouth that relaxes
 * rather than one that cuts.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const BEAT_SECONDS = 60 / CFG.bpm;

beforeAll(installCanvasGlobals);

function mouth(intake = 0): MouthFrame {
  return {
    x: L.gridLeft + 40,
    y: L.hullY,
    tipY: L.hullY,
    l: L,
    intake,
    surface: (x) => ({ x, y: L.hullY }),
  };
}

describe("the opening's own numbers", () => {
  it("are the ones the game ships now", () => {
    // `drop` moved from 0.12 to 0.26 with the `egg` adoption: the mouth
    // belongs to the ship's side of the lobe now, not to its peak. A
    // candidate is welcome to change any of these for the length of one
    // `draw()`; the shipped record is not, and a silent edit here is a look
    // changed with nobody asked.
    expect(MOUTH_LOOK.drop).toBe(0.26);
    expect(MOUTH_LOOK.ry).toBe(0.13);
    expect(MOUTH_LOOK.rxRest).toBe(0.13);
    expect(MOUTH_LOOK.rxOpen).toBe(0.94);
  });

  it("never reach further below the tip as the maw opens", () => {
    // The same claim `swallow-bounds.test.ts` holds against the drawing, held
    // here against the record it now comes out of: the growth from muzzle to
    // throat only ever goes sideways, or the maw drops into the control band.
    expect(MOUTH_LOOK.rxOpen).toBeGreaterThan(MOUTH_LOOK.rxRest);
    expect(MOUTH_LOOK.ry).toBeLessThanOrEqual(MOUTH_LOOK.rxRest);
  });
});

describe("the shipped mouth and the half of the phase added under it", () => {
  const calls = (phase: number): number => {
    const { ctx } = stubCanvas();
    LAY_LOOK.draw(ctx as unknown as CanvasRenderingContext2D, mouth(), { phase, time: 1.4 });
    return ctx.calls;
  };

  it("draws the body at rest, the wind-up and the departure", () => {
    // Unlike the old rim, the cloaca is a body part and is drawn whether or
    // not anything is happening — `egg-curve.test.ts`'s "draws no round hole
    // at rest" is `MOUTH_LOOK`'s half of that claim, this is `LAY_LOOK`'s.
    expect(calls(0)).toBeGreaterThan(0);
    expect(calls(0.15)).toBeGreaterThan(0);
    expect(calls(1)).toBeGreaterThan(0);
  });

  it("keeps drawing through the follow-through, going slack rather than cutting", () => {
    // The whole point of the adoption: the old rim stopped the instant the
    // shot left, which is why the phase could grow a second half without
    // moving a pixel. The egg does not — it relaxes, and relaxing is drawn.
    for (const phase of [1.01, 1.3, 1.7, 2]) expect(calls(phase)).toBeGreaterThan(0);
  });
});

describe("the follow-through the world cannot say", () => {
  const fired: SimEvent[] = [{ type: "fire", col: 3, color: "red", lance: false }];

  it("is 0 until a shot goes, 1 the moment it does, and climbs towards 2", () => {
    const fx = new Effects();
    expect(fx.layEcho.phase).toBe(0);

    fx.ingest(fired, L, 0, () => 0, CFG);
    // 1 on the tick of departure, so it joins the world's own countdown
    // exactly where that countdown stops.
    expect(fx.layEcho.phase).toBe(1);

    fx.update(BEAT_SECONDS * 0.2, L);
    const half = fx.layEcho.phase;
    expect(half).toBeGreaterThan(1);
    expect(half).toBeLessThan(2);

    fx.update(BEAT_SECONDS * 0.2, L);
    expect(fx.layEcho.phase).toBeGreaterThan(half);
  });

  it("runs out rather than sitting at 2, so a resting mouth is a resting mouth", () => {
    const fx = new Effects();
    fx.ingest(fired, L, 0, () => 0, CFG);
    fx.update(BEAT_SECONDS, L);
    expect(fx.layEcho.phase).toBe(0);
  });

  it("starts again on the next shot", () => {
    const fx = new Effects();
    fx.ingest(fired, L, 0, () => 0, CFG);
    fx.update(BEAT_SECONDS * 0.4, L);
    fx.ingest(fired, L, 0, () => 0, CFG);
    expect(fx.layEcho.phase).toBe(1);
  });
});
