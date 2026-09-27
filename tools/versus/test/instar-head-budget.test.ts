import { describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
} from "../../../packages/render/test/frame-harness.js";
import { acting, hung, TPB } from "../../../packages/render/test/instar-kit.js";
import { instarBoss } from "../../../packages/sim/src/index.js";
import { INSTAR_HEAD_RIG } from "../candidates/instar-head/rig/index.js";
import { apply, restore } from "../variant.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE INSTAR's rig head costs what the shipped head costs**, near enough:
 * the VERSUS candidate (`candidates/instar-head/rig`) patches `INSTAR_HEAD`, and a candidate that won a vote and then put the body over
 * its frame budget would have been offered on a difference nobody could
 * afford. Whole frames, face-on and side-on, one beat each, the worst of each
 * op, the candidate's against the shipped head's on the same world.
 *
 * `SLACK` is what the rig may cost over the shipped frame. **Fills and
 * strokes are held as one count, draws**: the rig lays a tube as filled
 * slices and rims it once, where the plates stroke every scale — measured on
 * 27 September 2026, face-on fills 311 → 370 and strokes 255 → 165, side-on
 * 303 → 345 and 276 → 250 — so a fill-only ceiling would refuse a head that
 * draws less. The gradients and the blits are held one by one. Set `MEASURE`
 * to print both; never committed as `true`.
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
  const applied = apply(INSTAR_HEAD_RIG);
  try {
    return worst(pose);
  } finally {
    restore(applied);
  }
}

describe("THE INSTAR's rig head stays inside the shipped head's cost", () => {
  for (const pose of ["crouch", "perch"]) {
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
