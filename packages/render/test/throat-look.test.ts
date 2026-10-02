import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildQueue } from "@neon-spore/content";
import { createWorld, type ThroatMode, throatRadiusMilli, ticksPerBeat } from "@neon-spore/sim";
import { hullCrown } from "../src/hull-crown.js";
import { PALETTE } from "../src/palette.js";
import { drawMouth } from "../src/throat-mouth.js";
import { throatRefuseShake } from "../src/throat-refuse-shake.js";
import { mouthX, mouthY } from "../src/throat-shape.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./frame-harness.js";
import { LAYOUT, opened, put } from "./throat-rig.js";

/**
 * THE THROAT's look after the rework: the mouth wears the colour it is set
 * to, the pump's circle is drawn as wide as the simulation pulls, a body the
 * mouth refuses shakes where it stands, and the hull grows the root rather
 * than the gun (`throat-hue.ts`, `throat-refuse-shake.ts`, `hull-crown.ts`).
 * `throat-frame.test.ts` is the whole frame on every screen; this file asks
 * the four facts one at a time.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

beforeAll(installCanvasGlobals);

const L = LAYOUT.test;
const TPB = ticksPerBeat(CFG);

/** What one call of `drawMouth` put down: the log, and every path string. */
function mouth(mode: ThroatMode, pumpMilli: number): { log: string; paths: string[] } {
  const { world, t } = opened();
  t.mode = mode;
  t.pumpMilli = pumpMilli;
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  const paths: string[] = [];
  const g = globalThis as Record<string, unknown>;
  const Base = g.Path2D as new (d?: string) => object;
  g.Path2D = class extends Base {
    constructor(d?: string) {
      super(d);
      if (typeof d === "string") paths.push(d);
    }
  };
  try {
    drawMouth(ctx as unknown as CanvasRenderingContext2D, L, CFG, t, world.beat, 0, 0);
  } finally {
    g.Path2D = Base;
  }
  return { log: log.join("|"), paths };
}

/** The radius of every circle drawn round the mouth, off `circleSubpath`'s
 * `M x y A r r` opening. */
function circlesRound(paths: string[]): number[] {
  const { t } = opened();
  const cx = mouthX(L, t);
  const cy = mouthY(L, t);
  const out: number[] = [];
  for (const d of paths) {
    const m = /^M (-?[\d.]+) (-?[\d.]+) A ([\d.]+) /.exec(d);
    if (!m) continue;
    const r = Number(m[3]);
    if (Math.abs(Number(m[1]) + r - cx) < 1 && Math.abs(Number(m[2]) - cy) < 1) out.push(r);
  }
  return out;
}

describe("the throat's mouth", () => {
  const HEX: Record<ThroatMode, string> = {
    red: PALETTE.red,
    cyan: PALETTE.cyan,
    shield: PALETTE.shield,
    suck: PALETTE.pod,
  };
  for (const mode of ["red", "cyan", "shield", "suck"] as const) {
    it(`wears ${mode} on its lip`, () => {
      expect(mouth(mode, 0).log).toContain(HEX[mode]);
    });
  }

  it("carries the panel's face for the shield, which shares the cyan shot's hue", () => {
    // One hue for two modes, so the face is the whole of the difference.
    expect(PALETTE.shield).toBe(PALETTE.cyan);
    expect(mouth("shield", 0).log.length).toBeGreaterThan(mouth("cyan", 0).log.length);
    expect(mouth("suck", 0).log.length).toBeGreaterThan(mouth("red", 0).log.length);
  });

  it("draws no circle while the pump is still, and the simulation's own one when pumped", () => {
    expect(circlesRound(mouth("red", 0).paths).filter((r) => r > L.tile)).toEqual([]);
    const { t } = opened();
    t.pumpMilli = 1000;
    const reach = (throatRadiusMilli(CFG, t) / 1000) * L.tile;
    const wide = circlesRound(mouth("red", 1000).paths).filter((r) => r > L.tile);
    expect(wide.length).toBeGreaterThan(0);
    // Within the inward breathing, a few hundredths of the radius.
    for (const r of wide) expect(Math.abs(r - reach) / reach).toBeLessThan(0.05);
  });
});

describe("a body the mouth refuses", () => {
  it("shakes sideways for the refusal's window, and only that body", () => {
    const { world, t } = opened();
    const refused = put(world, "slick", 5, 4, "red");
    const other = put(world, "slick", 6, 4, "red");
    t.refusedId = refused.id;
    t.refusedTick = world.tick;
    const swings: number[] = [];
    for (let i = 1; i < CFG.throatRefuseTicks; i += 2) {
      world.tick = t.refusedTick + i;
      swings.push(throatRefuseShake(L, world, refused, 0));
      expect(throatRefuseShake(L, world, other, 0)).toBe(0);
    }
    expect(Math.max(...swings.map(Math.abs))).toBeGreaterThan(L.tile * 0.05);
    world.tick = t.refusedTick + CFG.throatRefuseTicks;
    expect(throatRefuseShake(L, world, refused, 0)).toBe(0);
  });

  it("stands still when nothing has been refused", () => {
    const { world, t } = opened();
    const c = put(world, "slick", 5, 4, "red");
    t.refusedId = -1;
    t.refusedTick = -1;
    for (let i = 0; i < TPB; i++) {
      world.tick++;
      expect(throatRefuseShake(L, world, c, 0.5)).toBe(0);
    }
  });
});

describe("the hull's crown", () => {
  it("is the throat's root on its wave, the gun elsewhere, and a hand under the claw", () => {
    expect(hullCrown(opened().world, false)).toBe("root");
    expect(hullCrown(opened().world, true)).toBe("hand");
    expect(hullCrown(createWorld(CFG, 7, buildQueue(0, CFG.cols)), false)).toBe("gun");
  });
});
