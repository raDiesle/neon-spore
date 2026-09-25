import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSetForWave } from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { seatRole } from "../src/guide-film.js";
import { SeatView } from "../src/guide-seat.js";
import { computeLayout } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  waveWith,
} from "./frame-harness.js";
import { displaced } from "./unseen-shift.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A rehearsal draws no body the game would not.**
 *
 * A seat's screen inside a film is the shipping renderer's own passes
 * (`guide-seat.ts`), and until 18 September 2026 it ran them on the world
 * as it stood — every body, including the ones THE REPRISE forbids either
 * screen to draw (`unseen.ts`). Its film taught the dark with the lights
 * on. The proof is the one `reprise-frame.test.ts` uses for the phone: the
 * same tick drawn as it stands and with every unseen body moved and
 * recoloured has to make the same canvas calls, in order (`unseen-shift.ts`).
 */

beforeAll(installCanvasGlobals);

const PHONE = { width: 390, height: 844, dpr: 1 };

/** The shipped wave, stepped to a beat its first echo is halfway through. */
function reprised(): World {
  const at = waveWith("reprise");
  const world = createWorld(CFG, 7, buildQueue(at, CFG.cols));
  startWave(world, at, buildQueue(at, CFG.cols), [], buildBoss(at, CFG.cols));
  for (let t = 0; t < ticksPerBeat(CFG) * 16; t++) step(world, []);
  return world;
}

function oneSeatFrame(world: World, seat: 1 | 2): string[] {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  const role = seatRole(seat);
  const l = computeLayout(PHONE, CFG, role);
  new SeatView().draw(ctx as unknown as CanvasRenderingContext2D, l, {
    world,
    beatPhase: 0,
    role,
    time: 1,
    dt: 1 / 60,
    events: [],
    running: true,
    controls: controlSetForWave(waveWith("reprise")),
  });
  return log;
}

describe("a seat's screen inside a rehearsal", () => {
  for (const seat of [1, 2] as const) {
    it(`costs the canvas nothing for a body the pair cannot see, on seat ${seat}`, () => {
      const world = reprised();
      expect(
        world.creatures.some((c) => c.unseen === true),
        "the echo had nothing standing",
      ).toBe(true);
      // Once to warm: the first frame in a process also paints the sprites
      // the module caches, and that is a longer log than any frame after it.
      oneSeatFrame(world, seat);
      const drawn = oneSeatFrame(world, seat);
      expect(oneSeatFrame(displaced(world), seat)).toEqual(drawn);
    });
  }
});
