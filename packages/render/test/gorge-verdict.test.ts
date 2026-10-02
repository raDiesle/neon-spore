import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  type GorgeLevel,
  type GorgeState,
  gorgeBoss,
  gorgeBottom,
  midCol,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { GorgeFx } from "../src/gorge-fx.js";
import { drawGorgeAsked, drawGorgeVerdicts } from "../src/gorge-marks.js";
import { GripVerdicts } from "../src/grip-verdict.js";
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
 * **THE GORGE's tap answers a touch the way THE INSTAR's marks do**
 * (`gorge-marks.ts`, `.claude/skills/new-boss` §5): the ring's bottom bubble,
 * shut and due, wears the halo on the pilot's screen alone; a tap washes its
 * ring green and a spit washes it red, on the screen that draws the ring;
 * and the verdict reaches the field's frame.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const PHASE = 0.4;
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);
/** A ring in any order, so the bubble at the bottom is due from the start. */
const RING: GorgeLevel = {
  intakes: 5,
  ordered: false,
  ring: true,
  mixed: 0,
  needMin: 2,
  needMax: 3,
};

function opened(): World {
  const world = createWorld(CFG, 5);
  startWave(world, waveWith("gorge"), [], [], { kind: "gorge", levels: [RING] });
  return world;
}

function sack(world: World): GorgeState {
  const g = gorgeBoss(world);
  if (g === null) throw new Error("the gorge wave installed no sack");
  return g;
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

describe("THE GORGE's ring asking", () => {
  it("halos on the pilot's screen alone, and stops once the bubble is open", () => {
    const world = opened();
    const g = sack(world);
    const halos = (role: ViewRole) =>
      count(
        drawn(role, (ctx, l) => drawGorgeAsked(ctx, l, CFG, g, world.beat, PHASE, 1.2)),
        HALO,
      );
    expect(halos("p1")).toBe(1);
    expect(halos("p2")).toBe(0);
    expect(halos("test")).toBe(1);
    const k = g.intakes[gorgeBottom(g)];
    if (k) k.taps = CFG.gorgeOpenTaps;
    expect(halos("p1")).toBe(0);
  });
});

describe("THE GORGE's verdict on a touch", () => {
  it("keeps the ring's verdict under its column, fades it and forgets it on reset", () => {
    const fx = new GorgeFx();
    const l = layout("test");
    const none = () => {};
    const row = CFG.gorgeRow + CFG.gorgeRingRows;
    fx.ingest([{ type: "gorgeTap", row, col: 5, left: 2 }], l, none);
    expect(fx.verdicts.at(5)?.good).toBe(true);
    fx.ingest([{ type: "gorgeSpit", row, col: 5, color: "red" }], l, none);
    expect(fx.verdicts.at(5)?.good).toBe(false);
    fx.update(1);
    expect(fx.verdicts.at(5)).toBeNull();
    fx.ingest([{ type: "gorgeTap", row, col: 5, left: 1 }], l, none);
    fx.clear();
    expect(fx.verdicts.at(5)).toBeNull();
  });

  it("rings the tap's ring on the screens that draw it, and no other", () => {
    const world = opened();
    const g = sack(world);
    const shown = (role: ViewRole, good: boolean) => {
      const v = new GripVerdicts();
      v.mark(midCol(CFG), good);
      const log = drawn(role, (ctx, l) => drawGorgeVerdicts(ctx, l, CFG, g, world.beat, PHASE, v));
      return count(log, good ? PALETTE.good : PALETTE.red) > 0;
    };
    expect([shown("p1", true), shown("p2", true), shown("test", true)]).toEqual([
      true,
      false,
      true,
    ]);
    expect([shown("p1", false), shown("p2", false)]).toEqual([true, false]);
  });

  /** Two beats of the ring, `said` on tick 2. */
  function frames(role: ViewRole, said: (w: World) => SimEvent[]): string {
    const log: string[] = [];
    runFrames(opened(), role, TPB * 2, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        step(w, []);
        if (tick === 2) w.events.push(...said(w));
      },
    });
    return log.join("|");
  }

  const tapped = (w: World): SimEvent[] => [
    { type: "gorgeTap", row: w.cfg.gorgeRow + w.cfg.gorgeRingRows, col: midCol(w.cfg), left: 2 },
  ];

  it.each(["p1", "test"] as const)("reaches the field's frame, on %s", (role) => {
    expect(count(frames(role, tapped), PALETTE.good)).toBeGreaterThan(
      count(
        frames(role, () => []),
        PALETTE.good,
      ),
    );
  });

  it("is not on the navigator's frame", () => {
    expect(count(frames("p2", tapped), PALETTE.good)).toBe(
      count(
        frames("p2", () => []),
        PALETTE.good,
      ),
    );
  });
});
