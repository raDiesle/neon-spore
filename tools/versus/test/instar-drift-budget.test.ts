import { describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
} from "../../../packages/render/test/frame-harness.js";
import { acting, hung, TPB } from "../../../packages/render/test/instar-kit.js";
import { instarBoss } from "../../../packages/sim/src/index.js";
import { INSTAR_DRIFT_TURN } from "../candidates/instar-drift/turn/index.js";
import { apply, restore } from "../variant.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE INSTAR on the idle drift costs what the still body costs**, within a
 * tenth: the VERSUS candidate (`candidates/instar-drift/turn`) turns the body
 * on the canvas and draws the head through the rig at its turned yaw
 * (`instar-drift.ts`). Whole frames, side-on, one beat each, the worst of each
 * op, the candidate's against the shipped body's on the same world.
 *
 * **Fills and strokes are held as one count, draws**: the rig head fills where
 * the side head's plates stroke — measured on 1 October 2026, perch fills 303
 * → 345 and strokes 276 → 250, rise 305 → 347 and 268 → 242; blits 58 → 60 and
 * 42 → 44, the gradients a couple fewer. Set `MEASURE` to print both; never
 * committed as `true`.
 */
const MEASURE = false;
const SLACK = 1.1;
const OPS = ["drawImage", "createLinearGradient", "createRadialGradient"];
const draws = (m: Map<string, number>) => (m.get("fill") ?? 0) + (m.get("stroke") ?? 0);

installCanvasGlobals();

function worst(pose: string): Map<string, number> {
  const world = hung();
  const s = instarBoss(world);
  const cursor = s?.steps.findIndex((st) => st.pose === pose) ?? -1;
  if (cursor < 0) throw new Error(`no ${pose} step`);
  acting(world, cursor);
  const most = new Map<string, number>();
  runFrames(world, "p1", TPB, {
    viewport: { width: 390, height: 844, dpr: 3 },
    onDrawn: (ctx, frame) => {
      if (frame >= 2) for (const [k, v] of ctx.tally) most.set(k, Math.max(most.get(k) ?? 0, v));
      ctx.tally.clear();
    },
  });
  return most;
}

function rigged(pose: string): Map<string, number> {
  const applied = apply(INSTAR_DRIFT_TURN);
  try {
    return worst(pose);
  } finally {
    restore(applied);
  }
}

describe("THE INSTAR on the drift stays inside the still body's cost", () => {
  for (const pose of ["perch", "rise"]) {
    it(pose, () => {
      const was = worst(pose);
      const now = rigged(pose);
      if (MEASURE) {
        const ops = ["fill", "stroke", ...OPS];
        console.log(
          `  ${pose}`,
          ops.map((k) => `${k} ${was.get(k) ?? 0} → ${now.get(k) ?? 0}`),
        );
        return;
      }
      expect(draws(now), `${pose} draws`).toBeLessThanOrEqual(Math.ceil(draws(was) * SLACK));
      for (const k of OPS)
        expect(now.get(k) ?? 0, `${pose} ${k}`).toBeLessThanOrEqual(
          Math.ceil((was.get(k) ?? 0) * SLACK),
        );
    });
  }
  it("is not left measuring", () => expect(MEASURE).toBe(false));
});
