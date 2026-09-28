import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type SimEvent,
  startWave,
  step,
  type ThroatState,
  throatBoss,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { deskDown } from "../src/desk-grab.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { throatRingCircle, throatTubeCircle } from "../src/throat-grip.js";
import { drawThroatAsked, drawThroatVerdicts, ThroatMarks } from "../src/throat-marks.js";
import type { Field } from "../src/touch.js";
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
 * **THE THROAT's ring and tube answer a touch the way THE INSTAR's marks do**
 * (`throat-marks.ts`, `.claude/skills/new-boss` §5): the ring that asks this
 * seat for a thumb wears the halo — the slack ring on the navigator's screen,
 * the tube on the pilot's — with no partner's clock anywhere; a cinch and a
 * haul wash their ring green and a refused press red; a desk press is signed
 * with the ring's seat; and the verdict reaches the field's frame.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const PHASE = 0.4;
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function opened(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("throat");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function gullet(world: World): ThroatState {
  const b = throatBoss(world);
  if (b === null) throw new Error("the throat's wave installed no throat");
  return b;
}

/** Open, four rings slack and the debt paid: both rings on offer at once. */
function both(world: World): ThroatState {
  const b = gullet(world);
  b.phase = "open";
  b.phaseBeat = world.beat;
  b.slack = CFG.throatRings - 1;
  b.breath = 0;
  b.cinchBeat = -1;
  return b;
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

describe("THE THROAT's rings asking", () => {
  it("each halos on its own seat's screen alone, and stops once taken", () => {
    const world = opened();
    const b = both(world);
    const halos = (role: ViewRole) =>
      count(
        drawn(role, (ctx, l) => drawThroatAsked(ctx, l, CFG, b, world.beat, PHASE, 1.2)),
        HALO,
      );
    expect(halos("p1")).toBe(1);
    expect(halos("p2")).toBe(1);
    expect(halos("test")).toBe(2);
    b.cinchBeat = world.beat;
    expect(halos("p2")).toBe(0);
    b.phase = "slide";
    expect(halos("p1")).toBe(0);
  });
});

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: [],
    cannonCol: 0,
    shieldCol: 0,
    beatPhase: PHASE,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("a desk press", () => {
  it("on the ring is signed with the navigator, on the tube with the pilot", () => {
    const world = opened();
    const b = both(world);
    const l = layout("test");
    const r = throatRingCircle(l, CFG, b, world.beat, PHASE);
    if (r === null) throw new Error("no lowest ring");
    const onRing = deskDown(l, r.x, r.y, [1, 2], (seat) => field(world, seat));
    expect(onRing?.player).toBe(2);
    expect(onRing?.command).toMatchObject({ target: "throatRing" });
    const t = throatTubeCircle(l, CFG, b, world.beat, PHASE);
    const onTube = deskDown(l, t.x, t.y, [2, 1], (seat) => field(world, seat));
    expect(onTube?.player).toBe(1);
    expect(onTube?.command).toMatchObject({ target: "throatTube" });
  });
});

describe("THE THROAT's verdict on a touch", () => {
  it("keeps each ring's verdict under its key, fades it and forgets it on reset", () => {
    const marks = new ThroatMarks();
    marks.ingest([{ type: "throatCinch", col: 3 }]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    marks.ingest([{ type: "throatRefuse", col: 3, part: "ring", player: 1 }]);
    expect(marks.verdicts.at(0)?.good).toBe(false);
    marks.ingest([{ type: "throatHaul", col: 3 }]);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    marks.ingest([{ type: "throatRefuse", col: 3, part: "tube", player: 2 }]);
    expect(marks.verdicts.at(1)?.good).toBe(false);
    marks.update(1);
    expect(marks.verdicts.at(1)).toBeNull();
    marks.ingest([{ type: "throatHaul", col: 3 }]);
    marks.clear();
    expect(marks.verdicts.at(1)).toBeNull();
  });

  it("rings each part on every screen, since both screens draw both rings", () => {
    const world = opened();
    const b = both(world);
    for (const role of ROLES) {
      for (const key of [0, 1]) {
        for (const good of [true, false]) {
          const v = new GripVerdicts();
          v.mark(key, good);
          const log = drawn(role, (ctx, l) =>
            drawThroatVerdicts(ctx, l, CFG, b, world.beat, PHASE, v),
          );
          expect(count(log, good ? PALETTE.good : PALETTE.red), role).toBeGreaterThan(0);
        }
      }
    }
  });

  it("draws nothing while the tube everts", () => {
    const world = opened();
    const b = both(world);
    b.phase = "everts";
    const v = new GripVerdicts();
    v.mark(0, true);
    v.mark(1, false);
    expect(drawn("p1", (ctx, l) => drawThroatVerdicts(ctx, l, CFG, b, world.beat, PHASE, v))).toBe(
      "",
    );
  });

  /** Two beats of the gullet open, `said` on tick 2. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const log: string[] = [];
    runFrames(opened(), role, TPB * 2, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        step(w, []);
        if (tick === 0) both(w);
        if (tick === 2) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const refused: SimEvent[] = [{ type: "throatRefuse", col: 3, part: "tube", player: 2 }];
    expect(count(frames(role, refused), PALETTE.red)).toBeGreaterThan(
      count(frames(role, []), PALETTE.red),
    );
  });
});
