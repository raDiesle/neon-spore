import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  type SpawnEntry,
  step,
  type TimedCommand,
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
 * THE SEEDER, drawn: the living body with the pod it will leave glowing inside
 * it (`seeder.ts`), and then — one shot early — that pod hanging where it died,
 * drawn as any pod. A second, never shot, keeps the seed on the same frames as
 * the hung pod. Whether the seed *reads* as a pod is an eye's question; this
 * holds that every frame of it is a frame a real canvas accepts.
 */

beforeAll(installCanvasGlobals);

const QUEUE: SpawnEntry[] = [
  { beat: 0, col: 3, kind: "seeder", color: "red" },
  { beat: 0, col: 6, kind: "seeder", color: "cyan" },
];

const TPB = ticksPerBeat(CFG);

const INPUTS: TimedCommand[] = [
  { tick: 2, player: 1, command: { kind: "cannonCol", col: 3 } },
  { tick: TPB * 2 + 4, player: 2, command: { kind: "fire", color: "red" } },
];

function seederFrames(role: ViewRole, ticks: number) {
  const byTick = new Map(INPUTS.map((i) => [i.tick, [i]]));
  let hung = false;
  const out = runFrames(createWorld(CFG, 1, QUEUE), role, ticks, {
    onTick: (tick, w) => {
      step(w, byTick.get(tick) ?? []);
      if (w.pods.length > 0 && w.creatures.some((c) => c.kind === "seeder")) hung = true;
    },
  });
  return { ...out, hung };
}

describe("the seeder", () => {
  const played = remembered((role: ViewRole) => seederFrames(role, TPB * 10));

  for (const role of ROLES) {
    it(`draws a seeded body and a hung pod together for ${role}`, () => {
      expect(played(role).hung).toBe(true);
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }
});
