import { metColor, missedColor } from "./balance.js";
import { closeSlow } from "./slow.js";
import {
  type TasterBlade,
  type TasterState,
  tasterBladeAt,
  tasterBoss,
  tasterLifted,
  tasterPhase,
  tasterPried,
  tasterStanding,
  tasterWeak,
} from "./taster.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **What a shot does to THE TASTER**, which is the whole of the inverted rule:
 * a blade is struck off by the colour it is *not*, thickened by the colour it
 * is, and the crest where one used to be takes either.
 *
 * Its own file beside `taster-step.ts` for `orrery-shot.ts`' reason, said about
 * a fan rather than about three rings: next door is the fight's **clock** — a
 * blade out of the crest, a colour setting on the ledger, the re-edge — and
 * everything here happens on the **tick** a bolt or a beam leaves the top of a
 * column, because a blade that sheared on the next beat would be a blade the
 * pair watched a correct shot pass through. The two halves also read the ledger
 * from opposite ends: the clock asks what the pair has been *leaning* on, and
 * this file asks, once, at the end, what they are *short* of.
 *
 * **The interlock's answer is three-part since 19 September 2026** — open, then
 * the right colour, then out — and the first part is a thumb and not a shot at
 * all (`taster-hand.ts`). Nothing else here moved.
 */

/** The last blades interlock over the body, and no bolt touches them again. */
function close(world: World, t: TasterState): void {
  world.events.push({
    type: "tasterClose",
    col: t.col + Math.floor(t.blades.length / 2),
    left: tasterStanding(t),
  });
}

/** A blade struck off, for good, and the crest under it soft. */
function shear(world: World, t: TasterState, i: number, k: TasterBlade): void {
  k.shorn = true;
  k.edge = null;
  k.layers = 0;
  t.shorn += 1;
  world.events.push({ type: "tasterShear", col: t.col + i, left: tasterStanding(t) });
  // The interlock is reached by shearing and by nothing else, so this is the
  // one place it can be announced (`tasterPhase`).
  if (tasterPhase(t, world.cfg) === "closed") close(world, t);
}

/**
 * A cut into the crest where a blade used to be — the design's *soft and
 * visibly wet*, and player 1's own job.
 *
 * **It counts nothing on the balance sheet**, either way. That sheet counts
 * joint *colour* moments (`balance.ts`) and the crest is the one target in
 * this fight with no colour at all: it takes a bolt of either, which is
 * exactly why it is the pilot's to take while the navigator is saving the
 * colour they are short of. The cost of it is elsewhere and it is the whole
 * trap — every shot into the crest is still a colour spent, and the ledger
 * counted it before it got here.
 *
 * **Exported because the crest has two ways in**: a bolt, and the navigator's
 * thumb carried across it, which makes the same cut and spends nothing at all
 * (`taster-hand.ts`). Two counts of `tasterCrestCuts` would be two answers to
 * *is the crest through yet*, which is the one thing both seats read off the
 * same picture — so there is one, and it lives on the side that shipped first.
 */
export function tasterCut(world: World, t: TasterState, i: number): void {
  t.crest += 1;
  world.events.push({ type: "tasterCrest", col: t.col + i, cuts: t.crest });
  if (t.crest >= world.cfg.tasterCrestCuts && !tasterLifted(t)) {
    t.liftBeat = world.beat;
    world.events.push({ type: "tasterLift" });
  }
}

/**
 * **A shot that nothing on the field stopped, leaving through the top** of a
 * column the crest stands under. Called by `bullets.ts` and `lance-burn.ts`
 * beside `gorgeStruck`, and a no-op unless THE TASTER is the boss.
 *
 * The inverted rule, in one place: the colour a blade's edge carries is the
 * colour it grew toward and therefore the one that **cannot** break it — it
 * thickens instead, up to `tasterThickMax`, and the balance sheet reads that
 * as the missed colour it was. The other colour takes a layer off, and the
 * last layer takes the blade. A column with nothing standing in it is either
 * soft crest, if a blade was struck off there, or a blade still growing — and a
 * shot at one that has not decided yet is simply spent, the way a shot past the
 * top of any other field is.
 */
export function tasterStruck(world: World, bullet: Bullet): void {
  const t = tasterBoss(world);
  if (t === null || t.outBeat >= 0) return;
  const i = tasterBladeAt(t, bullet.col);
  const k = t.blades[i];
  if (k === undefined) return;
  const cfg = world.cfg;
  const col = t.col + i;
  if (tasterPhase(t, cfg) === "closed") {
    interlock(world, t, bullet, col);
    return;
  }
  if (k.shorn) {
    tasterCut(world, t, i);
    return;
  }
  if (k.edge === null) return;
  if (bullet.color === k.edge) {
    missedColor(world);
    if (k.layers < cfg.tasterThickMax) k.layers += 1;
    world.events.push({ type: "tasterThick", col, layers: k.layers });
    return;
  }
  metColor(world);
  k.layers -= 1;
  if (k.layers > 0) {
    world.events.push({ type: "tasterPare", col, layers: k.layers });
    return;
  }
  shear(world, t, i, k);
}

/**
 * The closed fan, which is edged in both colours at once: **no bolt of either
 * touches it**, and the one thing that opens it is the beam in the colour the
 * ledger says the pair has spent least of — into an interlock the pilot's
 * carry has hauled apart, and inside the beats it stands open.
 *
 * **The pry is checked before the colour**, and the order is the whole of what
 * the pair has to coordinate: a beam that came to a shut fan is early, and a
 * beam in the wrong colour to an open one is wrong, and those are two
 * different sentences to say to each other. A shut fan therefore counts
 * nothing on the balance sheet either way — there was no colour that would
 * have worked, so it is not a colour moment (`balance.ts`) — and an open one
 * counts both ways, because by then the colour is the only question left.
 *
 * A refused bolt counts nothing for its own reason, which has not changed: a
 * single shot never reached this fan and never will.
 *
 * **Two beams since 24 September 2026** (`tasterPryFills`): each right one is
 * a colour met, and the last inside the pry ends the fight and the slow.
 */
function interlock(world: World, t: TasterState, bullet: Bullet, col: number): void {
  if (!bullet.lance || !tasterPried(t, world.beat, world.cfg)) {
    world.events.push({ type: "tasterRefused", col });
    return;
  }
  const want = tasterWeak(world, t);
  if (want === null || bullet.color !== want) {
    missedColor(world);
    world.events.push({ type: "tasterRefused", col });
    return;
  }
  metColor(world);
  t.pryFills += 1;
  if (t.pryFills < world.cfg.tasterPryFills) return;
  closeSlow(world);
  t.outBeat = world.beat;
  world.events.push({ type: "tasterOut", col, color: want });
}
