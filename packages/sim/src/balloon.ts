import { markMoment } from "./balance.js";
import { hullRow, type SimConfig } from "./config.js";
import { type CrossDir, crossAwayFromWall, crossField } from "./cross.js";
import { removeCreature } from "./field.js";
import { breachUnscarred } from "./hull-damage.js";
import { spanOf } from "./span.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE BALLOON: the first body in this game that does not come down, and the
 * first that **neither panel can touch at all**.
 *
 * It appears out of nothing one row above the ship, swells into the field for
 * `balloonSwellBeats`, and then climbs — a row up and a column across every
 * beat, turning at the side walls the way a carom does. At the top it bursts,
 * and the hull pays for it wherever the ship happens to be standing.
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
 * The row a balloon enters at: one above the ship's own, which is where the
 * owner asked for it to appear from nothing.
 *
 * `hullRow(cfg) - 1` is a rule and not a literal, and it is written here once
 * so `spawnArrivals` calls it rather than spelling the arithmetic out — the
 * shape `purity.test.ts`'s `COPIES` table exists to catch.
 */
export function balloonEntryRow(cfg: SimConfig): number {
  return Math.max(0, hullRow(cfg) - 1);
}

/**
 * How far through its swell this body is, 0..1 — nought on the beat it came
 * into being and one once it has started climbing.
 *
 * It takes beats as a fraction rather than an integer, `echoSplitPhase`'s
 * arrangement and for its reason: the drawing is sampled between beats, and a
 * body that grew in steps would read as a stutter rather than as something
 * filling with air.
 */
export function balloonSwellPhase(cfg: SimConfig, beats: number, c: Creature): number {
  const wait = Math.max(1, cfg.balloonSwellBeats);
  const gone = beats - (c.balloonBeat ?? 0);
  return Math.max(0, Math.min(1, gone / wait));
}

/**
 * Whether this balloon is still filling rather than climbing — read on the
 * beat, from the moment it came into being plus a length, never from a
 * countdown (`World.guardTick`'s rule, `echoDue`'s spelling).
 */
export function balloonIsSwelling(cfg: SimConfig, beat: number, c: Creature): boolean {
  return beat - (c.balloonBeat ?? 0) < cfg.balloonSwellBeats;
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
 * Three phases and they are read in order: the swell, the climb, and the burst
 * at the top. A body that both climbed and fell would be going nowhere at all
 * — `own-step.ts`'s rule, and here it is the *sign* that carries it.
 */
export function stepBalloon(world: World, c: Creature): void {
  const cfg = world.cfg;
  if (balloonIsSwelling(cfg, world.beat, c)) return;
  const rise = balloonRiseRows(cfg, c.balloonRise);
  // The crossing first, so the column it bursts in is the one it travelled to
  // rather than the one it left. `crossField` is the whole of the sideways
  // move, the wall included — never spelled out here (`cross.ts`).
  const step = crossField(cfg.cols, c.col, spanOf(c), balloonHeading(c), rise);
  c.col = step.col;
  c.balloonDir = step.dir;
  c.row -= rise;
  if (c.row > 0) return;
  // It has reached the top. The row is clamped rather than allowed past it, so
  // the burst is drawn on the field both players are looking at rather than
  // above the edge of it.
  c.row = 0;
  burstBalloon(world, c);
}

/**
 * A balloon reached the top of the field, and the hull pays for it.
 *
 * `breachUnscarred` rather than `breachHull`: nothing struck the ship. A scar
 * is a crack drawn where a body landed, and drawing one for something that
 * went off at the far end of the field would put damage on the hull in a place
 * nothing ever hit — the defect the owner named when he asked for damage to be
 * drawn where it lands (`singChoirs` makes the same call for the same reason).
 *
 * The column is the balloon's own, so the burst comes out of a body the pair
 * has been watching climb.
 */
export function burstBalloon(world: World, c: Creature): void {
  markMoment(world, false);
  world.events.push({ type: "balloonBurst", col: c.col, row: c.row });
  breachUnscarred(world, c.col, "balloon", c.fromRow, world.cfg.damageBalloonBurst, null);
  removeCreature(world, c.id);
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
