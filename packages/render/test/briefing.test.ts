import { beforeAll, describe, expect, it } from "bun:test";
import { WAVES, waveGuideSteps } from "@neon-spore/content";
import {
  ackBriefing,
  createWorld,
  DEFAULT_CONFIG,
  guidePages,
  guideStepHeard,
  startWave,
  type World,
} from "@neon-spore/sim";
import { drawWaveOpening } from "../src/briefing.js";
import { GuideStage } from "../src/guide-scene.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { OpeningFx } from "../src/opening-fx.js";
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
const SCENED = WAVES.map((w, i) => (w.guide?.scene ? i : -1)).filter((i) => i >= 0);

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

/**
 * A world holding a wave's guide, and one holding its introduction.
 *
 * The introduction is posed by opening the wave with no guide at all, which is
 * what a wave without one does and what a wave with a prose guide reaches once
 * its gate is crossed. It cannot be posed by crossing a *stepped* guide's gate
 * any more: that guide's last page is the introduction, so passing it goes
 * straight to the field (`sim/guide-steps.ts`).
 */
function opening(waveIndex: number): { intro: World; guide: World } {
  const build = (guided: boolean): World => {
    const world = createWorld(CFG, 3);
    startWave(
      world,
      waveIndex,
      [],
      [],
      null,
      guided && WAVES[waveIndex]?.guide !== undefined,
      waveGuideSteps(waveIndex),
    );
    return world;
  };
  return { intro: build(false), guide: build(true) };
}

