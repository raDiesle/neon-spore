import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SimEvent,
  type SlingAsk,
  type SlingPhase,
  slingBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  SLING_CUP_MARK,
  SLING_LEFT_MARK,
  SLING_RIGHT_MARK,
  SlingVerdicts,
} from "../src/sling-verdicts.js";
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
 * **THE SLING's marks answer a touch the way every mark does**
 * (`sling-verdicts.ts`, `.claude/skills/new-boss` §5): each cord wears the
 * halo on its own seat's screen and the partner's ring and clock on the
 * other's while a draw is lit on it and not yet loosed, and a seat already
 * loosed in a `both` step sees its partner's cord still waited on; the cup is
 * either seat's, and halos on both screens with nobody's clock; each of the
 * fork's words lands on the mark it names; a step run out reddens only what
 * it asked and was not yet loosed; and the verdict reaches the field's frame
 * on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("sling");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The fork in `phase` since a beat ago, `ask` the step under the cursor, `loosed` each seat's. */
function at(
  world: World,
  phase: SlingPhase,
  ask: SlingAsk = "left",
  loosed: [boolean, boolean] = [false, false],
  yokeLit = true,
): void {
  const s = slingBoss(world);
  if (s === null) throw new Error("the sling wave hung no fork");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.yokeLit = yokeLit;
  s.loosed = [...loosed];
  s.steps[0] = { ask, aim: "left", color: "either", beats: 4 };
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

describe("THE SLING's marks asking", () => {
  const lit =
    (ask: SlingAsk, loosed?: [boolean, boolean], yokeLit = true) =>
    (w: World) =>
      at(w, "lit", ask, loosed, yokeLit);
  const rest = (w: World) => at(w, "rest");

  it("asks the left cord of the pilot and the right of the navigator", () => {
    expect(halos("p1", lit("left"))).toBeGreaterThan(halos("p1", rest));
    expect(clocks("p1", lit("left"))).toBe(clocks("p1", rest));
    expect(clocks("p2", lit("left"))).toBeGreaterThan(clocks("p2", rest));
    expect(halos("p2", lit("right"))).toBeGreaterThan(halos("p2", rest));
    expect(clocks("p1", lit("right"))).toBeGreaterThan(clocks("p1", rest));
    expect(clocks("test", lit("left"))).toBe(clocks("test", rest));
  });

  it("shows a seat already loosed its partner's cord still asked", () => {
    const pilotLoosed = lit("both", [true, false]);
    expect(halos("p1", pilotLoosed)).toBe(halos("p1", lit("both", [true, true])));
    expect(clocks("p1", pilotLoosed)).toBeGreaterThan(clocks("p1", lit("both", [true, true])));
    expect(halos("p2", pilotLoosed)).toBeGreaterThan(halos("p2", lit("both", [true, true])));
    expect(clocks("p2", pilotLoosed)).toBe(clocks("p2", lit("both", [true, true])));
  });

  it.each(ROLES)("haloes the cup on %s with the yoke lit, and waits on nobody", (role) => {
    expect(halos(role, lit("fire"))).toBeGreaterThan(halos(role, lit("fire", undefined, false)));
    expect(clocks(role, lit("fire"))).toBe(clocks(role, rest));
  });
});

describe("THE SLING's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new SlingVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [at(SLING_CUP_MARK), at(SLING_LEFT_MARK), at(SLING_RIGHT_MARK)];
  };
  const col = 5;
  const light = (ask: SlingAsk): SimEvent => ({ type: "slingLight", ask, aim: "left", col });

  it("lands each of the fork's words on the mark it names", () => {
    const n = null;
    expect(on([{ type: "slingLoose", side: 1, draws: 1, col }])).toEqual([n, n, true]);
    expect(on([{ type: "slingSteady", col }])).toEqual([n, true, true]);
    expect(on([{ type: "slingHit", hits: 1, col }])).toEqual([true, n, n]);
    expect(on([{ type: "slingSlack", side: 0, col }])).toEqual([n, false, n]);
    expect(on([{ type: "slingSnap", side: 1, col }])).toEqual([n, n, false]);
  });

  it("reddens on a step run out only what it asked and was not yet loosed", () => {
    const n = null;
    expect(on([light("right"), { type: "slingSpring", side: 1, col }])).toEqual([n, n, false]);
    expect(on([light("both"), { type: "slingDim", col }])).toEqual([n, false, false]);
    const leftLoosed: SimEvent = { type: "slingLoose", side: 0, draws: 1, col };
    expect(on([light("both"), leftLoosed, { type: "slingDim", col }])).toEqual([n, true, false]);
    expect(on([light("fire"), { type: "slingMiss", col }])).toEqual([false, n, n]);
  });

  it("forgets on reset", () => {
    const v = new SlingVerdicts();
    v.ingest([light("fire")]);
    v.clear();
    v.ingest([{ type: "slingMiss", col }]);
    expect(v.verdicts.at(SLING_CUP_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [light("fire"), { type: "slingMiss", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
