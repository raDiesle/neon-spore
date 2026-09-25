/**
 * THE MAZE's wheel under the hand: how fast it turns, how far a pull carries
 * it, and how its click catches and lets go (`maze-controls.ts`).
 *
 * Its own file rather than four rows in `config-boss.ts`, which had reached
 * its limit when the click was widened (the owner, 25 September 2026), and
 * merged into `SimConfig` through `config-boss-clocks.ts` the way
 * `config-maze-grip.ts` is. All four are the feel of one control, which is
 * why they moved together.
 */
export interface MazeTurnConfig {
  /**
   * How far the wheel turns in a tick while the string is pulled, in
   * thousandths of a degree. A whole turn at 200 is twenty-four beats.
   */
  mazeTurnMilli: number;
  /**
   * How far the wheel turns for one tile of hand travel while the string's
   * handle is dragged, in thousandths of a degree. Forty-five degrees: the
   * handle can be pulled about a third of the field's width in one gesture and
   * carry a way in the whole distance between two of them, so a pull is one
   * hand movement rather than a series of them.
   *
   * It is the drag's counterpart to `mazeTurnMilli`, which is per *tick* and
   * belongs to the thumb — the two are the two gestures and neither replaces
   * the other (`maze-controls.ts`).
   */
  mazeDragMilliPerTile: number;
  /**
   * How far the hand has to carry on past a click before it breaks, in
   * thousandths of a tile. The detent needs hysteresis and a thumb does not: a
   * press under `valve` is a decision, while a hand resting on the handle
   * jitters by a pixel a frame, and without this the click a pair had just
   * agreed on came off again before either of them said the column out loud.
   * Wider than the snap window is worth in hand travel, narrow enough that
   * pulling on is still one movement.
   *
   * **A fifth of a tile since 25 September 2026**, from 0.08: the owner asked
   * for the way in to *snap a little*, and a click that came off after three
   * pixels of thumb was a click nobody felt. Out of it, the wheel jumps the
   * whole distance at once — a detent letting go, about nine degrees, clear
   * of the snap window so it cannot catch straight back.
   */
  mazeDragBreakMilli: number;
  /**
   * How near a column's centre a way in has to come before it clicks onto it,
   * in thousandths of a column. It has to be wider than the furthest the rim
   * moves in one tick or a column could be turned straight past, and inside
   * the column's own half-width, so nothing but the column under the drum
   * catches — `test/maze-bridge.test.ts` holds both ends of that.
   *
   * **Wide on purpose, since 25 September 2026** — the owner: *the entrance
   * should snap a little, so it is easier to position*. The click pulls the
   * mouth exactly onto the column wherever in the window it caught
   * (`mazeClickAngle`), so a wider window costs no precision in the picture;
   * it only means a pull that stops near enough is caught. It is also the
   * width the way in's funnel is drawn to, so what a pair
   * sees is what catches.
   */
  mazeSnapMilli: number;
}

export const MAZE_TURN_DEFAULTS: MazeTurnConfig = {
  mazeTurnMilli: 600,
  mazeDragMilliPerTile: 45_000,
  mazeDragBreakMilli: 200,
  mazeSnapMilli: 450,
};
