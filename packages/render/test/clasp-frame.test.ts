import { beforeAll, describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { claspResonanceIn } from "../src/clasp.js";
import { claspBreakVisible } from "../src/clasp-break.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * THE CLASP, drawn — through the same canvas that refuses what a real one
 * refuses (`frame.test.ts`), which is the only coverage render/ has.
 *
 * Nothing here can answer whether the shield *reads*, or whether the arcs
 * growing off the ship's rim actually say "these two are lined up". That is
 * the check this lane owes and it needs a phone. What it can hold is the shape
 * of the arrangement: that a shielded body paints without throwing, that the
 * resonance is on exactly when the two columns agree and off otherwise, and
 * that the break blinks rather than fades — which is the one part of the
 * owner's description a number can actually check.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

beforeAll(installCanvasGlobals);

const clasp = (col: number): SpawnEntry => ({ beat: 0, col, kind: "clasp", color: "cyan" });

function paint(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): number {
  const world = createWorld(CFG, 1, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 900, height: 1600, dpr: 2 });

  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    step(world, byTick.get(tick) ?? []);
    if (world.events.length) events.push(...world.events);
    if (tick % 4 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % TPB) / TPB,
      role: "p1",
      time: tick / CFG.tickHz,
      dt: 4 / CFG.tickHz,
      events,
      running: true,
    });
    events = [];
  }
  return ctx.calls;
}

describe("a clasp on the field", () => {
  it("paints a shielded body without the canvas refusing anything", () => {
    expect(paint([clasp(5)], TPB * 4)).toBeGreaterThan(0);
  });

  it("paints the ward opening it, and the shield blinking out afterwards", () => {
    // Straight through the break and out the other side, so the frames that
    // draw a shield which is no longer in the world are all painted too.
    const inputs: TimedCommand[] = [
      { tick: 10, player: 2, command: { kind: "shieldCol", col: 5 } },
      { tick: TPB, player: 1, command: { kind: "guard" } },
    ];
    expect(paint([clasp(5)], TPB * 6, inputs)).toBeGreaterThan(0);
  });
});

describe("the resonance both ends of the link read", () => {
  it("is off while the shield is in another column", () => {
    const world = createWorld(CFG, 1, [clasp(5)]);
    for (let t = 0; t < TPB; t++) step(world, []);
    world.shieldCol = 2;
    expect(claspResonanceIn(world)).toBe(0);
  });

  it("is on the moment the shield stands in a clasp's column", () => {
    const world = createWorld(CFG, 1, [clasp(5)]);
    for (let t = 0; t < TPB; t++) step(world, []);
    world.shieldCol = 5;
    expect(claspResonanceIn(world)).toBe(1);
  });

  it("goes off again once the clasp has been opened", () => {
    // The body is still standing in that column — it is a bulb now. The link
    // is to the *shield*, not to the body, so it has to stop.
    const world = createWorld(CFG, 1, [clasp(5)]);
    const inputs: TimedCommand[] = [
      { tick: 10, player: 2, command: { kind: "shieldCol", col: 5 } },
      { tick: TPB, player: 1, command: { kind: "guard" } },
    ];
    const byTick = new Map<number, TimedCommand[]>();
    for (const i of inputs) byTick.set(i.tick, [i]);
    for (let t = 0; t < TPB * 2; t++) step(world, byTick.get(t) ?? []);
    expect(world.creatures[0]?.kind).toBe("bulb");
    expect(world.shieldCol).toBe(5);
    expect(claspResonanceIn(world)).toBe(0);
  });
});

describe("the break blinks rather than fades", () => {
  /**
   * The owner asked for a broken bulb — "blinking on off, then completely
   * vanishing". A fade would say the shield weakened; it did not, it failed.
   * So the visibility over the break's life has to change state several times
   * and end off, and that is a property a test can hold even though how it
   * looks is not.
   */
  it("changes state at least three times and ends gone", () => {
    const samples = 200;
    let flips = 0;
    let previous = claspBreakVisible(0);
    for (let i = 1; i <= samples; i++) {
      const now = claspBreakVisible(i / samples);
      if (now !== previous) flips++;
      previous = now;
    }
    expect(flips).toBeGreaterThanOrEqual(3);
    expect(claspBreakVisible(1)).toBe(false);
    expect(claspBreakVisible(0)).toBe(true);
  });
});
