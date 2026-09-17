import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_SHED,
  type BatonState,
  batonBoss,
  batonLocked,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE BATON through its stages, on both screens.
 *
 * The stages are **played into where a command reaches them and set where it
 * does not**, for `diastole-frame.test.ts`'s reason: a flight is one press
 * away and is pressed, while a dark socket, a shed one and the fold at the
 * end are each a run of handovers deep — `sim/test/baton.test.ts` proves those
 * and this file only asks whether every branch of the picture is drawn. The
 * one thing here nothing else in the suite could catch is the grey panel: it
 * has to land on the locked seat's screen and on no other.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const GREY = "rgba(60,63,73,.62)";

function opened(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("baton");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function arm(world: World): BatonState {
  const b = batonBoss(world);
  if (b === null) throw new Error("the baton wave installed no arm");
  return b;
}

/** The arm unfolded and the bead sitting, which is the first press's picture. */
function sitting(world: World): void {
  for (let i = 0; i < (CFG.batonSockets + 1) * TPB; i++) step(world, []);
  if (arm(world).stage !== "sitting") throw new Error("the bead never sat");
}

/** Player 1 under the bead, then the trigger: the bead is in the air. */
function launched(world: World): void {
  sitting(world);
  const b = arm(world);
  step(world, [
    { tick: world.tick, player: 1, command: { kind: "cannonCol", col: b.col } },
    { tick: world.tick, player: 1, command: { kind: "guard" } },
  ]);
  if (b.stage !== "flying") throw new Error("the trigger launched nothing");
}

/** Every colour and fill a screen set over a run of frames, as one string. */
function drawn(world: World, role: ViewRole, ticks: number): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

describe("the baton", () => {
  for (const role of ROLES) {
    it(`draws the arm unfolding and the bead sitting for ${role}`, () => {
      const world = opened();
      const { calls } = drawn(world, role, (CFG.batonSockets + 2) * TPB);
      expect(calls).toBeGreaterThan(500);
      expect(arm(world).stage).toBe("sitting");
    });

    it(`draws the bead in flight in its own colour for ${role}`, () => {
      const world = opened();
      launched(world);
      const hex = arm(world).color === "red" ? PALETTE.red : PALETTE.cyan;
      const { text } = drawn(world, role, TPB);
      expect(text).toContain(hex);
    });

    it(`draws dark and shed sockets and the fold at the end for ${role}`, () => {
      const world = opened();
      sitting(world);
      const b = arm(world);
      b.sockets[0] = BATON_SOCKET_SHED;
      b.sockets[1] = BATON_SOCKET_DARK;
      b.socket = 2;
      const worn = drawn(world, role, TPB).calls;
      b.stage = "down";
      b.stageBeat = world.beat;
      // A beat and a half of the fold: the arm is still there, going out.
      const folding = drawn(world, role, TPB).calls;
      expect(worn).toBeGreaterThan(500);
      expect(folding).toBeGreaterThan(500);
    });
  }

  it("greys the locked seat's panel on that seat's screen and on no other", () => {
    // The load-bearing test of this file. After the pilot's trigger the pilot
    // is locked for a beat (`batonLocks`), so the pilot's phone greys and the
    // navigator's does not; the test screen carries both seats and greys the
    // pilot's half. A grey on the wrong phone would tell a seat it was locked
    // when its press would have been taken.
    const p1 = opened();
    launched(p1);
    expect(drawn(p1, "p1", 3).text).toContain(GREY);
    const p2 = opened();
    launched(p2);
    expect(drawn(p2, "p2", 3).text).not.toContain(GREY);
    const both = opened();
    launched(both);
    expect(drawn(both, "test", 3).text).toContain(GREY);
  });

  it("greys nothing while nobody is locked", () => {
    const world = opened();
    sitting(world);
    expect(drawn(world, "p1", 3).text).not.toContain(GREY);
    expect(drawn(world, "p2", 3).text).not.toContain(GREY);
  });

  it("greys the navigator after the navigator's shot, and not the pilot", () => {
    const world = opened();
    launched(world);
    const b = arm(world);
    // The turn is spent the tick the bolt leaves the lobe, whatever it meets
    // (`batonShotSpends`), so a shot on the launch's own beat would end its
    // lock on the same beat the pilot's ends. A beat into the flight, then
    // the shot, then on past the pilot's lock: the only grey left is hers.
    for (let i = 0; i < TPB; i++) step(world, []);
    step(world, [{ tick: world.tick, player: 2, command: { kind: "fire", color: b.color } }]);
    if (!batonLocked(b, 2, world.beat)) throw new Error("the shot locked nobody");
    while (batonLocked(b, 1, world.beat)) step(world, []);
    if (!batonLocked(b, 2, world.beat)) throw new Error("her lock ended with his");
    expect(drawn(world, "p2", 3).text).toContain(GREY);
    expect(drawn(world, "p1", 3).text).not.toContain(GREY);
  });

  it("shows the whole arm to both seats", () => {
    // Nothing about the arm is kept from either screen: the split of this
    // fight is in the hands, and the bead's colour — the one fact the
    // navigator's shot depends on — reaches the navigator's phone as it is.
    const p1 = opened();
    launched(p1);
    const hex = arm(p1).color === "red" ? PALETTE.red : PALETTE.cyan;
    expect(drawn(p1, "p1", 3).text).toContain(hex);
    const p2 = opened();
    launched(p2);
    expect(drawn(p2, "p2", 3).text).toContain(hex);
  });
});
