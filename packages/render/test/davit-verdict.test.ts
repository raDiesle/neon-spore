import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type DavitAsk,
  type DavitPhase,
  davitBoss,
  davitLooseAsks,
  davitSteerAsks,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { DAVIT_BOOM_MARK, DAVIT_HOOK_MARK, DavitVerdicts } from "../src/davit-verdicts.js";
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
 * **THE DAVIT's marks answer a touch the way every mark does**
 * (`davit-verdicts.ts`, `.claude/skills/new-boss` §5): on a swing the boom
 * wears the halo on its steerer's screen and the hook on its drawer's, each
 * with the partner's ring and clock on the other's; on a reland both ask
 * both seats until one thumb holds the boom on its target, and then the boom
 * asks only that seat and the hook only the other; the lit pivot is either
 * seat's, and halos on both screens with nobody's clock; each of the boom's
 * words lands on the mark it names; and the verdict reaches the field's
 * frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);
const LEAN = -20_000;

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("davit");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The boom in `phase` since a beat ago, `ask` the step under the cursor, `steering` the seat on target. */
function at(
  world: World,
  phase: DavitPhase,
  ask: DavitAsk = "left",
  steering: 0 | 1 | null = null,
  pivotLit = false,
): void {
  const s = davitBoss(world);
  if (s === null) throw new Error("the davit wave hung no boom");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.pivotLit = pivotLit;
  s.tiltMilli = [steering === 0 ? LEAN : 1_000_000, steering === 1 ? LEAN : 1_000_000];
  s.steps[0] = { ask, leanMilli: LEAN, rangeMilli: 5_000, color: "either", beats: 4 };
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

describe("THE DAVIT's marks asking", () => {
  const as =
    (phase: DavitPhase, ask: DavitAsk, steering: 0 | 1 | null = null, pivotLit = false) =>
    (w: World) =>
      at(w, phase, ask, steering, pivotLit);
  const rest = (w: World) => at(w, "rest");

  it("asks a swing's steer of one seat and its loose of the other", () => {
    const world = hung();
    at(world, "lit", "left");
    const s = davitBoss(world);
    if (s === null) throw new Error("no boom");
    expect([davitSteerAsks(s, 0), davitSteerAsks(s, 1)]).toEqual([true, false]);
    expect([davitLooseAsks(s, 0), davitLooseAsks(s, 1)]).toEqual([false, true]);
    at(world, "lit", "right");
    expect([davitSteerAsks(s, 0), davitSteerAsks(s, 1)]).toEqual([false, true]);
    expect([davitLooseAsks(s, 0), davitLooseAsks(s, 1)]).toEqual([true, false]);
  });

  it.each(["left", "right"] as const)(
    "waits on the partner's mark on both screens, on %s",
    (ask) => {
      expect(clocks("p1", as("lit", ask))).toBeGreaterThan(clocks("p1", rest));
      expect(clocks("p2", as("lit", ask))).toBeGreaterThan(clocks("p2", rest));
      expect(halos("test", as("lit", ask))).toBeGreaterThan(halos("p1", as("lit", ask)));
      expect(clocks("test", as("lit", ask))).toBe(clocks("test", rest));
    },
  );

  it("asks both of both seats on a reland, until one holds the boom", () => {
    const free = as("lit", "reland");
    expect(clocks("p1", free)).toBe(clocks("p1", rest));
    expect(halos("p1", free)).toBeGreaterThan(halos("p1", as("lit", "left")));
    const world = hung();
    at(world, "lit", "reland", 0);
    const s = davitBoss(world);
    if (s === null) throw new Error("no boom");
    expect([davitSteerAsks(s, 0), davitSteerAsks(s, 1)]).toEqual([true, false]);
    expect([davitLooseAsks(s, 0), davitLooseAsks(s, 1)]).toEqual([false, true]);
    expect(clocks("p1", as("lit", "reland", 0))).toBeGreaterThan(clocks("p1", free));
    expect(clocks("p2", as("lit", "reland", 0))).toBeGreaterThan(clocks("p2", free));
  });

  it.each(ROLES)("haloes the hook on %s once the pivot is lit, and waits on nobody", (role) => {
    const lit = as("lit", "fire", null, true);
    expect(halos(role, lit)).toBeGreaterThan(halos(role, as("lit", "fire")));
    expect(clocks(role, lit)).toBe(clocks(role, rest));
  });
});

describe("THE DAVIT's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new DavitVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [at(DAVIT_BOOM_MARK), at(DAVIT_HOOK_MARK)];
  };
  const col = 5;
  const n = null;

  it("lands each of the boom's words on the mark it names", () => {
    expect(on([{ type: "davitLoose", swing: 0, looses: 1, col }])).toEqual([true, true]);
    expect(on([{ type: "davitReland", side: 1, col }])).toEqual([true, true]);
    expect(on([{ type: "davitHit", hits: 1, col }])).toEqual([n, true]);
    expect(on([{ type: "davitDrift", side: 0, col }])).toEqual([false, n]);
    expect(on([{ type: "davitSlack", side: 1, col }])).toEqual([n, false]);
    expect(on([{ type: "davitSway", swing: 1, col }])).toEqual([false, false]);
    expect(on([{ type: "davitDim", col }])).toEqual([false, false]);
    expect(on([{ type: "davitMiss", col }])).toEqual([n, false]);
    expect(on([{ type: "davitPivot", col }])).toEqual([n, n]);
  });

  it("forgets on reset", () => {
    const v = new DavitVerdicts();
    v.ingest([{ type: "davitMiss", col }]);
    v.clear();
    expect(v.verdicts.at(DAVIT_HOOK_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [{ type: "davitSway", swing: 0, col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
