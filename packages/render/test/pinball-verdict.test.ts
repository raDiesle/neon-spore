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
import { GripVerdicts } from "../src/grip-verdict.js";
import { rgba } from "../src/hex.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { pinballGripSeat, pinPlungerCircle } from "../src/pinball-grip.js";
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
 * **PINBALL's plunger answers a touch the way THE INSTAR's marks do**
 * (`pinball-marks.ts`, `.claude/skills/new-boss` §5): it wears the halo on
 * the pilot's screen while it is asked, the partner's turning ring and a clock
 * on the driver's; the wind washes it green and the driver's press red; a desk
 * press is signed with his seat; and the verdict reaches the round's screen
 * through the takeover. The shove is ◀ and ▶ on the band since 10 October
 * 2026, so a flight asks nothing of the field.
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
  it("asks nothing in the aim, in a flight, or outside the play", () => {
    for (const role of ROLES) {
      expect(asked(role, playing().pin)).toBe("");
      expect(asked(role, playing("flight").pin)).toBe("");
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

  it("at a desk signs the slack plunger with his seat", () => {
    const { world } = playing("power");
    const l = layout("test");
    const at = pinPlungerCircle(l, CFG);
    expect(pinballGripSeat(l, at.x, at.y, field(world, 2))).toBe(1);
  });
});

const wound: SimEvent = { type: "pinWind" };
const shoved: SimEvent = { type: "pinNudge", way: 1 };
const refused: SimEvent = { type: "pinRefuse", part: "plunger", player: 2 };

describe("PINBALL's verdict on a touch", () => {
  it("keeps the plunger's verdict, fades it and forgets it on reset", () => {
    const marks = new PinballMarks();
    marks.ingest([wound]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    // A shove is answered on its button, not on the field.
    marks.ingest([shoved]);
    expect(marks.verdicts.at(1)).toBeNull();
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

  it("rings the plunger on every screen, since both screens draw it", () => {
    for (const role of ROLES) {
      expect(count(verdicts(role, 0, true), PALETTE.good)).toBeGreaterThan(0);
      expect(count(verdicts(role, 0, false), PALETTE.red)).toBeGreaterThan(0);
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
