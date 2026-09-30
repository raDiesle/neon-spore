/**
 * **THE VANE's second and third gestures**: how long a thumb may hold the arm
 * before the sweep tears it free, and how far the navigator's hand has to
 * carry the housing for the haul to bite (`vane-hand.ts`,
 * `docs/spec/bosses.md` §11.5, *Three phases, three gestures*).
 *
 * Its own file next to `config-warden.ts` and for its reason: `SimConfig`
 * extends it rather than nesting it, so every call site reads
 * `cfg.vanePinBeats`. The boss's *place* — how many pins the bearing carries —
 * stays in `config-boss.ts`; these two are a count the pair says out loud,
 * which is what `config-boss-clocks.ts` groups. The arm's row joined them on
 * 30 September 2026, as the third number about where the pair's hands meet
 * the bearing.
 */
export interface VaneHandConfig {
  /**
   * Beats a thumb may hold the arm still before the sweep tears it free
   * (`stepVanePin`).
   *
   * 4: long enough that the pilot can pin on a beat he has called, the
   * navigator can read the column it froze in and get a shot up it, and the
   * fold line stands still for a whole sentence. Two is shorter than a
   * sentence across a voice delay (`docs/spec/latency.md`). Eight would make a
   * parked thumb the answer to the boss, and the arm moving is the boss.
   */
  vanePinBeats: number;
  /**
   * How far the navigator's thumb has to carry the housing, in thousandths of
   * a tile, for the lift to read as a haul rather than a brush against it
   * (`vane-hand.ts`).
   *
   * 1500: a tile and a half, the same travel THE WARDEN's hatch asks for,
   * because it is the same gesture on a phone — a deliberate swipe, and more
   * than the drift of a thumb settling.
   */
  vaneHaulMilli: number;
  /**
   * The row the arm hangs across, and the one row of the field that is the
   * boss's: a body is folded as it crosses it, and a shot up the split column
   * meets the bearing here rather than at the top edge (`vane.ts`, `vaneMouthAlong`).
   *
   * 2: the owner, 30 September 2026 — *move boss around 2 tiles more down*.
   * Two rows of sky above it are where the radar's column is still the true
   * one, so the pair watch a body come in, cross the arm and come out; at
   * row 0 the fold was a thing that had happened before anything was drawn.
   */
  vaneArmRow: number;
  /**
   * Openings the housing keeps one colour for before it turns to the other
   * (`vaneColor`).
   *
   * 2: the owner, 30 September 2026 — *the changing colour should be somehow
   * slower*. Both ends of one sweep wear the same colour, so it turns once a
   * cycle rather than twice, and the navigator loads it once for a whole
   * swing. 1 was the colour until then; a larger number stops it being a
   * thing to watch at all.
   */
  vaneColorOpenings: number;
  /**
   * Forms the bearing goes through before its last pin ends the fight
   * (`vane.ts`, *re-forms*). Each one after the first carries a fresh set of
   * `vaneFormPins` and one more guard arm turning round the hub.
   *
   * 4: the owner, 30 September 2026 — *change its form of boss when it
   * reaches current end of hitting it … some more arms appears in further
   * levels which make it harder and harder to hit*. The bearing as built,
   * then one, two and three guards; a fourth would cover a mouth for most of
   * a pin and the fight would be waiting rather than reading.
   */
  vaneForms: number;
  /**
   * Pins a re-formed bearing carries. 3: under SWING's threshold, so a new
   * form opens at VEER and keeps SEIZE for its last pin — the pin and the
   * haul the pair already learned, with the guards as the one new thing.
   */
  vaneFormPins: number;
  /**
   * Beats one guard arm takes to go once round the hub (`vane-guard.ts`).
   *
   * 12: one cycle of the sweep, so a guard is in the same place every time
   * the arm is, and a pair that has watched one turn has watched them all.
   */
  vaneGuardTurnBeats: number;
  /**
   * Beats a passing guard stands across a mouth, and so the beats a shot up
   * it is refused. 2 of a 12-beat turn: with three guards spaced round the
   * hub a mouth is covered half the time, and any four beats — one pin
   * (`vanePinBeats`) — still hold a beat that is clear with the next one clear
   * after it, which is what a shot up the column needs.
   */
  vaneGuardCoverBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`: four beats, a tile and a half,
 * the arm two rows down, a colour kept for two openings, and four forms of
 * three pins each after the first, their guards once round a cycle.
 */
export const VANE_HAND_DEFAULTS: VaneHandConfig = {
  vanePinBeats: 4,
  vaneHaulMilli: 1500,
  vaneArmRow: 2,
  vaneColorOpenings: 2,
  vaneForms: 4,
  vaneFormPins: 3,
  vaneGuardTurnBeats: 12,
  vaneGuardCoverBeats: 2,
};
