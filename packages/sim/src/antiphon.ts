import type { SimConfig } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE ANTIPHON: describing a thing that has no name.
 *
 * **The question no other boss asks** — *whether you can describe a thing
 * you have no name for.* A body over the top of the field grows an **organ**
 * every cycle, and the organ is a contour the game has never drawn before:
 * one of `antiphonShapes`, by index, which the pilot alone is shown — its
 * shape and nothing about its colour or column. The navigator alone is shown
 * a **rail** of candidates, each a shape with a colour and a column, one of
 * which is the organ; she has to find the one he is describing and fire its
 * colour into its column, and he has to put the cannon there, which he
 * cannot see either. Two descriptions crossing is the boss
 * (`docs/spec/bosses-choreographed.md` §12; the split is the look's,
 * `render/view-role-clocks-b.ts`). The game never listens: it arranges for
 * the pair to have to build a vocabulary and gives them nothing to build it
 * out of (`CLAUDE.md` rule 5, untouched).
 *
 * **Its health is its pits.** A described organ shrivels to a pit and the
 * body keeps every one; at `antiphonPits` it goes still and grows the last
 * organ, which is **their own ship**, among ships subtly wrong — and on the
 * right one every pit erupts into the shape that made it. A wrong candidate
 * **hardens** the cycle and widens the next rail; an organ whose window
 * runs out **sinks back healed**, and from `antiphonFirePits` fires a body
 * down its column first. From `antiphonTightPits` the decoys are the organ's
 * own family, a lobe apart; from `antiphonSpillPits` the candidates a pit
 * rejected arrive as bodies; from `antiphonTwinPits` two organs grow at
 * once; from `antiphonEchoPits` one organ a cycle is a shape already
 * killed, and for once the pair has a name.
 *
 * **It is a fixture and not a body** (`bossFillsWave`): nothing of it is
 * among the creatures, and every arrival in its wave is a candidate it
 * spilled or an organ that fired.
 *
 * The clock is `antiphon-step.ts`, the rail `antiphon-rail.ts`, the shot
 * that leaves the top `antiphon-shot.ts`, the fingerprint
 * `antiphon-hash.ts`, the numbers `config-antiphon.ts`. This file is the
 * shape and the questions asked of it.
 */

/** The shape index of the last organ: their own hull, drawn by `drawHull` and never in the table. */
export const ANTIPHON_SHIP = -1;

/** One thing on the navigator's rail: a shape, and the colour and column that would take it if it were the organ. */
export interface AntiphonCandidate {
  /** A contour under `antiphonShapes`, or `ANTIPHON_SHIP`. */
  shape: number;
  color: Color;
  col: number;
}

/** One organ standing out of the surface. */
export interface AntiphonOrgan extends AntiphonCandidate {
  /** `world.beat` it began pushing out on; it can be taken `antiphonGrowBeats` later. */
  grownBeat: number;
}

/** Everything THE ANTIPHON remembers between beats. */
export interface AntiphonState {
  kind: "antiphon";
  /** The organs standing now — none between cycles, one, or two from `antiphonTwinPits`. */
  organs: AntiphonOrgan[];
  /** The navigator's rail, the organs among it in the seed's order; empty between cycles. */
  rail: AntiphonCandidate[];
  /** The shapes described, in order: the health, and the record. */
  pits: number[];
  /** Candidates a wrong answer has added to every rail since, under `antiphonRailMax`. */
  extra: number;
  /** `world.beat` the current cycle began on — the rise, the growth, or the rest after an end. */
  cycleBeat: number;
  /** `world.beat` the surface went still on before the ship; `-1` until it does. */
  stillBeat: number;
  /** `world.beat` the right ship was fired on; `-1` while it stands. */
  downBeat: number;
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

/** Whether two organs grow a cycle now. */
export function antiphonTwins(s: AntiphonState, cfg: SimConfig): boolean {
  return s.pits.length >= cfg.antiphonTwinPits;
}

/** Whether the pits are all there and what comes next is the still, then the ship. */
export function antiphonFull(s: AntiphonState, cfg: SimConfig): boolean {
  return s.pits.length >= cfg.antiphonPits;
}

/** Whether the organ standing is their own ship. */
export function antiphonShipUp(s: AntiphonState): boolean {
  return s.organs.some((o) => o.shape === ANTIPHON_SHIP);
}

/** Beats a grown organ stands, now. */
export function antiphonWindow(s: AntiphonState, cfg: SimConfig): number {
  return antiphonTight(s, cfg) || antiphonShipUp(s)
    ? cfg.antiphonTightWindowBeats
    : cfg.antiphonWindowBeats;
}

/** Whether the organ has pushed all the way out and can be taken. */
export function antiphonGrown(o: AntiphonOrgan, cfg: SimConfig, beat: number): boolean {
  return beat >= o.grownBeat + cfg.antiphonGrowBeats;
}

/** The beat the standing organs' window runs out on; `-1` when none stands. */
export function antiphonSinkBeat(s: AntiphonState, cfg: SimConfig): number {
  const o = s.organs[0];
  if (o === undefined) return -1;
  return o.grownBeat + cfg.antiphonGrowBeats + antiphonWindow(s, cfg);
}

/** How wide the rail is for `organs` standing: the base, two more a second organ, and what wrong answers added, capped. */
export function antiphonRailSize(s: AntiphonState, cfg: SimConfig, organs: number): number {
  if (antiphonFull(s, cfg)) return cfg.antiphonShipRail;
  return Math.min(cfg.antiphonRailMax, cfg.antiphonRail + (organs - 1) * 2 + s.extra);
}

/** Whether a candidate on the rail is one of the organs — the one she is looking for. */
export function antiphonIsOrgan(s: AntiphonState, c: AntiphonCandidate): boolean {
  return s.organs.some((o) => o.col === c.col && o.color === c.color && o.shape === c.shape);
}

/** The organ standing over `col`, if one is. */
export function antiphonOrganAt(s: AntiphonState, col: number): AntiphonOrgan | null {
  return s.organs.find((o) => o.col === col) ?? null;
}

/** Whether the body is collapsing after the right ship. */
export function antiphonDown(s: AntiphonState): boolean {
  return s.downBeat >= 0;
}
