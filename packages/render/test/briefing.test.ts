import { beforeAll, describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, step, type World } from "@neon-spore/sim";
import { drawWaveOpening } from "../src/briefing.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * Every wave's opening, in both states and every role, through the strict
 * canvas — the same rule as `frame.test.ts`, because the introduction is the
 * first thing a new pair ever sees and a colour the browser cannot parse there
 * is a game that never starts.
 *
 * The other half of this file is the prose. A guide with an empty line is a
 * guide that teaches half of a split, which is worse than no guide: one player
 * is told to read something out and has nothing to read.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const GUIDED = WAVES.map((w, i) => (w.guide ? i : -1)).filter((i) => i >= 0);

beforeAll(installCanvasGlobals);

describe("the guides the waves carry", () => {
  it("never says the same thing to both players", () => {
    for (const i of GUIDED) {
      const guide = WAVES[i]?.guide;
      expect(guide?.p1, `${WAVES[i]?.name} tells both players the same thing`).not.toBe(guide?.p2);
    }
  });

  it("keeps a line short enough to read on a phone under a beat", () => {
    for (const i of GUIDED) {
      const guide = WAVES[i]!.guide!;
      for (const part of [guide.p1, guide.p2]) {
        expect(part.length, `${WAVES[i]?.name} has a long half: ${part}`).toBeLessThanOrEqual(220);
      }
    }
  });

  it("keeps the name the guide is headed with short enough to fit", () => {
    for (const wave of WAVES) {
      expect(wave.name.length, `${wave.name} is a long name`).toBeLessThanOrEqual(20);
    }
  });
});

/** A world holding a wave's introduction, and one holding its guide. */
function opening(waveIndex: number): { intro: World; guide: World } {
  const build = (): World => {
    const world = createWorld(CFG, 3);
    startWave(world, waveIndex, [], [], null, WAVES[waveIndex]?.guide !== undefined);
    return world;
  };
  const guide = build();
  step(guide, [
    { tick: 0, player: 1, command: { kind: "brief" } },
    { tick: 0, player: 2, command: { kind: "brief" } },
  ]);
  return { intro: build(), guide };
}

describe("a wave's opening on the stage", () => {
  it("draws both states of every wave in every role", () => {
    const { ctx } = stubCanvas();
    for (const role of ROLES) {
      const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, role);
      for (let i = 0; i < WAVES.length; i++) {
        const { intro, guide } = opening(i);
        drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, intro, role);
        drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, guide, role);
      }
    }
  });

  it("draws on a screen narrow enough that a word does not fit", () => {
    const { ctx } = stubCanvas();
    const l = computeLayout({ width: 240, height: 480, dpr: 1 }, CFG, "p1");
    for (const i of GUIDED) {
      const { intro, guide } = opening(i);
      drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, intro, "p1");
      drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, guide, "p1");
    }
  });

  it("draws a wave past the end of the authored list without a name to show", () => {
    const { ctx } = stubCanvas();
    const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");
    const world = createWorld(CFG, 3);
    startWave(world, WAVES.length + 4, []);
    drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, "p1");
  });

  it("draws nothing at all once the field is playing", () => {
    const { ctx } = stubCanvas();
    const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");
    const world = createWorld(DEFAULT_CONFIG, 3);
    startWave(world, 0, []);
    const calls = ctx.calls;
    drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, "p1");
    expect(ctx.calls).toBe(calls);
  });
});
