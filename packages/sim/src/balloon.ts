import { balloonClimbs, balloonIsSwelling } from "./balloon-clock.js";
import type { SimConfig } from "./config.js";
import { type CrossDir, crossAwayFromWall, crossField } from "./cross.js";
import { spanOf } from "./span.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE BALLOON: the first body in this game that does not come down, and the
 * first that **neither panel can touch at all**.
 *
 * It appears out of nothing one row above the ship, swells into the field for
 * `balloonSwellBeats`, and then climbs — a row up and a column across every
 * `balloonClimbBeats`, turning at the side walls the way a carom does. At the
 * top it becomes a torch and drops (`topOut`), which the pair has to answer;
 * nothing it does costs the hull on its own. A split sends two halves up, not
 * one up and one down — the owner's rule of 14 September 2026, and
 * `balloonSinks` below is what is left of the field that said otherwise.
 *
 * **Every other arrival in the game is a deadline behind the pair.** A slick,
 * a rock, a wall: say the colour, say the column, before it reaches the ship.
 * This one is a deadline *in front of* them and it runs the other way — the
 * longer it is left the further it is from anything, and it never gets easier
 * to reach because reaching it was never the problem. What is asked instead is
 * an agreement, and the field usually holds several of these at once, so the
 * sentence is the plainest one two people can be made to say: **which one**.
 *
 * **What answers it is two hands at the same instant**, and that half is
 * `balloon-pull.ts` next door. The seam is the one `choir.ts` and
 * `choir-gesture.ts` already cut: this is what the *body* is and what happens
 * to it, and that is what the *hands* do. THE CHOIR's two arrows are one seat
 * making one gesture twice; these are two seats making one gesture once, which
 * is the thing this game has been building towards since THE LID.
 *
 * **It carries no colour and there is nothing to shoot.** A bolt is spent on
 * the skin (`balloonStruck`), deliberately not charged as a colour miss:
 * nothing about the ammunition was wrong, and the pair who fired at one have
 * misread what the body is rather than what it is made of.
 */

/** How many times this body still comes apart. Zero on a small one, which is
 * the only state in which a rub pops rather than splits. */
export function balloonSplitsLeft(c: Creature): number {
  return c.balloonSplits ?? 0;
}

/** Rows this one climbs a beat — the wave's own number, or the shipped one.
 * Called rather than read, so the step, the picture and the director's panel
 * are three readings of one figure. */
export function balloonRiseRows(cfg: SimConfig, rise?: number): number {
  return rise !== undefined && rise > 0 ? rise : cfg.balloonRiseRows;
}

/** Which way the diagonal leans. `caromHeading`'s rule one creature on, and
 * for its reason: the step, the lean and the wall it is heading for are three
 * readings of one number. */
export function balloonHeading(c: Creature): CrossDir {
  return c.balloonDir ?? 1;
}

/**
 * **A balloon never goes downwards**, which is the owner's rule of 14
 * September 2026, and this is what is left of the field that used to say
 * otherwise.
 *
 * A vertical split used to send its lower half to the ship's row, where it
 * burst against the plating; both halves rise now (`balloon-rub.ts`). The
 * function stays because `hash-creature-late.ts` and the creature's own state
 * both still name the field, and because a body that answers *no* to this in
 * one place and *yes* in another is worse than one that answers it once.
 */
export function balloonSinks(_c: Creature): boolean {
  return false;
}

/** The fields a balloon arrives with: the beat its swell is counted from, the
 * side its diagonal sets off towards, and the speed the wave authored. Set off
 * **away from the nearer wall** so the first crossing is the long one, which is
 * `caromOnSpawn`'s decision and its argument. */
export function balloonOnSpawn(
  cfg: SimConfig,
  beat: number,
  col: number,
  span: number,
  rise?: number,
): { balloonSplits: number; balloonBeat: number; balloonDir: CrossDir; balloonRise?: number } {
  return {
    balloonSplits: cfg.balloonSplits,
    balloonBeat: beat,
    balloonDir: crossAwayFromWall(cfg.cols, col, span),
    // Only when the wave asked for something other than the shipped speed, so
    // an unhurried balloon carries no field at all and every wave written
    // before this creature is byte-for-byte the same world.
    ...(rise === undefined || rise === cfg.balloonRiseRows ? {} : { balloonRise: rise }),
  };
}

