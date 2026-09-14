/**
 * **Everything THE GUM does that the field does not already say**, as events:
 * it is swiped and flies. Its own file on `events-crystal.ts`' terms — one
 * arrival taken apart rather than incidents that share a creature — and one
 * arm of `CreatureEvent`, so every consumer still switches over the whole
 * list.
 *
 * Its arrival at the ship is not here: a gum that gets there breaks the hull
 * through `breachUnscarred` and is the ordinary `breach` event carrying the
 * gum's own kind, the way THE FENCE's is (`hull-damage.ts`) — which is what
 * the splash across the ship is drawn from (`render/gum-splash.ts`).
 */
export type GumEvent =
  /**
   * A hand carried a falling gum a swipe's worth and sent it flying. `dir` is
   * which way it went, `col` and `row` where it was when the hand let it fly,
   * `span` how wide it is. Once per gum: on the path there is no second
   * swipe to make.
   */
  { type: "gumFlung"; col: number; row: number; span: number; dir: -1 | 1 };
