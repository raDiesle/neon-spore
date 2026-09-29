import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type MazeState,
  mazeWheel,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { deskDown } from "../src/desk-grab.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { rgba } from "../src/hex.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { mazeGripSeat, mazeHeartCircle } from "../src/maze-grip.js";
import { drawMazeAsked, drawMazeVerdicts, MazeMarks } from "../src/maze-marks.js";
import { mazeStringCircle } from "../src/maze-string.js";
import { PALETTE } from "../src/palette.js";
import type { Field } from "../src/touch.js";
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
 * **THE MAZE's string and heart answer a touch the way THE INSTAR's marks do**
 * (`instar-verdict.test.ts`, `.claude/skills/new-boss` §5): her thumb landing
 * on the heart washes it green and the tear both parts, the other seat's
 * refused press red; a part asked of this seat wears the halo until this hand
 * is on it, and one asked only of the partner their turning ring and a clock;
 * a desk press is signed with the seat the part is asked of; and the verdict
 * is a transient the next run does not inherit.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** One small drum with two ways into the middle (`maze-draw.test.ts`). */
function wheel() {
  return mazeWheel(
    {
      rings: 3,
      coreMilli: 250,
      openMilli: 60,
      walls: [[], [0, 180_000], [0, 180_000], [0, 180_000]],
      openings: [
        [90_000, 270_000],
        [45_000, 225_000],
        [45_000, 225_000],
        [45_000, 225_000],
      ],
    },
    15_000,
  );
}

/** The wheel up and turning: `read` — or what `overrides` says. */
function maze(overrides: Partial<MazeState> = {}): MazeState {
  return {
    kind: "maze",
    rounds: [wheel()],
    round: 0,
    phase: "read",
    phaseBeat: 4,
    angleMilli: 15_000,
    turn: 0,
    dragging: false,
    dragFromMilli: 0,
    armed: true,
    lockedCol: -1,
    lockedWay: -1,
    way: -1,
    shotColor: -1,
    step: 0,
    tried: [],
    hullMilli: 100_000,
    scars: [],
    verdict: 0,
    verdictCol: -1,
    lost: null,
    gripSeats: 0,
    gripFromMilli: [0, 0, 0, 0],
    gripXMilli: 0,
    gripYMilli: 0,
    gripShookMilli: [0, 0],
    ...overrides,
  };
}

const grip = (overrides: Partial<MazeState> = {}) =>
  maze({ phase: "grip", way: 0, shotColor: 0, ...overrides });

/** What the asking draws on a role's screen. */
function asked(role: ViewRole, m: MazeState): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  drawMazeAsked(ctx as unknown as CanvasRenderingContext2D, layout(role), CFG, m, 1.2);
  return log.join("|");
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";
const THEIRS = rgba(PALETTE.text, 0.8);
const CLOCK = rgba(PALETTE.text, 0.85);

describe("THE MAZE's parts asking", () => {
  it("under read: the string halos for the pilot, and the navigator waits on it", () => {
    expect(count(asked("p1", maze()), HALO)).toBe(1);
    expect(count(asked("p1", maze()), THEIRS)).toBe(0);
    expect(count(asked("p2", maze()), HALO)).toBe(0);
    expect(count(asked("p2", maze()), THEIRS)).toBe(1);
    expect(count(asked("p2", maze()), CLOCK)).toBe(1);
  });

  it("under grip: the heart is both seats', and the halo leaves it under this seat's thumb", () => {
    for (const role of ["p1", "p2"] as const) {
      expect(count(asked(role, grip()), HALO)).toBe(1);
      expect(count(asked(role, grip()), THEIRS)).toBe(0);
    }
    expect(count(asked("p1", grip({ gripSeats: 1 })), HALO)).toBe(0);
    expect(count(asked("p2", grip({ gripSeats: 2 })), HALO)).toBe(0);
    // The partner's thumb on the heart leaves this seat still asked.
    expect(count(asked("p1", grip({ gripSeats: 2 })), HALO)).toBe(1);
  });

  it("asks nothing while the shot walks or the verdict stands", () => {
    for (const role of ROLES) {
      expect(asked(role, maze({ phase: "travel" }))).toBe("");
      expect(asked(role, maze({ phase: "verdict" }))).toBe("");
    }
  });
});