/**
 * One beat of a balloon, in place of the fall every other body takes.
 *
 * Three phases and they are read in order: the swell, the climb, and the turn
 * at the top. **Every one of them goes upward** — the owner's rule of 14
 * September 2026 — so there is no sign to carry and `own-step.ts`'s objection
 * to a body that both climbs and falls never comes up.
 *
 * **It writes its own `from` fields**, which is why `beat.ts` skips it before
 * the reset it gives every other body. A step is `balloonClimbBeats` long and
 * the picture glides it over the whole of that (`balloonGlidePhase`), so the
 * tile the step set out from has to stand until the next one — a reset every
 * beat would have the body drawn back to its origin on the second beat of
 * every step.
 *
 * **The turn at the top comes on the climbing beat after the body was drawn
 * arriving**, not on the beat it arrived. The row is clamped at row 0 rather
 * than allowed past it, the glide carries the body onto that row, and only on
 * the next step — when it has been seen standing there — does it become a
 * torch. That is `resolveHull`'s rule for everything that reaches the end of
 * its travel, kept here so the handoff is a thing the pair watched happen
 * rather than a body that vanished on the beat it appeared at the top.
 */
export function stepBalloon(world: World, c: Creature): void {
  const cfg = world.cfg;
  if (balloonIsSwelling(cfg, world.beat, c)) {
    // **Not on the beat it arrived**, which is the beat its glide is drawn
    // over. A balloon comes in out of a wall and a split half comes out of its
    // parent's tile (`balloon-entry.ts`, `balloon-rub.ts`), and both are
    // carried by `fromCol`; resetting it on the same beat the body appeared
    // would put the picture at its destination before anybody saw it leave.
    // Every swelling beat after the first is a body standing still, and those
    // do reset, or it would go on gliding out of a wall it left two beats ago.
    if (c.balloonBeat === world.beat) return;
    c.fromRow = c.row;
    c.fromCol = c.col;
    return;
  }
  if (!balloonClimbs(cfg, world.beat, c)) return;
  if (c.row === 0) {
    topOut(world, c);
    return;
  }
  c.fromRow = c.row;
  c.fromCol = c.col;
  const rise = balloonRiseRows(cfg, c.balloonRise);
  // The crossing first, so the column it bursts in is the one it travelled to
  // rather than the one it left. `crossField` is the whole of the sideways
  // move, the wall included — never spelled out here (`cross.ts`).
  const step = crossField(cfg.cols, c.col, spanOf(c), balloonHeading(c), rise);
  c.col = step.col;
  c.balloonDir = step.dir;
  // Clamped at the top so the moment it turns is drawn on the field both
  // players are looking at rather than past the edge of it.
  c.row = Math.max(0, c.row - rise);
}

/**
 * **A balloon that reaches the top becomes a torch there and drops at once.**
 *
 * The owner's rule of 14 September 2026. It used to burst and charge the hull
 * with `breachUnscarred`, which made the top of the field a silent bill: the
 * pair watched a body go up, lost some ship for it, and had nothing to do
 * about it in between. A torch is a body they have to answer, at thirteen rows
 * a beat, and what it does when it lands is what a torch always does.
 *
 * `popCoil`'s handoff word for word and for its reason — the width is written
 * down before the kind changes, because `spanOf` answers one for a balloon and
 * two for a torch, and a rock that inherited the fallback would be twice the
 * body the pair has been watching climb.
 */
function topOut(world: World, c: Creature): void {
  const span = spanOf(c);
  c.kind = "torch";
  c.span = span;
  // Out of the tile it topped out in, straight down: `fromRow` is where it
  // turned, so the picture starts the fall where the climb ended — the one
  // thing that makes the torch read as *this* balloon rather than as a new
  // arrival (`coil.ts`'s own argument, a creature along).
  c.fromCol = c.col;
  c.fromRow = c.row;
  // Every balloon field goes with the kind: a torch that kept a swell beat or a
  // split count would be a rock carrying state nothing reads, and
  // `hash-creature-late.ts` would go on hashing it.
  c.balloonBeat = undefined;
  c.balloonDir = undefined;
  c.balloonRise = undefined;
  c.balloonSplits = undefined;
  c.balloonPullP1 = undefined;
  c.balloonPullP2 = undefined;
  c.balloonTautTick = undefined;
  world.events.push({ type: "balloonTopped", col: c.col, row: c.row });
}

/**
 * A shot met a balloon.
 *
 * A `reject` and deliberately **not** a colour miss, `choirStruck`'s argument
 * one creature on: a balloon carries no colour at all, so there was no right
 * ammunition to have loaded and charging the balance would read the failure to
 * a player who could not have got it right. What the pair has misread is what
 * the body *is*, and the spark off the skin says so.
 */
export function balloonStruck(world: World, hit: Creature): void {
  world.events.push({ type: "reject", col: hit.col, row: hit.row });
}
