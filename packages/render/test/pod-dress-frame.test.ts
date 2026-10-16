import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, type PodEntry, step, type TimedCommand, ticksPerBeat } from "@neon-spore/sim";
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
 * A pod's options, drawn (`pod-dress.ts`): a coloured pod's cage, a heavy
 * pod's bands — moored, falling and gripped in the mouth — and a swinging
 * pod's thread. Whether each *reads* is an eye's question; this holds that
 * every frame of them is a frame a real canvas accepts.
 */

beforeAll(installCanvasGlobals);

const PODS: PodEntry[] = [
  { beat: 0, col: 2, row: 3, kind: "pod", tint: "cyan" },
  { beat: 0, col: 5, row: 4, kind: "pod", heavy: true },
  { beat: 0, col: 8, row: 3, kind: "pod", swing: true },
];
const TPB = ticksPerBeat(CFG);
const INPUTS: TimedCommand[] = [
  { tick: 2, player: 1, command: { kind: "cannonCol", col: 5 } },
  { tick: TPB, player: 2, command: { kind: "fire", color: "red" } },
  ...[3, 4, 5, 6].map((b) => ({
    tick: TPB * b,
    player: 1 as const,
    command: { kind: "intake" as const },
  })),
];

function dressFrames(role: ViewRole, ticks: number) {
  const byTick = new Map(INPUTS.map((i) => [i.tick, [i]]));
  let gripped = 0;
  const out = runFrames(createWorld(CFG, 1, [], PODS), role, ticks, {
    onTick: (tick, w) => {
      step(w, byTick.get(tick) ?? []);
      gripped = Math.max(gripped, w.pods.filter((p) => p.gripTicks !== undefined).length);
    },
  });
  return { ...out, gripped };
}

describe("the pod options", () => {
  const played = remembered((role: ViewRole) => dressFrames(role, TPB * 7));

  for (const role of ROLES) {
    it(`draws a cage, bands, a grip and a thread for ${role}`, () => {
      expect(played(role).gripped).toBe(1);
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }
});
