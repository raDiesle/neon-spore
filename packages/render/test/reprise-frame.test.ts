import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, CREATURES } from "@neon-spore/content";
import {
  type CreatureKind,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";
import { displaced } from "./unseen-shift.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE REPRISE, drawn — the one boss whose claim on this file is that it draws
 * **nothing where a body is**.
 *
 * A body the mechanism has sent again is on the field like any other: it
 * falls, the shield turns it, a bolt takes it, and it costs the hull if it
 * lands. What neither screen may do is put a mark where it is
 * (`sim/reprise.ts`). So what is worth holding here is a negative, and it is
 * one an eye cannot check: an unseen slick drawn in its own dark grey against
 * a dark field would look very much like nothing at all. The frame is
 * therefore compared call by call — the same tick of the same wave, drawn once
 * as it stands and once with every unseen body moved and recoloured
 * (`unseen-shift.ts`), and the two logs have to be identical. The boss's count
 * of them is in both; where they are and what colour is in neither.
 *
 * And the ordinary half, for the reason every `*-frame.test.ts` here exists:
 * the whole wave through a canvas that refuses what a real one refuses, on
 * every seat.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

/** The shipped wave, stepped to a beat its first echo is halfway through. */
function reprised(beats: number): World {
  const at = waveWith("reprise");
  const world = createWorld(CFG, 7, buildQueue(at, CFG.cols));
  startWave(world, at, buildQueue(at, CFG.cols), [], buildBoss(at, CFG.cols));
  for (let t = 0; t < TPB * beats; t++) step(world, []);
  return world;
}

/** The ordered log of one frame of a world already stepped, with nothing
 * stepped further. */
function oneFrame(world: World, role: (typeof ROLES)[number]): string[] {
  // Once to warm: the first frame in a process also paints the sprites the
  // module caches, and that is a longer log than any frame after it.
  runFrames(world, role, 1, { onTick: () => {} });
  const log: string[] = [];
  runFrames(world, role, 1, {
    onTick: () => {},
    onCanvas: (ctx) => {
      ctx.log = log;
    },
  });
  return log;
}

describe("a frame of THE REPRISE", () => {
  for (const role of ROLES) {
    it(`draws the wave and its echo for ${role} without the canvas refusing a value`, () => {
      const at = waveWith("reprise");
      const world = createWorld(CFG, 7, buildQueue(at, CFG.cols));
      startWave(world, at, buildQueue(at, CFG.cols), [], buildBoss(at, CFG.cols));
      const { ctx, world: after } = runFrames(world, role, TPB * 18);
      expect(
        after.creatures.some((c) => c.unseen === true),
        "no echo was on the field",
      ).toBe(true);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("costs the canvas nothing for a body the pair cannot see", () => {
    for (const role of ROLES) {
      const world = reprised(16);
      const unseen = world.creatures.filter((c) => c.unseen === true);
      expect(unseen.length, `${role}: the echo had nothing standing`).toBeGreaterThan(0);
      const drawn = oneFrame(world, role);
      // The same tick with the echo moved and recoloured. Nothing else about
      // the world changes, so a single mark drawn for one of those bodies
      // would show up here as a line that differs.
      expect(oneFrame(displaced(world), role), role).toEqual(drawn);
    }
  });
});

/**
 * Every kind in the bestiary, one at a time, as an unseen body.
 *
 * The wave THE REPRISE ships on authors plain bodies, so the test above proves
 * the rule for one kind and says nothing about the other forty. It is not the
 * body pass that is the risk: it is the two dozen passes *beside* it, each
 * walking the creature list for its own kind — a lure's alarm, a veil's marks,
 * a mine's fuses, a wall's arcs, a box's row of dots. Sixteen of them drew an
 * unseen body when this was first measured, and every one was a column handed
 * to the pair for nothing.
 *
 * So the claim is made once over the whole roster, which is also what holds
 * the *next* creature to it: a pass added with a new kind and no thought about
 * this fails here rather than on a wave months later, where it would read as
 * the pair having remembered better than they did.
 */
const KINDS = Object.keys(CREATURES) as CreatureKind[];

describe("a body no screen may draw", () => {
  for (const kind of KINDS) {
    it(`costs the canvas nothing as a ${kind}`, () => {
      for (const role of ROLES) {
        const world = standing(kind);
        expect(world.creatures.length, `${kind} never arrived`).toBeGreaterThan(0);
        const drawn = oneFrame(world, role);
        expect(oneFrame(displaced(world), role), `${kind}/${role}`).toEqual(drawn);
      }
    });
  }
});

/** One body of a kind, on the field and unseen. Built from a queue of its own
 * rather than by hand: what a kind arrives carrying is `spawn-fields.ts`'s to
 * answer, and a body assembled here would be a body no wave can produce. */
function standing(kind: CreatureKind): World {
  const at = waveWith("reprise");
  const world = createWorld(CFG, 7, [{ beat: 0, col: 3, kind, color: "red" }]);
  startWave(world, at, [{ beat: 0, col: 3, kind, color: "red" }], [], buildBoss(at, CFG.cols));
  for (let t = 0; t < TPB * 2; t++) step(world, []);
  for (const c of world.creatures) c.unseen = true;
  return world;
}
