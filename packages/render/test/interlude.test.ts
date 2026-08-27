import { beforeAll, describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  gaugeSeated,
  PAIR_ON,
  type SimConfig,
  startInterlude,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { interludeControls, showsGaugeMarks, showsGaugeValve } from "../src/interlude.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The round that is not the field, drawn.
 *
 * `frame.test.ts` and `frame-pair.test.ts` cover the field and the two things
 * that stop it; this covers the one thing that replaces it. Every phase in
 * every role, through a canvas that refuses what a real one refuses — because
 * an interlude is the first picture in this game with no grid under it, so
 * every coordinate in it is derived from the stage rather than from a tile,
 * and a tile is what most of this package's arithmetic has been checked
 * against until now.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, ...PAIR_ON };
const TPB = ticksPerBeat(CFG);
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const VIEWPORT = { width: 900, height: 1600, dpr: 2 };

beforeAll(installCanvasGlobals);

/** The pair from `sim/test/gauge.test.ts`, so the round actually progresses. */
function talking(world: World): TimedCommand[] {
  const gauge = world.interlude;
  if (gauge === null || gauge.phase !== "play") return [];
  const out: TimedCommand[] = [];
  const want = gauge.needleMilli < gauge.markMilli ? 1 : -1;
  if (gauge.valve !== want) {
    out.push({ tick: world.tick, player: 1, command: { kind: "valve", on: true, dir: want } });
  }
  if (gaugeSeated(world, gauge)) {
    out.push({ tick: world.tick, player: 2, command: { kind: "call" } });
  }
  return out;
}

function frames(role: ViewRole, beats: number, play: boolean) {
  const world = createWorld(CFG, 13);
  startInterlude(world, { kind: "gauge" }, 4);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize(VIEWPORT);

  for (let tick = 0; tick < TPB * beats; tick++) {
    step(world, play ? talking(world) : []);
    if (tick % 4 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % TPB) / TPB,
      role,
      time: tick / CFG.tickHz,
      dt: 4 / CFG.tickHz,
      events: [],
      running: true,
      banner: null,
    });
  }
  return { world, ctx };
}

describe("a gauge round on screen", () => {
  for (const role of ROLES) {
    it(`draws the count-in for ${role} without the canvas refusing a value`, () => {
      const { world, ctx } = frames(role, 2, false);
      expect(world.interlude?.phase).toBe("lead");
      expect(ctx.calls).toBeGreaterThan(200);
    });

    it(`draws the round being played for ${role}`, () => {
      const { world, ctx } = frames(role, 10, true);
      expect(world.interlude?.phase).toBe("play");
      expect(world.interlude?.marks).toBeGreaterThan(0);
      expect(ctx.calls).toBeGreaterThan(1000);
    });

    it(`draws the verdict for ${role}`, () => {
      const { world, ctx } = frames(role, CFG.gaugeRoundBeats + 2, false);
      expect(world.interlude?.phase).toBe("verdict");
      expect(world.interlude?.passed).toBe(false);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  /**
   * The information split, as a count rather than as a promise. The pilot's
   * dial is the same dial with the band and its two marks left out, so his
   * frame makes strictly fewer calls than the navigator's — and if someone
   * later draws the band on both screens, this is what fails.
   */
  it("leaves the marks off the pilot's screen and puts them on the navigator's", () => {
    expect(showsGaugeMarks("p1")).toBe(false);
    expect(showsGaugeMarks("p2")).toBe(true);
    const pilot = frames("p1", 10, true);
    const navigator = frames("p2", 10, true);
    expect(pilot.ctx.calls).toBeLessThan(navigator.ctx.calls);
  });
});

describe("the round's own controls", () => {
  const layoutFor = (role: ViewRole) =>
    computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

  it("gives the two seats different ones, and neither of them the band's", () => {
    const pilot = interludeControls(layoutFor("p1"), "p1");
    const navigator = interludeControls(layoutFor("p2"), "p2");
    expect(pilot.down).not.toBeNull();
    expect(pilot.up).not.toBeNull();
    expect(pilot.call).toBeNull();
    expect(navigator.call).not.toBeNull();
    expect(navigator.down).toBeNull();
    expect(showsGaugeValve("p2")).toBe(false);
  });

  it("puts all three on one screen when one person holds both seats", () => {
    const both = interludeControls(layoutFor("test"), "test");
    expect(both.down).not.toBeNull();
    expect(both.up).not.toBeNull();
    expect(both.call).not.toBeNull();
    // Side by side, in the order they are read out, and none of them overlaps
    // the next — a hit test that answered two slabs at once would be a call
    // the pilot made with his own thumb.
    const slabs = [both.down, both.up, both.call];
    for (let i = 1; i < slabs.length; i++) {
      expect(slabs[i]?.x).toBeGreaterThan((slabs[i - 1]?.x ?? 0) + (slabs[i - 1]?.w ?? 0));
    }
  });
});
