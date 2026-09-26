import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  hullRow,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { ShieldPushFx } from "../src/shield-push-fx.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The shield pushing a creature back up, drawn** (`shield-push-fx.ts`,
 * `last-chance.ts`).
 *
 * One slick down column three into a shield standing there with the trigger
 * held every beat: it is pushed once, climbs, and falls again carrying ONE
 * LAST CHANCE, on every seat. What is held is that every frame of that went
 * through a canvas that refuses what a real one refuses, that the push really
 * happened, and that the words really reached the canvas. Whether the red
 * reads as a mistake rather than as a shot colour is an eye's, and the lane's
 * report carries the picture.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const COL = 3;
const SLICK: SpawnEntry = { beat: 0, col: COL, kind: "slick", color: "red" };

function pushed(role: (typeof ROLES)[number]) {
  return runFrames(createWorld(CFG, 5, [SLICK]), role, TPB * (hullRow(CFG) + 6), {
    every: 3,
    onCanvas: (c) => {
      c.texts = [];
    },
    onTick: (tick, w) => {
      const cmds: TimedCommand[] = [];
      if (tick === 0) cmds.push({ tick, player: 2, command: { kind: "shieldCol", col: COL } });
      if (tick % TPB === 0) cmds.push({ tick, player: 1, command: { kind: "guard" } });
      step(w, cmds);
    },
  });
}

const pushes = (events: SimEvent[]) => events.filter((e) => e.type === "shieldPush").length;

describe("a creature pushed back up by the shield", () => {
  for (const role of ROLES) {
    it(`draws the push and ONE LAST CHANCE as ${role}`, () => {
      const { ctx, events } = pushed(role);
      expect(pushes(events)).toBe(1);
      expect(ctx.calls).toBeGreaterThan(1000);
      expect(ctx.texts?.some((t) => t.text === "ONE LAST CHANCE")).toBe(true);
    });
  }
});

describe("the red on the rim", () => {
  const push: SimEvent = { type: "shieldPush", id: 1, col: COL, row: 13, kind: "slick" };
  const l = computeLayout(VIEWPORT, CFG, "test");

  it("goes full on the push, fades, and a restart forgets it", () => {
    const fx = new ShieldPushFx();
    let sprayed = 0;
    fx.ingest([push], l, (_x, _y, n) => {
      sprayed += n;
    });
    expect(fx.wrong).toBe(1);
    expect(sprayed).toBeGreaterThan(0);
    fx.update(0.3);
    expect(fx.wrong).toBeGreaterThan(0);
    expect(fx.wrong).toBeLessThan(1);
    fx.clear();
    expect(fx.wrong).toBe(0);
  });
});
