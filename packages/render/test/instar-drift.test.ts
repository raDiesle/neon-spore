import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { FRONT, INSTAR_SCRIPT, SIDE } from "@neon-spore/content";
import { beatSeconds, type World } from "@neon-spore/sim";
import { bakedEntries, clearBakedCaches } from "../src/baked.js";
import { DEG, idleDrift } from "../src/idle-drift.js";
import { headTurn, INSTAR_DRIFT } from "../src/instar-drift.js";
import { instarMarkUnder } from "../src/instar-mark-grip.js";
import { instarMarkPoint } from "../src/instar-place.js";
import { instarThreat } from "../src/instar-shape.js";
import { instarSway } from "../src/instar-sway.js";
import { computeLayout } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";
import { acting, asking, field, hung } from "./instar-kit.js";

/**
 * **THE INSTAR turns on the idle drift, and a thumb still finds what it sees**
 * (`instar-drift.ts`, `docs/spec/living-bosses.md` §1). The drift is the
 * VERSUS candidate's (`tools/versus/candidates/instar-drift/turn`), so every
 * test here turns it on and puts it back.
 *
 * The marks are pressed at the beat of ten minutes where the body's yaw is
 * widest, with THE SLOW shut — the drift at its full — and open, where it is
 * hushed to a tenth. *Every part at its widest too* is `instar-parts.test.ts`'s:
 * there the head and the tail are cocked on the body as well, and a mark on
 * them rides its part.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout(VIEWPORT, CFG, "test");
/** Ten minutes of the drift, in beats. */
const SPAN = 600 / beatSeconds(CFG);

/** The drift as the candidate offers it: on, reached wide, shaking. */
function drifting<T>(run: () => T): T {
  const was = { ...INSTAR_DRIFT };
  Object.assign(INSTAR_DRIFT, { amount: 1, reach: 1.75, shake: 1 });
  try {
    return run();
  } finally {
    Object.assign(INSTAR_DRIFT, was);
  }
}

/** The beat, and the part of it, where the body's yaw is widest over ten minutes. */
function widest(): { beat: number; phase: number; yaw: number } {
  let best = { beat: 0, phase: 0, yaw: 0 };
  for (let b = 0; b < SPAN; b += 0.05) {
    const yaw = Math.abs(idleDrift(b * beatSeconds(CFG), 163, 1).yaw);
    if (yaw > best.yaw) best = { beat: Math.floor(b), phase: b - Math.floor(b), yaw };
  }
  return best;
}

/** The world stood at `beat`, so the step `acting` puts up starts there. */
function at(beat: number): World {
  const world = hung();
  world.beat = Math.max(world.beat, beat);
  return world;
}

describe("a thumb finds a mark where the drift carried it", () => {
  const w = widest();

  it("turns the body near its whole swing in ten minutes", () => {
    expect(w.yaw).toBeGreaterThan(4 * DEG);
  });

  for (const [name, put] of [
    ["the slow shut", acting],
    ["the slow open", asking],
  ] as const) {
    it(`presses every mark of every step at the widest yaw, ${name}`, () =>
      drifting(() => {
        let moved = 0;
        for (let cursor = 0; cursor < INSTAR_SCRIPT.length; cursor++) {
          const world = at(w.beat);
          const s = put(world, cursor);
          const sway = instarSway(s, CFG, world, world.beat, w.phase);
          const along = instarThreat(s, world.beat, w.phase);
          (s.steps[cursor]?.marks ?? []).forEach((mark, id) => {
            const p = instarMarkPoint(L, mark, sway, along);
            const still = instarMarkPoint(L, mark, { ...sway, drift: undefined }, along);
            moved = Math.max(moved, Math.hypot(p.x - still.x, p.y - still.y) / L.tile);
            const t = instarMarkUnder(L, p.x, p.y, field(world, world.beat, w.phase));
            const pressed = t?.command ?? null;
            expect(
              pressed !== null && "id" in pressed ? pressed.id : null,
              `step ${cursor} mark ${id}`,
            ).toBe(id);
          });
        }
        // The drift moved a mark far enough to miss it if the hit test ignored it.
        if (put === acting) expect(moved).toBeGreaterThan(0.3);
      }));
  }
});

/** The first step the body acts side-on, where the profile is drawn and the drift is whole. */
function sideOn(): number {
  for (let cursor = 0; cursor < INSTAR_SCRIPT.length; cursor++) {
    const world = at(0);
    const s = acting(world, cursor);
    const d = drifting(() => instarSway(s, CFG, world, world.beat + 2, 0).drift);
    if (d !== undefined && d.headYaw !== 0) return cursor;
  }
  throw new Error("no step of the script is acted side-on");
}

describe("a face looks at the players", () => {
  it("is turned between the profile and face-on at every tenth of a second of ten minutes", () =>
    drifting(() => {
      const world = at(0);
      const s = acting(world, sideOn());
      const dt = 0.1 / beatSeconds(CFG);
      let widestTurn = 0;
      for (let b = world.beat; b < world.beat + SPAN; b += dt) {
        const beat = Math.floor(b);
        const d = instarSway(s, CFG, world, beat, b - beat).drift;
        if (d === undefined) throw new Error("the drift is on and answered nothing");
        const turn = headTurn(d);
        expect(turn).toBeGreaterThanOrEqual(SIDE);
        expect(turn).toBeLessThanOrEqual(FRONT);
        widestTurn = Math.max(widestTurn, turn - SIDE);
      }
      // And it does turn: a head that only ever looked one way would pass the bounds.
      expect(widestTurn).toBeGreaterThan(10 * DEG);
    }));
});

describe("what the renderer keeps with the drift running", () => {
  const held = (): number => {
    installCanvasGlobals();
    clearBakedCaches();
    runFrames(hung(), "p1", 1600);
    return bakedEntries();
  };

  it("bakes no more on THE INSTAR's wave than it does with the body still", () => {
    const still = held();
    const turning = drifting(held);
    expect(turning).toBe(still);
  });
});
