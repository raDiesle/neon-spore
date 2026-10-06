import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  BATON_LEVELS,
  BATON_SOCKET_LIT,
  type BatonBead,
  type BatonState,
  batonArmCol,
  batonBoss,
  batonSlot,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { socketPoint, socketRoomBelow } from "../src/baton-socket-draw.js";
import { computeLayout, tileCX, tileCY } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
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
 * THE BATON's `pair` level, drawn (`sim/baton-arm.ts`): two arms, each in its
 * own column, every socket of the second found on the second — the spine,
 * the rings the thumbs are asked for and the words hung under them. And the
 * `across` level's one arm, laid along its row.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const N = CFG.batonSockets;
/** The second bead's pupil fill (`baton-bead-draw.ts`). */
const TWIN_PUPIL = "#0B0614";

function arm(world: World): BatonState {
  const b = batonBoss(world);
  if (b === null) throw new Error("the baton wave installed no arm");
  return b;
}

/** The wave opened, the arm unfolded, and then hung as the pair level would hang it. */
function paired(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("baton");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < (N + 1) * TPB; i++) step(world, []);
  const b = arm(world);
  const first = b.beads[0];
  if (first === undefined) throw new Error("the arm has no bead");
  const left = batonArmCol(CFG, 2, 0);
  const right = batonArmCol(CFG, 2, 1);
  const second: BatonBead = { ...first, arm: 1, color: "cyan", col: right, fromCol: right };
  b.level = BATON_LEVELS.indexOf("pair");
  b.sockets = Array.from({ length: 2 * N }, () => BATON_SOCKET_LIT);
  b.beads = [{ ...first, col: left, fromCol: left }, second];
  b.col = left;
  return world;
}

/** Every colour and fill a screen set over a run of frames, as one string. */
function drawn(world: World, ticks: number, role: (typeof ROLES)[number]) {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

describe("THE BATON's two arms, drawn", () => {
  const l = computeLayout(VIEWPORT, CFG, "test");

  it("finds the second arm's sockets in its own column, from the top row down", () => {
    const b = arm(paired());
    const top = socketPoint(l, CFG, b, batonSlot(CFG, 1, 0));
    const bottom = socketPoint(l, CFG, b, batonSlot(CFG, 1, N - 1));
    expect(top).toEqual({ x: tileCX(l, batonArmCol(CFG, 2, 1)), y: tileCY(l, 0) });
    expect(bottom.y).toBe(tileCY(l, N - 1));
    expect(socketPoint(l, CFG, b, N - 1).x).toBe(tileCX(l, batonArmCol(CFG, 2, 0)));
    // The first arm's last socket has nothing under it, whatever comes next in the list.
    expect(socketRoomBelow(l, CFG, b, N - 1)).toBeUndefined();
    expect(socketRoomBelow(l, CFG, b, N)).toBeDefined();
  });

  for (const role of ROLES) {
    it(`draws both arms and both beads, neither with the pupil, for ${role}`, () => {
      const world = paired();
      const { calls, text } = drawn(world, 3, role);
      expect(text).toContain(PALETTE.red);
      expect(text).toContain(PALETTE.cyan);
      expect(text).not.toContain(TWIN_PUPIL);
      const one = paired();
      const b = arm(one);
      b.level = BATON_LEVELS.indexOf("twin");
      b.sockets = b.sockets.slice(0, N);
      b.beads = b.beads.slice(0, 1);
      expect(calls).toBeGreaterThan(drawn(one, 3, role).calls * 1.3);
    });
  }
});

describe("THE BATON's arm across, drawn", () => {
  const l = computeLayout(VIEWPORT, CFG, "test");

  /** The wave opened, the arm unfolded, and then laid across as the last level lays it. */
  function across(): World {
    const world = paired();
    const b = arm(world);
    b.level = BATON_LEVELS.indexOf("across");
    b.sockets = b.sockets.slice(0, N);
    b.beads = b.beads.slice(0, 1);
    return world;
  }

  it("finds every socket on the arm's row, a column each from the left", () => {
    const b = arm(across());
    for (let i = 0; i < N; i++)
      expect(socketPoint(l, CFG, b, i)).toEqual({
        x: tileCX(l, i),
        y: tileCY(l, CFG.batonAcrossRow),
      });
  });

  for (const role of ROLES) {
    it(`draws the arm and its bead for ${role}`, () => {
      const { calls, text } = drawn(across(), 3, role);
      expect(calls).toBeGreaterThan(400);
      expect(text).toContain(PALETTE.red);
    });
  }
});
