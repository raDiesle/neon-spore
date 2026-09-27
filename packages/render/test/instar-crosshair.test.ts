import { afterEach, beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { CROSSHAIR_LOOK } from "../src/instar-crosshair.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";
import { acting, hung } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A shoot mark is a crosshair** — the owner, 27 September 2026
 * (`instar-crosshair.ts`). On every step of the shipped script, on all three
 * screens, one frame of the open window draws exactly one crosshair per
 * shoot mark still open, and none for any other gesture.
 */

beforeAll(installCanvasGlobals);
const paint = CROSSHAIR_LOOK.paint;
afterEach(() => {
  CROSSHAIR_LOOK.paint = paint;
});

/** How many crosshairs one frame of step `cursor` draws, with `done` marks already finished. */
function crosshairs(cursor: number, role: (typeof ROLES)[number], done: number[] = []): number {
  const world = hung();
  const s = acting(world, cursor);
  for (const i of done) s.doneBeat[i] = world.beat;
  let n = 0;
  CROSSHAIR_LOOK.paint = () => {
    n++;
  };
  runFrames(world, role, 1, { every: 1 });
  return n;
}

const shoots = (cursor: number): number[] =>
  (INSTAR_SCRIPT[cursor]?.marks ?? []).flatMap((m, i) => (m.gesture === "shoot" ? [i] : []));

describe("THE INSTAR's shoot mark", () => {
  it("is asked of the eye, the eggs, the heart and the tail", () => {
    const parts = new Set(
      INSTAR_SCRIPT.flatMap((s) => s.marks.filter((m) => m.gesture === "shoot").map((m) => m.part)),
    );
    expect([...parts].sort()).toEqual(["eggs", "eye", "heart", "tail"]);
  });

  INSTAR_SCRIPT.forEach((step, cursor) => {
    const gestures = [...new Set(step.marks.map((m) => m.gesture))].join(", ");
    it(`is a crosshair on step ${cursor} (${gestures}) once per shoot mark, on every screen`, () => {
      for (const role of ROLES) expect(crosshairs(cursor, role), role).toBe(shoots(cursor).length);
    });
  });

  it("gives its crosshair up once the mark is done", () => {
    const cursor = INSTAR_SCRIPT.findIndex((_, c) => shoots(c).length > 1);
    const [first] = shoots(cursor);
    if (first === undefined) throw new Error("no step shoots two marks");
    expect(crosshairs(cursor, "p1", [first])).toBe(shoots(cursor).length - 1);
  });
});
