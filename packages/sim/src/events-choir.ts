import type { Color, CreatureKind } from "./types.js";

/**
 * **THE CHOIR's three**: an arrow out, both in, and the window gone.
 *
 * Their own file beside `events-coil.ts` and `events-carom.ts`, on the terms
 * those set — `events-creature.ts` is at its 250-line limit — and with one
 * argument of their own. Every other group cut out of that file is one
 * *arrival* taken apart: a crust cracking, a dome failing, a shell bursting.
 * These three are one **gesture** taken apart, and the thing being reported is
 * the pilot's hands rather than anything that met a body. That is a different
 * kind of event and it reads better in one place.
 *
 * One arm of `CreatureEvent` and not a union anything handles on its own:
 * every consumer still switches over the whole list, which is what keeps a new
 * event a compile error rather than a silence.
 */
export type ChoirEvent =
  /**
   * THE CHOIR drew together and is now the body it was hiding. `kind` is what
   * it *became*, and `col` is the middle of the three it hung across — by the
   * time anything reads this the creature is one tile wide and standing there,
   * and an event naming the leftmost dot would be pointing at a lane that is
   * now empty. `claspBreak` next door is the same event one creature earlier, and
   * carries `id` for the same reason: the picture of a membrane closing is
   * drawn around a body that is still falling.
   */
  | { type: "choirMerge"; id: number; col: number; row: number; kind: CreatureKind }
  /**
   * And the closing finished: the body is a slick or a bulb now, standing in
   * the lane it arrived in, and the colour on this event is the one that has
   * *just* come into existence. It is the beat player 2 has been waiting for —
   * nothing about a choir names a trigger until this.
   *
   * Two events rather than one because they are two moments a beat apart, and
   * the pair does something different at each: the first says *stop shaking,
   * it is working* and the second says *now*. One event with a delay read off
   * it would have made the ear and the eye do arithmetic.
   */
  | {
      type: "choirOpen";
      id: number;
      col: number;
      row: number;
      kind: CreatureKind;
      color?: Color;
    }
  /**
   * One of the two arrows was carried outward and the window is open — the
   * field starts to shake, and shakes harder when the second one lands. It is
   * an event rather than a state read off the world because it is a *moment*:
   * what render/ keeps is a decaying quake, and a clock started by a flag
   * would restart on every frame the flag was still true.
   */
  | { type: "choirArm"; side: -1 | 1 }
  /**
   * The window lapsed, or an arrow went the wrong way, and the thing sang. The
   * hull damage rides on the `breach` beside it (`singChoirs`); this is the
   * chord itself, so the ear can tell a body that beat the pair from a gesture
   * they fumbled.
   */
  | { type: "choirSing"; col: number; row: number };
