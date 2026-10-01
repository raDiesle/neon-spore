import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GrindstoneAsk,
  type GrindstonePhase,
  grindstoneBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import {
  GRINDSTONE_AXLE_MARK,
  GRINDSTONE_LEFT_FLAT_MARK,
  GRINDSTONE_LEFT_JAW_MARK,
  GRINDSTONE_RIGHT_FLAT_MARK,
  GRINDSTONE_RIGHT_JAW_MARK,
  GrindstoneVerdicts,
} from "../src/grindstone-verdicts.js";
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
 * **THE GRINDSTONE's marks answer a touch the way every mark does**
 * (`grindstone-verdicts.ts`, `.claude/skills/new-boss` §5): each flat wears
 * the halo on its own seat's screen and the partner's ring and clock on the
 * other's while a pass is lit on it, and each jaw while a clamp is lit and it
 * is not yet held, so a seat already holding sees its partner's jaw still
 * waited on; the axle is either seat's, and halos on both screens with
 * nobody's clock; each of the wheel's words lands on the mark it names; a
 * step run out reddens only what it asked; and the verdict reaches the
 * field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);
const HELD = 0b11;

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("grindstone");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The wheel in `phase` since a beat ago, `ask` the step under the cursor, `pads` each seat's held. */
function at(
  world: World,
  phase: GrindstonePhase,
  ask: GrindstoneAsk = "left",
  pads: [number, number] = [0, 0],
  locked = true,
): void {
  const s = grindstoneBoss(world);
  if (s === null) throw new Error("the grindstone wave hung no wheel");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.locked = locked;
  s.padsDown = [...pads];
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

describe("THE GRINDSTONE's marks asking", () => {
  const lit =
    (ask: GrindstoneAsk, pads?: [number, number], locked = true) =>
    (w: World) =>
      at(w, "lit", ask, pads, locked);
  const rest = (w: World) => at(w, "rest");

  it("asks the left flat of the pilot and the right of the navigator", () => {
    expect(halos("p1", lit("left"))).toBeGreaterThan(halos("p1", rest));
    expect(clocks("p1", lit("left"))).toBe(clocks("p1", rest));
    expect(clocks("p2", lit("left"))).toBeGreaterThan(clocks("p2", rest));
    expect(halos("p2", lit("right"))).toBeGreaterThan(halos("p2", rest));
    expect(clocks("p1", lit("right"))).toBeGreaterThan(clocks("p1", rest));
    expect(clocks("test", lit("left"))).toBe(clocks("test", rest));
  });

  it("shows a seat already holding its jaw its partner's still asked", () => {
    const both = lit("clamp", [HELD, HELD]);
    const pilotHeld = lit("clamp", [HELD, 0]);
    expect(halos("p1", pilotHeld)).toBe(halos("p1", both));
    expect(clocks("p1", pilotHeld)).toBeGreaterThan(clocks("p1", both));
    expect(halos("p2", pilotHeld)).toBeGreaterThan(halos("p2", both));
    expect(clocks("p2", pilotHeld)).toBe(clocks("p2", both));
  });

  it.each(ROLES)("haloes the axle on %s with the caliper locked, and waits on nobody", (role) => {
    expect(halos(role, lit("fire"))).toBeGreaterThan(halos(role, lit("fire", undefined, false)));
    expect(clocks(role, lit("fire"))).toBe(clocks(role, rest));
  });
});

describe("THE GRINDSTONE's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new GrindstoneVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [
      at(GRINDSTONE_AXLE_MARK),
      at(GRINDSTONE_LEFT_FLAT_MARK),
      at(GRINDSTONE_RIGHT_FLAT_MARK),
      at(GRINDSTONE_LEFT_JAW_MARK),
      at(GRINDSTONE_RIGHT_JAW_MARK),
    ];
  };
  const col = 5;
  const light = (ask: GrindstoneAsk): SimEvent => ({ type: "grindstoneLight", ask, col });

  it("lands each of the wheel's words on the mark it names", () => {
    const n = null;
    expect(on([{ type: "grindstoneClear", side: 1, passes: 1, col }])).toEqual([n, n, true, n, n]);
    expect(on([{ type: "grindstoneClamp", col }])).toEqual([n, n, n, true, true]);
    expect(on([{ type: "grindstoneHit", hits: 1, col }])).toEqual([true, n, n, n, n]);
    expect(on([{ type: "grindstoneSlip", side: 0, col }])).toEqual([n, n, n, false, n]);
    expect(on([{ type: "grindstoneJar", side: 1, col }])).toEqual([n, n, false, n, false]);
  });

  it("reddens on a step run out only what it asked", () => {
    const n = null;
    expect(on([light("right"), { type: "grindstoneRegrit", side: 1, col }])).toEqual([
      n,
      n,
      false,
      n,
      n,
    ]);
    expect(on([light("clamp"), { type: "grindstoneLoose", col }])).toEqual([n, n, n, false, false]);
    expect(on([light("fire"), { type: "grindstoneMiss", col }])).toEqual([false, n, n, n, n]);
  });

  it("forgets on reset", () => {
    const v = new GrindstoneVerdicts();
    v.ingest([light("fire")]);
    v.clear();
    v.ingest([{ type: "grindstoneMiss", col }]);
    expect(v.verdicts.at(GRINDSTONE_AXLE_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [light("fire"), { type: "grindstoneMiss", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
