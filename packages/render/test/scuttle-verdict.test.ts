import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type ScuttleState,
  type SimEvent,
  scuttleBoss,
  scuttleSocketCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { drawScuttleGrip } from "../src/scuttle-grip.js";
import { ScuttleMarks } from "../src/scuttle-marks.js";
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
 * **THE SCUTTLE's hanging parts answer a touch the way THE GAUGE's do**
 * (`scuttle-marks.ts`, `.claude/skills/new-boss` §5): the rings stand on the
 * pilot's screen alone, so every part offered and not under his thumb wears
 * the halo there and the navigator is shown nothing — no partner's clock and
 * no refusal; a carry washes the part green in the column it went to; and
 * the verdict reaches the field's frame.
 *
 * The parts are **set** loose, `scuttle-frame.test.ts`' arrangement.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("scuttle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.scuttleOutBeats + 2); i++) step(world, []);
  return world;
}

/** Sockets `at` have come loose this beat, the first of them live. */
function loose(world: World, at: number[] = [9]): ScuttleState {
  const s = scuttleBoss(world);
  if (s === null) throw new Error("the scuttle wave hung no frame");
  s.loose = at;
  s.live = at[0] ?? -1;
  s.cycleBeat = world.beat;
  s.windBeat = -1;
  s.swung = -1;
  s.swungCol = -1;
  s.held = -1;
  return s;
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";

function rings(world: World, s: ScuttleState, role: ViewRole, v = new GripVerdicts()): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  const c = ctx as unknown as CanvasRenderingContext2D;
  drawScuttleGrip(c, layout(role), CFG, s, world.beat, 0.4, 1.2, v);
  return log.join("|");
}

describe("THE SCUTTLE's parts asking", () => {
  it("halo every part offered on his screen alone, and not the one under his thumb", () => {
    const world = hung();
    const s = loose(world, [8, 9]);
    expect(count(rings(world, s, "p1"), HALO)).toBe(2);
    expect(count(rings(world, s, "test"), HALO)).toBe(2);
    expect(rings(world, s, "p2")).toBe("");
    s.held = 9;
    expect(count(rings(world, s, "p1"), HALO)).toBe(1);
  });

  it("ask nothing once the cycle's carry is spent", () => {
    const world = hung();
    const s = loose(world);
    s.swung = 9;
    s.swungCol = scuttleSocketCol(CFG, 9) - 1;
    expect(rings(world, s, "p1")).toBe("");
  });
});

describe("THE SCUTTLE's verdict on a touch", () => {
  it("washes the carried part green, keeps each socket apart, and forgets on reset", () => {
    const marks = new ScuttleMarks();
    marks.ingest([{ type: "scuttleSwing", col: 4, socket: 9, from: 5 }]);
    expect(marks.verdicts.at(9)?.good).toBe(true);
    expect(marks.verdicts.at(8)).toBeNull();
    marks.clear();
    expect(marks.verdicts.at(9)).toBeNull();
  });

  it("rings the carried part on his screen, in the column it went to, and not on hers", () => {
    const world = hung();
    const s = loose(world);
    s.swung = 9;
    s.swungCol = scuttleSocketCol(CFG, 9) - 1;
    const v = new GripVerdicts();
    v.mark(9, true);
    expect(count(rings(world, s, "p1", v), PALETTE.good)).toBeGreaterThan(0);
    expect(rings(world, s, "p2", v)).toBe("");
  });

  /** A beat of a part hanging, `said` on tick 2 and the world held still. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const world = hung();
    loose(world);
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

  it.each(["p1", "test"] as const)("reaches the field's frame, on %s", (role) => {
    const swung: SimEvent[] = [{ type: "scuttleSwing", col: 8, socket: 9, from: 9 }];
    expect(count(frames(role, swung), PALETTE.good)).toBeGreaterThan(
      count(frames(role, []), PALETTE.good),
    );
  });
});
