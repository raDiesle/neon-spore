import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GaugeState,
  type SimEvent,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { drawGaugeAsked, drawGaugeVerdicts, GaugeMarks } from "../src/gauge-marks.js";
import { gaugeDial } from "../src/gauge-round.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GAUGE's needle and band answer a touch the way THE INSTAR's marks
 * do**, as far as the round's split lets them (`gauge-marks.ts`,
 * `.claude/skills/new-boss` §5): the part asked of this seat wears the halo
 * until the thumb is down, the thumb landing washes it green, and neither is
 * ever drawn on the screen that is not shown that part — no partner's clock,
 * no red — because that screen is the one the round keeps it from.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The round installed and in its play, with the fields this case is about moved. */
function playing(overrides: Partial<GaugeState> = {}): { world: World; g: GaugeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("gauge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const g = world.boss;
  if (g === null || g.kind !== "gauge") throw new Error("the gauge's wave installed no gauge");
  Object.assign(g, { phase: "play" }, overrides);
  return { world, g };
}

const gauge = (overrides: Partial<GaugeState> = {}) => playing(overrides).g;

function drawn(role: ViewRole, paint: (ctx: CanvasRenderingContext2D, role: ViewRole) => void) {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  paint(ctx as unknown as CanvasRenderingContext2D, role);
  return log.join("|");
}

function asked(role: ViewRole, g: GaugeState): string {
  return drawn(role, (ctx) => {
    const l = layout(role);
    drawGaugeAsked(ctx, l, DEFAULT_CONFIG, gaugeDial(l), g, role, 1.2);
  });
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";

describe("THE GAUGE's parts asking", () => {
  it("asks nothing while the round is in one state, or outside the play", () => {
    for (const role of ROLES) {
      expect(asked(role, gauge())).toBe("");
      expect(asked(role, gauge({ jamBeat: 3, boundBeat: 3, phase: "verdict" }))).toBe("");
    }
  });

  it("haloes the jammed needle on his screen alone, until his hand is down", () => {
    expect(count(asked("p1", gauge({ jamBeat: 3 })), HALO)).toBe(1);
    expect(asked("p2", gauge({ jamBeat: 3 }))).toBe("");
    expect(count(asked("p1", gauge({ jamBeat: 3, handOn: true })), HALO)).toBe(0);
  });

  it("haloes the wound band on her screen alone, until her thumb is down", () => {
    expect(count(asked("p2", gauge({ boundBeat: 3 })), HALO)).toBe(1);
    expect(asked("p1", gauge({ boundBeat: 3 }))).toBe("");
    expect(count(asked("p2", gauge({ boundBeat: 3, openThumb: true })), HALO)).toBe(0);
  });

  it("haloes both on the test screen", () => {
    expect(count(asked("test", gauge({ jamBeat: 3, boundBeat: 3 })), HALO)).toBe(2);
  });
});

const onNeedle: SimEvent = { type: "gaugeHold", part: "needle" };
const onBand: SimEvent = { type: "gaugeHold", part: "band" };

describe("THE GAUGE's verdict on a touch", () => {
  it("keeps each part's green under its key, fades it and forgets it on reset", () => {
    const marks = new GaugeMarks();
    marks.ingest([onNeedle]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    expect(marks.verdicts.at(1)).toBeNull();
    marks.ingest([onBand]);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    marks.update(1);
    expect(marks.verdicts.at(0)).toBeNull();
    marks.ingest([onNeedle]);
    marks.clear();
    expect(marks.verdicts.at(0)).toBeNull();
  });

  function verdicts(role: ViewRole, key: number): string {
    const v = new GripVerdicts();
    v.mark(key, true);
    return drawn(role, (ctx) => {
      const l = layout(role);
      drawGaugeVerdicts(ctx, l, DEFAULT_CONFIG, gaugeDial(l), gauge(), role, v);
    });
  }

  it("draws each part's ring only on a screen shown that part", () => {
    expect(count(verdicts("p1", 0), PALETTE.good)).toBeGreaterThan(0);
    expect(verdicts("p2", 0)).toBe("");
    expect(count(verdicts("p2", 1), PALETTE.good)).toBeGreaterThan(0);
    expect(verdicts("p1", 1)).toBe("");
    for (const key of [0, 1]) expect(count(verdicts("test", key), PALETTE.good)).toBeGreaterThan(0);
  });

  /** Nine ticks of the round in its play, `said` thrown on the first. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const { world } = playing({ jamBeat: 3, boundBeat: 3 });
    const log: string[] = [];
    runFrames(world, role, 9, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        if (tick === 0) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(ROLES)("reaches the round's screen through the takeover, on %s", (role) => {
    const said = role === "p2" ? [onBand] : [onNeedle];
    expect(count(frames(role, said), PALETTE.good)).toBeGreaterThan(
      count(frames(role, []), PALETTE.good),
    );
  });
});
