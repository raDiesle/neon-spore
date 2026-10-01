import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CystAsk,
  type CystPhase,
  createWorld,
  cystBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import {
  CYST_BUD_MARK,
  CYST_CORE_MARK,
  CYST_LEFT_FLANK_MARK,
  CYST_LEFT_FREEZE_MARK,
  CYST_RIGHT_FLANK_MARK,
  CYST_RIGHT_FREEZE_MARK,
  CystVerdicts,
} from "../src/cyst-verdicts.js";
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
 * **THE CYST's marks answer a touch the way every mark does**
 * (`cyst-verdicts.ts`, `.claude/skills/new-boss` §5): each freeze mark wears
 * the halo on its tapper's screen and the partner's ring and clock on the
 * other's while its flank's step is lit, and each flank on its pincher's
 * while stilled or on a swell and not yet shut, so a seat already pinching
 * sees its partner's flank still waited on; the core and the bud are either
 * seat's, and halo on both screens with nobody's clock; each of the sac's
 * words lands on the mark it names; a step run out reddens only what it
 * asked; and the verdict reaches the field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);
const OPEN = CFG.cystOpenMilli;

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("cyst");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The sac in `phase` since a beat ago, `ask` the step under the cursor, `gaps` each flank's. */
function at(
  world: World,
  phase: CystPhase,
  ask: CystAsk = "left",
  gaps: [number, number] = [OPEN, OPEN],
  bared = false,
): void {
  const s = cystBoss(world);
  if (s === null) throw new Error("the cyst wave hung no sac");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.bared = bared;
  s.gapMilli = [...gaps];
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

describe("THE CYST's marks asking", () => {
  const as =
    (phase: CystPhase, ask: CystAsk, gaps?: [number, number], bared = false) =>
    (w: World) =>
      at(w, phase, ask, gaps, bared);
  const rest = (w: World) => at(w, "rest");

  it("asks the left flank's tap of the navigator and the right's of the pilot", () => {
    expect(halos("p2", as("lit", "left"))).toBeGreaterThan(halos("p2", rest));
    expect(clocks("p2", as("lit", "left"))).toBe(clocks("p2", rest));
    expect(clocks("p1", as("lit", "left"))).toBeGreaterThan(clocks("p1", rest));
    expect(halos("p1", as("lit", "right"))).toBeGreaterThan(halos("p1", rest));
    expect(clocks("p2", as("lit", "right"))).toBeGreaterThan(clocks("p2", rest));
    expect(clocks("test", as("lit", "left"))).toBe(clocks("test", rest));
  });

  it("asks a stilled flank's pinch of the other seat, until it is shut", () => {
    expect(halos("p1", as("frozen", "left"))).toBeGreaterThan(halos("p1", rest));
    expect(clocks("p2", as("frozen", "left"))).toBeGreaterThan(clocks("p2", rest));
    expect(halos("p1", as("frozen", "left"))).toBeGreaterThan(
      halos("p1", as("frozen", "left", [0, OPEN])),
    );
    expect(clocks("p2", as("frozen", "left", [0, OPEN]))).toBe(clocks("p2", rest));
  });

  it("shows a seat already pinching on a swell its partner's flank still asked", () => {
    const both = as("lit", "swell", [0, 0]);
    const pilotShut = as("lit", "swell", [0, OPEN]);
    expect(halos("p1", pilotShut)).toBe(halos("p1", both));
    expect(clocks("p1", pilotShut)).toBeGreaterThan(clocks("p1", both));
    expect(halos("p2", pilotShut)).toBeGreaterThan(halos("p2", both));
    expect(clocks("p2", pilotShut)).toBe(clocks("p2", both));
  });

  it.each(ROLES)("haloes the core on %s once it is bare, and waits on nobody", (role) => {
    const bare = as("lit", "fire", undefined, true);
    expect(halos(role, bare)).toBeGreaterThan(halos(role, as("lit", "fire")));
    expect(clocks(role, bare)).toBe(clocks(role, rest));
  });

  it.each(ROLES)("haloes the bud on %s while it is lit, and waits on nobody", (role) => {
    expect(halos(role, as("lit", "bud"))).toBeGreaterThan(halos(role, as("rest", "bud")));
    expect(clocks(role, as("lit", "bud"))).toBe(clocks(role, rest));
  });
});

describe("THE CYST's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new CystVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [
      at(CYST_CORE_MARK),
      at(CYST_BUD_MARK),
      at(CYST_LEFT_FREEZE_MARK),
      at(CYST_RIGHT_FREEZE_MARK),
      at(CYST_LEFT_FLANK_MARK),
      at(CYST_RIGHT_FLANK_MARK),
    ];
  };
  const col = 5;
  const light = (ask: CystAsk): SimEvent => ({ type: "cystLight", ask, col });
  const n = null;

  it("lands each of the sac's words on the mark it names", () => {
    expect(on([{ type: "cystStill", side: 1, col }])).toEqual([n, n, n, true, n, n]);
    expect(on([{ type: "cystShudder", side: 0, col }])).toEqual([n, n, false, n, n, n]);
    expect(on([{ type: "cystCrack", side: 0, col }])).toEqual([n, n, n, n, true, n]);
    expect(on([{ type: "cystGuard", side: 1, col }])).toEqual([n, n, n, n, n, true]);
    expect(on([{ type: "cystSlip", side: 1, col }])).toEqual([n, n, n, n, n, false]);
    expect(on([{ type: "cystSpring", side: 0, col }])).toEqual([n, n, n, n, false, n]);
    expect(on([{ type: "cystClench", col }])).toEqual([n, n, n, n, true, true]);
    expect(on([{ type: "cystHit", hits: 1, col }])).toEqual([true, n, n, n, n, n]);
    expect(on([{ type: "cystPop", col }])).toEqual([n, true, n, n, n, n]);
  });

  it("reddens on a step run out only what it asked", () => {
    const miss: SimEvent = { type: "cystMiss", col };
    expect(on([light("fire"), miss])).toEqual([false, n, n, n, n, n]);
    expect(on([light("bud"), miss])).toEqual([n, false, n, n, n, n]);
    expect(on([light("swell"), miss])).toEqual([n, n, n, n, false, false]);
    expect(on([light("spit"), miss])).toEqual([n, n, n, n, n, n]);
  });

  it("forgets on reset", () => {
    const v = new CystVerdicts();
    v.ingest([light("fire")]);
    v.clear();
    v.ingest([{ type: "cystMiss", col }]);
    expect(v.verdicts.at(CYST_CORE_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [light("fire"), { type: "cystMiss", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
