import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type HalterAsk,
  type HalterPhase,
  halterBoss,
  halterCoreAsks,
  halterGripAsks,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import {
  HALTER_CORE_MARK,
  HALTER_LEFT_GRIP_MARK,
  HALTER_RIGHT_GRIP_MARK,
  HalterVerdicts,
} from "../src/halter-verdicts.js";
import { rgba } from "../src/hex.js";
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
 * **THE HALTER's marks answer a touch the way every mark does**
 * (`halter-verdicts.ts`, `.claude/skills/new-boss` §5): the lit segment's
 * grips wear the halo on the gripper's screen and the partner's ring and
 * clock on the resting seat's; on a guard they ask both seats until one has
 * a grip down, and then only that one; the bared core on a fire step is
 * either seat's, and halos on both screens with nobody's clock; each of the
 * seam's words lands on the mark it names; and the verdict reaches the
 * field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("halter");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The seam in `phase` since a beat ago, `ask` the step under the cursor, `gripping` the seat with a grip down. */
function at(
  world: World,
  phase: HalterPhase,
  ask: HalterAsk = "left",
  gripping: 0 | 1 | null = null,
  bared = false,
): void {
  const s = halterBoss(world);
  if (s === null) throw new Error("the halter wave hung no seam");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.bared = bared;
  s.grips = [gripping === 0 ? 1 : 0, gripping === 1 ? 1 : 0];
  s.steps[0] = { ask, color: "either", beats: 4 };
}

function frame(role: ViewRole, arrange: (world: World) => void, said: SimEvent[] = []): string {
  const world = hung();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      w.events.length = 0;
      if (tick === 2) w.events.push(...said);
    },
  });
  return log.join("|");
}

const count = (text: string, what: string) => text.split(what).length - 1;
const halos = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), HALO);
const clocks = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), CLOCK);

describe("THE HALTER's marks asking", () => {
  const as =
    (phase: HalterPhase, ask: HalterAsk, gripping: 0 | 1 | null = null, bared = false) =>
    (w: World) =>
      at(w, phase, ask, gripping, bared);
  const rest = (w: World) => at(w, "pause");

  it("asks the left segment's chord of the pilot and the right's of the navigator", () => {
    const world = hung();
    at(world, "lit", "left");
    const s = halterBoss(world);
    if (s === null) throw new Error("no seam");
    expect([halterGripAsks(s, 0), halterGripAsks(s, 1)]).toEqual([true, false]);
    at(world, "lit", "right");
    expect([halterGripAsks(s, 0), halterGripAsks(s, 1)]).toEqual([false, true]);
    at(world, "lit", "fire", null, true);
    expect([halterGripAsks(s, 0), halterGripAsks(s, 1), halterCoreAsks(s)]).toEqual([
      false,
      false,
      true,
    ]);
  });

  it.each([
    ["left", "p1", "p2"],
    ["right", "p2", "p1"],
  ] as const)("waits on the %s chord on the resting screen only", (ask, gripper, rester) => {
    expect(clocks(rester, as("lit", ask))).toBeGreaterThan(clocks(rester, rest));
    expect(clocks(gripper, as("lit", ask))).toBe(clocks(gripper, rest));
    expect(halos(gripper, as("lit", ask))).toBeGreaterThan(halos(rester, as("lit", ask)));
    expect(clocks("test", as("lit", ask))).toBe(clocks("test", rest));
  });

  it("asks the guard's chord of both seats, until one has a grip down", () => {
    const free = as("lit", "guard");
    expect(clocks("p1", free)).toBe(clocks("p1", rest));
    expect(halos("p1", free)).toBeGreaterThan(halos("p1", rest));
    const world = hung();
    at(world, "lit", "guard", 1);
    const s = halterBoss(world);
    if (s === null) throw new Error("no seam");
    expect([halterGripAsks(s, 0), halterGripAsks(s, 1)]).toEqual([false, true]);
    expect(clocks("p1", as("lit", "guard", 1))).toBeGreaterThan(clocks("p1", free));
    expect(clocks("p2", as("lit", "guard", 1))).toBe(clocks("p2", free));
  });

  it.each(ROLES)("haloes the core on %s once it is bare, and waits on nobody", (role) => {
    const bare = as("lit", "fire", null, true);
    expect(halos(role, bare)).toBeGreaterThan(halos(role, as("lit", "fire")));
    expect(clocks(role, bare)).toBe(clocks(role, rest));
  });
});

describe("THE HALTER's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new HalterVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [at(HALTER_LEFT_GRIP_MARK), at(HALTER_RIGHT_GRIP_MARK), at(HALTER_CORE_MARK)];
  };
  const col = 5;
  const n = null;

  it("lands each of the seam's words on the mark it names", () => {
    expect(on([{ type: "halterCrack", side: 0, col }])).toEqual([true, true, n]);
    expect(on([{ type: "halterGuard", col }])).toEqual([true, true, n]);
    expect(on([{ type: "halterHit", hits: 1, col }])).toEqual([n, n, true]);
    expect(on([{ type: "halterSlip", seat: 1, col }])).toEqual([false, false, n]);
    expect(on([{ type: "halterStartle", seat: 2, col }])).toEqual([false, false, n]);
    expect(on([{ type: "halterShut", col }])).toEqual([false, false, n]);
    expect(on([{ type: "halterSeal", col }])).toEqual([false, false, n]);
    expect(on([{ type: "halterMiss", col }])).toEqual([n, n, false]);
    expect(on([{ type: "halterSettle", seat: 2, col }])).toEqual([n, n, n]);
  });

  it("forgets on reset", () => {
    const v = new HalterVerdicts();
    v.ingest([{ type: "halterMiss", col }]);
    v.clear();
    expect(v.verdicts.at(HALTER_CORE_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "pause");
    const missed: SimEvent[] = [{ type: "halterShut", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
