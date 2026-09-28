import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type PulseState,
  type SimEvent,
  startWave,
  type World,
} from "@neon-spore/sim";
import { GripVerdicts } from "../src/grip-verdict.js";
import { rgba } from "../src/hex.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { pulseGripBox } from "../src/pulse-grip.js";
import {
  drawPulseHalo,
  drawPulseVerdicts,
  drawPulseWaiting,
  PulseMarks,
  pulseEnd,
} from "../src/pulse-marks.js";
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
 * **THE PULSE's bar answers a touch the way THE INSTAR's marks do**
 * (`pulse-marks.ts`, `.claude/skills/new-boss` §5): each seat's end of the
 * bar wears the halo while it is asked, the partner's end wears their ring
 * and a clock only under `arrest` once this seat is holding, a brace washes
 * that end green and the arrest both, and the verdict reaches the round's
 * screen through the takeover.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function open(meter: number, brace1 = false, brace2 = false): { world: World; pulse: PulseState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("pulse");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  if (world.boss?.kind !== "pulse") throw new Error("the pulse wave hung no round");
  Object.assign(world.boss, { meter, brace1, brace2 });
  return { world, pulse: world.boss };
}

function drawn(role: ViewRole, paint: (ctx: CanvasRenderingContext2D, l: Layout) => void) {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  paint(ctx as unknown as CanvasRenderingContext2D, layout(role));
  return log.join("|");
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";
const THEIRS = rgba(PALETTE.text, 0.8);
const CLOCK = rgba(PALETTE.text, 0.85);

const halo = (role: ViewRole, p: PulseState) =>
  count(
    drawn(role, (ctx, l) => drawPulseHalo(ctx, l, CFG, p, 1.2)),
    HALO,
  );
const waiting = (role: ViewRole, p: PulseState) =>
  drawn(role, (ctx, l) => drawPulseWaiting(ctx, l, CFG, p, 1.2));

const FLUTTER = CFG.pulseFlutterMilli - 1;
const ARREST = CFG.pulseArrestMilli - 1;

describe("THE PULSE's bar asking", () => {
  it("asks nothing on a steady bar or once the stage is called", () => {
    for (const role of ROLES) {
      expect(halo(role, open(CFG.pulseMeterMaxMilli).pulse)).toBe(0);
      expect(halo(role, { ...open(0).pulse, phase: "verdict" })).toBe(0);
    }
  });

  it("haloes this seat's end until its thumb is down — both ends on the test screen", () => {
    expect(halo("p1", open(FLUTTER).pulse)).toBe(1);
    expect(halo("p2", open(FLUTTER).pulse)).toBe(1);
    expect(halo("test", open(FLUTTER).pulse)).toBe(2);
    expect(halo("p1", open(FLUTTER, true).pulse)).toBe(0);
    expect(halo("p2", open(FLUTTER, true).pulse)).toBe(1);
  });

  it("stands the halo on the seat's own end of the box", () => {
    const l = layout("p1");
    const b = pulseGripBox(l, CFG);
    const left = pulseEnd(l, CFG, 1);
    const right = pulseEnd(l, CFG, 2);
    expect(left.x - left.r).toBeCloseTo(b.x);
    expect(right.x + right.r).toBeCloseTo(b.x + b.w);
    expect(left.r * 2).toBeCloseTo(b.h);
  });

  it("waits on the partner only under arrest, and only once this seat holds", () => {
    expect(waiting("p1", open(FLUTTER, true).pulse)).toBe("");
    expect(waiting("p1", open(ARREST).pulse)).toBe("");
    const held = waiting("p1", open(ARREST, true).pulse);
    expect(count(held, THEIRS)).toBe(1);
    expect(count(held, CLOCK)).toBe(1);
    expect(count(waiting("p2", open(ARREST, false, true).pulse), CLOCK)).toBe(1);
    expect(waiting("p1", open(ARREST, true, true).pulse)).toBe("");
    expect(waiting("test", open(ARREST, true).pulse)).toBe("");
  });
});

const braced: SimEvent = { type: "pulseBrace", player: 2 };
const arrested: SimEvent = { type: "pulseArrest" };

describe("THE PULSE's verdict on a touch", () => {
  it("greens the braced seat's end, both on the arrest, and forgets on reset", () => {
    const marks = new PulseMarks();
    marks.ingest([braced]);
    expect(marks.verdicts.at(2)?.good).toBe(true);
    expect(marks.verdicts.at(1)).toBeNull();
    marks.ingest([{ type: "pulseSlip", player: 1 }]);
    expect(marks.verdicts.at(1)).toBeNull();
    marks.ingest([arrested]);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    marks.update(1);
    expect(marks.verdicts.at(2)).toBeNull();
    marks.ingest([braced]);
    marks.clear();
    expect(marks.verdicts.at(2)).toBeNull();
  });

  function verdicts(role: ViewRole, meter: number, over = false): string {
    const { pulse } = open(meter);
    if (over) pulse.phase = "verdict";
    const v = new GripVerdicts();
    v.mark(1, true);
    return drawn(role, (ctx, l) => drawPulseVerdicts(ctx, l, CFG, pulse, v));
  }

  it("rings the end on every screen, even on the beat the bar goes steady", () => {
    for (const role of ROLES) {
      expect(count(verdicts(role, FLUTTER), PALETTE.good)).toBeGreaterThan(0);
      expect(count(verdicts(role, CFG.pulseFlutterMilli), PALETTE.good)).toBeGreaterThan(0);
    }
  });

  it("draws none once the stage is called", () => {
    expect(verdicts("p1", 0, true)).toBe("");
  });

  /** Nine ticks of the round, `said` thrown on the first. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const { world } = open(FLUTTER);
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
    expect(count(frames(role, [arrested]), PALETTE.good)).toBeGreaterThan(
      count(frames(role, []), PALETTE.good),
    );
  });
});
