import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_SWELL,
  type BatonState,
  batonBoss,
  batonMergeSocket,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { batonDrawRest, batonSocketUnder, batonSwellRest } from "../src/baton-grip.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import type { Field } from "../src/touch.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE BATON's arm as a control** (`baton-grip.ts`): whose thumb each ring
 * answers, and that the answer to the strip changes seats with the beat.
 *
 * The rule is the simulation's (`sim/test/baton-hand.test.ts`); this file
 * proves the picture hands it a thumb with the socket's index on it — and that
 * it hands it to the seat the lock is on and to no other, which is the one
 * thing about this handle that is unlike every other one in the game.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

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

/** The arm unfolded and the bead sitting, which is where every state below starts. */
function sitting(world: World): BatonState {
  for (let i = 0; i < (CFG.batonSockets + 1) * TPB; i++) step(world, []);
  const b = arm(world);
  if (b.stage !== "passing") throw new Error("the bead never sat");
  return b;
}

/** A shell coming away at socket 1, with `seat` locked out of the ship. */
function swelling(world: World, seat: 1 | 2 | null): BatonState {
  const b = sitting(world);
  b.sockets[0] = BATON_SOCKET_DARK;
  b.sockets[1] = BATON_SOCKET_SWELL;
  b.swellSocket = 1;
  b.swellBeat = world.beat;
  const bead = b.beads[0];
  if (bead !== undefined) bead.socket = 2;
  b.lockUntil = [seat === 1 ? world.beat : -1, seat === 2 ? world.beat : -1];
  return b;
}

/** Both beads at rest in the last two sockets, the pair asked for a thumb each. */
function merging(world: World): BatonState {
  const b = sitting(world);
  const first = b.beads[0];
  if (first === undefined) throw new Error("the arm has no bead");
  first.socket = CFG.batonSockets - 1;
  b.beads.push({ ...first, socket: CFG.batonSockets - 2, color: "cyan" });
  b.stage = "merging";
  b.stageBeat = world.beat;
  return b;
}

function fieldWith(seat: 1 | 2, world: World, boss: BatonState): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: DEFAULT_CONFIG,
    boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("the strip's ring", () => {
  it("rests on the socket whose shell is coming away, and nowhere while none is", () => {
    const world = opened();
    const l = layout("p1");
    const b = swelling(world, 1);
    expect(batonSwellRest(l, CFG, b)).not.toBeNull();
    b.swellSocket = -1;
    expect(batonSwellRest(l, CFG, b)).toBeNull();
  });

  it("answers the seat the beat locked out, with the socket on the hold", () => {
    const world = opened();
    const l = layout("p1");
    const b = swelling(world, 1);
    const at = batonSwellRest(l, CFG, b);
    if (at === null) throw new Error("no ring on the swelling socket");
    const touch = batonSocketUnder(l, at.x, at.y, fieldWith(1, world, b));
    expect(touch?.player).toBe(1);
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "batonSocket",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: 1,
    });
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "batonSocket", player: 1, id: 1 });
  });

  it("changes seats with the lock, and answers neither on a beat nobody acted in", () => {
    const world = opened();
    const l = layout("p2");
    const b = swelling(world, 2);
    const at = batonSwellRest(l, CFG, b);
    if (at === null) throw new Error("no ring on the swelling socket");
    expect(batonSocketUnder(l, at.x, at.y, fieldWith(2, world, b))?.command).toMatchObject({
      id: 1,
    });
    expect(batonSocketUnder(l, at.x, at.y, fieldWith(1, world, b))).toBeNull();
    b.lockUntil = [-1, -1];
    expect(batonSocketUnder(l, at.x, at.y, fieldWith(2, world, b))).toBeNull();
  });
});

describe("the draw's two rings", () => {
  it("rest one per seat, on that seat's own bead, and only under merging", () => {
    const world = opened();
    const l = layout("p1");
    const b = merging(world);
    const upper = batonDrawRest(l, CFG, b, 1);
    const waited = batonDrawRest(l, CFG, b, 2);
    expect(upper).not.toBeNull();
    expect(waited).not.toBeNull();
    expect(upper?.y).toBeLessThan(waited?.y ?? 0);
    b.stage = "passing";
    expect(batonDrawRest(l, CFG, b, 1)).toBeNull();
  });

  it("answer their own seat and refuse the other's, socket and all", () => {
    const world = opened();
    const l = layout("p2");
    const b = merging(world);
    const mine = batonDrawRest(l, CFG, b, 2);
    if (mine === null) throw new Error("no ring on the bead that waited");
    expect(batonSocketUnder(l, mine.x, mine.y, fieldWith(2, world, b))?.command).toMatchObject({
      id: batonMergeSocket(CFG, 2),
    });
    // Player 1's thumb there is not his ring: his own is a socket higher, and
    // the simulation refuses a thumb on the other seat's bead out loud
    // (`sim/baton-hand.ts`). What the picture does is send his own socket.
    expect(batonSocketUnder(l, mine.x, mine.y, fieldWith(1, world, b))).toBeNull();
  });
});

describe("on the field", () => {
  for (const role of ROLES) {
    it(`draws the swelling socket and both of the arm's rings for ${role}`, () => {
      const world = opened();
      const swell = runFrames(world, role, TPB * 2, {
        onTick: (tick, w) => {
          step(w, []);
          if (tick === 0) swelling(w, 1);
        },
      });
      expect(swell.ctx.calls).toBeGreaterThan(500);
      const drawn = runFrames(opened(), role, TPB * 2, {
        onTick: (tick, w) => {
          step(w, []);
          if (tick === 0) merging(w);
        },
      });
      expect(drawn.ctx.calls).toBeGreaterThan(500);
    });
  }
});
