import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  type SimEvent,
  seamBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { JAB_SHAKE } from "../src/boss-hurt.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { drawSeam } from "../src/seam-draw.js";
import { SeamFx } from "../src/seam-fx.js";
import { seamRockAt, seamRockNow, seamThrow } from "../src/seam-marks.js";
import { seamCentre } from "../src/seam-shape.js";
import { SEAM_CRACK_MARK, seamGritCircle } from "../src/seam-verdicts.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

/**
 * What THE SEAM leaves behind a frame (`seam-fx.ts`): the plating's click
 * as a point is shot shut and the ridge's blow, the lighter blow for a step
 * answered that seals nothing, the grit going off the shield, the split's
 * shudder, and where its receipts are thrown — the crack's mark and the rock
 * the drawer tells it of. The reseal's flash is `seam-hold-frame.test.ts`'s,
 * the red of the blow `boss-hurt.test.ts`'s.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const col = midCol(CFG);
const BEAT = 0.5;
const CRACK = { x: 400, y: 300 };
const ROCK = { x: 150, y: 900 };

interface Thrown {
  x: number;
  y: number;
  n: number;
  hex: string;
}

function said(fx: SeamFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, y, n, hex) => out.push({ x, y, n, hex }));
  return out;
}

function told(): SeamFx {
  const fx = new SeamFx();
  fx.note(CRACK, ROCK);
  return fx;
}

function settle(fx: SeamFx): void {
  for (let i = 0; i < 120; i++) fx.update(1 / 60);
}

describe("THE SEAM's transients", () => {
  it("clicks the plating as a point is shot shut, off the crack's mark, and deals the whole blow", () => {
    const fx = told();
    const [thrown] = said(fx, [{ type: "seamSeal", sealed: 1, col }]);
    expect(thrown).toMatchObject({ x: CRACK.x, y: CRACK.y });
    expect(fx.shock.now).toBeGreaterThan(0);
    expect(fx.hurt.shake).toBe(1);
    expect(fx.verdicts.at(SEAM_CRACK_MARK)?.good).toBe(true);
    settle(fx);
    expect(fx.shock.now).toBe(0);
    expect(fx.hurt.value).toBe(0);
  });

  it("deals the lighter blow for a point that dims, a rock shot out and the glow quenched", () => {
    const answered: SimEvent[] = [
      { type: "seamDim", col },
      { type: "seamRockOut", col },
      { type: "seamQuench", left: 0, col },
    ];
    for (const e of answered) {
      const fx = told();
      said(fx, [e]);
      expect(fx.hurt.shake, e.type).toBe(JAB_SHAKE);
      expect(fx.shock.now, e.type).toBe(0);
    }
  });

  it("bursts a rock shot out where the drawer last had it, and at the ridge with none told", () => {
    expect(said(told(), [{ type: "seamRockOut", col }])[0]).toMatchObject(ROCK);
    const mid = seamCentre(L, CFG);
    expect(said(new SeamFx(), [{ type: "seamRockOut", col }])[0]).toMatchObject(mid);
  });

  it("sparks the grit off the shield under the ridge, and deals nothing for it", () => {
    const fx = told();
    const [thrown] = said(fx, [{ type: "seamBlock", col }]);
    const at = seamGritCircle(L, CFG);
    expect(thrown).toMatchObject({ x: at.x, y: at.y, hex: PALETTE.hullRim });
    expect(fx.hurt.value).toBe(0);
  });

  it("shudders the plating harder for the split than for a seal, and deals nothing for it", () => {
    const sealed = told();
    said(sealed, [{ type: "seamSeal", sealed: 1, col }]);
    const split = told();
    said(split, [{ type: "seamSplit", col }]);
    expect(split.shock.now).toBeGreaterThan(sealed.shock.now);
    expect(split.hurt.value).toBe(0);
  });

  it("deals nothing for a step lighting or a shot into a glow that wants more", () => {
    const fx = told();
    said(fx, [
      { type: "seamLight", ask: "glow", col },
      { type: "seamQuench", left: 2, col },
    ]);
    expect(fx.hurt.value).toBe(0);
  });

  it("leaves a step run out and the false point fired at to the seam's own blow", () => {
    const fx = told();
    for (const type of ["seamMiss", "seamBaited", "seamFade", "seamOut"] as const) {
      expect(said(fx, [{ type, col }]), type).toEqual([]);
    }
    expect(fx.shock.now).toBe(0);
    expect(fx.hurt.value).toBe(0);
  });

  it("forgets everything on a clear", () => {
    const fx = told();
    said(fx, [
      { type: "seamLight", ask: "point", col },
      { type: "seamSeal", sealed: 1, col },
      { type: "seamReseal", col },
      { type: "seamSplit", col },
    ]);
    fx.clear();
    expect(fx).toEqual(new SeamFx());
  });
});

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("seam");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  return world;
}

describe("THE SEAM's drawer telling its fx", () => {
  it("bursts a rock shot out where the rock was drawn the frame before", () => {
    const world = stood();
    const s = seamBoss(world);
    if (s === null) throw new Error("the seam wave stood no ridge");
    s.phase = "lit";
    s.phaseBeat = world.beat - 1;
    s.shot = false;
    s.guarded = false;
    s.cursor = 0;
    s.steps[0] = { ask: "rock", color: "either", offset: 2, seals: false };
    const fx = new SeamFx();
    const { ctx } = stubCanvas();
    const c2d = ctx as unknown as CanvasRenderingContext2D;
    drawSeam(c2d, L, world, s, world.beat, 0, 1, fx);
    const thrown = seamThrow(L, world, s, seamCentre(L, CFG), world.beat, 0);
    const rock = seamRockNow(L, thrown);
    expect(thrown?.toX).not.toBeNull();
    expect(rock).toEqual(
      seamRockAt(L, thrown?.from ?? { x: 0, y: 0 }, thrown?.toX ?? 0, thrown?.along ?? 0),
    );
    expect(said(fx, [{ type: "seamRockOut", col }])[0]).toMatchObject(rock ?? {});
  });
});
