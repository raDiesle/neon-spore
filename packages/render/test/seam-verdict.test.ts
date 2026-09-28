import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SeamAsk,
  type SeamPhase,
  type SimEvent,
  seamBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  SEAM_CRACK_MARK,
  SEAM_GRIT_MARK,
  SEAM_ROCK_MARK,
  SeamMarks,
} from "../src/seam-verdicts.js";
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
 * **THE SEAM's marks answer a touch the way THE INSTAR's do**
 * (`seam-verdicts.ts`, `.claude/skills/new-boss` §5), as a boss answered
 * with the cannon and the shield has them: every mark is both seats', so
 * what the lit step asks — the point, the rock, the shield's place under the
 * ridge — wears the halo on every screen and nobody's clock; each of the
 * ridge's words lands on the mark it names; a step run out reddens only what
 * it still owed; and the verdict reaches the field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("seam");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The ridge in `phase` since a beat ago, nothing sealed, `ask` the step under the cursor. */
function at(world: World, phase: SeamPhase, ask: SeamAsk = "point"): void {
  const s = seamBoss(world);
  if (s === null) throw new Error("the seam wave stood no ridge");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.sealed = 0;
  s.shot = false;
  s.guarded = false;
  s.cursor = 0;
  s.steps[0] = { ask, color: "either", offset: 2, seals: false };
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

describe("THE SEAM's marks asking", () => {
  const lit = (ask: SeamAsk) => (w: World) => at(w, "lit", ask);
  /** The same step with its shot and its shield already in: nothing more asked. */
  const answered = (ask: SeamAsk) => (w: World) => {
    at(w, "lit", ask);
    const s = seamBoss(w);
    if (s !== null) {
      s.shot = true;
      s.guarded = true;
    }
  };

  it.each(ROLES)("halo what the lit step asks, on %s, and wait on nobody", (role) => {
    for (const ask of ["point", "glow", "grit", "blind", "rock", "both"] as const) {
      expect(count(frame(role, lit(ask)), HALO)).toBeGreaterThan(
        count(frame(role, answered(ask)), HALO),
      );
      expect(count(frame(role, lit(ask)), CLOCK)).toBe(count(frame(role, answered(ask)), CLOCK));
    }
    // Grit and a rock at once: both marks asked.
    expect(count(frame(role, lit("both")), HALO) - count(frame(role, answered("both")), HALO)).toBe(
      2 * (count(frame(role, lit("rock")), HALO) - count(frame(role, answered("rock")), HALO)),
    );
  });
});

describe("THE SEAM's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const marks = new SeamMarks();
    marks.ingest(said);
    const v = (k: number) => marks.verdicts.at(k)?.good ?? null;
    return [v(SEAM_CRACK_MARK), v(SEAM_ROCK_MARK), v(SEAM_GRIT_MARK)];
  };
  const col = 5;
  const light = (ask: SeamAsk): SimEvent => ({ type: "seamLight", ask, col });
  const miss: SimEvent = { type: "seamMiss", col };

  it("lands each of the ridge's words on the mark it names", () => {
    expect(on([{ type: "seamSeal", sealed: 1, col }])).toEqual([true, null, null]);
    expect(on([{ type: "seamDim", col }])).toEqual([true, null, null]);
    expect(on([{ type: "seamQuench", left: 2, col }])).toEqual([true, null, null]);
    expect(on([{ type: "seamRockOut", col }])).toEqual([null, true, null]);
    expect(on([{ type: "seamBlock", col }])).toEqual([null, null, true]);
    expect(on([{ type: "seamSplit", col }])).toEqual([null, null, null]);
  });

  it("reddens on a miss only what the step still owed", () => {
    expect(on([light("point"), miss])).toEqual([false, null, null]);
    expect(on([light("blind"), miss])).toEqual([null, null, false]);
    expect(on([light("both"), miss])).toEqual([null, false, false]);
    expect(on([light("both"), { type: "seamBlock", col }, miss])).toEqual([null, false, true]);
    expect(on([light("glow"), { type: "seamQuench", left: 1, col }, miss])).toEqual([
      false,
      null,
      null,
    ]);
  });

  it("forgets on reset", () => {
    const marks = new SeamMarks();
    marks.ingest([light("rock")]);
    marks.clear();
    marks.ingest([miss]);
    expect(marks.verdicts.at(SEAM_ROCK_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest", "grit");
    const missed: SimEvent[] = [light("grit"), miss];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
