/**
 * **Everything THE FLEET does that neither screen already says**, as events.
 *
 * Its own file on `events-splice.ts`' terms — one fight taken apart rather
 * than incidents that share a body — and one arm of `SimEvent`, so every
 * consumer still switches over the whole list. Moved out when `events.ts`
 * came back to its 250-line limit for the third time: a boss is worth four or
 * five lines of that file, and there are nine more rounds designed.
 */

/**
 * A salvo left the cannon, whatever it is about to find. Pushed before the
 * splash or the hit that rides beside it on the same tick, and carrying the
 * square it is aimed at.
 *
 * Its own event because the *press* and the *arrival* are no longer the same
 * moment on either screen: the shell is drawn arcing out of the muzzle and
 * takes `FLEET_SHELL_BEATS` to land, and the two events after this one are
 * held back by the same amount so the ear hears the water close over it when
 * the eye sees it. Without this the pilot would press a trigger and get a
 * second of silence back, which is the one thing a control may never do.
 */
export type FleetEvent =
  | { type: "fleetSalvo"; col: number; row: number }
  | { type: "fleetSplash"; col: number; row: number }
  /** A salvo that found a hull. The square is now marked on both screens. */
  | { type: "fleetHit"; col: number; row: number }
  /**
   * The last square of one ship. `len` is how long it was and `left` how many
   * are still afloat, so the ear can say how big a thing just went down and
   * how much of the fight is left without either screen being read.
   */
  | { type: "fleetSunk"; col: number; row: number; len: number; left: number }
  /** The last ship of the fleet. The chart is clear and the wave is over. */
  | { type: "fleetDown"; col: number; row: number }
  /**
   * A hit that holed a hull and let the water in: `flood` opened at this
   * square (`fleet-state.ts`). Rides beside `fleetHit` on the same tick; the
   * hit is the mark on the chart, this is the plume that stands up out of it.
   */
  | { type: "fleetFlood"; col: number; row: number }
  /** The navigator's thumb landing on the plume (`on`) or leaving it. */
  | { type: "fleetBreach"; col: number; row: number; on: boolean }
  /** A square of the holed hull struck by the pilot's rake. */
  | { type: "fleetRake"; col: number; row: number }
  /**
   * The window closed on a hull not finished: every mark on it is taken back
   * and the hunt for it starts over. The square is the hole that healed.
   */
  | { type: "fleetPlug"; col: number; row: number }
  /** The hull raked end to end, lying on the water for the navigator to sink. */
  | { type: "fleetWreck"; col: number; row: number };
