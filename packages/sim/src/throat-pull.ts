import { hullRow } from "./config.js";
import { gripBrakes } from "./grip.js";
import { isMount } from "./gyre.js";
import { occupiesLane, spanOf } from "./span.js";
import { type ThroatState, throatBoss, throatMouthCol, throatMouthRow } from "./throat.js";
import type { Creature, Pod } from "./types.js";
import { isBossBody } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * **The pull**: what standing in THE THROAT's column does to a body, which is
 * that it stops falling and starts going the other way.
 *
 * Its own file rather than a branch in `throat-step.ts`, along the seam the
 * boss itself has: next door is the throat's own clock and the two hit tests
 * that change its health, and this is the rule about **somebody else's body**.
 * The two callers are on opposite sides of a beat — `steppedInsteadOfFalling`
 * asks the question inside the fall loop, `stepThroat` acts on it after — and
 * a reader who only wanted to know why a rock stopped falling should not have
 * to read a hit test to find out.
 *
 * ## It is a condition on a place, not on a kind
 *
 * `rockCrosses` and `volleyIsClimbing` are conditions on a *body*, and
 * `own-step.ts`'s header says why the order of those branches is a contract.
 * This one is weaker still: it is a condition on a **column**, and any body may
 * be standing in it. So it is asked **last** in that file, after every body
 * with a rule of its own has answered — a carom on its diagonal, a ghost on
 * its prowl, a gum a hand has flung — because a body crossing the throat's
 * column is *travelling through* it and not standing in it. Only a body that
 * would otherwise have fallen is caught.
 *
 * **THE DRAG and not THE SLOW**, which is the design's own choice here and the
 * plainest illustration of why they are two tools: the climb takes a whole
 * inhale per row, and those are real beats. A braking hand therefore has
 * `throatInhaleBeats` chances to arrive rather than one, and every one of them
 * is a beat the pair can talk in (`slow.ts` says what the other tool is for).
 *
 * ## A pod is held by the same rule
 *
 * The design's step 10 — *a gum and a pod arrive in the same lane; the throat
 * wants the pod* — is the one beat in the fight that needs both seats at once,
 * and it was the last piece built (17 September 2026). Pods are not creatures:
 * they live in `world.pods`, in thousandths, and fall a tick at a time from
 * `advancePods`. So the hold is asked of a **place** rather than of a body
 * (`Standing`), and both arrays are read through it — a creature by its span,
 * a pod by the tile it is nearest, the rounding `firstPodAlong` already uses
 * so a shot and the throat agree about which column a pod is in. One
 * predicate, not two copies of the column test, is the property the entry
 * asked to keep.
 *
 * **The maw is the only thing that answers a pod the throat would otherwise
 * take**, and it answers it by reach: a loose pod within `podHomeTiles` of the
 * hull is steering for the cannon (`advancePods`) and the throat has lost it.
 * Above that it is the throat's until the mouth steps off its column or the
 * inhale hauls it in — and a swallowed pod re-tightens a ring like any other
 * body, which is the design's own fail cell for that step. It does not lose
 * the wave: what the pod cost is rings, and that is the throat's own currency.
 */

/**
 * Where a thing stands, in whole tiles: the narrow shape the hold reads both
 * arrays through. `col` is the leftmost column, as everywhere (`span.ts`).
 */
export interface Standing {
  col: number;
  row: number;
  span: number;
}

/** A pod as the throat sees it: the tile it is nearest, one column wide. */
export function podStanding(p: Pod): Standing {
  return { col: Math.round(p.colMilli / MILLI), row: Math.round(p.rowMilli / MILLI), span: 1 };
}

/**
 * Whether the throat has hold of this body: it is in the mouth's column, at or
 * below the mouth's row, and the throat is still eating.
 *
 * `true` from `steppedInsteadOfFalling` means *do not fall it* — and nothing
 * else, because nothing moves here. The lift is one row an inhale and it
 * happens in `stepThroat`, after the swallow, so a body hauled into the mouth
 * always gets a whole inhale standing in it before it goes down. That order is
 * the pair's window and it is the only reason the lift is not in this file.
 *
 * **The four bodies `beat.ts` answers before it asks** — a boss's own body, a
 * mount on THE GYRE's rim, a link of a worm and a balloon — are refused here
 * rather than in the loop, so this file holds the list once and the lift next
 * door cannot disagree with the hold.
 */
export function throatHolds(world: World, c: Creature): boolean {
  const b = throatBoss(world);
  if (b === null || b.phase === "everts") return false;
  return holdsBody(world, b, c);
}

/** The same question with the boss already in hand, for the lift's loop. */
export function throatHasHold(world: World, b: ThroatState, c: Creature): boolean {
  if (b.phase === "everts") return false;
  return holdsBody(world, b, c);
}

function holdsBody(world: World, b: ThroatState, c: Creature): boolean {
  if (isBossBody(c.kind) || isMount(c) || c.kind === "crawler" || c.kind === "balloon") {
    return false;
  }
  return holdsAt(world, b, { col: c.col, row: c.row, span: spanOf(c) });
}

/**
 * Whether the throat has hold of this pod: loose — a moored pod hangs off the
 * field and is nobody's to haul — in the mouth's column at or below its row,
 * and above the maw's reach. `advancePods` asks it a tick at a time.
 */
export function throatHoldsPod(world: World, p: Pod): boolean {
  const b = throatBoss(world);
  if (b === null) return false;
  return throatHasHoldOfPod(world, b, p);
}

/** The same with the boss in hand, for the lift and the swallow. */
export function throatHasHoldOfPod(world: World, b: ThroatState, p: Pod): boolean {
  if (b.phase === "everts" || !p.loose) return false;
  const reach = hullRow(world.cfg) * MILLI - p.rowMilli;
  if (reach <= world.cfg.podHomeTiles * MILLI) return false;
  return holdsAt(world, b, podStanding(p));
}

function holdsAt(world: World, b: ThroatState, at: Standing): boolean {
  const cfg = world.cfg;
  if (at.row < throatMouthRow(cfg)) return false;
  return occupiesLane(at.col, at.span, throatMouthCol(cfg, b, world.beat));
}

/**
 * **One inhale's worth of climbing**, for every body the throat has hold of
 * below its mouth — a row each, and a braked one stays where it is.
 *
 * `gripBrakes` rather than `gripCount`, which is the shipped rule and the one
 * this had to be held to: a hand on a living body is player 1's *aim* and drags
 * at nothing (`grip.ts`). So the sentence the pair ends up saying is the one
 * the design wanted — **a rock in the mouth's column is his to brake, a
 * creature is hers to shoot** — and player 1 cannot brake a slick by aiming at
 * it, which would be a mechanic nobody pressed a button for.
 */
export function throatLift(world: World, b: ThroatState): void {
  const mouth = throatMouthRow(world.cfg);
  for (const c of world.creatures) {
    if (c.row <= mouth) continue;
    if (!throatHasHold(world, b, c)) continue;
    if (gripBrakes(world, c) > 0) continue;
    c.row -= 1;
  }
  // A pod climbs a whole tile too, and no hand brakes one: a hand is never
  // put on a pod, so the only answer to a pod being hauled is the maw's reach.
  for (const p of world.pods) {
    if (podStanding(p).row <= mouth) continue;
    if (!throatHasHoldOfPod(world, b, p)) continue;
    p.rowMilli -= MILLI;
  }
}
