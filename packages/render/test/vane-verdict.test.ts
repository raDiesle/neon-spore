import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type VaneState,
} from "@neon-spore/sim";
import { deskDown } from "../src/desk-grab.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { rgba } from "../src/hex.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import type { Field } from "../src/touch.js";
import { vaneArmCircle, vaneGripSeat, vaneHousingCircle } from "../src/vane-grip.js";
import { drawVaneAsked, drawVaneVerdicts, VaneMarks } from "../src/vane-marks.js";
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
 * **THE VANE's arm and housing answer a touch the way THE INSTAR's marks
 * do** (`instar-verdict.test.ts`, `.claude/skills/new-boss` §5): a pin
 * landing washes the arm green and a haul the housing, a press from the seat
 * the part is not asked of red; the part asked of this seat wears the halo
 * and the one asked of the partner their turning ring and a clock; a desk
 * press is signed with the seat the part is asked of; and the verdict is a
 * transient the next run does not inherit.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

const BEAT = 6;

/** VEER, the arm sweeping — or what `overrides` says. */
function vane(overrides: Partial<VaneState> = {}): VaneState {
  return {
    kind: "vane",
    pins: 2,
    spentOpening: -1,
    throwBeat: -1,
    throwCol: -1,
    pinBeat: -1,
    pinCol: -1,
    pinSide: 0,
    hauled: false,
    spentPin: -1,
    ...overrides,
  };
}

/** SEIZE, the arm pinned this beat and the housing not yet hauled. */
const seized = (overrides: Partial<VaneState> = {}) =>
  vane({ pins: 1, pinBeat: BEAT, pinCol: 2, pinSide: 1, ...overrides });

const TIP = { x: 120, y: 90 };

/** What the asking draws on a role's screen. */
function asked(role: ViewRole, b: VaneState): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  drawVaneAsked(ctx as unknown as CanvasRenderingContext2D, layout(role), CFG, b, BEAT, TIP, 1.2);
  return log.join("|");
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";
const THEIRS = rgba(PALETTE.text, 0.8);
const CLOCK = rgba(PALETTE.text, 0.85);

describe("THE VANE's parts asking", () => {
  it("under VEER the arm: the halo for the pilot, their ring and the clock for the navigator", () => {
    expect(count(asked("p1", vane()), HALO)).toBe(1);
    expect(count(asked("p1", vane()), THEIRS)).toBe(0);
    expect(count(asked("p2", vane()), HALO)).toBe(0);
    expect(count(asked("p2", vane()), THEIRS)).toBe(1);
    expect(count(asked("p2", vane()), CLOCK)).toBe(1);
  });

  it("under SEIZE with the pin standing, the housing: the other way about", () => {
    expect(count(asked("p2", seized()), HALO)).toBe(1);
    expect(count(asked("p2", seized()), THEIRS)).toBe(0);
    expect(count(asked("p1", seized()), HALO)).toBe(0);
    expect(count(asked("p1", seized()), CLOCK)).toBe(1);
  });

  it("asks nothing under SWING, or once the housing is hauled", () => {
    for (const role of ROLES) {
      expect(asked(role, vane({ pins: 4 }))).toBe("");
      expect(asked(role, seized({ hauled: true }))).toBe("");
    }
  });
});

function field(seat: 1 | 2, boss: VaneState): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: BEAT,
    waveBeat: BEAT,
    tick: 0,
    seat,
    cfg: CFG,
    boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("a desk press on a part", () => {
  const l = layout("test");

  it("names the seat each part is asked of, and nobody off them", () => {
    const b = vane();
    const armAt = vaneArmCircle(l, CFG, b, BEAT, BEAT, 0.5);
    expect(vaneGripSeat(l, armAt.x, armAt.y, field(2, b))).toBe(1);
    const housingAt = vaneHousingCircle(l, CFG);
    expect(vaneGripSeat(l, housingAt.x, housingAt.y, field(1, seized()))).toBe(2);
    expect(vaneGripSeat(l, housingAt.x, housingAt.y, field(1, b))).toBeUndefined();
  });

  it("is signed with that seat, so one mouse hauls the navigator's housing", () => {
    const at = vaneHousingCircle(l, CFG);
    const touch = deskDown(l, at.x, at.y, [1, 2], (seat) => field(seat, seized()));
    expect(touch?.player).toBe(2);
    expect(touch?.hold).not.toBeNull();
  });
});

const pinned: SimEvent = { type: "vanePin", col: 3 };
const hauled: SimEvent = { type: "vaneHaul", col: 5 };
const refused: SimEvent = { type: "vaneRefuse", col: 3, part: "arm", player: 2 };

describe("THE VANE's verdict on a touch", () => {
  it("keeps each part's verdict under its key, fades it and forgets it on reset", () => {
    const marks = new VaneMarks();
    marks.ingest([pinned, hauled]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    marks.ingest([refused]);
    expect(marks.verdicts.at(0)?.good).toBe(false);
    marks.update(1);
    expect(marks.verdicts.at(0)).toBeNull();
    marks.ingest([hauled]);
    marks.clear();
    expect(marks.verdicts.at(1)).toBeNull();
  });

  it("a pin lost is no verdict", () => {
    const marks = new VaneMarks();
    marks.ingest([{ type: "vaneSlip", col: 3 }]);
    expect(marks.verdicts.at(0)).toBeNull();
  });

  it("draws the ring on the part it is kept under, green or red", () => {
    const { ctx } = stubCanvas();
    const log: string[] = [];
    ctx.log = log;
    const v = new GripVerdicts();
    v.mark(1, false);
    drawVaneVerdicts(ctx as unknown as CanvasRenderingContext2D, layout("p1"), CFG, TIP, v);
    expect(count(log.join("|"), PALETTE.red)).toBeGreaterThan(0);
    expect(count(log.join("|"), PALETTE.good)).toBe(0);
  });

  /** Nine ticks of its wave, `said` thrown on the first. */
  function drawn(role: ViewRole, said: SimEvent[]): string {
    const world = createWorld(CFG, 7);
    const index = waveWith("vane");
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    for (let i = 0; i < ticksPerBeat(CFG) * 2; i++) step(world, []);
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

  it.each(ROLES)("reaches the field from the effects, on %s", (role) => {
    expect(count(drawn(role, [pinned]), PALETTE.good)).toBeGreaterThan(
      count(drawn(role, []), PALETTE.good),
    );
    expect(count(drawn(role, [refused]), PALETTE.red)).toBeGreaterThan(
      count(drawn(role, []), PALETTE.red),
    );
  });
});
