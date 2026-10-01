import { afterEach, beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { buildBoss, buildPods, buildQueue, controlSet } from "@neon-spore/content";
import {
  type Creature,
  createWorld,
  DEFAULT_CONFIG,
  NO_SHELL,
  type QueenState,
  queenMarkCol,
  startWave,
  ticksPerBeat,
} from "@neon-spore/sim";
import { DEG } from "../src/idle-drift.js";
import { computeLayout, tileCX } from "../src/layout.js";
import { OUTLINE_DRIFT } from "../src/outline-drift.js";
import { QUEEN_FIGURE, queenMarkCenter } from "../src/queen-figure.js";
import { queenMarkUnder } from "../src/queen-grip.js";
import { QUEEN_SURFACE, queenTurn, SEAMS, seamsAt, shellTheta } from "../src/queen-surface.js";
import type { Field } from "../src/touch.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * **THE QUEEN's shell and marks, placed by longitude** (`queen-surface.ts`):
 * at no turn every seam is the shipped one and the far pair is hidden; a turn
 * moves each seam by its own longitude, takes a near one over the rim and
 * brings a far one round; the marks ride the same turn by less, stay over
 * their columns and are found by the thumb where they are drawn; the shipped
 * still shell turns nothing; and a frame turning costs within a tenth of one
 * standing still.
 */

const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const saved = { surface: { ...QUEEN_SURFACE }, drift: OUTLINE_DRIFT.queen };
afterEach(() => {
  Object.assign(QUEEN_SURFACE, saved.surface);
  OUTLINE_DRIFT.queen = saved.drift;
});

const QUEEN: Creature = {
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

/** BROOD with its window open, so both marks are asked for. */
const BROOD: QueenState = {
  kind: "queen",
  creatureId: 3,
  phase: 1,
  phaseBeat: 0,
  tellCol: 5,
  tellColor: "red",
  weakSide: 1,
  pickBeat: 0,
  spentSide: 0,
  openBeat: 0,
  closeBeat: 100_000,
  pryBeat: -1,
  holdSide: 0,
  startPetals: 9,
  dropSide: 1,
  releaseBeat: -1,
  releaseSide: 0,
  scratch: [1, 1],
};

function field(beat: number, beatPhase: number): Field {
  return {
    creatures: [QUEEN],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase,
    skinY: null,
    beat,
    waveBeat: beat,
    tick: 0,
    seat: 1,
    cfg: DEFAULT_CONFIG,
    boss: BROOD,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

/** The beat, on a quarter-beat grid, where she turns her widest in the first few minutes. */
function widestBeat(): { beat: number; phase: number; turn: number } {
  let best = { beat: 0, phase: 0, turn: 0 };
  for (let b = 0; b < 400; b++) {
    for (const phase of [0, 0.25, 0.5, 0.75]) {
      const turn = queenTurn(CFG, b, phase);
      if (Math.abs(turn) > Math.abs(best.turn)) best = { beat: b, phase, turn };
    }
  }
  return best;
}

const near = (theta: number) => seamsAt(theta, 1, 1).map((x) => x !== null);

describe("THE QUEEN's seams by longitude", () => {
  test("at no turn the six shipped seams, and the far pair hidden", () => {
    expect(seamsAt(0, 2, 1.1)).toEqual([null, ...SEAMS.map((s) => s * 2 * 1.1), null]);
  });

  test("a turn moves each seam by its longitude, fast in the middle and slow at the wing", () => {
    const theta = 10 * DEG;
    const turned = seamsAt(theta, 1, 1);
    SEAMS.forEach((s, i) => {
      expect(turned[i + 1]).toBeCloseTo(Math.sin(Math.asin(s) + theta), 9);
    });
    const travel = (i: number) => (turned[i + 1] ?? 0) - (SEAMS[i] ?? 0);
    expect(travel(3)).toBeGreaterThan(travel(4));
    expect(travel(4)).toBeGreaterThan(travel(5));
  });

  test("turned its widest, the outer seam goes over the rim and the far one comes round", () => {
    const widest = shellTheta(1);
    expect(widest).toBeCloseTo(QUEEN_SURFACE.degrees * DEG, 9);
    expect(near(widest)).toEqual([true, true, true, true, true, true, false, false]);
    expect(near(-widest)).toEqual([false, false, true, true, true, true, true, true]);
    for (const x of seamsAt(widest, 1, 1)) if (x !== null) expect(Math.abs(x)).toBeLessThan(1);
  });
});

describe("THE QUEEN's marks, turned", () => {
  test("ship still: no turn at 0, at any beat", () => {
    expect(saved.surface.amount).toBe(0);
    for (const b of [0, 7, 41]) expect(queenTurn(CFG, b, 0.3)).toBe(0);
  });

  test("ride the turn by their longitude, stay over their columns, and are found where drawn", () => {
    QUEEN_SURFACE.amount = 1;
    const { beat, phase, turn } = widestBeat();
    expect(Math.abs(turn)).toBeGreaterThan(0.5);
    for (const side of [-1, 1] as const) {
      const rest = queenMarkCenter(L, QUEEN, side);
      const at = queenMarkCenter(L, QUEEN, side, turn);
      expect(rest.x).toBe(tileCX(L, queenMarkCol(QUEEN.col, side)));
      const lon = Math.asin((queenMarkCol(QUEEN.col, side) - QUEEN.col) / QUEEN_FIGURE.bodyRx);
      const want = QUEEN_FIGURE.bodyRx * Math.sin(lon + turn * 9 * DEG);
      expect((at.x - tileCX(L, QUEEN.col)) / L.tile).toBeCloseTo(want, 9);
      // Moved enough to be seen, never out of the column's tile.
      const moved = Math.abs(at.x - rest.x) / L.tile;
      expect(moved).toBeGreaterThan(0.15);
      expect(moved).toBeLessThan(0.35);
      expect(at.y).toBe(rest.y);
      // The thumb finds the mark under it at the turned point, on that beat.
      const touch = queenMarkUnder(L, at.x, at.y, field(beat, phase));
      expect(touch?.command).toMatchObject({ target: "queenMark", id: side === -1 ? 0 : 1 });
    }
  });
});

describe("what a frame of THE QUEEN costs turning", () => {
  const KEYS = ["fill", "stroke", "drawImage", "createLinearGradient", "createRadialGradient"];
  const worst = (): Map<string, number> => {
    const index = waveWith("queen");
    const world = createWorld(DEFAULT_CONFIG, 3, []);
    startWave(
      world,
      index,
      buildQueue(index, DEFAULT_CONFIG.cols),
      buildPods(index, DEFAULT_CONFIG.cols),
      buildBoss(index, DEFAULT_CONFIG.cols),
    );
    const most = new Map<string, number>();
    runFrames(world, "p1", ticksPerBeat(DEFAULT_CONFIG) * 40, {
      every: 7,
      onDrawn: (ctx, frame) => {
        if (frame >= 2) for (const [k, v] of ctx.tally) most.set(k, Math.max(most.get(k) ?? 0, v));
        ctx.tally.clear();
      },
    });
    return most;
  };

  test("draws within a tenth of the still shell", () => {
    const still = worst();
    QUEEN_SURFACE.amount = 1;
    OUTLINE_DRIFT.queen = 1;
    const turning = worst();
    expect(still.get("stroke") ?? 0).toBeGreaterThan(0);
    for (const key of KEYS) {
      expect(turning.get(key) ?? 0, key).toBeLessThanOrEqual(
        Math.ceil((still.get(key) ?? 0) * 1.1),
      );
    }
  });
});
