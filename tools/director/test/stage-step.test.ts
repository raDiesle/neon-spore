import { describe, expect, it } from "bun:test";
import type { ViewState } from "@neon-spore/render";
import {
  createWorld,
  DEFAULT_CONFIG,
  failWave,
  type SimConfig,
  startWave,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { stageStep } from "../src/stage-step.js";

/**
 * THE STAGE'S OWN TICK, PROVED WITHOUT A BROWSER.
 *
 * `bindStage` is `ResizeObserver` and `requestAnimationFrame` end to end, so
 * everything it held could only be checked by playing the director — which is
 * how the paused drain came to be a comment and no test. Cut into `stage-step.ts` when `stage.ts`
 * reached its 250-line ceiling, the pieces arrive as calls, and a stub answers
 * each of them here: a renderer that keeps its frames, keys that write down
 * which tick they were drained on, and a real `World`, since what is on trial
 * is the order these are asked in rather than the simulation.
 */

const PER_BEAT = ticksPerBeat(DEFAULT_CONFIG);

function rig(startRunning = true, cfg: SimConfig = DEFAULT_CONFIG) {
  const world: World = createWorld(cfg, 0);
  const frames: ViewState[] = [];
  const drained: number[] = [];
  const order: string[] = [];
  const beats: number[] = [];
  let running = startRunning;
  const step = stageStep({
    cfg,
    world: () => world,
    renderer: { draw: (seen) => frames.push(seen) },
    keys: {
      drain: (tick) => {
        drained.push(tick);
        order.push("drain");
        return [];
      },
    },
    running: () => running,
    role: () => "test",
    controls: () => undefined,
    guide: () => undefined,
    hand: () => undefined,
    pointer: () => undefined,
    onBeat: (beat) => beats.push(beat),
    onFrame: () => order.push("frame"),
    onNeedWave: () => order.push("needWave"),
  });
  return {
    step,
    world,
    frames,
    drained,
    order,
    beats,
    pause: () => {
      running = false;
    },
  };
}

describe("one tick of the stage", () => {
  it("holds the world still while paused, and drains the keys anyway", () => {
    const r = rig(false);
    r.step.advance();
    // A thumb held through a pause is not a command waiting to arrive on the
    // tick after it, out of the hand that meant it.
    expect(r.drained).toEqual([0]);
    expect(r.world.tick).toBe(0);
    expect(r.order).toEqual(["drain"]);
  });

  it("drains the keys and steps the world once a tick", () => {
    const r = rig();
    r.step.advance();
    expect(r.order).toEqual(["drain"]);
    expect(r.world.tick).toBe(1);
  });

  it("steps whatever the transport says, when it is asked to", () => {
    const r = rig(false);
    r.step.stepOnce();
    expect(r.world.tick).toBe(1);
    // SEEK and the page's own handle replay a wave while it is paused.
    expect(r.order).toEqual(["drain"]);
  });
});

describe("what the beat says", () => {
  it("is said once, and only when it changes", () => {
    const r = rig();
    for (let i = 0; i < PER_BEAT; i++) r.step.advance();
    expect(r.beats).toEqual([0, 1]);
    expect(r.step.beat()).toBe(1);
  });

  it("goes back to zero for a fresh world, and says so", () => {
    const r = rig();
    for (let i = 0; i < PER_BEAT; i++) r.step.advance();
    r.step.opened();
    expect(r.step.beat()).toBe(0);
    expect(r.beats.at(-1)).toBe(0);
  });
});

/**
 * The row the map marks is the wave's, not the clock's. The tick counts on
 * through a briefing, a lost screen and the rest after a clear, and the map
 * used to walk on down with it — past the last row of a wave already over.
 */
describe("the row the map follows", () => {
  const beats = (r: ReturnType<typeof rig>, n: number): void => {
    for (let i = 0; i < n * PER_BEAT; i++) r.step.advance();
  };
  // Something far down the map, so the wave stays open while it is played.
  const late = [{ beat: 60, col: 0, kind: "slick" as const, color: null }];

  it("stands on the first row while the wave's briefing is up", () => {
    const r = rig(true, { ...DEFAULT_CONFIG, briefings: true });
    startWave(r.world, 0, [...late], [], null, true, 2);
    r.step.opened();
    beats(r, 5);
    expect(r.world.tick).toBe(5 * PER_BEAT);
    expect(r.beats).toEqual([0]);
  });

  it("stays on the row a lost wave was lost on", () => {
    const r = rig();
    startWave(r.world, 0, [...late]);
    r.step.opened();
    beats(r, 3);
    failWave(r.world);
    beats(r, 4);
    expect(r.beats.at(-1)).toBe(3);
    expect(r.step.beat()).toBe(3);
  });

  it("stays on the row a wave was cleared on, through the rest after it", () => {
    const r = rig();
    startWave(r.world, 0, []);
    r.step.opened();
    beats(r, 1 + DEFAULT_CONFIG.waveRestBeats);
    expect(r.world.restBeat).not.toBe(0);
    expect(r.beats).toEqual([0, 1]);
  });
});

describe("one frame of the picture", () => {
  it("carries the events of every tick since the last one, and then none", () => {
    const r = rig();
    // A beat is the first thing a fresh wave reports, at the tick that ends it.
    for (let i = 0; i < PER_BEAT; i++) r.step.advance();
    r.step.paint(1 / 60);
    expect(r.frames[0]?.events.map((e) => e.type)).toContain("beat");
    r.step.paint(1 / 60);
    // Cleared by the frame that carried them: a second frame drawing the same
    // beat would fire its effect twice.
    expect(r.frames[1]?.events).toEqual([]);
  });

  it("says the world, the seat and whether the transport is running", () => {
    const r = rig();
    r.pause();
    r.step.paint(1 / 60);
    const seen = r.frames[0];
    expect(seen?.world).toBe(r.world);
    expect(seen?.role).toBe("test");
    expect(seen?.running).toBe(false);
    expect(seen?.dt).toBe(1 / 60);
    expect(r.order).toEqual(["frame"]);
  });
});
