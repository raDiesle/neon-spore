import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SimEvent,
  startWave,
  step,
  type TrivetAsk,
  type TrivetPhase,
  ticksPerBeat,
  trivetBoss,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  TRIVET_FRONT_MARK,
  TRIVET_HUB_MARK,
  TRIVET_NEEDLE_MARK,
  TRIVET_REAR_MARK,
  TrivetVerdicts,
} from "../src/trivet-verdicts.js";
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
 * **THE TRIVET's marks answer a touch the way every mark does**
 * (`trivet-verdicts.ts`, `.claude/skills/new-boss` §5): each outer foot wears
 * the halo on its own seat's screen and the partner's ring and clock on the
 * other's while the lit step wants its chord and the chord is not held, and a
 * seat already holding in a brace sees the foot still up; the hub and the
 * hull under the needle are either seat's, and halo on both screens with
 * nobody's clock; each of the stand's words lands on the mark it names; a
 * step run out reddens only what it asked; and the verdict reaches the
 * field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The hub's face, lit from inside while its step counts down, drawn in the
 * hub's own frame at its origin (`trivet-marks.ts`): the step's light, not a
 * mark's halo, so it is not counted as one. */
const FACE = /^createRadialGradient\(0, 0, 0, 0, 0, (?!1\))/;
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);
/** Both pads of a two-pad chord. */
const CHORD = 0b11;

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("trivet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The stand in `phase` since a beat ago, `ask` the step under the cursor, `held` each seat's chord down. */
function at(
  world: World,
  phase: TrivetPhase,
  ask: TrivetAsk = "front",
  held: [boolean, boolean] = [false, false],
  hubLit = true,
): void {
  const s = trivetBoss(world);
  if (s === null) throw new Error("the trivet wave stood no stand");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.hubLit = hubLit;
  s.padsDown = [held[0] ? CHORD : 0, held[1] ? CHORD : 0];
  s.steps[0] = { ask, pads: 2, color: "either", beats: 4, offset: -2 };
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
const halos = (role: ViewRole, arrange: (w: World) => void) =>
  frame(role, arrange)
    .split("|")
    .filter((c) => c.startsWith(HALO) && !FACE.test(c)).length;
const clocks = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), CLOCK);

describe("THE TRIVET's marks asking", () => {
  const lit =
    (ask: TrivetAsk, held?: [boolean, boolean], hubLit = true) =>
    (w: World) =>
      at(w, "lit", ask, held, hubLit);
  const rest = (w: World) => at(w, "rest");

  it("haloes each seat's own foot through a brace, and shows it the partner's waited on", () => {
    for (const role of ["p1", "p2"] as const) {
      expect(halos(role, lit("both"))).toBeGreaterThan(halos(role, lit("both", [true, true])));
      expect(clocks(role, lit("both"))).toBeGreaterThan(clocks(role, lit("both", [true, true])));
    }
    expect(clocks("test", lit("both"))).toBe(clocks("test", lit("both", [true, true])));
  });

  it("asks only the foot a chord names, of its own seat", () => {
    expect(halos("p1", lit("front"))).toBeGreaterThan(halos("p1", rest));
    expect(clocks("p1", lit("front"))).toBe(clocks("p1", rest));
    expect(halos("p2", lit("front"))).toBe(halos("p2", rest));
    expect(clocks("p2", lit("front"))).toBeGreaterThan(clocks("p2", rest));
  });

  it("shows a seat already holding the foot still up", () => {
    const pilotHeld = lit("both", [true, false]);
    const both = lit("both", [true, true]);
    expect(halos("p1", pilotHeld)).toBe(halos("p1", both));
    expect(clocks("p1", pilotHeld)).toBeGreaterThan(clocks("p1", both));
    expect(halos("p2", pilotHeld)).toBeGreaterThan(halos("p2", both));
    expect(clocks("p2", pilotHeld)).toBe(clocks("p2", both));
  });

  it("asks the lurch's shot only once the foot it leans on is held", () => {
    // The lurch leans on the front foot: held, the hub asks on both screens.
    expect(halos("p2", lit("tip", [true, false]))).toBeGreaterThan(halos("p2", rest));
    expect(halos("p2", lit("tip"))).toBe(halos("p2", rest));
  });

  it.each(ROLES)("haloes the hub and the needle on %s, and waits on nobody", (role) => {
    for (const ask of ["fire", "needle"] as const) {
      const quiet = ask === "fire" ? lit("fire", undefined, false) : rest;
      expect(halos(role, lit(ask))).toBeGreaterThan(halos(role, quiet));
      expect(clocks(role, lit(ask))).toBe(clocks(role, quiet));
    }
  });
});

describe("THE TRIVET's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new TrivetVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [
      at(TRIVET_HUB_MARK),
      at(TRIVET_FRONT_MARK),
      at(TRIVET_REAR_MARK),
      at(TRIVET_NEEDLE_MARK),
    ];
  };
  const col = 5;
  const light = (ask: TrivetAsk): SimEvent => ({ type: "trivetLight", ask, col });

  it("lands each of the stand's words on the mark it names", () => {
    const n = null;
    expect(on([{ type: "trivetPlant", side: 0, level: 1, col }])).toEqual([n, true, n, n]);
    expect(on([{ type: "trivetPlant", side: 1, level: 1, col }])).toEqual([n, n, true, n]);
    expect(on([light("both"), { type: "trivetBrace", col }])).toEqual([n, true, true, n]);
    expect(on([{ type: "trivetHit", hits: 1, col }])).toEqual([true, n, n, n]);
    expect(on([light("needle"), { type: "trivetTurn", col }])).toEqual([n, n, n, true]);
    expect(on([{ type: "trivetSlip", side: 1, col }])).toEqual([n, n, false, n]);
  });

  it("reddens on a step run out only what it asked", () => {
    const n = null;
    const spring = (side: 0 | 1): SimEvent => ({ type: "trivetSpring", side, col });
    const miss: SimEvent = { type: "trivetMiss", col };
    expect(on([light("front"), spring(0)])).toEqual([n, false, n, n]);
    expect(on([light("rear"), spring(1)])).toEqual([n, n, false, n]);
    expect(on([light("both"), { type: "trivetRock", col }])).toEqual([n, false, false, n]);
    expect(on([light("fire"), miss])).toEqual([false, n, n, n]);
    expect(on([light("tip"), miss])).toEqual([false, n, n, n]);
    expect(on([light("needle"), miss])).toEqual([n, n, n, false]);
  });

  it("forgets on reset", () => {
    const v = new TrivetVerdicts();
    v.ingest([light("fire")]);
    v.clear();
    v.ingest([{ type: "trivetMiss", col }]);
    expect(v.verdicts.at(TRIVET_HUB_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [light("fire"), { type: "trivetMiss", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
