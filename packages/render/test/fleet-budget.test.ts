import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  FLEET_SHELL_BEATS,
  fleetRows,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, runFrames, waveWith } from "./frame-harness.js";

/**
 * An op-count budget for THE FLEET, the way `frame-budget.test.ts` keeps one
 * for a busy wave — and it exists because this boss grew an *animation*.
 *
 * The owner's standing rule is that a new shape or a new animation is measured
 * as part of testing it, and that the figure is kept in the repository so a
 * later run can be compared against it rather than admired on its own. The
 * shell arcing over the chart, the burst where it lands and the swell under
 * the whole picture are three new things drawn every frame of this fight; this
 * is what they cost, on the two frames where they cost the most.
 *
 * Two rows, and they are the two moments: a shell at the top of its arc, with
 * its shadow and its exhaust; and the frame just after it lands, where the
 * flash, the shockwave, the fireball and its shards are all on screen at once.
 * Everything the boss draws the rest of the time is a subset of those.
 *
 * **The numbers are measured, not padded.** Set `MEASURE` to true, run this
 * file, and read the rows off the output; then put them back and pin them in
 * the same commit as the change that earned them. Lower them whenever a saving
 * lands.
 */

/** Dump the tally instead of asserting it. Never committed as `true`. */
const MEASURE = false;

const TPB = ticksPerBeat(CFG);
/** The stage every row was measured on — a phone, the same one next door. */
const VIEWPORT = { width: 390, height: 844, dpr: 3 };

type Budget = Partial<
  Record<
    | "fillRect"
    | "stroke"
    | "fill"
    | "clip"
    | "save"
    | "drawImage"
    | "createLinearGradient"
    | "createRadialGradient"
    | "new Path2D"
    | "fillText",
    number
  >
>;

/**
 * The shell at the top of its arc, and the burst a beat and a quarter later,
 * for each seat.
 *
 * Both seats, not one: the pilot is drawn five hulls the navigator is not, so
 * a single ceiling would let the ships get more expensive without anything
 * saying so. Neither row is a first frame — `installCanvasGlobals` empties
 * render's caches and the first frame of a run pays for its own bakes — so
 * both are the steady-state cost of the fight.
 *
 * **`fillRect` was nearly two hundred, and almost none of it was new.** The
 * chart marks every crossing of its own lattice, twelve by eleven of them
 * every frame, and each one was a `fillRect` — roughly seventy per cent of
 * every rectangle the game drew during this fight. They are one `fill` of one
 * path now (`fleet-chart.ts`), which is the same picture while no two marks
 * touch, and the rows below are the measurement that bought: 192 down to 60
 * on both seats, for one more `fill` and one more `Path2D`.
 */
const BUDGETS: Readonly<Record<"p1" | "p2", Readonly<Record<"mid" | "hit", Budget>>>> = {
  p1: {
    mid: {
      fillRect: 60,
      stroke: 44,
      fill: 35,
      clip: 6,
      save: 36,
      drawImage: 18,
      createLinearGradient: 7,
      createRadialGradient: 0,
      "new Path2D": 9,
      fillText: 25,
    },
    hit: {
      fillRect: 83,
      // Two more than mid: the shockwave ring and the fireball's own contour.
      stroke: 46,
      fill: 33,
      clip: 6,
      // Eight more: the burst opens one per shard it turns, and the shards are
      // the only thing in this picture drawn in a frame of its own.
      save: 44,
      // Three more: the flash and the fireball are `halo` blits, and the halo
      // the shell was carrying is gone.
      drawImage: 22,
      // One fewer: the shell's exhaust gradient goes with the shell.
      createLinearGradient: 6,
      // The fireball, and the one radial gradient this fight ever builds.
      createRadialGradient: 1,
      "new Path2D": 9,
      fillText: 25,
    },
  },
  p2: {
    mid: {
      fillRect: 60,
      // Nine fewer than the pilot's: five hulls, their spines and their scars
      // are the whole of what this seat is not shown (`fleet-hulls.ts`).
      stroke: 35,
      fill: 32,
      clip: 6,
      save: 31,
      drawImage: 19,
      createLinearGradient: 7,
      createRadialGradient: 0,
      "new Path2D": 9,
      fillText: 24,
    },
    hit: {
      fillRect: 83,
      stroke: 36,
      fill: 30,
      clip: 6,
      save: 39,
      drawImage: 22,
      createLinearGradient: 6,
      createRadialGradient: 1,
      "new Path2D": 9,
      // One fewer than the pilot's, every frame: the square's own name is on
      // both screens and the wave's own readouts are not all of them.
      fillText: 24,
    },
  },
};

/** The wave, opened with the sights already standing on a hull. */
function fleetWorld(): { world: World; target: { col: number; row: number } } {
  const world = createWorld(CFG, 3);
  const index = waveWith("fleet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const boss = world.boss;
  if (boss?.kind !== "fleet") throw new Error("the fleet wave installed no fleet");
  const ship = boss.ships[0];
  if (!ship) throw new Error("the fleet wave carries no ships");
  return { world, target: { col: ship.col, row: ship.row } };
}

describe("THE FLEET's op count", () => {
  beforeAll(installCanvasGlobals);

  for (const role of ["p1", "p2"] as const) {
    it(`stays inside the measured budget through a salvo on ${role}`, () => {
      const { world, target } = fleetWorld();
      let col = Math.floor(CFG.cols / 2);
      let row = Math.floor(fleetRows(CFG) / 2);
      // The walk has to be finished before the thumb lands, so the frames
      // below are a shell in flight rather than a cursor still moving.
      const fire = TPB * 3;
      const mid = fire + Math.round(TPB * FLEET_SHELL_BEATS * 0.5);
      const hit = fire + Math.round(TPB * FLEET_SHELL_BEATS) + 8;
      const worst: Record<string, Map<string, number>> = { mid: new Map(), hit: new Map() };

      runFrames(world, role as ViewRole, hit + 4, {
        every: 1,
        controls: controlSet("fleet"),
        viewport: VIEWPORT,
        onTick: (tick, w) => {
          if (tick === fire) {
            step(w, [{ tick, player: 1, command: { kind: "salvo" } }]);
            return;
          }
          if (tick < fire && col !== target.col) {
            const dcol: -1 | 1 = target.col > col ? 1 : -1;
            col += dcol;
            step(w, [{ tick, player: 2, command: { kind: "aim", dcol, drow: 0 } }]);
            return;
          }
          if (tick < fire && row !== target.row) {
            const drow: -1 | 1 = target.row > row ? 1 : -1;
            row += drow;
            step(w, [{ tick, player: 2, command: { kind: "aim", dcol: 0, drow } }]);
            return;
          }
          step(w, []);
        },
        onDrawn: (ctx, frame) => {
          const at = frame === mid ? "mid" : frame === hit ? "hit" : null;
          if (at) for (const [k, v] of ctx.tally) worst[at]?.set(k, v);
          ctx.tally.clear();
        },
      });

      for (const at of ["mid", "hit"] as const) {
        const tally = worst[at] ?? new Map<string, number>();
        if (MEASURE) {
          console.log(role, at, Object.fromEntries(tally));
          continue;
        }
        for (const [key, max] of Object.entries(BUDGETS[role][at])) {
          expect(tally.get(key) ?? 0, `${role} ${at} ${key}`).toBeLessThanOrEqual(max as number);
        }
      }
      expect(MEASURE).toBe(false);
    });
  }
});
