import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type Creature,
  createWorld,
  NO_SHELL,
  type QueenState,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { GripVerdicts } from "../src/grip-verdict.js";
import { rgba } from "../src/hex.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { QueenFx, queenMarkKey } from "../src/queen-fx.js";
import { drawQueenAsked, drawQueenVerdicts } from "../src/queen-marks.js";
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
 * **THE BULB QUEEN's marks answer a touch the way THE INSTAR's do**
 * (`instar-verdict.test.ts`, `.claude/skills/new-boss` §5): a pry landed or
 * a thumb on the real mark washes that mark green, a flinch, a thumb on the
 * other or player 2's refused press red; while a mark asks, player 1 sees a
 * halo under both and player 2 the partner's turning ring and a clock on
 * both; and the verdict is a transient the next run does not inherit.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

const queen: Creature = {
  id: 3,
  kind: "queen",
  col: 5,
  row: 2,
  fromRow: 2,
  color: null,
  holes: 0,
  petals: 6,
  dragMilli: 0,
  shell: NO_SHELL,
};

/** BROOD, a window announced and nothing pried yet — or what `overrides` says. */
function brood(overrides: Partial<QueenState> = {}): QueenState {
  return {
    kind: "queen",
    creatureId: 3,
    phase: 1,
    phaseBeat: 0,
    tellCol: 5,
    tellColor: "red",
    weakSide: 1,
    pickBeat: 0,
    spentSide: 0,
    openBeat: 6,
    closeBeat: 8,
    pryBeat: -1,
    holdSide: 0,
    startPetals: 9,
    dropSide: 1,
    releaseBeat: -1,
    releaseSide: 0,
    scratch: [1, 1],
    ...overrides,
  };
}

/** What the asking draws on a role's screen. */
function asked(role: ViewRole, boss: QueenState, q: Creature = queen): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  drawQueenAsked(ctx as unknown as CanvasRenderingContext2D, layout(role), q, boss, 1.2, 0, 0);
  return log.join("|");
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";
const THEIRS = rgba(PALETTE.text, 0.8);
const CLOCK = rgba(PALETTE.text, 0.85);

describe("THE BULB QUEEN's marks asking", () => {
  it("halo both marks for player 1, and give player 2 the partner's ring and clock on both", () => {
    expect(count(asked("p1", brood()), HALO)).toBe(2);
    expect(count(asked("p1", brood()), THEIRS)).toBe(0);
    expect(count(asked("p2", brood()), HALO)).toBe(0);
    expect(count(asked("p2", brood()), THEIRS)).toBe(2);
    expect(count(asked("p2", brood()), CLOCK)).toBe(2);
    expect(count(asked("test", brood()), THEIRS)).toBe(0);
  });

  it("drop the halo from the mark his thumb holds, whose ring is filled", () => {
    const held = brood({ phase: 2, holdSide: 1 });
    expect(count(asked("p1", held, { ...queen, petals: 3 }), HALO)).toBe(1);
  });

  it("ask nothing in CROWN, between windows or once pried", () => {
    for (const role of ROLES) {
      expect(asked(role, brood({ phase: 0 }))).toBe("");
      expect(asked(role, brood({ openBeat: -1, closeBeat: -1 }))).toBe("");
      expect(asked(role, brood({ pryBeat: 6 }), { ...queen, color: "red" })).toBe("");
    }
  });
});

const pry: SimEvent = { type: "queenPry", col: 6, row: 2, side: 1 };
const flinch: SimEvent = { type: "queenFlinch", col: 4, row: 2, side: -1 };
const refused: SimEvent = { type: "queenRefuse", col: 6, row: 2, side: 1, player: 2 };

describe("THE BULB QUEEN's verdict on a touch", () => {
  it("keeps each mark's verdict under its own key, fades it and forgets it on reset", () => {
    const fx = new QueenFx();
    fx.ingest([pry, flinch]);
    expect(fx.verdicts.at(queenMarkKey(1))?.good).toBe(true);
    expect(fx.verdicts.at(queenMarkKey(-1))?.good).toBe(false);
    fx.ingest([refused, { type: "queenHold", col: 4, row: 2, side: -1, real: true }]);
    expect(fx.verdicts.at(queenMarkKey(1))?.good).toBe(false);
    expect(fx.verdicts.at(queenMarkKey(-1))?.good).toBe(true);
    fx.update(1);
    expect(fx.verdicts.at(queenMarkKey(1))).toBeNull();
    fx.ingest([pry]);
    fx.clear();
    expect(fx.verdicts.at(queenMarkKey(1))).toBeNull();
  });

  it("draws the ring on the mark it is kept under, green or red", () => {
    const { ctx } = stubCanvas();
    const log: string[] = [];
    ctx.log = log;
    const v = new GripVerdicts();
    v.mark(queenMarkKey(1), true);
    drawQueenVerdicts(ctx as unknown as CanvasRenderingContext2D, layout("p1"), queen, v, 0, 0);
    expect(count(log.join("|"), PALETTE.good)).toBeGreaterThan(0);
    expect(count(log.join("|"), PALETTE.red)).toBe(0);
  });

  /** Nine ticks of her wave drawn, `said` thrown on the first. */
  function drawn(role: ViewRole, said: SimEvent[]): string {
    const world = createWorld(CFG, 7);
    const index = waveWith("queen");
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
    expect(count(drawn(role, [pry]), PALETTE.good)).toBeGreaterThan(
      count(drawn(role, []), PALETTE.good),
    );
    expect(count(drawn(role, [refused]), PALETTE.red)).toBeGreaterThan(
      count(drawn(role, []), PALETTE.red),
    );
  });
});
