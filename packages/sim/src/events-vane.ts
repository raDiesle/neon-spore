/**
 * **What THE VANE's second and third hands do that neither screen already
 * says**, as three events (`vane-hand.ts`) — and a fourth, the pin a shot
 * knocks out (`vane.ts` `vaneStruck`).
 *
 * Its own file on `events-warden.ts`' terms: one boss, one arm of `SimEvent`,
 * and a file `packages/audio/test/bind.test.ts` has to be told the name of.
 * The boss had no events of its own until 18 September 2026, because
 * everything about it followed from the beat and both screens drew it; these
 * three do not.
 *
 * A pin landing is the navigator's, because the column she is about to name is
 * the one it just froze and she cannot see the hand that froze it. A pin lost
 * is both seats': the fold line is moving again and the window is gone. A haul
 * is the pilot's, because it is the beat the shot he is standing under becomes
 * worth taking.
 */
export type VaneEvent =
  /** The pilot's thumb landed on the arm: it stands still in this column. */
  | { type: "vanePin"; col: number }
  /** The pin ended — lifted, or torn free by the sweep after `vanePinBeats`. */
  | { type: "vaneSlip"; col: number }
  /** The navigator hauled the seized housing open, in the split's column. */
  | { type: "vaneHaul"; col: number }
  /**
   * A shot of the right colour through the split knocked a pin out of the
   * bearing, and `pins` are what is left — 0 on the last, which ends the
   * fight. The one moment the pair get the better of the boss, and until 26
   * September 2026 the only one it kept silent.
   */
  | { type: "vaneKnock"; pins: number; col: number };
