import { midCol, type SimConfig, ticksPerBeat } from "./config.js";
import type { World } from "./world.js";

/**
 * THE ANTIPHON: describing a thing that has no name.
 *
 * **The question no other boss asks** — *whether you can describe a thing
 * you have no name for.* A body over the top of the field grows an **organ**
 * every level, and the organ is a contour the game has never drawn before:
 * one of `antiphonShapes`, by index. One seat — the **explainer** — is shown
 * it, standing `antiphonVeinRows` under the **rail**; the other — the
 * **chooser** — is shown the rail of candidates and, where the organ stands,
 * nothing it could read. Every candidate is joined to the organ's place by a
 * vein, and the chooser carries the one the explainer is describing down its
 * vein to that place (`antiphon-hand.ts`). It arrives and is judged: the
 * organ, and it shrivels to a pit; anything else, and the hull is struck —
 * the wave lost (the owner, 5 October 2026: *when its reached, it will
 * reveal if its correct one or not. when not, wave is lost*). Nothing is
 * shot. The seats **swap every level**: the explainer is the pilot on an
 * even count of pits and the navigator on an odd one (`antiphonExplainer`).
 * The game never listens: it arranges for the pair to have to build a
 * vocabulary and gives them nothing to build it out of (`CLAUDE.md` rule 5,
 * untouched).
 *
 * **Its health is its pits.** A described organ shrivels to a pit and the
 * body keeps every one; at `antiphonPits` it goes still and grows the last
 * organ, which is **their own ship**, among ships subtly wrong — and on the
 * right one every pit erupts into the shape that made it. A window run out
 * strikes the hull as a wrong candidate does. From `antiphonTightPits` the
 * decoys are the organ's own family, a lobe apart, and the window is
 * shorter; from `antiphonEchoPits` one organ is a shape already killed, and
 * for once the pair has a name.
 *
 * **It is a fixture and not a body** (`bossFillsWave`): nothing of it is
 * among the creatures, and nothing arrives in its wave.
 *
 * The clock is `antiphon-step.ts`, the rail `antiphon-rail.ts`, the vein
 * `antiphon-vein.ts`, the hands `antiphon-hand.ts`, the fingerprint
 * `antiphon-hash.ts`, the numbers `config-antiphon.ts`. This file is the
 * shape and the questions asked of it.
 */

/** The shape index of the last organ: their own hull, drawn by `drawHull` and never in the table. */
export const ANTIPHON_SHIP = -1;

/** One thing on the chooser's rail: a shape, and the column of the field it hangs over on the rail's row. */
export interface AntiphonCandidate {
  /** A contour under `antiphonShapes`, or `ANTIPHON_SHIP`. */
  shape: number;
  /** The quarter turn it hangs at, `0` the way up its contour was drawn (`antiphon-turn.ts`). */
  turn: number;
  col: number;
}

/** The organ standing out of the surface, under the rail at the middle column. */
export interface AntiphonOrgan {
  /** A contour under `antiphonShapes`, or `ANTIPHON_SHIP`. */
  shape: number;
  /** The quarter turn it rests at, `0` but on a turned level (`antiphon-turn.ts`). */
  turn: number;
  /** `world.beat` it began pushing out on; it can be answered `antiphonGrowBeats` later. */
  grownBeat: number;
}

/** Everything THE ANTIPHON remembers between beats. */
export interface AntiphonState {
  kind: "antiphon";
  /** The organ standing now, or none between levels. */
  organ: AntiphonOrgan | null;
  /** The chooser's rail, left to right; empty between levels. */
  rail: AntiphonCandidate[];
  /**
   * The rail index of the organ, `-1` with no rail. An index and not a
   * shape, because the ship's rail is three ships and only the drawing
   * tells them apart.
   */
  answer: number;
  /** The shapes described, in order: the health, the record, and the level. */
  pits: number[];
  /** `world.beat` the current level began on — the rise, the growth, or the rest after an end. */
  cycleBeat: number;
  /** `world.beat` the surface went still on before the ship; `-1` until it does. */
  stillBeat: number;
  /** `world.beat` the right ship arrived on; `-1` while it stands. */
  downBeat: number;
  /**
   * Ticks the organ has been turned under a hand, back to nought as each
   * level grows: the orientation (`antiphon-hand.ts`).
   */
  turnTicks: number;
  /** Whose thumbs rest on the organ now — the turn goes on while either does. */
  heldP1: boolean;
  heldP2: boolean;
  /** The rail index the chooser's thumb is carrying down its vein, `-1` for none. */
  carried: number;
  /** How far down its vein the carried candidate is, in thousandths of the vein: `1000` is the organ's place. */
  carryMilli: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than five. */
export function antiphonBoss(world: World): AntiphonState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "antiphon" ? boss : null;
}

/** The family a shape index belongs to: the contours a lobe apart from it. */
export function antiphonFamilyOf(cfg: SimConfig, shape: number): number {
  return Math.floor(shape / cfg.antiphonFamily);
}

