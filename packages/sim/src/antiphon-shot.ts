import { type AntiphonState, antiphonBoss, antiphonGrown, antiphonOrganAt } from "./antiphon.js";
import { antiphonHarden, antiphonPit } from "./antiphon-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **A shot that nothing on the field stopped, leaving through the top**
 * under THE ANTIPHON. Called by `bullets.ts` and `lance-burn.ts` beside
 * `scuttleStruck`, and a no-op unless THE ANTIPHON is the boss.
 *
 * Its own file beside `antiphon-step.ts` for `scuttle-shot.ts`' reason:
 * next door is the fight's **clock**, and this happens on the **tick**,
 * where a bolt leaves the field. The judgment is the whole of it, and it is
 * the rail's: a bolt is a colour in a column, which is one candidate or
 * none. The organ's colour in the organ's column takes it — a pit, or the
 * eruption if the organ is their ship; a decoy's colour in the decoy's
 * column hardens the cycle; anything else is nothing, unsaid, because a
 * bolt that names no candidate has not answered the question. The organ's
 * column in the other colour is nothing too: she named the column and not
 * the colour, and the boss does not say which half was wrong.
 *
 * **The beam is nothing here.** The design has no beam in it, and a beam
 * that took an organ would take it without a colour, which is half the
 * description; a beam up any column burns the column and touches nothing.
 * Nothing counts until the organ has pushed all the way out: the rail is
 * laid the beat the growth begins, for the screens, but a bolt into a
 * contour still resolving is a guess.
 */
export function antiphonStruck(world: World, b: Bullet): void {
  const s = antiphonBoss(world);
  if (s === null || b.lance || s.downBeat >= 0) return;
  if (!standing(s, world)) return;
  const o = antiphonOrganAt(s, b.col);
  if (o !== null) {
    if (b.color === o.color) antiphonPit(world, s, o);
    return;
  }
  const decoy = s.rail.find((c) => c.col === b.col && c.color === b.color);
  if (decoy !== undefined) antiphonHarden(world, s, b.col);
}

/** Whether an organ stands, grown all the way out. */
function standing(s: AntiphonState, world: World): boolean {
  const o = s.organs[0];
  return o !== undefined && antiphonGrown(o, world.cfg, world.beat);
}
