import type { ViewRole } from "@neon-spore/render";
import type { World } from "@neon-spore/sim";

/**
 * What a pose *is* — the shape of one, and the two things a caller can ask of
 * one without building it.
 *
 * Split out of `pose-kit.ts`, which was at CLAUDE.md's line ceiling exactly
 * when `Pose` grew `lookAt`. The seam is a real one rather than a place the
 * knife happened to land: everything here is the *description* of a posed
 * state, and everything left there is the machinery for reaching one — a
 * config, a `fresh` world, a `run`, an `until`. `pose-kit.ts` re-exports the
 * lot, so no caller had to learn a second import path for it.
 */

/** Which part of the phone the picture is cut out of. */
export type CropKind =
  /** The bottom of the field and the whole control band — the ship and its buttons. */
  | "ship"
  /** The band alone. */
  | "band"
  /** The play area above the band. */
  | "field"
  /** The warning strip along the top. */
  | "radar"
  /** A few tiles square, centred on what `Pose.at` names. */
  | "tile"
  /** The whole phone. */
  | "full";

export interface Pose {
  /** `SUBJECT · STATE`, so a column of them sorts and scans. */
  name: string;
  /** What the picture is showing, and why that is the moment worth holding. */
  note: string;
  /**
   * The thing on screen a VERSUS vote is about, in plain words — *"the two
   * round buttons at the bottom of player 1's panel"*.
   *
   * Its own field rather than the first sentence of `note`, because it
   * answers a different question and is read at a different moment: `note`
   * says why this state is worth holding, and this says where to point the
   * eye. The owner could not find GUARD and INTAKE on a page that described
   * them at length, which is what it is for. Required of every pose
   * `versus-pose.ts` names, and unused by the STATES gallery — a reference
   * card names its own subject in its title.
   */
  lookAt?: string;
  crop: CropKind;
  /** Whose screen. Defaults to `test`, which is both halves at once. */
  role?: ViewRole;
  /** A world, posed. Built fresh each time — nothing here is shared. */
  build(): World;
  /** Where a `tile` crop is centred. Read off the posed world, never guessed. */
  at?(world: World): { col: number; row: number };
  /**
   * How many tiles across a `tile` crop shows. A creature wants three and the
   * queen wants seven — she is five columns wide with both wings counted, and
   * a frame fitted to a slick cuts her marks off, which are the fight.
   */
  span?: number;
  /**
   * Seconds between replays of this pose's built moment — set on a pose
   * whose whole difference lives in one instant (a shot leaving, a ward
   * deflecting, a hull cracking), left undefined on a *continuous* one (a
   * hull skin, a hover — already on screen, nothing to re-trigger).
   *
   * A property of the pose, not of any candidate shown through it: the pair
   * (`versus-pair.ts`, `advanceCadenced`/`cadenceElapsed`) replays whatever
   * pose it is handed on that pose's own clock, so the next event pose
   * inherits the rhythm by setting this one field. Deliberately not
   * `waveRestBeats` — that beat count is timed for play, and a ward's own
   * fall to the shield alone already dwarfs two seconds, while a shot's
   * default rest lands under it. See `EVENT_CADENCE_SECONDS`.
   */
  cadenceSeconds?: number;
}

/**
 * The owner's number: *"the meteorite must repeatingly hit the shield with
 * around 2 seconds pause between"* — long enough that the eye re-reads the
 * unchanged field before the next impact, short enough to watch several
 * candidates without waiting. The pause is what makes the repeat legible.
 */
export const EVENT_CADENCE_SECONDS = 2;

/** Whether a cadenced pose's own clock says it is time to replay from
 * scratch — the `>=` and the `undefined` guard, provable without a canvas.
 * `versus-pair.ts`'s `startPair` is the only caller. */
export function cadenceElapsed(pose: Pose, elapsedSeconds: number): boolean {
  return pose.cadenceSeconds !== undefined && elapsedSeconds >= pose.cadenceSeconds;
}

export interface PoseGroup {
  title: string;
  /** One line: what this group of states has in common. */
  note: string;
  poses: Pose[];
}
