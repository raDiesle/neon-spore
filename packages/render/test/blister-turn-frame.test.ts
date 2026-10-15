import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  BEARING_TURN,
  type BlisterBy,
  type BlisterTurnWay,
  blisterIsUp,
  blisterMayTap,
  createWorld,
  NO_BEARING,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { bodyOnTileOf } from "../src/blister-bodies.js";
import type { Body } from "../src/creature-body-in.js";
import type { ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  remembered,
  runFrames,
  thirdOf,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE BLISTER's TURN, drawn (`blister-turn-help.ts`): on every screen, THE
 * MAZE's channel, lever and knob round WHEEL or SNAIL (`drawTurnBody`), the
 * channel filling as a thumb goes round it each way.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

const turned = (col: number, by: BlisterBy, way: BlisterTurnWay): SpawnEntry => ({
  beat: 0,
  col,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count: 3,
  gesture: "turn",
  way,
});

/** Every blister turned its way by the hand its `by` names, an eighth a tick. */
function turnFrames(role: ViewRole, ticks: number, sampling: { every?: number; phase?: number }) {
  const queue = [turned(2, 1, "ccw"), turned(5, 2, "cw"), turned(8, "both", "cw")];
  const pressed = new Set<number>();
  const { ctx, events } = runFrames(createWorld(CFG, 3, queue), role, ticks, {
    ...sampling,
    onTick: (tick, w) => {
      const inputs: TimedCommand[] = [];
      for (const c of w.creatures) {
        if (!blisterIsUp(c)) continue;
        const player = blisterMayTap(c, 1) ? 1 : 2;
        const sign = c.blisterWay === "ccw" ? -1 : 1;
        const at = pressed.has(c.id)
          ? ((((sign * tick * BEARING_TURN) / 8) % BEARING_TURN) + BEARING_TURN) % BEARING_TURN
          : NO_BEARING;
        pressed.add(c.id);
        inputs.push({
          tick: w.tick,
          player,
          command: { kind: "drag", target: "blisterTurn", id: c.id, on: true, fromMilli: at },
        });
      }
      step(w, inputs);
    },
  });
  return { ctx, blows: events.filter((e) => e.type === "blisterBlow").length };
}

describe("the TURN blister", () => {
  const played = remembered((role) => turnFrames(role, TPB * 10, thirdOf(4, ROLES.indexOf(role))));

  for (const role of ROLES) {
    it(`draws the channel, the lever and the knob round it for ${role}`, () => {
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really turned blows out of them", () => {
    expect(played("test").blows).toBeGreaterThan(0);
  });
});

describe("the TURN blister's body", () => {
  it("is WHEEL on some tiles and SNAIL on others, the same every time it is asked", () => {
    const at = (i: number) => ({ c: { id: 7, col: i % 6, row: 3 + (i % 3) } }) as unknown as Body;
    const picks = Array.from({ length: 12 }, (_, i) => bodyOnTileOf(at(i)));
    expect(new Set(picks)).toEqual(new Set([0, 1]));
    expect(picks).toEqual(Array.from({ length: 12 }, (_, i) => bodyOnTileOf(at(i))));
  });
});
