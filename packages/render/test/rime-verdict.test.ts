import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  RIME_FULL_MILLI,
  type RimeAsk,
  type RimePhase,
  rimeBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  RIME_CORE_MARK,
  RIME_HULL_MARK,
  RIME_ICICLE_MARK,
  RIME_LEFT_MARK,
  RIME_RIGHT_MARK,
  RimeVerdicts,
} from "../src/rime-verdicts.js";
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
 * **THE RIME's marks answer a touch the way every mark does**
 * (`rime-verdicts.ts`, `.claude/skills/new-boss` §5): each half wears the halo
 * on its own seat's screen and the partner's ring and clock on the other's
 * while a wipe or the whiteout is lit on it with frost still on it, and a seat
 * already wiped clear in the whiteout sees the half still frosted; the core,
 * the hull under the lens and the hull under the icicle are either seat's, and
 * halo on both screens with nobody's clock; each of the lens's words lands on
 * the mark it names; a step run out reddens only what it asked; and the
 * verdict reaches the field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("rime");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The lens in `phase` since a beat ago, `ask` the step under the cursor, `clear` the halves wiped to nought. */
function at(
  world: World,
  phase: RimePhase,
  ask: RimeAsk = "left",
  clear: [boolean, boolean] = [false, false],
  bared = true,
): void {
  const s = rimeBoss(world);
  if (s === null) throw new Error("the rime wave stood no lens");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.bared = bared;
  s.rimeMilli = [clear[0] ? 0 : RIME_FULL_MILLI, clear[1] ? 0 : RIME_FULL_MILLI];
  s.steps[0] = { ask, color: "either", beats: 4, offset: 2 };
}

function frame(role: ViewRole, arrange: (world: World) => void, said: SimEvent[] = []): string {
  const world = stood();
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

describe("THE RIME's marks asking", () => {
  const lit =
    (ask: RimeAsk, clear?: [boolean, boolean], bared = true) =>
    (w: World) =>
      at(w, "lit", ask, clear, bared);
  const rest = (w: World) => at(w, "rest");

  it("haloes each seat's own half through the whiteout, and shows it the partner's waited on", () => {
    for (const role of ["p1", "p2"] as const) {
      expect(halos(role, lit("both"))).toBeGreaterThan(halos(role, lit("both", [true, true])));
      expect(clocks(role, lit("both"))).toBeGreaterThan(clocks(role, lit("both", [true, true])));
    }
    expect(clocks("test", lit("both"))).toBe(clocks("test", lit("both", [true, true])));
  });

  it("asks only the half a wipe names, of its own seat", () => {
    expect(halos("p1", lit("left"))).toBeGreaterThan(halos("p1", rest));
    expect(clocks("p1", lit("left"))).toBe(clocks("p1", rest));
    expect(halos("p2", lit("left"))).toBe(halos("p2", rest));
    expect(clocks("p2", lit("left"))).toBeGreaterThan(clocks("p2", rest));
  });

  it("shows a seat already wiped clear the half still frosted", () => {
    const pilotClear = lit("both", [true, false]);
    const both = lit("both", [true, true]);
    expect(halos("p1", pilotClear)).toBe(halos("p1", both));
    expect(clocks("p1", pilotClear)).toBeGreaterThan(clocks("p1", both));
    expect(halos("p2", pilotClear)).toBeGreaterThan(halos("p2", both));
    expect(clocks("p2", pilotClear)).toBe(clocks("p2", both));
  });

  it.each(ROLES)("haloes the core, the surge and the icicle on %s, and waits on nobody", (role) => {
    for (const ask of ["fire", "shield", "icicle"] as const) {
      const quiet = ask === "fire" ? lit("fire", undefined, false) : rest;
      expect(halos(role, lit(ask))).toBeGreaterThan(halos(role, quiet));
      expect(clocks(role, lit(ask))).toBe(clocks(role, quiet));
    }
  });
});

describe("THE RIME's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new RimeVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [
      at(RIME_CORE_MARK),
      at(RIME_LEFT_MARK),
      at(RIME_RIGHT_MARK),
      at(RIME_HULL_MARK),
      at(RIME_ICICLE_MARK),
    ];
  };
  const col = 5;
  const light = (ask: RimeAsk): SimEvent => ({ type: "rimeLight", ask, col });

  it("lands each of the lens's words on the mark it names", () => {
    const n = null;
    expect(on([{ type: "rimeClear", side: 0, wipes: 1, col }])).toEqual([n, true, n, n, n]);
    expect(on([{ type: "rimeClear", side: 1, wipes: 1, col }])).toEqual([n, n, true, n, n]);
    expect(on([light("both"), { type: "rimeBare", col }])).toEqual([n, true, true, n, n]);
    expect(on([{ type: "rimeHit", hits: 1, col }])).toEqual([true, n, n, n, n]);
    expect(on([light("shield"), { type: "rimeBlock", col }])).toEqual([n, n, n, true, n]);
    expect(on([light("icicle"), { type: "rimeBlock", col }])).toEqual([n, n, n, n, true]);
    expect(on([{ type: "rimeScatter", side: 0, col }])).toEqual([false, n, n, n, n]);
    expect(on([{ type: "rimeBare", col }])).toEqual([n, n, n, n, n]);
  });

  it("greens only the half a wipe cleared, though the core bares with it", () => {
    const n = null;
    const cleared: SimEvent[] = [
      light("right"),
      { type: "rimeClear", side: 1, wipes: 2, col },
      { type: "rimeBare", col },
    ];
    expect(on(cleared)).toEqual([n, n, true, n, n]);
  });

  it("reddens on a step run out only what it asked", () => {
    const n = null;
    const frost = (side: 0 | 1): SimEvent => ({ type: "rimeFrost", side, col });
    const miss: SimEvent = { type: "rimeMiss", col };
    expect(on([light("left"), frost(0)])).toEqual([n, false, n, n, n]);
    expect(on([light("right"), frost(1)])).toEqual([n, n, false, n, n]);
    expect(on([light("shield"), { type: "rimeCloud", col }])).toEqual([n, n, n, false, n]);
    expect(on([light("both"), miss])).toEqual([n, false, false, n, n]);
    expect(on([light("fire"), miss])).toEqual([false, n, n, n, n]);
    expect(on([light("icicle"), miss])).toEqual([n, n, n, n, false]);
  });

  it("forgets on reset", () => {
    const v = new RimeVerdicts();
    v.ingest([light("fire")]);
    v.clear();
    v.ingest([{ type: "rimeMiss", col }]);
    expect(v.verdicts.at(RIME_CORE_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [light("fire"), { type: "rimeMiss", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
