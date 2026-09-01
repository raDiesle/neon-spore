import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SpawnEntry,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { dartLegs } from "../src/dart-path.js";

/**
 * **A previewed path is a promise, and this is the test that it is kept.**
 *
 * Player 2 reads two dotted legs and a hollow body on the tile the dart is
 * about to stand in, says a column out loud, and player 1 moves a cannon there
 * over a voice delay. If `dartLegs` and the simulation ever disagree by one
 * column, nothing throws and nothing looks wrong — the pair simply loses hull
 * on a call they made correctly. Nothing else in render/ can be wrong in that
 * particular way, because nothing else in render/ is a claim about the future.
 *
 * So it is checked against the world itself rather than against arithmetic
 * written out a second time: fly a dart, ask where it says it is going, and
 * step the beats to find out.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const dart = (col: number): SpawnEntry => ({ beat: 0, col, kind: "dart", color: "red" });

/** Where the one dart on the field stands at each beat boundary, with the two
 * legs it was promising when it stood there. */
function flight(startCol: number, beats: number, seed = 0) {
  const world = createWorld({ ...CFG }, seed, [dart(startCol)]);
  const seen: {
    col: number;
    row: number;
    float: boolean;
    legs: ReturnType<typeof dartLegs>;
  }[] = [];
  for (let b = 0; b < beats; b++) {
    for (let t = 0; t < TPB; t++) step(world, []);
    const c = world.creatures[0];
    if (!c) break;
    seen.push({
      col: c.col,
      row: c.row,
      float: c.dartFloat === true,
      legs: dartLegs(c, CFG.cols),
    });
  }
  return seen;
}

describe("the previewed path", () => {
  it("names the tile the body actually lands on, and the one after it", () => {
    for (const start of [5, 2, 8]) {
      const seen = flight(start, 10, start);
      for (const [i, at] of seen.entries()) {
        const { next, after } = at.legs;
        if (at.float) {
          // Aiming: the near leg ends where the next move puts it, and the far
          // leg where the move after that does.
          const moved = seen[i + 1];
          if (moved) expect({ col: moved.col, row: moved.row }).toEqual(next);
          const twice = seen[i + 3];
          if (twice) expect({ col: twice.col, row: twice.row }).toEqual(after);
        } else {
          // Mid-flight: the near leg is this run's own landing tile, which the
          // simulation has already moved the body to.
          expect(next).toEqual({ col: at.col, row: at.row });
          const twice = seen[i + 2];
          if (twice) expect({ col: twice.col, row: twice.row }).toEqual(after);
        }
      }
    }
  });

  it("bends once and only diagonally, so the legs read as one plan", () => {
    for (const at of flight(5, 12)) {
      const { next, after } = at.legs;
      // Every leg spends the same rows as columns, or it is a leg the body
      // cannot fly — except where the field's edge clamps one, which is the
      // one place a drawn leg is allowed to be shorter than a true diagonal.
      const rows = after.row - next.row;
      const cols = Math.abs(after.col - next.col);
      expect(rows).toBeGreaterThan(0);
      expect(cols).toBeLessThanOrEqual(rows);
      expect(after.col).toBeGreaterThanOrEqual(0);
      expect(after.col).toBeLessThan(CFG.cols);
    }
  });

  it("stays on the field at both walls", () => {
    for (const start of [0, CFG.cols - 1]) {
      for (const at of flight(start, 12, start + 1)) {
        for (const p of [at.legs.next, at.legs.after]) {
          expect(p.col).toBeGreaterThanOrEqual(0);
          expect(p.col).toBeLessThan(CFG.cols);
        }
      }
    }
  });
});
