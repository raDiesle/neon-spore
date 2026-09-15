import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  type CreatureKind,
  createWorld,
  type SpawnEntry,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Each of the five bodies a shot cannot break, drawn taking one.**
 *
 * The owner's rule of 14 September 2026 gave every one of them a mark where
 * there used to be nothing at all — a bolt walked through THE GUM, THE LIMPET,
 * THE LEECH, THE WEIGHT and THE CAIRN to whatever was above (`shot-reach.ts`).
 * Four of them now turn the bolt away with the magnet plate's own ricochet and
 * the pile takes a crater, and the body greys for a moment under either
 * (`effects-ingest.ts`).
 *
 * Nothing here can answer whether a ricochet off a gum *reads* as a bolt
 * turned away rather than as a miss — that needs an eye, and one is in the
 * lane's own report. What it holds is that every one of the five has been
 * through a canvas that refuses what a real one refuses, on all three seats,
 * with the refusal actually happening: a run that quietly never fired would
 * draw nothing and pass.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const COL = 3;

/** One body, and a bolt fired up its column once it is well into the field. */
function refused(kind: CreatureKind, role: ViewRole) {
  const queue: SpawnEntry[] = [{ beat: 0, col: COL, kind, color: null }];
  const { ctx, events } = runFrames(createWorld(CFG, 5, queue), role, TPB * 7, {
    every: 2,
    onTick: (tick, w) => {
      // The cannon under it first, then one bolt: a shot fired before the
      // strip has arrived goes up an empty column and proves nothing.
      if (tick === 1) {
        step(w, [{ tick, player: 1, command: { kind: "cannonCol", col: COL } }]);
        return;
      }
      if (tick === TPB * 3) {
        step(w, [{ tick, player: 2, command: { kind: "fire", color: "red" } }]);
        return;
      }
      step(w, []);
    },
  });
  const refusals = events.filter((e) => e.type === "bounce" || e.type === "hole").length;
  return { ctx, refusals };
}

describe("a bolt spent on a body that cannot be broken", () => {
  for (const kind of ["gum", "limpet", "leech", "weight"] as const) {
    for (const role of ROLES) {
      it(`draws ${kind.toUpperCase()} turning one away as ${role}`, () => {
        const { ctx, refusals } = refused(kind, role);
        expect(ctx.calls).toBeGreaterThan(0);
        // The run reached the state its frames are supposed to prove.
        expect(refusals).toBeGreaterThan(0);
      });
    }
  }

  // THE CAIRN is a boss and arrives through `buildBoss` rather than a wave
  // entry, so its own frames live beside the rest of it in
  // `cairn-frame.test.ts`; what it does with a bolt is a crater, which is the
  // branch every rock in the game already takes (`bullet-refused.ts`) and
  // `cairn.test.ts` holds as a rule.
});
