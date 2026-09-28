import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GorgeState,
  gorgeBoss,
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
  ROLES,
  runFrames,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GORGE's pinch and pry answer a touch the way THE INSTAR's marks do**
 * (`gorge-marks.ts`, `.claude/skills/new-boss` §5): a ring that asks this
 * seat for a thumb wears the halo on that seat's screen alone; a pinch and a
 * pry wash their ring green and a clench washes the mouth red, on the screen
 * that draws the ring; and the verdict reaches the field's frame.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const PHASE = 0.4;
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function opened(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gorge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

/** Intake 2 full for the pilot's pinch, and the mouth at 5 for her pry. */
function staged(world: World): GorgeState {
  const g = gorgeBoss(world);
  if (g === null) throw new Error("the gorge wave installed no sack");
  for (const [i, color] of [
    [2, "red"],
    [5, "cyan"],
  ] as const) {
    const k = g.intakes[i];
    if (k === undefined) throw new Error("the sack is short of intakes");
    k.beads = CFG.gorgeFullBeads;
    k.color = color;
    k.fullBeat = world.beat;
  }
  g.mouth = 5;
  g.ruptures = CFG.gorgeMouthRuptures;
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

describe("THE GORGE's rings asking", () => {
  it("halo on their own seat's screen alone, and stop once a thumb is down", () => {
    const world = opened();
    const g = staged(world);
    const halos = (role: ViewRole) =>
      count(
        drawn(role, (ctx, l) => drawGorgeAsked(ctx, l, CFG, g, world.beat, PHASE, 1.2)),
        HALO,
      );
    expect(halos("p1")).toBe(1);
    expect(halos("p2")).toBe(1);
    expect(halos("test")).toBe(2);
    g.pinch = 2;
    expect(halos("p1")).toBe(0);
    g.pry = 5;
    expect(halos("p2")).toBe(0);
  });
});

describe("THE GORGE's verdict on a touch", () => {
  it("keeps each ring's verdict under its column, fades it and forgets it on reset", () => {
    const fx = new GorgeFx();
    const l = layout("test");
    const none = () => {};
    fx.ingest([{ type: "gorgePinch", col: 3 }], l, none);
    expect(fx.verdicts.at(3)?.good).toBe(true);
    fx.ingest([{ type: "gorgePry", col: 6 }], l, none);
    expect(fx.verdicts.at(6)?.good).toBe(true);
    fx.ingest([{ type: "gorgeClench", col: 6 }], l, none);
    expect(fx.verdicts.at(6)?.good).toBe(false);
    fx.update(1);
    expect(fx.verdicts.at(6)).toBeNull();
    fx.ingest([{ type: "gorgePry", col: 6 }], l, none);
    fx.clear();
    expect(fx.verdicts.at(6)).toBeNull();
  });

  it("rings each thumb's ring on the screens that draw it, and no other", () => {
    const world = opened();
    const g = staged(world);
    const shown = (role: ViewRole, col: number, good: boolean) => {
      const v = new GripVerdicts();
      v.mark(col, good);
      const log = drawn(role, (ctx, l) => drawGorgeVerdicts(ctx, l, CFG, g, world.beat, PHASE, v));
      return count(log, good ? PALETTE.good : PALETTE.red) > 0;
    };
    const pinched = g.col + 2;
    const mouth = g.col + 5;
    expect([shown("p1", pinched, true), shown("p2", pinched, true)]).toEqual([true, false]);
    expect([shown("p1", mouth, false), shown("p2", mouth, false)]).toEqual([false, true]);
    expect([shown("test", pinched, true), shown("test", mouth, false)]).toEqual([true, true]);
  });

  /** Two beats of the sack staged, `said` on tick 2. */
  function frames(role: ViewRole, said: (w: World) => SimEvent[]): string {
    const log: string[] = [];
    runFrames(opened(), role, TPB * 2, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        step(w, []);
        if (tick === 0) staged(w);
        if (tick === 2) w.events.push(...said(w));
      },
    });
    return log.join("|");
  }

  /** A pinch on the pilot's screen and a clench on the others, and its colour. */
  function said(role: ViewRole): { colour: string; events: (w: World) => SimEvent[] } {
    const at = (w: World, i: number): number => (gorgeBoss(w)?.col ?? 0) + i;
    if (role === "p1") {
      return { colour: PALETTE.good, events: (w) => [{ type: "gorgePinch", col: at(w, 2) }] };
    }
    return { colour: PALETTE.red, events: (w) => [{ type: "gorgeClench", col: at(w, 5) }] };
  }

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const { colour, events } = said(role);
    expect(count(frames(role, events), colour)).toBeGreaterThan(
      count(
        frames(role, () => []),
        colour,
      ),
    );
  });
});
