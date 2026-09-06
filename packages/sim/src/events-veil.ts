import type { Color, CreatureKind } from "./types.js";

/**
 * **THE VEIL's three**: the cloud turning its weather over, shutting on a shot
 * in the wrong colour, and coming apart on one that matched.
 *
 * Cut out of `events-creature.ts` on purpose rather than under pressure — that
 * file sat at 250 lines exactly, and it grows by an arm per creature, so the
 * next lane to add a body would have been the one choosing where the cut went
 * (`docs/queue.md`, 6 September 2026). This is the seam that file's own header
 * already describes and that six creatures before this one were carried out
 * along.
 *
 * One arm of `CreatureEvent` and not a union anything handles on its own:
 * every consumer still switches over the whole list, which is what keeps a new
 * event a compile error rather than a silence nobody notices.
 */
export type VeilEvent =
  /**
   * The body inside a veil turned over — a slick became a bulb, or the other
   * way round. `color` is what it is *now*, which is the whole of what player 1
   * has to say next.
   *
   * Both devices carry it, and that is deliberate rather than an oversight of
   * the split: what player 2 is not told is *which* body, and a cloud that
   * visibly rolls over its own weather at the moment it turns is a fact both
   * screens already show. The ear gets the same thing — a turn nobody can read
   * the colour of — so player 2 knows the call they are holding has expired
   * without being told what replaced it.
   */
  | { type: "veilMorph"; col: number; row: number; color: Color }
  /**
   * A shot in the wrong colour struck a veil, and the cloud shut on it for
   * `veilArmourMs`. Its own event rather than a `reject`, because the ear has
   * to tell "that did nothing" from "that did something and it was bad": a
   * rebuff costs the pair a window as well as a shot, and the picture that
   * follows — red cloud, red lightning — is the only warning player 2 gets
   * that the next shot will bounce too.
   */
  | { type: "veilRebuff"; col: number; row: number }
  /**
   * The cloud came apart on a shot that matched, and what was inside it is
   * visible for the first time on player 2's screen. `kind` is the body that
   * was in there and `color` the shot that took it — the same colour, since
   * nothing else opens a veil.
   *
   * It rides beside the ordinary `destroy` on the same tick rather than in
   * place of it: the kill is a kill and gets the kill's burst, its sound and
   * its score, and this is the half-second of weather that comes off the top
   * of it (`render/veil-tear.ts`).
   */
  | { type: "veilTorn"; col: number; row: number; color: Color; kind: CreatureKind };
