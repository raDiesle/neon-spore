import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type ScoutState,
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
import { scoutGripSeat, scoutLineCircle, scoutPrimeCircle } from "../src/scout-grip.js";
import { drawScoutAsked, drawScoutVerdicts, ScoutMarks } from "../src/scout-marks.js";
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
 * **THE SCOUT's line and prime answer a touch the way THE INSTAR's marks do**
 * (`scout-marks.ts`, `.claude/skills/new-boss` §5): the ring asked of this
 * seat wears the halo, the prime asked of the pilot wears his turning ring and
 * a clock on the navigator's screen — and the line none on his; the reel and
 * the prime wash green, the other seat's press red; a desk press is signed
 * with the ring's seat; and the verdict reaches the round's screen through the
 * takeover.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The round in its play, with `motes` aboard. */
function playing(motes = 0): { world: World; scout: ScoutState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("scout");
  startWave(world, index, [], [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 60 * TPB && world.boss?.kind === "scout" && world.boss.phase !== "play"; i++)
    step(world, []);
  const scout = world.boss;
  if (scout?.kind !== "scout" || scout.phase !== "play") throw new Error("never reached play");
  scout.carrying = Array.from({ length: motes }, (_, i) => i);
  return { world, scout };
}

const LADEN = CFG.scoutLadenMotes + 1;
const HEAVY = CFG.scoutHeavyMotes + 1;

function drawn(role: ViewRole, paint: (ctx: CanvasRenderingContext2D, l: Layout) => void) {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  paint(ctx as unknown as CanvasRenderingContext2D, layout(role));
  return log.join("|");
}

const asked = (role: ViewRole, s: ScoutState, tick = 0): string =>
  drawn(role, (ctx, l) => drawScoutAsked(ctx, l, CFG, s, tick, 1.2));

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";
const THEIRS = rgba(PALETTE.text, 0.8);
const CLOCK = rgba(PALETTE.text, 0.85);

describe("THE SCOUT's rings asking", () => {
  it("asks nothing of a light ship, or outside the play", () => {
    for (const role of ROLES) {
      expect(asked(role, playing().scout)).toBe("");
      expect(asked(role, { ...playing(HEAVY).scout, phase: "verdict" })).toBe("");
    }
  });

  it("laden: the line halos for the navigator, and the pilot is shown no clock on it", () => {
    const { scout } = playing(LADEN);
    expect(count(asked("p2", scout), HALO)).toBe(1);
    expect(asked("p1", scout)).toBe("");
    expect(asked("p2", { ...scout, reeling: true })).toBe("");
  });

  it("heavy: the prime halos for the pilot, and the navigator waits on it", () => {
    const { scout } = playing(HEAVY);
    expect(count(asked("p1", scout), HALO)).toBe(1);
    expect(count(asked("p1", scout), CLOCK)).toBe(0);
    expect(count(asked("p2", scout), HALO)).toBe(1); // her line
    expect(count(asked("p2", scout), THEIRS)).toBe(1);
    expect(count(asked("p2", scout), CLOCK)).toBe(1);
    expect(count(asked("test", scout), HALO)).toBe(2);
  });

  it("stops asking for the prime while its window runs", () => {
    const { scout } = playing(HEAVY);
    expect(asked("p1", { ...scout, primeTick: 10 }, 11)).toBe("");
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

describe("a press on the wrong seat's ring", () => {
  it("is handed through with no hold, so the simulation can refuse it", () => {
    const { world, scout } = playing(LADEN);
    const l = layout("p1");
    const at = scoutLineCircle(l, CFG, scout);
    const touch = touchDown(l, at.x, at.y, field(world, 1));
    expect(touch?.player).toBe(1);
    expect(touch?.command).toMatchObject({ kind: "drag", target: "scoutLine", on: true });
    expect(touch?.hold).toBeNull();
  });

  it("from the ring's own seat takes hold", () => {
    const { world, scout } = playing(HEAVY);
    const l = layout("p1");
    const at = scoutPrimeCircle(l, CFG, scout);
    const touch = touchDown(l, at.x, at.y, field(world, 1));
    expect(touch?.command).toMatchObject({ target: "scoutPrime" });
    expect(touch?.hold).not.toBeNull();
  });

  it("at a desk is signed with the ring's own seat instead", () => {
    const { world, scout } = playing(LADEN);
    const l = layout("test");
    const at = scoutLineCircle(l, CFG, scout);
    expect(scoutGripSeat(l, at.x, at.y, field(world, 1))).toBe(2);
    const touch = deskDown(l, at.x, at.y, [1, 2], (seat) => field(world, seat));
    expect(touch?.player).toBe(2);
    expect(touch?.hold).not.toBeNull();
  });
});

const reeled: SimEvent = { type: "scoutReel" };
const primed: SimEvent = { type: "scoutPrime" };
const refused: SimEvent = { type: "scoutRefuse", part: "prime", player: 2 };

describe("THE SCOUT's verdict on a touch", () => {
  it("keeps each ring's verdict under its key, fades it and forgets it on reset", () => {
    const marks = new ScoutMarks();
    marks.ingest([reeled]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    expect(marks.verdicts.at(1)).toBeNull();
    marks.ingest([{ type: "scoutSlip" }]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    marks.ingest([primed]);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    marks.ingest([refused]);
    expect(marks.verdicts.at(1)?.good).toBe(false);
    marks.update(1);
    expect(marks.verdicts.at(0)).toBeNull();
    marks.ingest([reeled]);
    marks.clear();
    expect(marks.verdicts.at(0)).toBeNull();
  });

  function verdicts(role: ViewRole, key: number, good: boolean, over = false): string {
    const { scout } = playing(HEAVY);
    if (over) scout.phase = "verdict";
    const v = new GripVerdicts();
    v.mark(key, good);
    return drawn(role, (ctx, l) => drawScoutVerdicts(ctx, l, CFG, scout, v));
  }

  it("rings each part on every screen, since both screens draw both rings", () => {
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
    const { world } = playing(HEAVY);
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
    expect(count(frames(role, [primed]), PALETTE.good)).toBeGreaterThan(
      count(frames(role, []), PALETTE.good),
    );
  });
});
