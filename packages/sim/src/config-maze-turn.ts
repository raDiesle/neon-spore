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
   * How far out from the rim the lever's knob runs, in thousandths of a tile:
   * the knob's own radius and a hair for the bezel, so the ring the hand goes
   * round runs against the drum with no gap (`maze-string.ts`).
   *
   * **It is also the lever's gearing.** A hand on the string turns the wheel
   * one turn for one lap of that ring (the owner, 27 September 2026, 1:1 over
   * the 45° a tile it was tuned to), so the knob stays on the gap it was put
   * on all the way round — and how far one tile of hand travel turns it is
   * worked out from the ring's size (`mazeDragTurn`), not tuned beside it. A
   * gearing written as a number went wrong the first time the field's width
   * changed; one derived from the ring cannot.
   *
   * It is the drag's counterpart to `mazeTurnMilli`, which is per *tick* and
   * belongs to the thumb — the two are the two gestures and neither replaces
   * the other (`maze-controls.ts`).
   */
  mazeLeverOutMilli: number;
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
   *
   * **Nearly half a tile since 5 October 2026**, from 0.2: the owner asked for
   * a way in caught under the cannon to *stay more locked to it* when the hand
   * lets go — the last slip of a lifting thumb was breaking it. The wheel no
   * longer jumps the distance when it does break: it eases after the hand
   * (`maze-catch.ts`).
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
   * width the way in's funnel is drawn to (`maze-funnel.ts`), so what a pair
   * sees is what catches.
   *
   * **Widened again on 5 October 2026**, to just inside the column's own
   * half-width (the owner: *increase the lock radius further*). The click no
   * longer sets the wheel on the column in a tick — it eases there.
   */
  mazeSnapMilli: number;
  /**
   * The ease onto a caught column, and after a broken one: the share of what
   * is left to turn that each tick takes, in thousandths, and the least it
   * takes in thousandths of a degree so the tail does not crawl. The same
   * share carries a coast. About a sixth of a second for a catch at the edge
   * of the window (the owner, 5 October 2026: *smooth fast movement, not
   * jumping*).
   */
  mazeEaseMilli: number;
  mazeEaseLeastMilli: number;
  /**
   * The coast after a release out of a click: so many ticks of the hand's
   * last speed, never more than the cap, in thousandths of a tile of hand
   * travel, and the least a tick of it moves. *A little more*, the owner
   * said, so a fling carries the wheel a few degrees and not a lap.
   */
  mazeGlideTicks: number;
  mazeGlideMaxMilli: number;
  mazeGlideLeastMilli: number;
}

export const MAZE_TURN_DEFAULTS: MazeTurnConfig = {
  mazeTurnMilli: 600,
  mazeLeverOutMilli: 450,
  mazeDragBreakMilli: 450,
  mazeSnapMilli: 490,
  mazeEaseMilli: 350,
  mazeEaseLeastMilli: 250,
  mazeGlideTicks: 10,
  mazeGlideMaxMilli: 900,
  mazeGlideLeastMilli: 8,
};