const field = (seat: 1 | 2, boss: MazeState): Field => ({
  creatures: [],
  cannonCol: 4,
  shieldCol: 4,
  beatPhase: 0.5,
  skinY: null,
  beat: 6,
  waveBeat: 6,
  tick: 0,
  seat,
  cfg: CFG,
  boss,
  controls: controlSet("default"),
  faults: [],
  well: false,
});

describe("a desk press on a part", () => {
  const l = layout("test");

  it("names the seat a part is asked of, and nobody where nothing is", () => {
    const heart = mazeHeartCircle(l, CFG, grip());
    const string = mazeStringCircle(l, CFG);
    expect(mazeGripSeat(l, heart.x, heart.y, field(1, grip()))).toBe(2);
    // The heart is both seats', so one mouse takes whichever half is behind.
    const behind = grip({ gripShookMilli: [0, 500] });
    expect(mazeGripSeat(l, heart.x, heart.y, field(1, behind))).toBe(1);
    expect(mazeGripSeat(l, string.x, string.y, field(1, maze()))).toBe(1);
    expect(mazeGripSeat(l, string.x, string.y, field(1, grip()))).toBeUndefined();
    expect(mazeGripSeat(l, heart.x, heart.y, field(1, maze()))).toBeUndefined();
  });

  it("is signed with that seat, so one mouse takes the heart's half that is behind", () => {
    const heart = mazeHeartCircle(l, CFG, grip());
    const touch = deskDown(l, heart.x, heart.y, [1, 2], (seat) => field(seat, grip()));
    expect(touch?.player).toBe(2);
    expect(touch?.hold).not.toBeNull();
  });
});

const landed: SimEvent = { type: "mazeGrip", col: 4, on: true };
const torn: SimEvent = { type: "mazeVerdict", right: true, col: 4, reason: "mouth" };
const refused: SimEvent = { type: "mazeRefuse", col: 4, player: 2 };

describe("THE MAZE's verdict on a touch", () => {
  it("keeps each part's verdict under its key, fades it and forgets it on reset", () => {
    const marks = new MazeMarks();
    marks.ingest([landed]);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    expect(marks.verdicts.at(0)).toBeNull();
    marks.ingest([refused]);
    expect(marks.verdicts.at(0)?.good).toBe(false);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    marks.ingest([torn]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    marks.ingest([refused]);
    expect(marks.verdicts.at(0)?.good).toBe(false);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    marks.update(1);
    expect(marks.verdicts.at(1)).toBeNull();
    marks.ingest([landed]);
    marks.clear();
    expect(marks.verdicts.at(1)).toBeNull();
  });

  it("a thumb lost and a wrong verdict are no verdict on a part", () => {
    const marks = new MazeMarks();
    marks.ingest([
      { type: "mazeGrip", col: 4, on: false },
      { type: "mazeVerdict", right: false, col: 4, reason: "slip" },
    ]);
    expect(marks.verdicts.at(0)).toBeNull();
    expect(marks.verdicts.at(1)).toBeNull();
  });

  it("draws the ring on the part it is kept under, green or red", () => {
    const { ctx } = stubCanvas();
    const log: string[] = [];
    ctx.log = log;
    const v = new GripVerdicts();
    v.mark(1, true);
    drawMazeVerdicts(ctx as unknown as CanvasRenderingContext2D, layout("p2"), CFG, grip(), v);
    expect(count(log.join("|"), PALETTE.good)).toBeGreaterThan(0);
    expect(count(log.join("|"), PALETTE.red)).toBe(0);
  });

  /** Nine ticks of its wave, `said` thrown on the first. */
  function drawn(role: ViewRole, said: SimEvent[]): string {
    const world = createWorld(CFG, 7);
    const index = waveWith("maze");
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
    expect(count(drawn(role, [refused]), PALETTE.red)).toBeGreaterThan(
      count(drawn(role, []), PALETTE.red),
    );
  });
});
