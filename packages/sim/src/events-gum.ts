/**
 * **Everything THE GUM does**, as events: it sticks, it refuses a shot, it is
 * flung off, or it spreads. Its own file on `events-crystal.ts`' terms — one
 * arrival taken apart rather than incidents that share a creature — and one
 * arm of `CreatureEvent`, so every consumer still switches over the whole
 * list.
 */
export type GumEvent =
  /**
   * A gum came to rest on the ship. Pushed on the beat it is drawn standing
   * on the hull — the beat after the one it arrived on, which is the beat
   * every other body breaks the hull on — and never again for the same body.
   * `col` is its leftmost column and `span` how many it covers.
   */
  | { type: "gumStick"; col: number; row: number; span: number }
  /**
   * Player 2 pressed fire with the cannon standing under a stuck gum, and no
   * shot came out. `col` is the cannon's column. Once per press: the block is
   * the whole cost of the thing, and the pair has to hear each refused shot
   * to learn that the lane is shut rather than the trigger broken.
   */
  | { type: "gumBlock"; col: number }
  /**
   * Swiped off the ship toward the nearer wall, with the cannon under it, and
   * gone. `dir` is which way it went. `col` and `span` are the columns it
   * covered, which are the lanes the cannon has just got back.
   */
  | { type: "gumFlung"; col: number; row: number; span: number; dir: -1 | 1 }
  /**
   * Swiped the **wrong** way — away from the nearer wall — and spread
   * `gumSpreadCols` wider toward the side it was pushed. `col` and `span` are
   * what it covers **now**. The hand that did it has to lift before it can
   * swipe again, so a pair pushing on in the wrong direction does not spread
   * it across the whole ship in one gesture.
   */
  | { type: "gumSpread"; col: number; row: number; span: number };
