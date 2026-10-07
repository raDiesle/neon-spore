import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SimEvent,
  startWave,
  step,
  type TrapezeAsk,
  type TrapezePhase,
  ticksPerBeat,
  trapezeAims,
  trapezeBoss,
  trapezeFreezeAsks,
  trapezeSpindleAsks,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  TRAPEZE_DRAW_MARK,
  TRAPEZE_FREEZE_MARK,
  TRAPEZE_SPINDLE_MARK,
  TrapezeVerdicts,
} from "../src/trapeze-verdicts.js";
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
 * **THE TRAPEZE's marks answer a touch the way every mark does**
 * (`trapeze-verdicts.ts`, `.claude/skills/new-boss` §5): on a catch the freeze
 * ring wears the halo on the freezer's screen and the draw's track on the
 * other's, each with the partner's ring and clock on the other's, and the
 * ring stops asking once the flag is still; the lit spindle on a fire step is
 * either seat's, and halos on both screens with nobody's clock; each of the
 * flag's words lands on the mark it names; and the verdict reaches the
 * field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("trapeze");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The flag in `phase` since a beat ago, `ask` the step under the cursor, the pilot's to freeze. */
function at(
  world: World,
  phase: TrapezePhase,
  ask: TrapezeAsk = "catch",
  frozen = false,
  spindleLit = false,
): void {
  const s = trapezeBoss(world);
  if (s === null) throw new Error("the trapeze wave hung no flag");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.frozenBeats = frozen ? 2 : 0;
  s.frozenBy = frozen ? 0 : null;
  s.spindleLit = spindleLit;
  s.steps[0] = { ask, freezer: 1, offset: 1, sweepMilli: 200, color: "either", beats: 4 };
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

describe("THE TRAPEZE's marks asking", () => {
  const as =
    (phase: TrapezePhase, ask: TrapezeAsk = "catch", frozen = false, lit = false) =>
    (w: World) =>
      at(w, phase, ask, frozen, lit);
  const rest = (w: World) => at(w, "rest");

  it("asks a catch's freeze of its freezer and its draw of the other, until the flag is still", () => {
    const world = hung();
    const s = trapezeBoss(world);
    if (s === null) throw new Error("no flag");
    const asks = () => [
      [trapezeFreezeAsks(s, 0), trapezeFreezeAsks(s, 1)],
      [trapezeAims(s, 0), trapezeAims(s, 1)],
    ];
    at(world, "lit", "catch");
    expect(asks()).toEqual([
      [true, false],
      [false, true],
    ]);
    at(world, "lit", "catch", true);
    expect(asks()).toEqual([
      [false, false],
      [false, true],
    ]);
    at(world, "lit", "fire", false, true);
    expect([...asks(), trapezeSpindleAsks(s)]).toEqual([[false, false], [false, false], true]);
  });

  it("waits on the partner's mark on both screens, on a catch", () => {
    expect(clocks("p1", as("lit"))).toBeGreaterThan(clocks("p1", rest));
    expect(clocks("p2", as("lit"))).toBeGreaterThan(clocks("p2", rest));
    expect(halos("test", as("lit"))).toBeGreaterThan(halos("p1", as("lit")));
    expect(clocks("test", as("lit"))).toBe(clocks("test", rest));
  });

  it("stops asking the freeze once the flag is still", () => {
    expect(halos("test", as("lit", "catch", true))).toBeLessThan(halos("test", as("lit")));
  });

  it.each(ROLES)("haloes the spindle on %s once it is lit, and waits on nobody", (role) => {
    const lit = as("lit", "fire", false, true);
    expect(halos(role, lit)).toBeGreaterThan(halos(role, as("lit", "fire")));
    expect(clocks(role, lit)).toBe(clocks(role, rest));
  });
});

describe("THE TRAPEZE's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new TrapezeVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [at(TRAPEZE_FREEZE_MARK), at(TRAPEZE_DRAW_MARK), at(TRAPEZE_SPINDLE_MARK)];
  };
  const col = 5;
  const n = null;

  it("lands each of the flag's words on the mark it names", () => {
    expect(on([{ type: "trapezeFreeze", side: 0, col }])).toEqual([true, n, n]);
    expect(on([{ type: "trapezeFlap", side: 0, col }])).toEqual([false, n, n]);
    expect(on([{ type: "trapezeLapse", col }])).toEqual([n, false, n]);
    expect(on([{ type: "trapezeFlutter", side: 1, col }])).toEqual([n, false, n]);
    expect(on([{ type: "trapezeCatch", side: 1, catches: 1, col }])).toEqual([true, true, n]);
    expect(on([{ type: "trapezeRecatch", side: 1, col }])).toEqual([true, true, n]);
    expect(on([{ type: "trapezeSway", col }])).toEqual([false, false, n]);
    expect(on([{ type: "trapezeDim", col }])).toEqual([false, false, n]);
    expect(on([{ type: "trapezeHit", hits: 1, col }])).toEqual([n, n, true]);
    expect(on([{ type: "trapezeMiss", col }])).toEqual([n, n, false]);
    expect(on([{ type: "trapezeLight", ask: "catch", offset: 1, col }])).toEqual([n, n, n]);
  });

  it("stands the ring where the last lit catch put it, and forgets on reset", () => {
    const v = new TrapezeVerdicts();
    v.ingest([{ type: "trapezeLight", ask: "catch", offset: -1, col }]);
    v.ingest([{ type: "trapezeLight", ask: "fire", offset: 0, col }]);
    expect(v.offset).toBe(-1);
    v.ingest([{ type: "trapezeMiss", col }]);
    v.clear();
    expect(v.verdicts.at(TRAPEZE_SPINDLE_MARK)).toBeNull();
    expect(v.offset).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [{ type: "trapezeMiss", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
