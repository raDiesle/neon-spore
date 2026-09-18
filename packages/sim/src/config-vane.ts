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
 * which is what `config-boss-clocks.ts` groups.
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
}

/** The defaults, spread into `DEFAULT_CONFIG`: four beats, a tile and a half. */
export const VANE_HAND_DEFAULTS: VaneHandConfig = {
  vanePinBeats: 4,
  vaneHaulMilli: 1500,
};
