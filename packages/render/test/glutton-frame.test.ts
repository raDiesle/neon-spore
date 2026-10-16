import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  gluttonFed,
  type PodEntry,
  type SpawnEntry,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  remembered,
  runFrames,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GLUTTON, drawn: hungry, then fed — a size, a lobe and a pod inside it
 * for every meal (`glutton.ts`).
 *
 * Nobody shoots, so the glutton under the two pods eats both on its way down,
 * and the frames go from the hungry contour through one meal to two. A second
 * glutton, with nothing to eat, keeps the hungry draw on the same frames.
 * Whether the belly *reads* as two meals is an eye's question; this holds that
 * every frame of it is a frame a real canvas accepts.
 */

beforeAll(installCanvasGlobals);

const QUEUE: SpawnEntry[] = [
  { beat: 0, col: 3, kind: "glutton", color: "red" },
  { beat: 0, col: 8, kind: "glutton", color: "cyan" },
];
const PODS: PodEntry[] = [
  { beat: 0, col: 3, row: 2, kind: "pod" },
  { beat: 0, col: 4, row: 4, kind: "pod" },
];

const TPB = ticksPerBeat(CFG);

function gluttonFrames(role: ViewRole, ticks: number) {
  let mostFed = 0;
  const out = runFrames(createWorld(CFG, 1, QUEUE, PODS), role, ticks, {
    onTick: (_tick, w) => {
      step(w, []);
      for (const c of w.creatures)
        if (c.kind === "glutton") mostFed = Math.max(mostFed, gluttonFed(c));
    },
  });
  return { ...out, mostFed };
}

describe("the glutton", () => {
  const played = remembered((role: ViewRole) => gluttonFrames(role, TPB * 12));

  for (const role of ROLES) {
    it(`draws a hungry one and one fed twice for ${role}`, () => {
      expect(played(role).mostFed).toBe(2);
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }
});
