import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  hullRow,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE LIMPET and THE LEECH through a canvas that refuses what a real one
 * does (`frame-harness.ts`).
 *
 * Three pictures nothing else draws: a body arriving along the plating from
 * the lane it fell in, by `beatPhase`; a body lifting off its control and
 * opening its hooks as the moves against it mount; and the fuse — a row of
 * lights over the body, going out one a beat, pulsing on the last two and
 * flashing ember on the last (`cling.ts`, `cling-fuse.ts`). The fuse is
 * shown to one seat only, so every role is run: p1 is shown the limpet's
 * and not the leech's, p2 the other way, test both.
 *
 * Both runs go the whole way — one to the blast, one to the letting-go — so
 * the last beat's flash and the freed burst are drawn as well as the hold.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const STUCK_BY = TPB * (hullRow(CFG) + 2);
const MID = Math.floor(CFG.cols / 2);

const queue = (): SpawnEntry[] => [
  { beat: 0, col: 1, kind: "limpet", color: null },
  { beat: 0, col: 5, kind: "leech", color: null },
];

/** Both controls walked a column a beat from the grip, or left standing. */
function clingFrames(role: (typeof ROLES)[number], ticks: number, walking: boolean) {
  const { ctx, events, world } = runFrames(createWorld(CFG, 1, queue()), role, ticks, {
    every: 3,
    onTick: (tick, w) => {
      const inputs: TimedCommand[] = [];
      if (walking && tick > STUCK_BY && (tick - STUCK_BY) % TPB === 1) {
        const b = Math.floor((tick - STUCK_BY) / TPB);
        const col = b % 2 === 0 ? MID - 1 : MID + 1;
        inputs.push({ tick, player: 2, command: { kind: "shieldCol", col } });
        inputs.push({ tick, player: 1, command: { kind: "cannonCol", col } });
      }
      step(w, inputs);
    },
  });
  const count = (type: string) => events.filter((e) => e.type === type).length;
  return {
    ctx,
    world,
    grip: count("clingGrip"),
    shake: count("clingShake"),
    freed: count("clingFreed"),
    blast: count("clingBlast"),
  };
}

describe("THE LIMPET and THE LEECH through a canvas that refuses what a real one does", () => {
  for (const role of ROLES) {
    it(`draws the fall, the grip, the fuse running out and the blast as ${role}`, () => {
      const ticks = STUCK_BY + TPB * (CFG.limpetStillBeats + 1);
      const { ctx, grip, blast } = clingFrames(role, ticks, false);
      expect(ctx.calls).toBeGreaterThan(0);
      expect(grip).toBe(2);
      expect(blast).toBe(2);
    });
  }

  it("draws the body loosening under the moves and letting go", () => {
    const ticks = STUCK_BY + TPB * (CFG.limpetShakeMoves + 1);
    const { shake, freed, blast, world } = clingFrames("test", ticks, true);
    expect(shake).toBe(CFG.limpetShakeMoves + CFG.leechShakeMoves);
    expect(freed).toBe(2);
    expect(blast).toBe(0);
    expect(world.creatures).toHaveLength(0);
  });
});
