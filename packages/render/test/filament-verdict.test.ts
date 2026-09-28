import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type FilamentState, NO_GRAB, type SimEvent, type World } from "@neon-spore/sim";
import { FilamentMarks } from "../src/filament-marks.js";
import { drawFilamentOwn } from "../src/filament-turn-draw.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { count, hung, TPB, tracing } from "./filament-states.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE FILAMENT's two thumbs answer a touch the way THE INSTAR's marks do**
 * (`filament-marks.ts`, `.claude/skills/new-boss` §5): a ring whose move is
 * open and has no thumb on it wears the halo, a ring that must wait or has a
 * thumb on it does not; each of the line's words lands on the thumb whose
 * mistake it names; and the verdict reaches the field's frame on both
 * screens, which both draw both rings. The partner's waiting clock is
 * `filament-frame.test.ts`'.
 */

beforeAll(installCanvasGlobals);

const HALO = "createRadialGradient";

function own(world: World, s: FilamentState, seat: 1 | 2): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  const l = computeLayout(VIEWPORT, CFG, seat === 1 ? "p1" : "p2");
  drawFilamentOwn(ctx as unknown as CanvasRenderingContext2D, l, CFG, s, seat, world.beat, 1.2);
  return log.join("|");
}

describe("THE FILAMENT's rings asking", () => {
  it("halo a ring whose move is open and has no thumb on it", () => {
    const world = hung();
    const s = tracing(world, 3, 1);
    expect(count(own(world, s, 1), HALO)).toBe(0);
    expect(count(own(world, s, 2), HALO)).toBe(0);
    s.grab = [NO_GRAB, NO_GRAB];
    expect(count(own(world, s, 1), HALO)).toBe(1);
    expect(count(own(world, s, 2), HALO)).toBe(1);
  });

  it("ask nothing of a thumb that must wait", () => {
    const world = hung();
    // The next lit tile is his, so hers waits; and a tile already lit this beat makes his wait.
    const s = tracing(world, 2, 1);
    s.grab = [NO_GRAB, NO_GRAB];
    expect(count(own(world, s, 2), HALO)).toBe(0);
    s.headBeat = world.beat;
    expect(count(own(world, s, 1), HALO)).toBe(0);
  });
});

describe("THE FILAMENT's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const marks = new FilamentMarks();
    marks.ingest(said);
    return [marks.verdicts.at(1)?.good ?? null, marks.verdicts.at(2)?.good ?? null];
  };

  it("lands each of the line's words on the thumb whose mistake it names", () => {
    expect(on([{ type: "filamentDrawn", col: 3, row: 2 }])).toEqual([true, null]);
    expect(on([{ type: "filamentFollowed", col: 3, row: 2 }])).toEqual([null, true]);
    expect(on([{ type: "filamentSnap", col: 3 }])).toEqual([false, null]);
    expect(on([{ type: "filamentRecoil", col: 3 }])).toEqual([null, false]);
    expect(on([{ type: "filamentDark", col: 3 }])).toEqual([false, false]);
    expect(on([{ type: "filamentLate", seat: 2, col: 3 }])).toEqual([null, false]);
  });

  it("forgets on reset", () => {
    const marks = new FilamentMarks();
    marks.ingest([{ type: "filamentDark", col: 3 }]);
    marks.clear();
    expect(marks.verdicts.at(1)).toBeNull();
  });

  /** A beat of the line held mid-trace, `said` on tick 2. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const world = hung();
    tracing(world, 3, 1);
    const log: string[] = [];
    runFrames(world, role, TPB, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        w.events.length = 0;
        if (tick === 2) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(["p1", "p2", "test"] as const)("reaches the field's frame, on %s", (role) => {
    const snap: SimEvent[] = [{ type: "filamentSnap", col: 3 }];
    expect(count(frames(role, snap), PALETTE.red)).toBeGreaterThan(
      count(frames(role, []), PALETTE.red),
    );
  });
});
