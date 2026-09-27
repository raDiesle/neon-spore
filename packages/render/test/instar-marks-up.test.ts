import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  type InstarState,
  instarActing,
  instarBoss,
  instarStrikeBeat,
  NO_SLOW,
  slowing,
  step,
  type World,
} from "@neon-spore/sim";
import { drawInstarMarks } from "../src/instar-marks.js";
import { instarBody } from "../src/instar-sway.js";
import { computeLayout } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";
import { acting, hung, TPB } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A mark is up only while it can be answered** — the owner, 27 September
 * 2026: *the red circles for an upcoming action before slow should only be
 * visible when they are receiving actions already and when the slow
 * animation happens.*
 *
 * Every step of THE INSTAR's script is played by the simulation from the
 * first tick of its morph: through the morph, where a faint ring used to
 * glow up over the last of it; through the window, where THE SLOW is open;
 * to the strike, and on over the field frozen under the fail screen, where
 * the step is still `act` and the slow is shut. The marks are drawn on every
 * tick, and nothing may be drawn on one where the window or the slow is shut.
 * A second run lands each step halfway through its window and plays on into
 * the next step's window, the other way a window shuts.
 */

beforeAll(() => {
  installCanvasGlobals();
});

const L = computeLayout(VIEWPORT, CFG, "test");
const NO_VERDICT = { at: () => null };

/** How many ops the marks drew on this tick. */
function marksDrawn(world: World, s: InstarState, tick: number): number {
  const { ctx } = stubCanvas();
  const beatPhase = (tick % TPB) / TPB;
  const { sway } = instarBody(s, CFG, world, world.beat, beatPhase);
  const c = ctx as unknown as CanvasRenderingContext2D;
  drawInstarMarks(c, L, world, s, sway, world.beat, beatPhase, tick / 60, "p1", NO_VERDICT);
  let ops = 0;
  for (const n of ctx.tally.values()) ops += n;
  return ops;
}

/** The window, as the simulation counts it: acting, and not yet struck. */
function windowOpen(world: World, s: InstarState): boolean {
  return instarActing(s) && world.beat < instarStrikeBeat(s);
}

/** Step `cursor` put at the first tick of its morph, nothing slowed. */
function atMorph(cursor: number): { world: World; s: InstarState } {
  const world = hung();
  const s = acting(world, cursor);
  s.phase = "morph";
  s.phaseBeat = world.beat;
  world.slowFromBeat = NO_SLOW;
  world.slowToBeat = NO_SLOW;
  return { world, s };
}

/** Every tick of `ticks`, the marks drawn and judged; how many were up. */
function play(
  world: World,
  ticks: number,
  land?: (s: InstarState) => void,
): { up: number; wrong: string[] } {
  const wrong: string[] = [];
  let up = 0;
  for (let t = 0; t < ticks; t++) {
    step(world, []);
    const s = instarBoss(world);
    if (s === null) break;
    land?.(s);
    const open = windowOpen(world, s) && slowing(world);
    const ops = marksDrawn(world, s, world.tick);
    if (open && ops > 0) up++;
    if (!open && ops > 0)
      wrong.push(`step ${s.cursor} ${s.phase} beat ${world.beat} slow ${slowing(world)}`);
  }
  return { up, wrong };
}

const STEPS = instarBoss(hung())?.steps ?? [];

describe("THE INSTAR's marks are up only while the window and THE SLOW are open", () => {
  it("has a script to walk", () => {
    expect(STEPS.length).toBeGreaterThan(10);
  });

  it("draws none over a morph, and none on the field a strike froze, on any step", () => {
    for (let cursor = 0; cursor < STEPS.length; cursor++) {
      const step = STEPS[cursor];
      if (step === undefined) continue;
      const { world } = atMorph(cursor);
      // The morph, the window, and as long again after the strike.
      const beats = step.morphBeats + step.windowBeats * 2 + 2;
      const { up, wrong } = play(world, beats * TPB);
      expect(wrong, `step ${cursor}`).toEqual([]);
      expect(up, `step ${cursor}'s marks never came up`).toBeGreaterThan(0);
      expect(world.failTick, `step ${cursor} was never struck`).not.toBe(-1);
    }
  });

  it("draws none from a landing to the next window, on any step", () => {
    for (let cursor = 0; cursor + 1 < STEPS.length; cursor++) {
      const here = STEPS[cursor];
      const next = STEPS[cursor + 1];
      if (here === undefined || next === undefined) continue;
      const { world } = atMorph(cursor);
      // Landed halfway through the window, as `sim/instar-marks.ts`
      // `landStep` lands it: the slow shut on the same tick.
      const land = (s: InstarState): void => {
        if (!instarActing(s) || world.beat < s.phaseBeat + Math.floor(here.windowBeats / 2)) return;
        s.phase = "land";
        s.phaseBeat = world.beat;
        world.slowToBeat = world.beat;
      };
      let landed = false;
      const beats = here.morphBeats + here.windowBeats + here.landBeats + next.morphBeats + 2;
      const { up, wrong } = play(world, beats * TPB, (s) => {
        if (!landed && s.cursor === cursor) {
          land(s);
          landed = s.phase === "land";
        }
      });
      expect(landed, `step ${cursor} never landed`).toBe(true);
      expect(wrong, `step ${cursor}`).toEqual([]);
      // Its own window, and the next step's opening.
      expect(up, `step ${cursor}`).toBeGreaterThan(0);
      expect(instarBoss(world)?.cursor, `step ${cursor}`).toBe(cursor + 1);
    }
  });
});
