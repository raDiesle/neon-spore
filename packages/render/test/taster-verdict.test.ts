import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type SimEvent,
  startWave,
  step,
  type TasterState,
  tasterBoss,
  tasterPhase,
  tasterPinnable,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { deskDown } from "../src/desk-grab.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  tasterBladeCircle,
  tasterGapCircle,
  tasterGripUnder,
  tasterLockCircle,
} from "../src/taster-grip.js";
import {
  bladeKey,
  drawTasterAsked,
  drawTasterVerdicts,
  gapKey,
  LOCK,
  TasterMarks,
} from "../src/taster-marks.js";
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
 * **THE TASTER's three rings answer a touch the way THE INSTAR's marks do**
 * (`taster-marks.ts`, `.claude/skills/new-boss` §5): the ring offered to a
 * seat wears the halo on that seat's screen and the partner's ring and clock
 * on the other; a pin, a wipe and a pry wash theirs green and a press on the
 * other seat's red; a desk press is signed with the seat the ring is offered
 * to; and the verdict reaches the field's frame.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function standing(): World {
  const world = createWorld(CFG, 7);
  const index = waveWith("taster");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function fan(world: World): TasterState {
  const t = tasterBoss(world);
  if (t === null) throw new Error("the taster wave grew no fan");
  return t;
}

/** Strike `n` blades off, from the left, which is what `tasterPhase` counts. */
function shear(t: TasterState, n: number): void {
  for (let i = 0; i < n; i++) {
    const k = t.blades[i];
    if (k === undefined) continue;
    k.shorn = true;
    k.edge = null;
    k.layers = 0;
  }
  t.shorn = n;
}

/** The second movement, with one blade out of the crest and undecided. */
function fanning(world: World): { t: TasterState; col: number } {
  const t = fan(world);
  shear(t, CFG.tasterFanShorn);
  const i = t.blades.length - 1;
  const k = t.blades[i];
  if (k === undefined) throw new Error("no blade to grow");
  k.shorn = false;
  k.growBeat = world.beat;
  k.setBeat = -1;
  expect(tasterPhase(t, CFG)).toBe("fanning");
  return { t, col: t.col + i };
}

/** The third, with the gaps her thumb is offered. */
function hurrying(world: World): TasterState {
  const t = fan(world);
  shear(t, CFG.tasterHurryShorn);
  expect(tasterPhase(t, CFG)).toBe("hurrying");
  return t;
}

/** And the last, the interlock standing shut. */
function closed(world: World): TasterState {
  const t = fan(world);
  shear(t, t.blades.length - CFG.tasterClosedBlades);
  expect(tasterPhase(t, CFG)).toBe("closed");
  return t;
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

function asked(world: World, t: TasterState, role: ViewRole): string {
  return drawn(role, (ctx, l) => drawTasterAsked(ctx, l, CFG, t, world.beat, 1.2));
}

describe("THE TASTER's rings asking", () => {
  it("halo the pin on the pilot's screen and ring his clock on hers", () => {
    const world = standing();
    const { t } = fanning(world);
    const pins = t.blades.filter((_, i) => tasterPinnable(t, CFG, i)).length;
    expect(pins).toBeGreaterThan(0);
    expect(count(asked(world, t, "p1"), HALO)).toBe(pins);
    expect(count(asked(world, t, "p2"), HALO)).toBe(0);
    expect(asked(world, t, "p2")).not.toBe("");
  });

  it("halo every gap on the navigator's screen and none on his", () => {
    const world = standing();
    const t = hurrying(world);
    expect(count(asked(world, t, "p2"), HALO)).toBe(CFG.tasterHurryShorn);
    expect(count(asked(world, t, "p1"), HALO)).toBe(0);
    expect(asked(world, t, "p1")).not.toBe("");
  });

  it("halo the interlock on the pilot's screen while it is shut", () => {
    const world = standing();
    const t = closed(world);
    expect(count(asked(world, t, "p1"), HALO)).toBe(1);
    expect(count(asked(world, t, "p2"), HALO)).toBe(0);
  });
});

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0.4,
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

describe("a press on a ring", () => {
  it("at a desk is signed with the seat it is offered to, whichever is asked first", () => {
    const l = layout("test");
    const a = standing();
    const { col } = fanning(a);
    const pin = tasterBladeCircle(l, CFG, col);
    expect(deskDown(l, pin.x, pin.y, [2, 1], (s) => field(a, s))?.player).toBe(1);
    const b = standing();
    const t = hurrying(b);
    const gap = tasterGapCircle(l, CFG, t.col);
    expect(deskDown(l, gap.x, gap.y, [1, 2], (s) => field(b, s))?.player).toBe(2);
    const c = standing();
    const lock = tasterLockCircle(l, CFG, closed(c));
    expect(deskDown(l, lock.x, lock.y, [2, 1], (s) => field(c, s))?.player).toBe(1);
  });

  it("from the other seat is handed through with no hold, for the simulation to refuse", () => {
    const world = standing();
    const { col } = fanning(world);
    const l = layout("p2");
    const at = tasterBladeCircle(l, CFG, col);
    const touch = tasterGripUnder(l, at.x, at.y, field(world, 2));
    expect(touch?.player).toBe(2);
    expect(touch?.hold).toBeNull();
    expect(touch?.command).toMatchObject({ target: "tasterBlade", on: true, id: col });
  });
});

describe("THE TASTER's verdict on a touch", () => {
  it("keeps each ring's apart, fades them and forgets them on reset", () => {
    const marks = new TasterMarks();
    marks.ingest([{ type: "tasterPin", col: 9 }]);
    expect(marks.verdicts.at(bladeKey(9))?.good).toBe(true);
    marks.ingest([{ type: "tasterHandRefuse", col: 9, part: "gap" }]);
    expect(marks.verdicts.at(gapKey(9))?.good).toBe(false);
    expect(marks.verdicts.at(bladeKey(9))?.good).toBe(true);
    marks.ingest([{ type: "tasterPry", col: 5 }]);
    expect(marks.verdicts.at(LOCK)?.good).toBe(true);
    marks.ingest([{ type: "tasterHandRefuse", col: 5, part: "lock" }]);
    expect(marks.verdicts.at(LOCK)?.good).toBe(false);
    marks.update(1);
    expect(marks.verdicts.at(LOCK)).toBeNull();
    marks.ingest([{ type: "tasterWipe", col: 1 }]);
    expect(marks.verdicts.at(gapKey(1))?.good).toBe(true);
    marks.clear();
    expect(marks.verdicts.at(gapKey(1))).toBeNull();
  });

  it("rings every one of the three on every screen, since both screens draw them", () => {
    const world = standing();
    const t = fan(world);
    for (const role of ROLES) {
      for (const key of [bladeKey(t.col), gapKey(t.col), LOCK]) {
        const v = new GripVerdicts();
        v.mark(key, false);
        const log = drawn(role, (ctx, l) => drawTasterVerdicts(ctx, l, CFG, t, world.beat, v));
        expect(count(log, PALETTE.red), `${role} ${key}`).toBeGreaterThan(0);
      }
    }
  });

  /** Two beats of the interlock shut, `said` on tick 2. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const log: string[] = [];
    runFrames(standing(), role, TPB * 2, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        step(w, []);
        if (tick === 0) closed(w);
        if (tick === 2) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const refused: SimEvent[] = [{ type: "tasterHandRefuse", col: 5, part: "lock" }];
    expect(count(frames(role, refused), PALETTE.red)).toBeGreaterThan(
      count(frames(role, []), PALETTE.red),
    );
  });
});
