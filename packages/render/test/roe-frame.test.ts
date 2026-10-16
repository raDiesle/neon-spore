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
 * THE ROE, drawn: the thread down a column through its hanging pods, and then
 * none once one shot has freed the string (`roe-thread.ts`).
 *
 * The string hangs for two beats with its thread, the shot frees all three,
 * and the run goes on while they fall. Whether the thread *reads* as a string
 * is an eye's question; this holds that every frame of it is a frame a real
 * canvas accepts.
 */

beforeAll(installCanvasGlobals);

const roe = (row: number): PodEntry => ({ beat: 0, col: 5, row, kind: "pod", roe: true });
const PODS: PodEntry[] = [roe(1), roe(4), roe(7)];
const TPB = ticksPerBeat(CFG);
const INPUTS: TimedCommand[] = [
  { tick: 2, player: 1, command: { kind: "cannonCol", col: 5 } },
  { tick: TPB * 2, player: 2, command: { kind: "fire", color: "red" } },
];

function roeFrames(role: ViewRole, ticks: number) {
  const byTick = new Map(INPUTS.map((i) => [i.tick, [i]]));
  let strung = 0;
  let loose = 0;
  const out = runFrames(createWorld(CFG, 1, [], PODS), role, ticks, {
    onTick: (tick, w) => {
      step(w, byTick.get(tick) ?? []);
      strung = Math.max(strung, w.pods.filter((p) => p.roe && !p.loose).length);
      loose = Math.max(loose, w.pods.filter((p) => p.roe && p.loose).length);
    },
  });
  return { ...out, strung, loose };
}

describe("the roe", () => {
  const played = remembered((role: ViewRole) => roeFrames(role, TPB * 5));

  for (const role of ROLES) {
    it(`draws a strung roe and a freed one for ${role}`, () => {
      expect(played(role).strung).toBe(3);
      expect(played(role).loose).toBe(3);
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }
});
