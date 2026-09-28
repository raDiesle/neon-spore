import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  type Creature,
  type CurtainState,
  createWorld,
  curtainBody,
  curtainBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { curtainHemRest, curtainHemUnder } from "../src/curtain-grip.js";
import {
  CurtainMarks,
  drawCurtainAsked,
  drawCurtainVerdicts,
  HEM,
  SHEET,
} from "../src/curtain-marks.js";
import { deskDown } from "../src/desk-grab.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
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
 * **THE CURTAIN's hem and sheet answer a touch the way THE INSTAR's marks do**
 * (`curtain-marks.ts`, `.claude/skills/new-boss` §5): the hem asks the pilot
 * while the rail is jammed and it is at rest — the halo on his screen, his
 * partner's ring and clock on hers — a lift to the top washes it green and
 * her press on it red; a shove is green on the sheet and a shove into the
 * jam red; a desk press on the hem is signed with the pilot; and the verdict
 * reaches the field's frame.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const PHASE = 0.4;
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("curtain");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function sheet(world: World): { c: CurtainState; body: Creature } {
  const c = curtainBoss(world);
  if (c === null) throw new Error("the curtain wave hung no fabric");
  const body = curtainBody(world, c);
  if (body === undefined) throw new Error("the fabric is gone already");
  return { c, body };
}

/** The rail jammed by a hit and the hem at rest: the one state the hem asks in. */
function jammed(world: World): { c: CurtainState; body: Creature } {
  const s = sheet(world);
  s.c.phase = "pinned";
  s.c.phaseBeat = world.beat;
  s.c.liftMilli = 0;
  return s;
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

describe("THE CURTAIN's hem asking", () => {
  it("halos on the pilot's screen, rings his partner's clock on hers, and stops once lifted", () => {
    const world = hung();
    const { c, body } = jammed(world);
    const asked = (role: ViewRole) =>
      drawn(role, (ctx, l) => drawCurtainAsked(ctx, l, CFG, c, body, PHASE, 1.2));
    expect(count(asked("p1"), HALO)).toBe(1);
    expect(count(asked("test"), HALO)).toBe(1);
    expect(count(asked("p2"), HALO)).toBe(0);
    expect(asked("p2")).not.toBe("");
    c.liftMilli = 1;
    expect(asked("p1")).toBe("");
    expect(asked("p2")).toBe("");
    c.liftMilli = 0;
    c.phase = "hung";
    expect(asked("p1")).toBe("");
  });
});

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
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

describe("a press on the hem", () => {
  it("at a desk is signed with the pilot, whichever seat is asked first", () => {
    const world = hung();
    const { body } = jammed(world);
    const l = layout("test");
    const r = curtainHemRest(l, CFG, body, PHASE);
    if (r === null) throw new Error("no hem on the field");
    const down = deskDown(l, r.x, r.y, [2, 1], (seat) => field(world, seat));
    expect(down?.player).toBe(1);
    expect(down?.command).toMatchObject({ target: "curtainHem" });
  });

  it("from her screen is handed through with no hold, for the simulation to refuse", () => {
    const world = hung();
    const { body } = jammed(world);
    const l = layout("p2");
    const r = curtainHemRest(l, CFG, body, PHASE);
    if (r === null) throw new Error("no hem on the field");
    const t = curtainHemUnder(l, r.x, r.y, field(world, 2));
    expect(t?.player).toBe(2);
    expect(t?.hold).toBeNull();
    expect(t?.command).toMatchObject({ target: "curtainHem", on: true });
  });
});

describe("THE CURTAIN's verdict on a touch", () => {
  it("keeps the hem's and the sheet's apart, fades them and forgets them on reset", () => {
    const marks = new CurtainMarks();
    marks.ingest([{ type: "curtainLift", col: 4 }]);
    expect(marks.verdicts.at(HEM)?.good).toBe(true);
    marks.ingest([{ type: "curtainRefuse", col: 4 }]);
    expect(marks.verdicts.at(HEM)?.good).toBe(false);
    marks.ingest([{ type: "curtainShove", col: 2, dir: 1, stride: 1 }]);
    expect(marks.verdicts.at(SHEET)?.good).toBe(true);
    marks.ingest([{ type: "curtainJam", col: 2, dir: 1 }]);
    expect(marks.verdicts.at(SHEET)?.good).toBe(false);
    marks.update(1);
    expect(marks.verdicts.at(HEM)).toBeNull();
    marks.ingest([{ type: "curtainLift", col: 4 }]);
    marks.clear();
    expect(marks.verdicts.at(HEM)).toBeNull();
  });

  it("rings the hem on every screen, since both screens draw it", () => {
    const world = hung();
    const { c, body } = jammed(world);
    for (const role of ROLES) {
      for (const good of [true, false]) {
        const v = new GripVerdicts();
        v.mark(HEM, good);
        const log = drawn(role, (ctx, l) => drawCurtainVerdicts(ctx, l, world, c, body, PHASE, v));
        expect(count(log, good ? PALETTE.good : PALETTE.red), role).toBeGreaterThan(0);
      }
    }
  });

  it("rings the sheet only while a hand is on it, since its ring is only drawn then", () => {
    const world = hung();
    const { c, body } = sheet(world);
    const v = new GripVerdicts();
    v.mark(SHEET, false);
    const paint = (ctx: CanvasRenderingContext2D, l: Layout) =>
      drawCurtainVerdicts(ctx, l, world, c, body, PHASE, v);
    expect(drawn("p1", paint)).toBe("");
    world.gripP1 = body.id;
    expect(count(drawn("p1", paint), PALETTE.red)).toBeGreaterThan(0);
  });

  /** Two beats of the rail jammed, `said` on tick 2. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const log: string[] = [];
    runFrames(hung(), role, TPB * 2, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        step(w, []);
        if (tick === 0) jammed(w);
        if (tick === 2) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const refused: SimEvent[] = [{ type: "curtainRefuse", col: 4 }];
    expect(count(frames(role, refused), PALETTE.red)).toBeGreaterThan(
      count(frames(role, []), PALETTE.red),
    );
  });
});
