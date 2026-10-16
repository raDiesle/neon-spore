import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  morselIsLimp,
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
 * THE MORSEL, drawn: whole, then limp — the amber, the slump and the cargo's
 * mark (`morsel.ts`).
 *
 * The whole body is the ordinary living draw and has been through a canvas a
 * thousand times; the limp one is new, so one is shot early and the run goes on
 * long enough for it to fall limp most of the way down. A second, never shot,
 * keeps the whole draw on the same frames. Whether the slump *reads* as a body
 * gone slack is an eye's question; this holds that every frame of it is a
 * frame a real canvas accepts.
 */

beforeAll(installCanvasGlobals);

const QUEUE: SpawnEntry[] = [
  { beat: 0, col: 3, kind: "morsel", color: "red" },
  { beat: 0, col: 6, kind: "morsel", color: "cyan" },
];

const TPB = ticksPerBeat(CFG);

const INPUTS: TimedCommand[] = [
  { tick: 2, player: 1, command: { kind: "cannonCol", col: 3 } },
  { tick: TPB * 2 + 4, player: 2, command: { kind: "fire", color: "red" } },
];

function morselFrames(role: ViewRole, ticks: number) {
  const byTick = new Map(INPUTS.map((i) => [i.tick, [i]]));
  let limpSeen = false;
  const out = runFrames(createWorld(CFG, 1, QUEUE), role, ticks, {
    onTick: (tick, w) => {
      step(w, byTick.get(tick) ?? []);
      if (w.creatures.some((c) => c.kind === "morsel" && morselIsLimp(c))) limpSeen = true;
    },
  });
  return { ...out, limpSeen };
}

describe("the morsel", () => {
  const played = remembered((role: ViewRole) => morselFrames(role, TPB * 10));

  for (const role of ROLES) {
    it(`draws a whole one and a limp one for ${role}`, () => {
      expect(played(role).limpSeen).toBe(true);
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }
});
