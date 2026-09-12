import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { commsCall } from "../src/comms.js";
import type { ViewRole } from "../src/layout.js";
import { pressSeats, showsOwnMark } from "../src/weight.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE WEIGHT's split, which is the only one in the game about a player's own
 * hand rather than about the world.**
 *
 * Its own file rather than a block in `frame.test.ts`, for `wisp.test.ts`'
 * reason: that file asks whether a frame draws at all, and this asks *which*
 * frame draws what. A wisp is a body one seat cannot see; a weight is a body
 * both seats see and a **thumb** only one of them does — and because the thumb
 * is the answer to the creature, that difference is the mechanic rather than a
 * flourish over it.
 */

const TPB = ticksPerBeat(CFG);
const ID = 1;

beforeAll(installCanvasGlobals);

const weight = (col: number): SpawnEntry => ({ beat: 0, col, kind: "weight", color: null });
const press = (tick: number, player: 1 | 2): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id: ID },
});

function frames(role: ViewRole, ticks: number, inputs: TimedCommand[] = []) {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  return runFrames(createWorld(CFG, 3, [weight(3)]), role, ticks, {
    onTick: (tick, world) => step(world, byTick.get(tick) ?? []),
  });
}

/**
 * A world with one weight on the field and the given hands on it, sampled `after`
 * ticks later — few enough that a two-handed press has not yet run its window
 * out, since a crushed body is not one whose picture can be asked about.
 */
function held(hands: (1 | 2)[], after = 6) {
  const world = createWorld(CFG, 3, [weight(3)]);
  for (let tick = 0; tick < TPB + after; tick++) {
    step(
      world,
      tick === TPB
        ? hands.map((player) => ({ tick, player, command: { kind: "grip", id: ID } as const }))
        : [],
    );
  }
  return world;
}

describe("pressSeats", () => {
  it("is the seat looking at the screen, and both for the rig", () => {
    expect(pressSeats("p1")).toEqual([1]);
    expect(pressSeats("p2")).toEqual([2]);
    // The rig sees both, which is the only way one picture can carry both halves
    // of a two-seat control — the arrangement `balloon-handles.ts` is on.
    expect(pressSeats("test")).toEqual([1, 2]);
  });
});

describe("a hand on a weight", () => {
  it("is drawn for the seat whose hand it is and for nobody else", () => {
    // The whole creature, in two assertions. If the second one ever goes true,
    // each player can see their partner's thumb, and the pair no longer has to
    // say anything at all.
    const world = held([1]);
    const c = world.creatures[0];
    expect(c).toBeDefined();
    if (!c) return;
    expect(showsOwnMark({ role: "p1" } as never, world, c)).toBe(true);
    expect(showsOwnMark({ role: "p2" } as never, world, c)).toBe(false);
  });

  it("is drawn for the navigator when the navigator is the one pressing", () => {
    const world = held([2]);
    const c = world.creatures[0];
    expect(c).toBeDefined();
    if (!c) return;
    expect(showsOwnMark({ role: "p2" } as never, world, c)).toBe(true);
    expect(showsOwnMark({ role: "p1" } as never, world, c)).toBe(false);
  });

  it("gives way to the squeeze once both hands are on it", () => {
    // Two hands is no longer a fact about a thumb; it is the body giving, and
    // both screens draw that. So the private mark stops and the calipers start —
    // the pair's only confirmation, and it arrives after the commitment.
    const world = held([1, 2]);
    const c = world.creatures[0];
    expect(c).toBeDefined();
    if (!c) return;
    for (const role of ["p1", "p2", "test"] as const) {
      expect(showsOwnMark({ role } as never, world, c)).toBe(false);
    }
  });

  it("is nothing on any screen while nobody is pressing", () => {
    const world = held([]);
    const c = world.creatures[0];
    expect(c).toBeDefined();
    if (!c) return;
    for (const role of ROLES) expect(showsOwnMark({ role } as never, world, c)).toBe(false);
  });
});

describe("the frames", () => {
  for (const role of ROLES) {
    it(`draw a weight being pressed on ${role} without a throw`, () => {
      // One hand, then both: the mark, the calipers closing, and the crush.
      const run = frames(role, TPB * 4, [press(TPB, 1), press(TPB * 2, 2)]);
      expect(run.ctx.calls).toBeGreaterThan(1000);
    });
  }
});

describe("the siren", () => {
  it("asks both seats to speak, because neither can see the other's thumb", () => {
    // `TALKER` says "both" for this body (`comms-talker.ts`), the value the
    // balloon and the gum already use — and here it means the sharper thing:
    // not *one of you can see this*, but *neither of you can*.
    expect(commsCall(held([]))).toEqual({ p1: true, p2: true });
  });
});
