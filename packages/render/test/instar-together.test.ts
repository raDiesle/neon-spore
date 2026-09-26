import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  type BossSequenceStep,
  instarBoss,
  instarHeld,
  NOT_DONE,
  type World,
} from "@neon-spore/sim";
import { instarAwaited, instarTogetherLeft } from "../src/instar-together.js";
import type { TextBox } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";
import { acting, hung } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A mark answered alone is on a clock**, and until 20 September 2026 the
 * picture never said so: the dot sat there, the partner took a beat too long,
 * and both went back to nought with a sound and no reason
 * (`sim/instar-step.ts`, `slipLonely`).
 *
 * What is pinned here is the reading — how much of the together window is
 * left, and for which marks it is a question at all — and that the waiting
 * reaches the canvas: a step with one mark answered does not draw the same
 * frame as the same step with none, on every screen, because the seat that
 * most needs to see it is the one whose own mark is still open.
 *
 * **It is a question for a count and not for a pull.** A pull and a hold are
 * a place a thumb keeps, and letting go is what undoes them, so they never
 * slip for being early (`sim/instar.ts`, `instarHeld`). The step this reads
 * is therefore the first one whose marks are counted — the poses the owner
 * was on when he asked, as it happens: the hand and the eggs, the hand and
 * the tongue.
 */

beforeAll(installCanvasGlobals);

describe("the together window, read", () => {
  it("runs from whole to nothing over the beats a partner is given", () => {
    const world = hung();
    const s = acting(world, counted(world));
    s.doneBeat[0] = world.beat;
    const span = CFG.instarTogetherBeats + 1;
    expect(instarTogetherLeft(s, CFG, 0, world.beat, 0)).toBe(1);
    expect(instarTogetherLeft(s, CFG, 0, world.beat + span, 0)).toBe(0);
    const middle = instarTogetherLeft(s, CFG, 0, world.beat + 1, 0);
    expect(middle).toBeGreaterThan(0);
    expect(middle).toBeLessThan(1);
  });

  it("is no question for a mark nobody has answered", () => {
    const world = hung();
    const s = acting(world, counted(world));
    expect(instarTogetherLeft(s, CFG, 0, world.beat, 0)).toBeNull();
    expect(instarAwaited(s, CFG, world.beat, 0)).toBe(false);
  });

  it("is no question for a step with one mark, which has nobody to be late", () => {
    const world = hung();
    // One mark, the navigator's, and no partner to wait for. The shipped
    // script has no such step since 25 September 2026, so the test gives it one.
    const s = acting(world, 0);
    s.steps[0] = { ...(s.steps[0] ?? SOLO), marks: SOLO.marks };
    s.progress = [0];
    s.doneBeat = [NOT_DONE];
    s.doneBeat[0] = world.beat;
    expect(instarTogetherLeft(s, CFG, 0, world.beat, 0)).toBeNull();
  });

  it("is no question for a pull, which slips by being let go of and not by being early", () => {
    const world = hung();
    const s = acting(world, 0);
    const first = s.steps[0]?.marks[0];
    expect(first !== undefined && instarHeld(first.gesture)).toBe(true);
    s.doneBeat[0] = world.beat;
    expect(instarTogetherLeft(s, CFG, 0, world.beat, 0)).toBeNull();
  });

  it("says the step is waiting the moment one of its marks lands", () => {
    const world = hung();
    const s = acting(world, counted(world));
    s.doneBeat[1] = world.beat;
    expect(instarAwaited(s, CFG, world.beat, 0)).toBe(true);
  });
});

/** The first step whose two marks are counts — the only kind that slips for
 * being answered too early (`instarHeld`). */
function counted(world: World): number {
  const s = instarBoss(world);
  const i =
    s?.steps.findIndex(
      (st) => st.marks.length >= 2 && st.marks.every((m) => !instarHeld(m.gesture)),
    ) ?? -1;
  if (i < 0) throw new Error("the script has no step of two counted marks");
  return i;
}

/** A step of one tap, the navigator's. */
const SOLO: BossSequenceStep = {
  pose: "lash",
  arrive: "cross",
  morphBeats: 2,
  windowBeats: 8,
  landBeats: 2,
  marks: [{ seat: "p2", part: "tail", gesture: "tap", xMilli: 620, yMilli: 560, need: 4 }],
};

describe("the together window, drawn", () => {
  it.each(ROLES)("a mark waiting says so, in a word, on %s", (role) => {
    const words = (arrange: (w: World) => void): string[] => {
      const world = hung();
      arrange(world);
      const texts: TextBox[] = [];
      runFrames(world, role, 9, {
        every: 3,
        onCanvas: (c) => {
          c.texts = texts;
        },
      });
      return texts.map((t) => t.text);
    };
    const open = words((w) => {
      acting(w, counted(w));
    });
    const waiting = words((w) => {
      const at = counted(w);
      const s = acting(w, at);
      s.progress[0] = s.steps[at]?.marks[0]?.need ?? 1;
      s.doneBeat[0] = w.beat;
    });
    // On both screens: the seat that has to read it is the one whose own
    // mark is still open, and the dot is drawn the same on either.
    expect(waiting).toContain("WAITING");
    expect(open).not.toContain("WAITING");
  });
});
