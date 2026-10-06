import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type BatonBead,
  type BatonState,
  batonBoss,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { beadPoint } from "../src/baton-bead-draw.js";
import { batonThrown, throwPoint } from "../src/baton-knock.js";
import { computeLayout } from "../src/layout.js";
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
 * THE BATON's bead thrown back up the arm (`baton-knock.ts`): the wrong colour
 * knocks it two sockets back and a slow socket shakes it one, and the rule
 * does both in a tick. What is held here is that the picture puts a throw
 * between the two — out of where it was, up past the socket, and into it —
 * and that the throw is over in under a beat, with nothing kept.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

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

function bead(world: World): BatonBead {
  const first = arm(world).beads[0];
  if (first === undefined) throw new Error("the arm has no bead");
  return first;
}

/** The arm out and the bead sitting in the top socket. */
function sitting(world: World): void {
  for (let i = 0; i < (CFG.batonUnfoldBeats + 1) * TPB; i++) step(world, []);
  if (arm(world).stage !== "passing") throw new Error("the bead never sat");
}

/** The bead played into its knock: launched, then a bolt of the other colour through it. */
function knocked(world: World): BatonBead {
  sitting(world);
  const b = arm(world);
  const one = bead(world);
  // Down two sockets first, by hand: a knock from the top socket has nowhere to go.
  one.socket = 2;
  step(world, [
    { tick: world.tick, player: 1, command: { kind: "cannonCol", col: b.col } },
    { tick: world.tick, player: 1, command: { kind: "guard" } },
  ]);
  const wrong = one.color === "red" ? "cyan" : "red";
  step(world, [{ tick: world.tick, player: 2, command: { kind: "fire", color: wrong } }]);
  for (let i = 0; i < 3 * TPB && one.backTick < 0; i++) step(world, []);
  if (one.backTick < 0) throw new Error("the bolt never knocked the bead");
  return one;
}

describe("THE BATON's bead thrown back", () => {
  it("is thrown from where the bolt met it, up past its socket, and into it", () => {
    const world = opened();
    const one = knocked(world);
    expect(one.socket).toBe(0);
    expect(one.flying).toBe(false);
    const l = computeLayout(VIEWPORT, CFG, "test");
    const x = 100;
    const start = throwPoint(l, CFG, one, x, 0);
    const end = throwPoint(l, CFG, one, x, 1);
    const mid = throwPoint(l, CFG, one, x, 0.7);
    const socketY = l.gridTop + l.tile / 2;
    expect(start.y).toBeCloseTo(l.gridTop + (one.backFromMilli / 1000) * l.tile + l.tile / 2, 5);
    expect(end.y).toBeCloseTo(socketY, 5);
    // Rising past the socket before it drops in: thrown, not slid.
    expect(mid.y).toBeLessThan(socketY);
    // And the cue rides it: the point the bead is drawn at is the throw's.
    const at = beadPoint(l, CFG, arm(world), one, world.tick + 1);
    expect(at.y).toBeGreaterThan(socketY);
  });

  it("is over in under a beat, and the bead sits where the rule put it", () => {
    const world = opened();
    const one = knocked(world);
    expect(batonThrown(CFG, one, one.backTick)).toBe(0);
    expect(batonThrown(CFG, one, one.backTick + TPB)).toBeNull();
    const l = computeLayout(VIEWPORT, CFG, "test");
    const settled = beadPoint(l, CFG, arm(world), one, one.backTick + TPB);
    expect(settled.y).toBeCloseTo(l.gridTop + l.tile / 2, 5);
  });

  for (const role of ROLES) {
    it(`draws the throw's trail and the bolt's ring for ${role}`, () => {
      const thrown = opened();
      knocked(thrown);
      // The same knock with the throw taken out: everything else on the
      // screen — the grey panels, the arm — is the same picture.
      const still = opened();
      knocked(still).backTick = -1;
      const a = runFrames(thrown, role, 6, { every: 3 }).ctx.calls;
      const b = runFrames(still, role, 6, { every: 3 }).ctx.calls;
      expect(a).toBeGreaterThan(b);
    });
  }
});
