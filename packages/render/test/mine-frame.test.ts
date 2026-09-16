import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  type Creature,
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
 * THE MINE, drawn: the body on the seat it is drawn to, the count on both, the
 * finger that shuts one and the two fingers that do not.
 *
 * This is the only creature in the game whose picture differs between the two
 * seats **by the wave's instruction rather than by its kind**, so every run
 * here carries one mine set each way round: whichever seat is drawing, it has
 * a body to draw and a ring it draws instead of one. A run with both mines set
 * the same way would draw half of this creature and pass.
 *
 * **The three endings are three plays and not one**, which is the creature
 * saying so rather than the test being shy: a finger one tile out and a count
 * reaching nought both take the hull, and the hull going takes the wave
 * (`failTick`), after which nothing in the world moves again. Asking one play
 * for all three would only ever have reached the first.
 *
 * What none of it can answer is whether the ring reads as a count at a glance,
 * or whether a contour closing says *shut* rather than *killed*. Those need an
 * eye. What it holds is that all four states — standing, defused, mistaken by
 * one tile, and run out — have been through a canvas that refuses what a real
 * one refuses.
 */

beforeAll(installCanvasGlobals);

/** One mine drawn to each seat, so either screen has a body and a ring. */
const QUEUE: SpawnEntry[] = [
  { beat: 0, col: 3, kind: "mine", color: "cyan", row: 6, sees: 2 },
  { beat: 0, col: 1, kind: "mine", color: "red", row: 9, sees: 1 },
];

/** Which finger the play puts down, and where. */
type Script = "right" | "beside" | "none";

/** A mine by the column it was authored in, read off the world rather than
 * assumed: `minePlaceRow` steps an arrival clear of one already standing, so
 * the tile a finger goes to is the field's answer and not the wave's. */
function mineAt(creatures: readonly Creature[], col: number): Creature | undefined {
  return creatures.find((c) => c.kind === "mine" && c.col === col);
}

function mineFrames(
  role: ViewRole,
  ticks: number,
  script: Script,
  sampling: { every?: number; phase?: number } = {},
) {
  const tpb = ticksPerBeat(CFG);
  const { ctx, events, world } = runFrames(createWorld(CFG, 1, QUEUE), role, ticks, {
    ...sampling,
    onTick: (tick, w) => {
      const inputs: TimedCommand[] = [];
      // The pilot's finger on the exact tile of the body he is not drawn. It
      // shuts — the one press in this creature that costs nothing.
      const mine = mineAt(w.creatures, script === "beside" ? 1 : 3);
      if (tick === tpb * 2 && mine && script !== "none") {
        // …and one tile under it for the other play: near enough to have been
        // meant, so it is the hull rather than a beat off the count.
        const off = script === "beside" ? 1 : 0;
        inputs.push({
          tick,
          player: script === "beside" ? 2 : 1,
          command: { kind: "tapTile", col: mine.col, row: mine.row + off },
        });
      }
      step(w, inputs);
    },
  });
  const count = (type: string) => events.filter((e) => e.type === type).length;
  return { ctx, world, destroyed: count("destroy"), breaches: count("breach") };
}

describe("the mine", () => {
  const tpb = ticksPerBeat(CFG);
  const TICKS = tpb * 6;

  const played = remembered((role) =>
    mineFrames(role, TICKS, "right", thirdOf(4, ROLES.indexOf(role))),
  );

  for (const role of ROLES) {
    it(`draws the body it owes ${role} and the count it owes the other seat`, () => {
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really shut one, and left the other standing on its count", () => {
    // Without the first the run drew two bodies standing still for six beats:
    // no contour closing, no cold disc, no ring going out. Without the second
    // the play was over before the count had anything left to draw.
    const { destroyed, breaches, world } = played("test");
    expect(destroyed).toBe(1);
    expect(breaches).toBe(0);
    expect(world.creatures.filter((c) => c.kind === "mine").length).toBe(1);
  });

  it("draws the hull going when a finger lands one tile out", () => {
    const { breaches, ctx } = mineFrames("p2", TICKS, "beside");
    expect(breaches).toBe(1);
    expect(ctx.calls).toBeGreaterThan(1000);
  });

  it("draws the hull going when the count runs out", () => {
    // Past the shipped fuse, with nobody's finger on the field. The frames
    // after it are the lost screen, which is the other half of this picture.
    const { breaches, ctx } = mineFrames("p1", tpb * 12, "none");
    expect(breaches).toBeGreaterThan(0);
    expect(ctx.calls).toBeGreaterThan(1000);
  });
});
