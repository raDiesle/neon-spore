import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type PlumbAsk,
  type PlumbPhase,
  plumbBoss,
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
  PLUMB_CORE_MARK,
  PLUMB_LEFT_MARK,
  PLUMB_RIGHT_MARK,
  PlumbVerdicts,
} from "../src/plumb-verdicts.js";
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
 * **THE PLUMB's marks answer a touch the way every mark does**
 * (`plumb-verdicts.ts`, `.claude/skills/new-boss` §5): each stone wears the
 * halo on its own seat's screen and the partner's ring and clock on the
 * other's while a level step is lit and that seat is not yet pulling towards
 * true, and a seat already pulling sees its partner's stone still waited on;
 * the core is either seat's, and halos on both screens with nobody's clock;
 * each of the bob's words lands on the mark it names; a step run out reddens
 * only what it asked; and the verdict reaches the field's frame on every
 * screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);
/** A lean to the left, which wants both pulls to the right. */
const SKEW = -600;

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("plumb");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The bob in `phase` since a beat ago, `ask` the step under the cursor, `pulls` each seat's pull. */
function at(
  world: World,
  phase: PlumbPhase,
  ask: PlumbAsk = "left",
  pulls: [number, number] = [0, 0],
  coreLit = true,
): void {
  const s = plumbBoss(world);
  if (s === null) throw new Error("the plumb wave hung no bob");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.coreLit = coreLit;
  s.pullMilli = [...pulls];
  s.steps[0] = { ask, skewMilli: SKEW, rangeMilli: 100, color: "either", beats: 4 };
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

describe("THE PLUMB's marks asking", () => {
  const lit =
    (ask: PlumbAsk, pulls?: [number, number], coreLit = true) =>
    (w: World) =>
      at(w, "lit", ask, pulls, coreLit);
  const rest = (w: World) => at(w, "rest");
  const both: [number, number] = [300, 300];

  it.each(["left", "right", "both"] as const)(
    "asks both stones on a %s level, each of its own seat",
    (ask) => {
      for (const role of ["p1", "p2"] as const) {
        expect(halos(role, lit(ask))).toBeGreaterThan(halos(role, lit(ask, both)));
        expect(clocks(role, lit(ask))).toBeGreaterThan(clocks(role, lit(ask, both)));
      }
      expect(clocks("test", lit(ask))).toBe(clocks("test", lit(ask, both)));
    },
  );

  it("shows a seat already pulling towards true its partner's stone still asked", () => {
    const pilotPulling = lit("left", [300, 0]);
    expect(halos("p1", pilotPulling)).toBe(halos("p1", lit("left", both)));
    expect(clocks("p1", pilotPulling)).toBeGreaterThan(clocks("p1", lit("left", both)));
    expect(halos("p2", pilotPulling)).toBeGreaterThan(halos("p2", lit("left", both)));
    expect(clocks("p2", pilotPulling)).toBe(clocks("p2", lit("left", both)));
  });

  it("still asks a stone pulled the wrong way", () => {
    expect(halos("p1", lit("left", [-300, 300]))).toBe(halos("p1", lit("left", [0, 300])));
  });

  it.each(ROLES)("haloes the lit core on %s, and waits on nobody", (role) => {
    expect(halos(role, lit("fire"))).toBeGreaterThan(halos(role, lit("fire", undefined, false)));
    expect(clocks(role, lit("fire"))).toBe(clocks(role, rest));
  });
});

describe("THE PLUMB's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new PlumbVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [at(PLUMB_CORE_MARK), at(PLUMB_LEFT_MARK), at(PLUMB_RIGHT_MARK)];
  };
  const col = 5;
  const light = (ask: PlumbAsk): SimEvent => ({ type: "plumbLight", ask, col });

  it("lands each of the bob's words on the mark it names", () => {
    const n = null;
    expect(on([{ type: "plumbSettle", side: 0, level: 1, col }])).toEqual([n, true, true]);
    expect(on([{ type: "plumbSteady", col }])).toEqual([n, true, true]);
    expect(on([{ type: "plumbHit", hits: 1, col }])).toEqual([true, n, n]);
    expect(on([{ type: "plumbDrift", side: 1, col }])).toEqual([n, n, false]);
    expect(on([{ type: "plumbFlare", side: 0, col }])).toEqual([n, false, n]);
  });

  it("reddens on a step run out only what it asked", () => {
    const n = null;
    expect(on([light("right"), { type: "plumbSwing", side: 1, col }])).toEqual([n, false, false]);
    expect(on([light("both"), { type: "plumbDim", col }])).toEqual([n, false, false]);
    expect(on([light("fire"), { type: "plumbMiss", col }])).toEqual([false, n, n]);
  });

  it("forgets on reset", () => {
    const v = new PlumbVerdicts();
    v.ingest([light("fire")]);
    v.clear();
    v.ingest([{ type: "plumbMiss", col }]);
    expect(v.verdicts.at(PLUMB_CORE_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [light("fire"), { type: "plumbMiss", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
