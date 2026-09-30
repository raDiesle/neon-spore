import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GaugeState,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { bossCue } from "../src/boss-cue.js";
import { drawGaugeGrip } from "../src/gauge-grip.js";
import { gaugeDial } from "../src/gauge-round.js";
import { drawGaugeTongueOut, gaugeTongueGrip } from "../src/gauge-tongue.js";
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
 * **THE GAUGE's tongue, as a picture and two hands** (`gauge-tongue.ts`,
 * `gauge-tongue-grip.ts`). The rule is the simulation's
 * (`sim/test/gauge-tongue.test.ts`); this file proves each seat is offered its
 * own place on the tongue and nobody's else, that a carry reports the twist
 * the simulation reads, and that a wrung tongue draws in any state.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

/** The round in its tongue rest — set rather than played for. */
function out(overrides: Partial<GaugeState> = {}): { world: World; g: GaugeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("gauge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const g = world.boss;
  if (g === null || g.kind !== "gauge") throw new Error("the gauge's wave installed no gauge");
  const opens = world.beat + 8;
  Object.assign(g, {
    phase: "play",
    level: 2,
    tongueOut: true,
    levelBeat: opens,
    regrowBeat: opens,
  });
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

describe("a hand on the tongue", () => {
  it("is each seat's on its own place, and only while the tongue is out", () => {
    for (const seat of [1, 2] as const) {
      const { g } = out();
      const l = layout(seat === 1 ? "p1" : "p2");
      const at = gaugeTongueGrip(gaugeDial(l), seat);
      const touch = touchDown(l, at.x, at.y, fieldWith(seat, g));
      expect(touch?.player).toBe(seat);
      expect(touch?.command).toMatchObject({ kind: "drag", target: "gaugeTongue", on: true });
      const shut = touchDown(l, at.x, at.y, fieldWith(seat, out({ tongueOut: false }).g));
      expect(shut?.command?.kind === "drag" && shut.command.target).not.toBe("gaugeTongue");
    }
  });

  it("reports how far sideways the thumb has gone as the twist", () => {
    const { g } = out();
    const l = layout("p1");
    const at = gaugeTongueGrip(gaugeDial(l), 1);
    const hold = touchDown(l, at.x, at.y, fieldWith(1, g))?.hold as Hold;
    const moved = touchMove(l, hold, at.x - l.tile, at.y)?.command;
    expect(moved).toMatchObject({ target: "gaugeTongue", fromMilli: -1000 });
  });
});

/** Canvas calls one screen makes for the rings, in one state. */
function ringCalls(role: ViewRole, g: GaugeState): number {
  const { ctx } = stubCanvas();
  const l = layout(role);
  drawGaugeGrip(
    ctx as unknown as CanvasRenderingContext2D,
    l,
    DEFAULT_CONFIG,
    gaugeDial(l),
    g,
    role,
    1.2,
  );
  return ctx.calls;
}

describe("the picture", () => {
  it("rings the tongue on both screens, and not once it is back in", () => {
    expect(ringCalls("p1", out().g)).toBeGreaterThan(0);
    expect(ringCalls("p2", out().g)).toBeGreaterThan(0);
    expect(ringCalls("p1", out({ tongueOut: false }).g)).toBe(0);
  });

  it("draws a whole number of calls at every twist, with no NaN in any of them", () => {
    const dial = gaugeDial(layout("test"));
    for (const [p1, p2] of [
      [0, 0],
      [800, -800],
      [-1000, 1000],
      [1000, 1000],
    ] as const) {
      const { ctx } = stubCanvas();
      ctx.log = [];
      const g = out({ tongueHolds: 3, tongueP1Milli: p1, tongueP2Milli: p2 }).g;
      drawGaugeTongueOut(ctx as unknown as CanvasRenderingContext2D, dial, DEFAULT_CONFIG, g, 1.2);
      expect(ctx.calls).toBeGreaterThan(0);
      expect(ctx.log.some((line) => line.includes("NaN"))).toBe(false);
    }
  });
});

describe("the words", () => {
  it("tell each seat to twist, until its own hand is on", () => {
    const { world } = out();
    const p1 = layout("p1");
    const p2 = layout("p2");
    expect(bossCue(p1, world, 0, () => p1.hullY)?.word).toBe("TWIST");
    expect(bossCue(p2, world, 0, () => p2.hullY)?.word).toBe("TWIST");
    const his = out({ tongueHolds: 1 }).world;
    expect(bossCue(p1, his, 0, () => p1.hullY)).toBeNull();
    expect(bossCue(p2, his, 0, () => p2.hullY)?.word).toBe("TWIST");
  });
});
