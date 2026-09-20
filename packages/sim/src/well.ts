import type { SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * THE WELL: the field turned inside out, **and then turned**.
 *
 * The hull is drawn at the centre, the far row becomes a rim around it, and
 * the eleven columns become the eleven hours of a clock face — so "column
 * four" and "four o'clock" name the same lane, and on the field the game ships
 * they are the same number (`render/src/well.ts` is the whole projection).
 * `docs/spec/ideas.md` asked for exactly that and left two things open:
 * whether it is a round or a modifier, and whether both phones flip or only
 * one. The owner asked for a boss wave, and the second answer is in
 * `showsWell` — one phone, the pilot's, because a well on both is a skin on
 * the field and nothing for the pair to say.
 *
 * **The simulation still does not change, and that is still the boss.** A
 * creature falls a row a beat, the cannon slides a column a press, the shield
 * covers a column, a bolt climbs a lane — all of it exactly as the flat field
 * runs it. What this boss owns is *where the picture puts them*, and the state
 * below is that and nothing else: an angle, the clock that walks it, and the
 * thumb that answers.
 *
 * **What the pair has to learn is one thing the picture does not say.** Rolled
 * into a circle, the field's two walls meet in the one sector that holds no
 * column — the seam. Eleven o'clock and one o'clock are drawn a sector apart
 * and are the two ends of the field; crossing costs the simulation nothing
 * (`cannonCol` names a column and the cannon is there), so what it costs is
 * the hand and the eye.
 *
 * **And the seam is the handle.** It starts at twelve, where the hour under a
 * numeral is the column under it and the pilot need not read anything. Then it
 * slips: the whole face turns clockwise a quarter of a sector a beat, numerals
 * and all, until it is `wellRollSectors` from the top. Nothing on the field is
 * harmed by that — no hull, no health, no lost wave — but the pilot's shortcut
 * is gone, and the only seat with plain columns in front of it is hers. So he
 * has to ask. More talking, which is this game's control scheme.
 *
 * The two answers are one thumb on the seam, read by what the face is doing:
 * while it slips, **hold** it still, for `wellHoldBeats` beats; once it has
 * stopped, **turn** it back to the top. One sentence: *the clock slips — hold
 * it, then turn it home.* Like THE VANE it attacks nobody — a well wave is as
 * dangerous as the wave its author wrote (`bossFillsWave`) — and it is still
 * the one boss `bossHoldsWave` answers no for: a wave that ends when its
 * script is spent and its field is empty has nothing here left to finish
 * (`boss-kinds.ts`, and `beat.ts` is where it is asked).
 */
export const WELL_PHASES = ["still", "rolling", "wound"] as const;
export type WellPhase = (typeof WELL_PHASES)[number];

/** No thumb on the seam. A grab records the offset it began at, and an offset
 * is never negative, so one number says both things. */
export const NO_WELL_GRIP = -1;

export interface WellState {
  kind: "well";
  /** What the face is doing: resting, slipping, or stopped at the far end. */
  phase: WellPhase;
  /** The wave beat the phase began on, which is what `still` is counted from. */
  phaseBeat: number;
  /** How far clockwise of twelve the seam stands, in thousandths of a sector. */
  offsetMilli: number;
  /** Beats of the hold already spent this round of the cycle. */
  heldBeats: number;
  /** The offset the thumb on the seam grabbed at, or `NO_WELL_GRIP`. */
  gripMilli: number;
}

/**
 * THE WELL takes the field as a projection, not as a body. No creature, no
 * row, no column and no health — there is nothing of it for the fall loop, the
 * hull or a shot to find, which is one step further than THE VANE's nothing:
 * the arm at least decides where an arrival lands.
 *
 * It opens **still and square**, with the seam at twelve and every hour on its
 * own column, so the plain picture is the first thing the pair learn and the
 * slip is something they watch happen to it.
 */
export function installWell(_world: World): WellState {
  return {
    kind: "well",
    phase: "still",
    phaseBeat: 0,
    offsetMilli: 0,
    heldBeats: 0,
    gripMilli: NO_WELL_GRIP,
  };
}

/** The boss, when it is this one. */
export function wellBoss(world: World): WellState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "well" ? boss : null;
}

/** As far from twelve as the seam ever gets, in thousandths of a sector. */
export function wellMaxOffsetMilli(cfg: SimConfig): number {
  return cfg.wellRollSectors * 1000;
}

/** Whether a thumb is on the seam right now. */
export function wellHeldNow(b: WellState): boolean {
  return b.gripMilli !== NO_WELL_GRIP;
}

/** Beats of hold still in hand — what the ear is told, and what a pair count. */
export function wellHoldLeft(cfg: SimConfig, b: WellState): number {
  return Math.max(0, cfg.wellHoldBeats - b.heldBeats);
}
