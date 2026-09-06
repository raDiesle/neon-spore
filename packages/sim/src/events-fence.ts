/**
 * **What THE FENCE does**, as events: the wire going over the ship, and a bolt
 * cutting a way through it.
 *
 * Its own file rather than two more rows in `events-creature.ts`, which is at
 * its 250-line limit, and on `events-volley.ts`'s terms next door: these two
 * are one arrival taken apart rather than two incidents that share a creature.
 * They are also the two *answers* to it — the shield's and the cannon's — and
 * a reader looking for what a pair can do about a fence finds both in one
 * short file.
 *
 * One arm of `CreatureEvent` and not a union anything handles on its own:
 * every consumer still switches over the whole list, which is what keeps a new
 * event a compile error rather than a silence.
 */
export type FenceEvent =
  /**
   * A wall went over the ship: the dome was standing in one of its gaps when
   * it reached the shield's row (`resolveFence`, hull.ts). `col` is the
   * shield's own column, which is the gap the pair found, and `row` the row
   * the wall was on when it passed.
   *
   * Its own event because there is nothing else that could stand for it. A
   * `deflect` is a body thrown off the dome and render draws one tumbling away
   * from it, and this body is not turned at all — it goes *through*, over a
   * ship it did not touch. And the moment has to be audible: it is the one
   * beat in this creature where the pair finds out whether the number that
   * crossed the room was the right one, and until the wall is past the ship
   * neither of them can see that it was.
   */
  | { type: "fencePass"; col: number; row: number }
  /**
   * A bolt cut THE FENCE open in a column (`fenceBurn`, bullet-hit.ts). `col`
   * is the column the cannon was standing in, which is now a way through.
   *
   * Its own event, and not a `destroy` or a `hole`: nothing died and nothing
   * was merely dented — a shot that lands here *changes what the wire is*, and
   * it is the one moment in the game where the seat that cannot move the
   * shield makes the place the shield has to be. It goes to both devices,
   * because the cut is the one opening in a fence neither of them is keeping
   * from the other.
   */
  | { type: "fenceBurn"; col: number; row: number };
