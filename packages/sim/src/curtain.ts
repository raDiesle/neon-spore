import type { SimConfig } from "./config.js";
import { CURTAIN_COLS } from "./span.js";
import type { Color, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CURTAIN: what it is standing in front of.
 *
 * **The question no other boss asks** — *whether the pair can move the
 * enemy rather than answer it.* Nothing in this game occludes: every body
 * falls in plain sight and every column is readable to the top. This one is
 * a broad **membrane** hung across seven columns high in the field, and
 * behind it, seen only as a shadow through the fabric, a **core** that fires
 * down its own column. The core cannot be shot while the fabric covers it,
 * and the fabric is moved by **both hands on it, carried sideways** — THE
 * PUSH at boss scale (`grip-push.ts`, `docs/spec/bosses-choreographed.md` §6).
 *
 * **Health is the hem.** Seven weighted lobes hang along the fabric's lower
 * edge, one per column; a few are **soft** each cycle and a shot into a soft
 * one takes it off. A lighter curtain goes further per shove, and a curtain
 * with no lobes left cannot hold its rail: the next shove **tears** it off,
 * and the core hangs naked, firing, until it is hit `curtainCoreHits` times
 * in its own colour. Each hit drops the lobe nearest it and the core drifts
 * to a new column under the fabric, in a new colour, so the shadow has to
 * be read again.
 *
 * **The split is the eyes.** Player 1 is shown which lobes are soft and
 * nothing of the core while it is covered; player 2 is shown the core's
 * shadow and its colour through the fabric and nothing of the lobes. Both
 * push. So the sentence is *left, three — now shoot the fourth — red*, and
 * the fabric rolls back over the core `curtainRerollBeats` after the last
 * hand leaves it, so the sentence has to be said before it is stale.
 *
 * **Four states, and each asks for a different hand** (`CURTAIN_PHASES`,
 * `.claude/skills/new-boss` §6.2). While it is `hung` the gesture is the
 * shove and the shot; a hit **pins** the rail for `curtainPinBeats`, and a
 * pinned rail does not slide at all — what gives instead is the hem, which
 * the pilot lifts and holds to open a gap over the core (`curtain-hand.ts`);
 * a bare hem under a shove leaves it `torn`, the core naked and firing; the
 * last hit puts it `out`. Three words for the pair to say, and no more:
 * **SHOVE**, **FIRE**, **LIFT**.
 *
 * **It is a body and a fixture at once.** The fabric is a creature of kind
 * `"curtain"` — a boss body like THE CAIRN's pile (`kinds.ts`), so the fall
 * loop leaves it alone and the ordinary carry moves it — and the core is not
 * a creature at all: a column and a colour here, met by a shot leaving the
 * top of the field (`curtain-step.ts`). It fills its wave: nothing falls
 * but what the core fires.
 *
 * The clock is `curtain-step.ts`, the fingerprint `curtain-hash.ts`, the
 * numbers `config-curtain.ts`. This file is the shape and the questions
 * asked of it.
 */

/**
 * The four states, in the order one fight walks them.
 *
 * `hung` is the sheet on its rail, shoved along it by either seat's hands.
 * `pinned` is the rail jammed by a hit for `curtainPinBeats`: the shove does
 * nothing and the hem is the way through. `torn` is the sheet off the rail
 * and the core naked. `out` is the last hit, and the beats the frame has
 * before the wave may end (`stepCurtain`).
 */
export const CURTAIN_PHASES = ["hung", "pinned", "torn", "out"] as const;

export type CurtainPhase = (typeof CURTAIN_PHASES)[number];

/** Everything THE CURTAIN remembers between beats. */
export interface CurtainState {
  kind: "curtain";
  /** The id of the fabric in `world.creatures`; gone once torn. */
  creatureId: number;
  /** One per column of fabric, left to right: whether the lobe still hangs. */
  lobes: boolean[];
  /** Indexes into `lobes` that are soft this cycle — the ones a shot takes. */
  soft: number[];
  /** The column the core hangs in. Fixed while the fabric slides across it. */
  coreCol: number;
  /** The one colour that hurts it. */
  coreColor: Color;
  /** Hits taken so far. */
  coreHits: number;
  /** `world.beat` the soft set was last drawn. */
  softBeat: number;
  /** `world.beat` the core last fired. */
  fireBeat: number;
  /** `world.beat` the fabric last moved, or was last held. The roll-back counts from here. */
  moveBeat: number;
  /** Which of the four states it is in. */
  phase: CurtainPhase;
  /** `world.beat` the phase was entered. Every phase clock counts from here. */
  phaseBeat: number;
  /**
   * How far **up** the pilot has carried the hem, in thousandths of a tile,
   * cut to `curtainLiftMilli`. Zero with no hand on it, and zero again the
   * moment the phase moves (`enterCurtain`).
   */
  liftMilli: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than five. */
export function curtainBoss(world: World): CurtainState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "curtain" ? boss : null;
}

/** The fabric, or undefined once it is torn off. */
export function curtainBody(world: World, c: CurtainState): Creature | undefined {
  return world.creatures.find((b) => b.id === c.creatureId);
}

/** Whether the fabric hangs over `col`: the core is covered while its column does. */
export function curtainCovers(body: Creature, col: number): boolean {
  return col >= body.col && col < body.col + CURTAIN_COLS;
}

/**
 * Whether the hem is held clear of the core: the lift carried its whole
 * `curtainLiftMilli` and still held there. Only while the rail is `pinned` —
 * a sheet free to slide gives sideways rather than lifting, and a hem that
 * could be lifted from `hung` would be a second way to do the shove's job
 * (`curtain-hand.ts`).
 */
export function curtainHemHigh(c: CurtainState, cfg: SimConfig): boolean {
  return c.phase === "pinned" && c.liftMilli >= cfg.curtainLiftMilli;
}

/**
 * Whether the core can be shot: the sheet torn off, the fabric shoved clear
 * of it, or the hem held up over it.
 */
export function curtainCoreBare(world: World, c: CurtainState): boolean {
  if (c.phase === "torn") return true;
  if (curtainHemHigh(c, world.cfg)) return true;
  const body = curtainBody(world, c);
  return body === undefined || !curtainCovers(body, c.coreCol);
}

/** Lobes still hanging. */
export function curtainLobesLeft(c: CurtainState): number {
  let n = 0;
  for (const up of c.lobes) if (up) n += 1;
  return n;
}

/** Columns a shove carries the fabric: one, or two once it is light. */
export function curtainStride(c: CurtainState, cfg: SimConfig): number {
  return c.lobes.length - curtainLobesLeft(c) >= cfg.curtainLightLobes ? 2 : 1;
}

/** The leftmost column the fabric may hang at, and the rightmost: `curtainKeepCols` stay on. */
export function curtainReach(cfg: SimConfig): { min: number; max: number } {
  const keep = Math.min(cfg.curtainKeepCols, CURTAIN_COLS);
  return { min: keep - CURTAIN_COLS, max: cfg.cols - keep };
}

/** Whether the lobe over `col` is soft: a shot into it takes it off. */
export function curtainSoftAt(body: Creature, c: CurtainState, col: number): boolean {
  const i = col - body.col;
  return i >= 0 && i < c.lobes.length && (c.lobes[i] ?? false) && c.soft.includes(i);
}
