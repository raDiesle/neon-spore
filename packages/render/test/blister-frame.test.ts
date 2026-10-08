import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  type BlisterBy,
  blisterIsUp,
  blisterMayTap,
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
  thirdOf,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE BLISTER, drawn: the bulge on the seat that may not tap, the body coming
 * up out of its pore and going back in, the tap help over it on the seat that
 * may and the waiting clock on the one that may not, the pips, and the green
 * ring off every blow that counted (`blister.ts`, `blister-help.ts`,
 * `blister-verdicts.ts`).
 *
 * **One of each `by`**, THE MINE's argument: whichever seat is drawing, one
 * blister is its to tap, one is the partner's, and one is both — so every
 * screen draws the help, the clock and the bulge in the same run. A run with
 * every blister set one way would draw half of this creature and pass.
 *
 * The tapping hand is the one each `by` names, twice a beat while it is up,
 * so the run goes through a blow landing, a body sinking with blows still
 * owed, a bulge before it comes up again, and the last blow taking it.
 */

beforeAll(installCanvasGlobals);

const blister = (col: number, by: BlisterBy): SpawnEntry => ({
  beat: 0,
  col,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count: 3,
});

const QUEUE: SpawnEntry[] = [blister(2, 1), blister(5, 2), blister(8, "both")];

function blisterFrames(
  role: ViewRole,
  ticks: number,
  sampling: { every?: number; phase?: number },
) {
  const tpb = ticksPerBeat(CFG);
  const { ctx, events } = runFrames(createWorld(CFG, 3, QUEUE), role, ticks, {
    ...sampling,
    onTick: (tick, w) => {
      const inputs: TimedCommand[] = [];
      if (tick % (tpb / 2) === 1) {
        for (const c of w.creatures) {
          if (!blisterIsUp(c)) continue;
          const player = blisterMayTap(c, 1) ? 1 : 2;
          inputs.push({ tick: w.tick, player, command: { kind: "tap", id: c.id } });
        }
      }
      step(w, inputs);
    },
  });
  const count = (type: string) => events.filter((e) => e.type === type).length;
  return { ctx, blows: count("blisterBlow"), destroyed: count("destroy") };
}

describe("the blister", () => {
  const TICKS = ticksPerBeat(CFG) * 10;
  const played = remembered((role) => blisterFrames(role, TICKS, thirdOf(4, ROLES.indexOf(role))));

  for (const role of ROLES) {
    it(`draws the bulge, the body, the help and the verdicts for ${role}`, () => {
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really landed blows and knocked them out", () => {
    // Without the first, no verdict ring was ever thrown and no pip went out;
    // without the second, no last ring outlived its body.
    const { blows, destroyed } = played("test");
    expect(blows).toBe(9);
    expect(destroyed).toBe(3);
  });
});
