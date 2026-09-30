import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  GAUGE_TEETH,
  type GaugeState,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { bossCue } from "../src/boss-cue.js";
import { drawGaugeGrip } from "../src/gauge-grip.js";
import { gaugeDial } from "../src/gauge-round.js";
import { drawTeeth, type TeethView, toothAt, toothPoint } from "../src/gauge-teeth.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, type Hold, touchDown, touchMove } from "../src/touch.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GAUGE's loose tooth, as a picture and a hand** (`gauge-teeth.ts`,
 * `gauge-tooth-grip.ts`). The rule is the simulation's
 * (`sim/test/gauge-tooth.test.ts`); this file proves the split is drawn the
 * way round the rest needs it — the loose one on his screen and nobody's
 * else, a ring on every tooth on hers — and that her press names the tooth
 * under her thumb and no neighbour.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

/** The round in its tooth rest, tooth 6 loose — set rather than played for. */
function loose(overrides: Partial<GaugeState> = {}): { world: World; g: GaugeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("gauge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const g = world.boss;
  if (g === null || g.kind !== "gauge") throw new Error("the gauge's wave installed no gauge");
  // The rest as the simulation leaves it: the rim bare until the level opens.
  const opens = world.beat + 8;
  Object.assign(g, { phase: "play", level: 1, looseTooth: 6, levelBeat: opens, regrowBeat: opens });
  Object.assign(g, overrides);
  return { world, g };
}

function fieldWith(seat: 1 | 2, boss: GaugeState): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: 6,
    waveBeat: 6,
    tick: 0,
    seat,
    cfg: DEFAULT_CONFIG,
    boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("her press on the teeth", () => {
  it("names the tooth under the thumb, every one of the fifteen", () => {
    const l = layout("p2");
    const dial = gaugeDial(l);
    for (let k = 0; k < GAUGE_TEETH; k++) {
      const p = toothPoint(dial, k);
      expect(toothAt(dial, p.x, p.y, l.tile)).toBe(k);
    }
    // The pivot and the sky are nobody's tooth.
    expect(toothAt(dial, dial.cx, dial.cy - dial.r * 0.3, l.tile)).toBe(-1);
    expect(toothAt(dial, dial.cx, dial.cy + dial.r * 0.5, l.tile)).toBe(-1);
  });

  it("is hers alone, only in the rest, and never on a tooth already out", () => {
    const { g } = loose();
    const p2 = layout("p2");
    const at = toothPoint(gaugeDial(p2), 3);
    const touch = touchDown(p2, at.x, at.y, fieldWith(2, g));
    expect(touch?.command).toMatchObject({ kind: "drag", target: "gaugeTooth", on: true, id: 3 });
    const his = touchDown(layout("p1"), at.x, at.y, fieldWith(1, g));
    expect(his?.command?.kind === "drag" && his.command.target).not.toBe("gaugeTooth");
    expect(touchDown(p2, at.x, at.y, fieldWith(2, loose({ pulledTeeth: 1 << 3 }).g))).toBeNull();
    expect(touchDown(p2, at.x, at.y, fieldWith(2, loose({ looseTooth: -1 }).g))).toBeNull();
  });

  it("carries the tooth's id and the drag's displacement on a move", () => {
    const { g } = loose();
    const l = layout("p2");
    const at = toothPoint(gaugeDial(l), 6);
    const hold = touchDown(l, at.x, at.y, fieldWith(2, g))?.hold as Hold;
    const moved = touchMove(l, hold, at.x, at.y + l.tile * 2)?.command;
    expect(moved).toMatchObject({ target: "gaugeTooth", id: 6, fromMilli: 0, fromYMilli: 2000 });
  });
});

/** Canvas calls one screen makes for the rings, in one state. */
function ringCalls(role: ViewRole, g: GaugeState): number {
  const { ctx } = stubCanvas();
  const l = layout(role);
  const c = ctx as unknown as CanvasRenderingContext2D;
  drawGaugeGrip(c, l, DEFAULT_CONFIG, gaugeDial(l), g, role, 1.2);
  return ctx.calls;
}

/** Canvas calls the teeth make, and whether any was in the gum a tooth left. */
function teeth(view: TeethView): { calls: number; gum: boolean } {
  const { ctx } = stubCanvas();
  ctx.log = [];
  const c = ctx as unknown as CanvasRenderingContext2D;
  drawTeeth(c, gaugeDial(layout("test")), view, 1.2);
  return { calls: ctx.calls, gum: ctx.log.some((line) => line.includes("#3A0F22")) };
}

describe("the picture", () => {
  it("rings the teeth on her screen and not on his", () => {
    const { g } = loose();
    expect(ringCalls("p2", g)).toBeGreaterThan(0);
    expect(ringCalls("p1", g)).toBe(0);
    expect(ringCalls("p2", loose({ looseTooth: -1 }).g)).toBe(0);
  });

  it("leaves gum where a tooth is out, and draws the loose and the held one over it", () => {
    const whole = teeth({ pulled: 0, loose: -1, hold: -1, dx: 0, dy: 0 });
    expect(whole.gum).toBe(false);
    expect(teeth({ pulled: 1 << 6, loose: -1, hold: -1, dx: 0, dy: 0 }).gum).toBe(true);
    const shaking = teeth({ pulled: 0, loose: 6, hold: -1, dx: 0, dy: 0 });
    expect(shaking.gum).toBe(true);
    expect(shaking.calls).toBeGreaterThan(whole.calls);
    const held = teeth({ pulled: 0, loose: 6, hold: 6, dx: 20, dy: 30 });
    expect(held.calls).toBeGreaterThan(whole.calls);
  });
});

describe("the words", () => {
  it("tell him to call the tooth and her to pull, until one is in her hand", () => {
    const { world } = loose();
    const p1 = layout("p1");
    const p2 = layout("p2");
    expect(bossCue(p1, world, 0, () => p1.hullY)?.word).toBe("TOOTH");
    expect(bossCue(p2, world, 0, () => p2.hullY)?.word).toBe("PULL");
    const held = loose({ toothHold: 6 }).world;
    expect(bossCue(p2, held, 0, () => p2.hullY)).toBeNull();
  });
});