describe("a wave's opening on the stage", () => {
  it("draws both states of every wave in every role", () => {
    const { ctx } = stubCanvas();
    for (const role of ROLES) {
      const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, role);
      for (let i = 0; i < WAVES.length; i++) {
        const { intro, guide } = opening(i);
        drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, intro, { role: role });
        drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, guide, { role: role });
      }
    }
  });

  it("draws on a screen narrow enough that a word does not fit", () => {
    const { ctx } = stubCanvas();
    const l = computeLayout({ width: 240, height: 480, dpr: 1 }, CFG, "p1");
    for (const i of GUIDED) {
      const { intro, guide } = opening(i);
      drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, intro, { role: "p1" });
      drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, guide, { role: "p1" });
    }
  });

  it("draws every page of every guide with no clock behind it", () => {
    // No `fx` is a still — a capture, a shape sheet, the frames tool — and the
    // page then reports `SETTLED_AGE` rather than an infinite one. Every
    // entrance here clamps and could not tell the two apart, but the nav bar's
    // feeders, its halo and the glow on NEXT are sines of that number, and
    // `Math.sin(Infinity)` is a `NaN` this canvas refuses. Both guards that
    // used to stand in front of it were deleted with the sentinel.
    const { ctx } = stubCanvas();
    for (const role of ROLES) {
      const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, role);
      for (const i of GUIDED) {
        const { guide } = opening(i);
        // One past the last page is the gate, which is a different screen.
        for (let page = 0; page <= guidePages(guide); page++) {
          drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, guide, { role });
          guideStepHeard(guide, 1, false);
          guideStepHeard(guide, 2, false);
        }
      }
    }
  });

  it("draws a wave past the end of the authored list without a name to show", () => {
    const { ctx } = stubCanvas();
    const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");
    const world = createWorld(CFG, 3);
    startWave(world, WAVES.length + 4, []);
    drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, { role: "p1" });
  });

  /**
   * Every page of a scened guide, played through and drawn, at a role.
   *
   * Both seats are paged together so that whichever seat the role reads its
   * cursor off is the one moving — `test` and `p1` read player 1's, `p2` reads
   * player 2's, and a walk that only moved one of them would leave one role
   * looking at page one for the whole test.
   */
  /**
   * Frames drawn per page. Two ticks each, so a hundred and forty of them
   * crosses the shortest page a film may have and most of the longest — which
   * is what this test is for. It was 260, chosen when there was one film to
   * walk; there are twenty-six now and the walk grew past half a minute, so it
   * was cut rather than the timeout raised a third time.
   */
  const FRAMES_PER_PAGE = 140;

  const walkPages = (
    ctx: unknown,
    l: ReturnType<typeof computeLayout>,
    world: World,
    role: ViewRole,
    stage: GuideStage,
    framesPerPage: number,
  ): void => {
    for (let page = 0; page < guidePages(world); page++) {
      for (let f = 0; f < framesPerPage; f++) {
        stage.update(world, 1 / 60, role);
        drawWaveOpening(ctx as CanvasRenderingContext2D, l, world, {
          role,
          scene: stage,
          time: f / 60,
          fx: new OpeningFx(),
        });
      }
      guideStepHeard(world, 1, false);
      guideStepHeard(world, 2, false);
    }
  };

  it("draws a rehearsal, through every page of it, in every role", () => {
    // Every page and not a frame of one: a scene is a world being stepped, so
    // the values reaching the canvas change tick by tick — the muzzle flash,
    // the spark burst, the rebuild under two sets of `Effects` every time a
    // page repeats. One frame would prove almost nothing.
    expect(SCENED.length, "no wave carries a scene to draw").toBeGreaterThan(0);
    const { ctx } = stubCanvas();
    for (const role of ROLES) {
      const l = computeLayout({ width: 420, height: 860, dpr: 2 }, CFG, role);
      for (const i of SCENED) {
        const { guide } = opening(i);
        const stage = new GuideStage();
        walkPages(ctx, l, guide, role, stage, FRAMES_PER_PAGE);
        // The last page is the gate, which is not a rehearsal at all.
        expect(stage.active, `${WAVES[i]?.name} left its scene up on the gate`).toBe(false);
      }
    }
    // Every page of every film, on three screens, drawn frame by frame. The
    // default five seconds ran out at the ninth film and thirty at the
    // twenty-sixth; the walk is shorter now (`FRAMES_PER_PAGE`) and this is
    // the headroom for the rest of the arc. What it buys is the one check that
    // catches a value that is a perfectly good number and not a colour.
  }, 60_000);

  it("draws a rehearsal on a screen narrow enough that a word does not fit", () => {
    // A rehearsal is the whole stage, so there is no room left to run out of
    // — what a tiny screen tests instead is that every tile, lobe, caption and
    // button still comes out as a number a canvas accepts.
    const { ctx } = stubCanvas();
    const l = computeLayout({ width: 240, height: 480, dpr: 1 }, CFG, "p1");
    for (const i of SCENED) {
      const { guide } = opening(i);
      walkPages(ctx, l, guide, "p1", new GuideStage(), FRAMES_PER_PAGE);
    }
    // One screen rather than three, so it costs a third of the walk above.
  }, 30_000);

  it("puts a rehearsal away the moment the reader reaches the gate", () => {
    const stage = new GuideStage();
    const { guide } = opening(SCENED[0]!);
    stage.update(guide, 1 / 60, "p1");
    expect(stage.active).toBe(true);
    // The gate is the wave's own name over the field, not a page of film.
    for (let i = 0; i < guidePages(guide); i++) guideStepHeard(guide, 1, false);
    stage.update(guide, 1 / 60, "p1");
    expect(stage.active).toBe(false);
    // And both seats ready is the wave, with nothing left holding it.
    ackBriefing(guide, 1);
    ackBriefing(guide, 2);
    stage.update(guide, 1 / 60, "p1");
    expect(stage.active).toBe(false);
  });

  it("draws nothing at all once the field is playing", () => {
    const { ctx } = stubCanvas();
    const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");
    const world = createWorld(DEFAULT_CONFIG, 3);
    startWave(world, 0, []);
    const calls = ctx.calls;
    drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, { role: "p1" });
    expect(ctx.calls).toBe(calls);
  });
});