/** Whether the rail has closed in on one family and the window tightened. */
export function antiphonTight(s: AntiphonState, cfg: SimConfig): boolean {
  return s.pits.length >= cfg.antiphonTightPits;
}

/** Whether the pits are all there and what comes next is the still, then the ship. */
export function antiphonFull(s: AntiphonState, cfg: SimConfig): boolean {
  return s.pits.length >= cfg.antiphonPits;
}

/** Whether the organ standing is their own ship. */
export function antiphonShipUp(s: AntiphonState): boolean {
  return s.organ !== null && s.organ.shape === ANTIPHON_SHIP;
}

/** The level the pair is on: the pits so far, the ship's being `antiphonPits`. */
export function antiphonLevel(s: AntiphonState): number {
  return s.pits.length;
}

/** The seat shown the organ this level: the pilot first, and the two swap every level. */
export function antiphonExplainer(s: AntiphonState): 1 | 2 {
  return antiphonExplainerOn(antiphonLevel(s));
}

/** The seat shown the organ on level `level` — the director's stepper asks with no fight standing. */
export function antiphonExplainerOn(level: number): 1 | 2 {
  return level % 2 === 0 ? 1 : 2;
}

/** The seat shown the rail this level, whose thumb carries a candidate down. */
export function antiphonChooser(s: AntiphonState): 1 | 2 {
  return antiphonExplainer(s) === 1 ? 2 : 1;
}

/** Beats a grown organ stands, now. */
export function antiphonWindow(s: AntiphonState, cfg: SimConfig): number {
  return antiphonTight(s, cfg) || antiphonShipUp(s)
    ? cfg.antiphonTightWindowBeats
    : cfg.antiphonWindowBeats;
}

/** Whether the organ has pushed all the way out and can be answered. */
export function antiphonGrown(o: AntiphonOrgan, cfg: SimConfig, beat: number): boolean {
  return beat >= o.grownBeat + cfg.antiphonGrowBeats;
}

/** The beat the organ's window runs out on; `-1` when none stands. */
export function antiphonSinkBeat(s: AntiphonState, cfg: SimConfig): number {
  const o = s.organ;
  if (o === null) return -1;
  return o.grownBeat + cfg.antiphonGrowBeats + antiphonWindow(s, cfg);
}

/** How wide the rail is: the base, or the ship's. */
export function antiphonRailSize(s: AntiphonState, cfg: SimConfig): number {
  return antiphonFull(s, cfg) ? cfg.antiphonShipRail : cfg.antiphonRail;
}

/** Whether rail index `i` is the organ — the one the chooser is looking for. */
export function antiphonIsOrgan(s: AntiphonState, i: number): boolean {
  return i >= 0 && i === s.answer;
}

/** The column the organ stands over: the middle, whatever the rail. */
export function antiphonOrganCol(cfg: SimConfig): number {
  return midCol(cfg);
}

/** The row the organ stands on, `antiphonVeinRows` under the rail's. */
export function antiphonOrganRow(cfg: SimConfig): number {
  return cfg.antiphonRailRow + cfg.antiphonVeinRows;
}

/** Whether a thumb rests on the organ: the turn runs while one does. */
export function antiphonHeld(s: AntiphonState, player: 1 | 2): boolean {
  return player === 1 ? s.heldP1 : s.heldP2;
}

/** How far round the organ has been turned, in thousandths of a turn: a whole turn is `antiphonTurnBeats`. */
export function antiphonTurnMilli(s: AntiphonState, cfg: SimConfig): number {
  const ticks = ticksPerBeat(cfg) * cfg.antiphonTurnBeats;
  return Math.floor(((s.turnTicks % ticks) * 1000) / ticks);
}

/** Whether the body is collapsing after the right ship. */
export function antiphonDown(s: AntiphonState): boolean {
  return s.downBeat >= 0;
}

/** Whether an organ stands grown all the way out, so a carry is an answer and not a guess. */
export function antiphonStanding(s: AntiphonState, cfg: SimConfig, beat: number): boolean {
  return s.organ !== null && antiphonGrown(s.organ, cfg, beat);
}

/** Whether the organ asks the explainer's thumb to turn it: one stands, the body is up, and no thumb rests on it yet (`render/antiphon-marks.ts`). */
export function antiphonOrganAsks(s: AntiphonState): boolean {
  return !antiphonDown(s) && s.organ !== null && !s.heldP1 && !s.heldP2;
}

/**
 * Whether candidate `i` asks to be carried: the organ stands grown, so a
 * carry would be heard (`antiphon-hand.ts`), and no candidate is in hand.
 */
export function antiphonRailAsks(
  s: AntiphonState,
  cfg: SimConfig,
  beat: number,
  i: number,
): boolean {
  if (antiphonDown(s) || !antiphonStanding(s, cfg, beat)) return false;
  return i >= 0 && i < s.rail.length && s.carried < 0;
}
