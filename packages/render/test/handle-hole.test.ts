import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step, type World } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  peakWorld,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The hole a handle punches, and the seat it is punched for.**
 *
 * `drawHandleRing` fills a flat disc in `PALETTE.background` before it draws
 * anything else, so that a ring reads as a thing to take hold of over whatever
 * the fight has put behind it. The seat that may *not* take hold of it was
 * being sold the same hole under a wash it cannot see at 0.18 alpha, and what
 * came out was a black disc in the middle of the picture: on PINBALL's lit
 * board a hole in the board, on THE UNDERTOW's hull a breach nothing had
 * breached (`undertow-grip.ts`, 22 September 2026). So a ring drawn `theirs`
 * fills nothing, and that is what is counted here.
 *
 * **A background fill is a ring and nothing else is**, in both of these waves:
 * `BARE` is asserted rather than assumed, exactly as `undertow-grip-frame.ts`
 * asserts it, because every other number in this file is read straight off the
 * count.
 *
 * Nine more bosses draw a dim ring and each is ruled on in its own §11 section
 * as its lane reaches it (`docs/queue.md`). What this file holds is the two
 * that have been looked at in a frame and the rule they share.
 */

beforeAll(installCanvasGlobals);

/** Frames of a world **held still**: what a ring does is counted off a beat. */
function drawn(world: World, role: ViewRole): string {
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 3,
    onTick: () => {},
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

/** How many discs are punched out of this screen. */
function holes(world: World, role: ViewRole): number {
  return drawn(world, role).split(PALETTE.background).length - 1;
}

function table(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("pinball");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const round = () => world.boss as { phase: string } | null;
  for (let t = 0; t < 1000 && round()?.phase !== "play"; t++) step(world, []);
  return world;
}

/** The pair's own two answers, which is the only way into a flight: the pilot
 * stops the needle and the navigator launches on the bar (`pinball-controls.ts`). */
function launched(world: World): World {
  step(world, [{ tick: world.tick, player: 1, command: { kind: "latch" } }]);
  step(world, [{ tick: world.tick, player: 2, command: { kind: "launch" } }]);
  for (let t = 0; t < 5; t++) step(world, []);
  return world;
}

describe("PINBALL's nudge, which is hers while a ball falls", () => {
  it.each(ROLES)("punches nothing out of a table nobody has a hand on, on %s", (role) => {
    expect(holes(table(), role)).toBe(0);
  });

  it("fills its disc on her screen, where a thumb may land in it", () => {
    // Her one answer during a flight, and the thing she has to be able to find
    // on a board of pegs and targets (`pinball-hand.ts`).
    expect(holes(launched(table()), "p2")).toBe(1);
  });

  it("punches no hole in his board, where it is hers to press and his to read", () => {
    // **The defect, in the one wave whose handle stands on a lit surface.** It
    // stays on his screen: the dial is how many nudges she has spent, a second
    // one tilts the table and her hand is dead for the rest of the flight, so
    // *not yet* is a sentence the two of them have to say out loud — and he
    // cannot say it without the number. What he may not be shown is a hole.
    expect(holes(launched(table()), "p1")).toBe(0);
  });

  it("is still drawn on his screen, in the dim it is read in", () => {
    const quiet = table();
    const flying = launched(table());
    const dim = (w: World) => drawn(w, "p1").split(PALETTE.dim).length - 1;
    expect(dim(flying)).toBeGreaterThan(dim(quiet));
  });
});

describe("THE BALLOON's pair, one handle to a seat on every body", () => {
  it("punches one disc a body on each phone, and both on the rig", () => {
    // The only creature in the game with a handle per seat, and the reason
    // `HandleWords` carries one at all (`handle-word.ts`): a hand on each of
    // two different bodies is no hands at all, so each seat has to see the
    // other's ring and read the arc closing on it. It reads that arc through
    // whatever the body behind it is doing, and not through a hole.
    const world = peakWorld("theBalloon");
    const bodies = world.creatures.filter((c) => c.kind === "balloon").length;
    expect(bodies).toBeGreaterThan(0);
    expect(holes(world, "p1")).toBe(bodies);
    expect(holes(world, "p2")).toBe(bodies);
    // The rig is both seats at once, which is what makes a two-seat control
    // drawable in one frame (`balloon-handles.ts`).
    expect(holes(world, "test")).toBe(bodies * 2);
  });
});
