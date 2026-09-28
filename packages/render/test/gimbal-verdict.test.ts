import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GimbalRing,
  type GimbalState,
  gimbalBoss,
  INNER,
  NO_BEARING,
  NO_SEAM,
  OUTER,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { GimbalMarks } from "../src/gimbal-marks.js";
import { drawGimbalRing } from "../src/gimbal-ring.js";
import { gimbalCentre } from "../src/gimbal-shape.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GIMBAL's two rings answer a touch the way THE GAUGE's do**
 * (`gimbal-marks.ts`, `.claude/skills/new-boss` §5): a ring being turned
 * with no hand on it wears the halo, a held one does not, and neither does
 * one outside the turn; both rings wash green together at true, a slip
 * washes red only the ring that left its mark; and the verdict reaches the
 * field's frame on the screen that ring is drawn on.
 *
 * The states are **set**, `gimbal-frame.test.ts`' arrangement.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
const count = (text: string, needle: string): number => text.split(needle).length - 1;

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gimbal");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** Alignment 0 up, both rings at rest and nobody holding either. */
function turning(world: World): GimbalState {
  const s = gimbalBoss(world);
  if (s === null) throw new Error("the gimbal wave hung no cradle");
  s.phase = "turn";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.atMilli = [0, 0];
  s.seamCol = NO_SEAM;
  s.handMilli = [NO_BEARING, NO_BEARING];
  return s;
}

function ring(world: World, s: GimbalState, which: GimbalRing, v = new GripVerdicts()): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  const l = computeLayout(VIEWPORT, CFG, which === OUTER ? "p1" : "p2");
  const c = ctx as unknown as CanvasRenderingContext2D;
  drawGimbalRing(c, l, world, s, which, gimbalCentre(l, CFG), world.beat, 0.4, 1.2, v);
  return log.join("|");
}

describe("THE GIMBAL's rings asking", () => {
  it.each([OUTER, INNER] as const)("halo ring %i while it turns with no hand on it", (which) => {
    const world = hung();
    const s = turning(world);
    const asked = count(ring(world, s, which), HALO);
    s.handMilli[which] = 0;
    expect(asked - count(ring(world, s, which), HALO)).toBe(1);
  });

  it("asks nothing outside the turn", () => {
    const world = hung();
    const s = turning(world);
    const asked = count(ring(world, s, OUTER), HALO);
    s.phase = "still";
    expect(asked - count(ring(world, s, OUTER), HALO)).toBe(1);
  });
});

describe("THE GIMBAL's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const marks = new GimbalMarks();
    marks.ingest(said);
    return [marks.verdicts.at(OUTER)?.good ?? null, marks.verdicts.at(INNER)?.good ?? null];
  };

  it("washes both rings green at true and only the slipped ring red", () => {
    expect(on([{ type: "gimbalTrue", col: 5 }])).toEqual([true, true]);
    expect(on([{ type: "gimbalSlip", col: 5, outer: true, inner: false }])).toEqual([false, null]);
    expect(on([{ type: "gimbalSlip", col: 5, outer: false, inner: true }])).toEqual([null, false]);
    expect(on([{ type: "gimbalSlip", col: 5, outer: true, inner: true }])).toEqual([false, false]);
  });

  it("forgets on reset", () => {
    const marks = new GimbalMarks();
    marks.ingest([{ type: "gimbalTrue", col: 5 }]);
    marks.clear();
    expect(marks.verdicts.at(OUTER)).toBeNull();
  });

  /** A beat of the rings held mid-turn, `said` on tick 2 and the world held still. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const world = hung();
    turning(world);
    const log: string[] = [];
    runFrames(world, role, TPB, {
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

  it.each([
    ["p1", true, false],
    ["p2", false, true],
  ] as const)("reaches the field's frame, on %s", (role, outer, inner) => {
    const slip: SimEvent[] = [{ type: "gimbalSlip", col: 5, outer, inner }];
    expect(count(frames(role, slip), PALETTE.red)).toBeGreaterThan(
      count(frames(role, []), PALETTE.red),
    );
  });
});
