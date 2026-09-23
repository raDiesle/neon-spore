import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVES, waveGuideSteps } from "@neon-spore/content";
import {
  ackBriefing,
  createWorld,
  DEFAULT_CONFIG,
  failWave,
  guidePages,
  guideStepHeard,
  lostAsks,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { HANG_MS } from "../../../tools/test/cpu-time.js";
import { drawWaveOpening } from "../src/briefing.js";
import { GuideStage } from "../src/guide-scene.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { lostButtons, lostHit } from "../src/lost-screen.js";
import { OpeningFx } from "../src/opening-fx.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **What one walk through every rehearsal is allowed to take** — the ceiling in
 * `tools/test/cpu-time.ts`, flat, and deliberately not a number scaled off the
 * load.
 *
 * It was `60_000` written beside each of the four cases, which *overrode* this
 * file's own machine-scaled default (`canvas-stub.ts`) with a smaller number —
 * and on 18 September 2026 two landings of one green tree went red here, the
 * second at 134 s under sixteen shards. `tools/check/slots.ts` has since put a
 * ceiling on how many shards a machine runs at once, which is the cure for the
 * load itself; this is the part that was wrong in the test. The scaled default
 * would not have saved those two landings either: `CORE_LOAD` is read when the
 * process starts, and shards launched together see the minute before they
 * existed, so the moment that costs a landing is the one moment the load
 * average calls quiet.
 *
 * So this walk asks for the hang ceiling instead. Nothing here measures speed —
 * it draws every page of every film to catch a value that is a perfectly good
 * number and not a colour — so the budget is only ever spent when something is
 * genuinely stuck, and three minutes is how long a stuck shard should take to
 * say so.
 */
const WALK_MS = HANG_MS;

/**
 * Every wave's opening, in both states and every role, through the strict
 * canvas — the same rule as `frame.test.ts`, because the introduction is the
 * first thing a new pair ever sees and a colour the browser cannot parse there
 * is a game that never starts.
 *
 * The prose itself — two halves that differ, each short enough for a phone,
 * a name that fits — is `content/test/guides.test.ts`'s, beside the words, so
 * a lane that edits only the words meets it in `check:fast`.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const GUIDED = WAVES.map((w, i) => (w.guide ? i : -1)).filter((i) => i >= 0);
const SCENED = WAVES.map((w, i) => (w.guide?.scene ? i : -1)).filter((i) => i >= 0);

beforeAll(installCanvasGlobals);

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
   * Ticks stepped per page. A hundred and forty of them crosses the shortest
   * page a film may have and most of the longest — which is what this test is
   * for. It was 260, chosen when there was one film to walk; there are
   * fifty-one now, so it was cut rather than the timeout raised a third time.
   */
  const TICKS_PER_PAGE = 140;

  /**
   * Ticks per frame drawn. Every tick is stepped; one in four is drawn.
   *
   * The stepping is nothing — 250 pages of it cost under half a second — and
   * the drawing is everything: at a frame per tick the four walks below were
   * ninety seconds, thirty percent of the whole suite, and the profile that
   * found it (`bun run test:profile`) is in `docs/performance.md`. The four
   * walks each take a different tick of the four (`phase`), so across the
   * file every tick of every page is still drawn exactly once — the same
   * coverage of the film's clock as before, at a quarter of the frames — and
   * every walk draws a page's first tick regardless, because a fresh page at
   * age zero is the frame most likely to divide by it.
   */
  const DRAW_EVERY = 4;

  const walkPages = (
    ctx: unknown,
    l: ReturnType<typeof computeLayout>,
    world: World,
    role: ViewRole,
    stage: GuideStage,
    phase: number,
  ): void => {
    for (let page = 0; page < guidePages(world); page++) {
      for (let f = 0; f < TICKS_PER_PAGE; f++) {
        stage.update(world, 1 / 60, role);
        if (f !== 0 && f % DRAW_EVERY !== phase) continue;
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

  it("has a scene to draw at all", () => {
    expect(SCENED.length, "no wave carries a scene to draw").toBeGreaterThan(0);
  });

  /**
   * **One case per role, rather than one case walking all three.**
   *
   * Every page of every film, drawn frame by frame, is the one check that
   * catches a value that is a perfectly good number and not a colour — and it
   * is the most expensive thing in this package. The budget on it has been
   * raised twice already (five seconds ran out at the ninth film, thirty at
   * the twenty-sixth), `TICKS_PER_PAGE` cut once to avoid a third raise, and
   * the frames thinned to one tick in four when the four walks were found to
   * be ninety seconds of the suite.
   *
   * The role is the axis to split on rather than the axis to shorten: the
   * three walks share nothing — a fresh `GuideStage`, a fresh layout, a fresh
   * `Effects` per page — so three cases draw exactly what one did and each
   * gets its own `WALK_MS`. What was failing is a *timeout* and never an
   * assertion: on a busy machine the whole run overshot, and a test that only
   * passes on an idle box is a test somebody re-runs on its own and stops
   * reading. Nothing here is measuring speed, so the budget is a guard rather
   * than a claim.
   */
  for (const [phase, role] of ROLES.entries()) {
    it(
      `draws a rehearsal, through every page of it, for ${role}`,
      () => {
        // Every page and not a frame of one: a scene is a world being stepped,
        // so the values reaching the canvas change tick by tick — the muzzle
        // flash, the spark burst, the rebuild under two sets of `Effects` every
        // time a page repeats. One frame would prove almost nothing.
        const { ctx } = stubCanvas();
        const l = computeLayout({ width: 420, height: 860, dpr: 2 }, CFG, role);
        for (const i of SCENED) {
          const { guide } = opening(i);
          const stage = new GuideStage();
          walkPages(ctx, l, guide, role, stage, phase);
          // The last page is the gate, which is not a rehearsal at all.
          expect(stage.active, `${WAVES[i]?.name} left its scene up on the gate`).toBe(false);
        }
      },
      WALK_MS,
    );
  }

  it(
    "draws a rehearsal on a screen narrow enough that a word does not fit",
    () => {
      // A rehearsal is the whole stage, so there is no room left to run out of
      // — what a tiny screen tests instead is that every tile, lobe, caption and
      // button still comes out as a number a canvas accepts.
      const { ctx } = stubCanvas();
      const l = computeLayout({ width: 240, height: 480, dpr: 1 }, CFG, "p1");
      // The fourth tick of every four: the three walks above take the other
      // three, so this is the one that completes the film's clock.
      for (const i of SCENED) {
        const { guide } = opening(i);
        walkPages(ctx, l, guide, "p1", new GuideStage(), ROLES.length);
      }
      // One screen, so it costs what one of the three walks above costs — and
      // it gets the same budget, for the same reason.
    },
    WALK_MS,
  );

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

  it("draws the lost screen over a held field, falling in and settled, and knows its buttons", () => {
    const { ctx } = stubCanvas();
    for (const [w, h] of [
      [900, 1600],
      [240, 480],
    ] as const) {
      const l = computeLayout({ width: w, height: h, dpr: 2 }, CFG, "p1");
      const world = createWorld(DEFAULT_CONFIG, 3);
      startWave(world, 0, []);
      failWave(world);
      for (let i = 0; i <= DEFAULT_CONFIG.waveFailBeats * ticksPerBeat(DEFAULT_CONFIG); i++) {
        step(world, []);
      }
      expect(lostAsks(world)).toBe(true);
      const fx = new OpeningFx();
      for (const age of [0.05, 0.4, 0.9, 4]) {
        fx.update(age, `${world.wave}|lost|${world.retries}`);
        const b = lostButtons(l);
        const pointer = { x: b.retry.x + b.retry.w / 2, y: b.retry.y + b.retry.h / 2 };
        drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, {
          role: "p1",
          fx,
          pointer,
        });
        expect(lostHit(l, pointer.x, pointer.y)).toBe("retry");
        expect(lostHit(l, b.quit.x + 2, b.quit.y + 2)).toBe("quit");
        expect(lostHit(l, 1, 1)).toBeNull();
      }
      // And with no clock at all: a still of the screen is a settled one.
      drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, { role: "p2" });
    }
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
