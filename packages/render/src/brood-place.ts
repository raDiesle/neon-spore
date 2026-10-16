import {
  type BroodBud,
  type BroodState,
  broodCentre,
  broodLitStep,
  broodLobes,
  broodLobesAll,
  broodNextLurch,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * **Where THE BROOD is drawn**: the sac over the middle and each bud on its
 * column, in the pixels of this frame, read off the boss and the beat — and
 * nothing kept (`brood-draw.ts`).
 *
 * **The belly is where a bolt is met.** The simulation meets a bolt under the
 * sac on the bud row, bud or hide alike (`sim/brood-step.ts` `broodAlong`), so
 * the sac hangs down to that row and its lower edge is flattened across the
 * columns it covers (`broodBelly`): a bolt up any of them ends on the skin, or
 * on the bud hanging from it, never short of either in the air.
 */

/** The sac's half-width past the columns it covers, in tiles. */
const SIDE_TILES = 0.1;
/** How tall the sac is, in tiles, from the belly up. */
const TALL_TILES = 3.4;
/** How far above the bud row's middle the belly hangs, in tiles: a hair, so a
 * bolt met on the row is drawn ending on the skin. */
const BELLY_LIFT = 0.05;
/** How much of its size a sac with one lobe left keeps. */
const SPENT_SIZE = 0.72;
/** Tiles above the frame the sac comes down from. */
const DROP_TILES = 6;

export interface SacBox {
  x: number;
  y: number;
  rx: number;
  ry: number;
  /** How seen it is, 0..1: it fades as it goes. */
  alpha: number;
  /** How far round it has turned, in radians — a half turn every rest. */
  turn: number;
}

/** Beats since the phase began, with the beat's fraction. */
function since(s: BroodState, beat: number, beatPhase: number): number {
  return beat - s.phaseBeat + beatPhase;
}

/** The sac this frame: coming down, hung, turning in a rest, or sagging away. */
export function broodSacAt(
  l: Layout,
  cfg: SimConfig,
  s: BroodState,
  beat: number,
  beatPhase: number,
): SacBox {
  const all = Math.max(1, broodLobesAll(s));
  const left = s.phase === "enter" ? all : broodLobes(s);
  const size = SPENT_SIZE + (1 - SPENT_SIZE) * (left / all);
  const rx = (cfg.broodSpan + 0.5 + SIDE_TILES) * l.tile * (0.85 + 0.15 * size);
  const ry = (TALL_TILES / 2) * l.tile * size;
  const belly = tileCY(l, cfg.broodBudRow) - BELLY_LIFT * l.tile;
  let y = belly - ry;
  let alpha = 1;
  const t = since(s, beat, beatPhase);
  if (s.phase === "enter") {
    y -= (1 - smoothstep(Math.min(1, t / Math.max(1, cfg.broodEnterBeats)))) * DROP_TILES * l.tile;
  } else if (s.phase === "spent") {
    const k = Math.min(1, t / Math.max(1, cfg.broodSpentBeats));
    y += k * 0.8 * l.tile;
    alpha = 1 - smoothstep(k);
  }
  return { x: tileCX(l, broodCentre(cfg, s)), y, rx, ry, alpha, turn: broodTurn(cfg, s, t) };
}

/**
 * How hard the sac shudders this frame, 0..1: rising over the beats before a
 * lurch (`broodShudderBeats`), so the pair sees it about to go before it does.
 */
export function broodShudder(world: World, s: BroodState, beatPhase: number): number {
  const next = broodNextLurch(world, s);
  if (next < 0) return 0;
  const left = next - (world.beat + beatPhase);
  const span = Math.max(1, world.cfg.broodShudderBeats);
  return left > span ? 0 : 1 - Math.max(0, left) / span;
}

/**
 * How far round the sac has turned. Each rest turns it half round, so the face
 * the pair was reading goes away and the other comes, and the next step's buds
 * grow on the face that came round; nothing turns while a bud hangs.
 */
function broodTurn(cfg: SimConfig, s: BroodState, t: number): number {
  const rests = s.phase === "rest" || s.phase === "spent" ? s.cursor - 1 : s.cursor;
  const k = s.phase === "rest" ? smoothstep(Math.min(1, t / Math.max(1, cfg.broodRestBeats))) : 0;
  return Math.PI * (Math.max(0, rests) + k);
}

/** The lower half's superellipse power, as `2 / n`: square enough to run
 * nearly level under the far buds, round enough at the corners to be a sac. */
const BELLY_POW = 0.4;

/**
 * The flattened belly: a point of the sac's outline at angle `a` — an ellipse
 * over the top, and under it a superellipse, so the skin runs nearly level
 * across the columns a bolt can meet it in and rounds off at the sides.
 */
export function broodBelly(sac: SacBox, a: number, m = 1): { x: number; y: number } {
  const sin = Math.sin(a);
  const cos = Math.cos(a);
  if (sin <= 0) return { x: sac.x + cos * sac.rx * m, y: sac.y + sin * sac.ry * m };
  const x = Math.sign(cos) * Math.abs(cos) ** BELLY_POW;
  return { x: sac.x + x * sac.rx * m, y: sac.y + sin ** BELLY_POW * sac.ry * m };
}

/** Where a bud grows: on its column, out of the belly on the row a bolt meets it. */
export function broodBudX(l: Layout, bud: BroodBud): number {
  return tileCX(l, bud.col);
}

/** Where the belly is over `x`: the top of a bud's stalk. */
export function broodRimOver(sac: SacBox, x: number): number {
  const u = Math.max(-1, Math.min(1, (x - sac.x) / sac.rx));
  // The lower half's angle whose superellipse `x` is `u`.
  return broodBelly(sac, Math.acos(Math.sign(u) * Math.abs(u) ** (1 / BELLY_POW))).y;
}

/**
 * How ripe a bud is this frame, 0 as it begins and 1 as it drops; below 0
 * while a dropped one is regrowing.
 */
export function broodRipe(s: BroodState, bud: BroodBud, beat: number, beatPhase: number): number {
  const step = broodLitStep(s);
  if (step === null) return 0;
  return (beat + beatPhase - bud.bornBeat) / Math.max(1, step.ripenBeats);
}
