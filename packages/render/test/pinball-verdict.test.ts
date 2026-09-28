import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type PinballState,
  pinballRound,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { deskDown } from "../src/desk-grab.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { rgba } from "../src/hex.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { pinballGripSeat, pinPlungerCircle, pinTableCircle } from "../src/pinball-grip.js";
import { drawPinballAsked, drawPinballVerdicts, PinballMarks } from "../src/pinball-marks.js";
import { type Field, touchDown } from "../src/touch.js";
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
 * **PINBALL's plunger and table answer a touch the way THE INSTAR's marks
 * do** (`pinball-marks.ts`, `.claude/skills/new-boss` §5): the part asked of
 * this seat wears the halo while it is asked, the part asked of the partner
 * their turning ring and a clock; the wind and the shove wash it green, the
 * tilt and the other seat's press red; a desk press is signed with the seat
 * the part is asked of; and the verdict reaches the round's screen through the
 * takeover.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function playing(shot: "power" | "flight" | "aim" = "aim"): { world: World; pin: PinballState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("pinball");
  startWave(world, index, [], [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 40 * TPB && pinballRound(world)?.phase !== "play"; i++) step(world, []);
  const pin = pinballRound(world);
  if (pin === null || pin.phase !== "play") throw new Error("the round never reached play");
  Object.assign(pin, { shot, slack: shot === "power", nudges: 0, tilted: false });
  return { world, pin };
}

function drawn(role: ViewRole, paint: (ctx: CanvasRenderingContext2D, l: Layout) => void) {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  paint(ctx as unknown as CanvasRenderingContext2D, layout(role));
  return log.join("|");
}

function asked(role: ViewRole, pin: PinballState): string {
  return drawn(role, (ctx, l) => drawPinballAsked(ctx, l, CFG, pin, 1.2));
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";
const THEIRS = rgba(PALETTE.text, 0.8);
const CLOCK = rgba(PALETTE.text, 0.85);

describe("PINBALL's parts asking", () => {
  it("asks nothing in the aim, on a tilted table, or outside the play", () => {
    for (const role of ROLES) {
      expect(asked(role, playing().pin)).toBe("");
      expect(asked(role, { ...playing("flight").pin, tilted: true })).toBe("");
      expect(asked(role, { ...playing("power").pin, phase: "verdict" })).toBe("");
    }
  });

  it("on a slack spring: the plunger halos for the pilot, and the driver waits on it", () => {
    const { pin } = playing("power");
    expect(count(asked("p1", pin), HALO)).toBe(1);
    expect(count(asked("p1", pin), CLOCK)).toBe(0);
    expect(count(asked("p2", pin), HALO)).toBe(0);
    expect(count(asked("p2", pin), THEIRS)).toBe(1);
    expect(count(asked("p2", pin), CLOCK)).toBe(1);
  });

  it("in a flight: the table halos for the driver, and the pilot waits on it", () => {
    const { pin } = playing("flight");
    expect(count(asked("p2", pin), HALO)).toBe(1);
    expect(count(asked("p1", pin), HALO)).toBe(0);
    expect(count(asked("p1", pin), CLOCK)).toBe(1);
    expect(count(asked("test", pin), HALO)).toBe(1);
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

describe("a press on the wrong seat's part", () => {
  it("is handed through with no hold, so the simulation can refuse it", () => {
    const { world } = playing("power");
    const l = layout("p2");
    const at = pinPlungerCircle(l, CFG);
    const touch = touchDown(l, at.x, at.y, field(world, 2));
    expect(touch?.player).toBe(2);
    expect(touch?.command).toMatchObject({ kind: "drag", target: "pinPlunger", on: true });
    expect(touch?.hold).toBeNull();
  });

  it("at a desk is signed with the part's own seat instead", () => {
    const { world } = playing("flight");
    const l = layout("test");
    const at = pinTableCircle(l, CFG);
    expect(pinballGripSeat(l, at.x, at.y, field(world, 1))).toBe(2);
    const plunger = pinPlungerCircle(l, CFG);
    expect(pinballGripSeat(l, plunger.x, plunger.y, field(world, 1))).toBeUndefined();
    const touch = deskDown(l, at.x, at.y, [1, 2], (seat) => field(world, seat));
    expect(touch?.player).toBe(2);
    expect(touch?.hold).not.toBeNull();
  });
});

const wound: SimEvent = { type: "pinWind" };
const shoved: SimEvent = { type: "pinNudge", way: 1 };
const tilted: SimEvent = { type: "pinTilt" };
const refused: SimEvent = { type: "pinRefuse", part: "plunger", player: 2 };

describe("PINBALL's verdict on a touch", () => {
  it("keeps each part's verdict under its key, fades it and forgets it on reset", () => {
    const marks = new PinballMarks();
    marks.ingest([wound]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    expect(marks.verdicts.at(1)).toBeNull();
    marks.ingest([shoved]);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    marks.ingest([tilted]);
    expect(marks.verdicts.at(1)?.good).toBe(false);
    marks.ingest([refused]);
    expect(marks.verdicts.at(0)?.good).toBe(false);
    marks.update(1);
    expect(marks.verdicts.at(0)).toBeNull();
    marks.ingest([wound]);
    marks.clear();
    expect(marks.verdicts.at(0)).toBeNull();
  });

  function verdicts(role: ViewRole, key: number, good: boolean, over = false): string {
    const { pin } = playing();
    if (over) pin.phase = "verdict";
    const v = new GripVerdicts();
    v.mark(key, good);
    return drawn(role, (ctx, l) => drawPinballVerdicts(ctx, l, CFG, pin, v));
  }

  it("rings each part on every screen, since both screens draw both parts", () => {
    for (const role of ROLES) {
      for (const key of [0, 1]) {
        expect(count(verdicts(role, key, true), PALETTE.good)).toBeGreaterThan(0);
        expect(count(verdicts(role, key, false), PALETTE.red)).toBeGreaterThan(0);
      }
    }
  });

  it("draws none once the round is over", () => {
    expect(verdicts("p1", 0, true, true)).toBe("");
  });

  /** Nine ticks of the round in its play, `said` thrown on the first. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const { world } = playing();
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
    expect(count(frames(role, [wound]), PALETTE.good)).toBeGreaterThan(
      count(frames(role, []), PALETTE.good),
    );
  });
});
