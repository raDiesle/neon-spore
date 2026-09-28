import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type HiveState,
  hiveBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { GripVerdicts } from "../src/grip-verdict.js";
import { drawHiveGrip } from "../src/hive-grip.js";
import { HIVE_HAUL, HiveMarks } from "../src/hive-marks.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
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
 * **THE HIVE's one handle answers a touch the way THE GAUGE's does**
 * (`hive-marks.ts`, `.claude/skills/new-boss` §5): the clenched underside
 * wears the halo on the pilot's screen until his carry begins, every
 * swelling lobe but the one under her thumb wears it on the navigator's, and
 * neither seat is shown the other's — no partner's clock and no refusal; a
 * haul home and a lobe wrung wash green; and the verdict reaches the field's
 * frame.
 *
 * The states are **set**, `hive-frame.test.ts`' arrangement.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("hive");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.hiveOutBeats + 2); i++) step(world, []);
  return world;
}

/** The first two sites open, the rest shut, the mass standing and hanging. */
function open(world: World): HiveState {
  const s = hiveBoss(world);
  if (s === null) throw new Error("the hive wave hung no mass");
  s.phase = "spill";
  s.opened = 2;
  s.sealed = s.sealed.map(() => false);
  s.openBeat = world.beat;
  s.spillBeat = world.beat;
  s.downBeat = -1;
  s.pinch = -1;
  s.haulMilli = 0;
  return s;
}

/** The third site a beat into its swell. */
function swelling(world: World): HiveState {
  const s = open(world);
  s.openBeat = world.beat - (CFG.hiveOpenBeats - CFG.hiveSwellBeats) - 1;
  return s;
}

/** The mass clenched a beat ago, `hauled` thousandths carried. */
function clenched(world: World, hauled = 0): HiveState {
  const s = open(world);
  s.phase = "clench";
  s.phaseBeat = world.beat - 1;
  s.haulMilli = hauled;
  return s;
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";

function rings(world: World, s: HiveState, role: ViewRole, v = new GripVerdicts()): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  const c = ctx as unknown as CanvasRenderingContext2D;
  drawHiveGrip(c, layout(role), CFG, s, world.beat, 0.4, 1.2, v);
  return log.join("|");
}

describe("THE HIVE's handle asking", () => {
  it("halos the clenched underside on his screen alone, until his carry begins", () => {
    const world = hung();
    const s = clenched(world);
    expect(count(rings(world, s, "p1"), HALO)).toBe(1);
    expect(count(rings(world, s, "test"), HALO)).toBe(1);
    expect(rings(world, s, "p2")).toBe("");
    s.haulMilli = 1;
    expect(count(rings(world, s, "p1"), HALO)).toBe(0);
    expect(rings(world, s, "p1")).not.toBe("");
  });

  it("halos a swelling lobe on her screen alone, and not the one under her thumb", () => {
    const world = hung();
    const s = swelling(world);
    expect(count(rings(world, s, "p2"), HALO)).toBe(1);
    expect(count(rings(world, s, "test"), HALO)).toBe(1);
    expect(rings(world, s, "p1")).toBe("");
    s.pinch = 2;
    s.pinchBeat = world.beat;
    expect(count(rings(world, s, "p2"), HALO)).toBe(0);
    expect(rings(world, s, "p2")).not.toBe("");
  });

  it("asks nothing of either seat once the mass is down", () => {
    const world = hung();
    const s = clenched(world);
    s.downBeat = world.beat;
    expect(rings(world, s, "test")).toBe("");
  });
});

describe("THE HIVE's verdict on a touch", () => {
  it("washes the haul and each wrung lobe green, apart, and forgets on reset", () => {
    const marks = new HiveMarks();
    marks.ingest([
      { type: "hiveHaul", col: 5 },
      { type: "hiveWrung", col: 3 },
    ]);
    expect(marks.verdicts.at(HIVE_HAUL)?.good).toBe(true);
    expect(marks.verdicts.at(3)?.good).toBe(true);
    expect(marks.verdicts.at(5)).toBeNull();
    marks.clear();
    expect(marks.verdicts.at(HIVE_HAUL)).toBeNull();
  });

  it("rings the mass hauled home on his screen and a wrung lobe on hers, each alone", () => {
    const world = hung();
    const s = open(world);
    const haul = new GripVerdicts();
    haul.mark(HIVE_HAUL, true);
    expect(count(rings(world, s, "p1", haul), PALETTE.good)).toBeGreaterThan(0);
    expect(rings(world, s, "p2", haul)).toBe("");
    const wrung = new GripVerdicts();
    wrung.mark(s.cols[1] ?? -1, true);
    expect(count(rings(world, s, "p2", wrung), PALETTE.good)).toBeGreaterThan(0);
    expect(rings(world, s, "p1", wrung)).toBe("");
  });

  /** A beat of the mass standing, `said` on tick 2 and the world held still. */
  function frames(role: ViewRole, said: (s: HiveState) => SimEvent[]): string {
    const world = hung();
    const s = open(world);
    const log: string[] = [];
    runFrames(world, role, TPB, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        w.events.length = 0;
        if (tick === 2) w.events.push(...said(s));
      },
    });
    return log.join("|");
  }

  it.each([
    ["p1", (): SimEvent[] => [{ type: "hiveHaul", col: 5 }]],
    ["p2", (s: HiveState): SimEvent[] => [{ type: "hiveWrung", col: s.cols[1] ?? -1 }]],
  ] as const)("reaches the field's frame, on %s", (role, said) => {
    expect(count(frames(role, said), PALETTE.good)).toBeGreaterThan(
      count(
        frames(role, () => []),
        PALETTE.good,
      ),
    );
  });
});
