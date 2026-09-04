import { metColor, missedColor } from "./balance.js";
import type { SimConfig } from "./config.js";
import { livingKindForColor } from "./kinds.js";
import { spanOf } from "./span.js";
import type { Bullet, Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CAROM: a slick or a bulb sealed inside a hurtling rock crust, and the
 * first body **neither control can answer on its own**.
 *
 * THE CLASP is the precedent and its own doc says so out loud — "the first
 * body that becomes a different creature instead of dying", with the owner's
 * instruction to expect more of them and the three rules written to be lifted
 * rather than copied. This is the second, and it lifts them pointing the other
 * way. A clasp is opened by the shield and finished by the cannon; a carom is
 * opened by the *cannon* and finished by the *shield*, and what the cannon
 * leaves behind is not a body at all — it is a rock.
 *
 * **Nothing turns it away until somebody has shot it.** A whole carom is not a
 * `isMeteorKind`, so `resolveHull` never offers it the shield's row: a trigger
 * pressed at one answers nothing, whatever column the shield is in. The
 * matching colour cracks the crust, the light inside goes out, and what falls
 * the rest of the way is a plain `meteor` at a tile a beat — which the shield
 * now *must* take, because a rock is the one thing a cannon cannot touch. So
 * the pair's two controls are in series rather than in parallel for the first
 * time: player 2's colour, then player 2's column and player 1's trigger, in
 * that order, on one arrival.
 *
 * **And it does not fall.** It comes in on a diagonal — `caromCols` columns
 * and `caromRows` rows a beat — and reflects off the side walls of the field
 * the way a ball does, at least twice before it reaches the ship. THE DART
 * already steps sideways and THE GHOST already prowls a row, and neither of
 * them is this: a dart's next leg is a secret one seat is told, and a ghost's
 * is a count. A carom's is neither. Both screens can see exactly where it is
 * going, and *nobody can be there in time* — four lanes a beat is further than
 * a cannon slides comfortably in one, so what has to be said out loud is a
 * column the body has not reached yet, and the wall is what stops either of
 * them working it out alone.
 *
 * **A bounce lands on the wall rather than reflecting off it mid-beat.** THE
 * GHOST's rule exactly (`stepGhostAcross`), and for its reason: a stride that
 * overshoots is truncated so the body stands *on* the outermost column it can
 * occupy, and turns there. A body that reflected the remainder would spend the
 * beat somewhere no column names, and the two players are talking about
 * columns. What it costs is up to three columns of travel per wall, which
 * `caromCols` is chosen to pay for.
 */

/** Which way across the field it is going. `1` is to the right. */
export type CaromDir = -1 | 1;

/** The leftmost column a body this wide may stand in. Zero, always — it is
 * here so the pair of walls is read out of one place rather than one of them
 * being a literal and the other a subtraction. */
function leftWall(): number {
  return 0;
}

/**
 * The rightmost column a body this wide may stand in. `spanOf` rather than the
 * kind's own width: a carom is two columns and the rock it becomes keeps them
 * (`caromStruck`), so the wall it turns at and the wall the shield has to
 * cover are one number.
 */
function rightWall(cfg: SimConfig, c: Creature): number {
  return Math.max(0, cfg.cols - spanOf(c));
}

/**
 * Which way this one is going. Call it rather than reading `caromDir` by hand:
 * the step, the lean render draws and the wall it is heading for are three
 * readings of one number, and a second copy of the fallback is how they come
 * to disagree about which side of the field the pair should be looking at.
 */
export function caromHeading(c: Creature): CaromDir {
  return c.caromDir ?? 1;
}

/**
 * The fields a carom arrives with. It sets off **away from the nearer wall**,
 * so the first crossing is the long one — THE GHOST's arrangement and its
 * argument, with more riding on it here: the count of walls this creature
 * touches before it lands is what `caromCols` was chosen for, and an arrival
 * that turned after one beat would spend a third of its flight before anybody
 * had said a word.
 *
 * Deterministic, from the column and the field's own width. Nothing is rolled:
 * which way it is going is on both screens from the first frame, and what the
 * pair cannot do is be there.
 */
export function caromOnSpawn(cfg: SimConfig, col: number, span: number): { caromDir: CaromDir } {
  const hi = Math.max(0, cfg.cols - span);
  return { caromDir: col - leftWall() < hi - col ? 1 : -1 };
}

/**
 * The body a carom is drawn as — the slick or the bulb its colour names, lit
 * inside the crust. Reached through `wornKind` and never called at a draw site
 * directly, for the reason every other worn body has one: what a thing *is*
 * and what it *looks like* are two questions, and a second copy of the pairing
 * is how a body comes to be drawn in a colour a shot does not match.
 *
 * A slick for a carom built without a colour, the same fallback `recoilBecomes`
 * and `claspBecomes` reach for and for the same reason: a body has to be drawn
 * as some body. Nothing in the game builds one — a wave authors red or cyan,
 * because that colour is the only thing either player can do about it.
 */
export function caromBecomes(c: Creature): CreatureKind {
  return c.color === null ? "slick" : livingKindForColor(c.color);
}

/**
 * One beat of a carom, in place of the fall every other body takes.
 *
 * The drop is unconditional and the crossing is the part with a rule in it:
 * a stride that would leave the field lands on the wall instead and turns
 * there, which is one `caromBounce` for the ear and the eye. Deliberately not
 * through `grippedFallTiles` — a carom refuses a hand (`isGrippable`), so
 * there is no hold here for a brake to scale, and the rock it becomes is
 * grippable again the instant the crust is off.
 */
export function stepCarom(world: World, c: Creature): void {
  const cfg = world.cfg;
  c.row += cfg.caromRows;

  const lo = leftWall();
  const hi = rightWall(cfg, c);
  // A field narrower than the body: there is nowhere to cross to, so it comes
  // straight down. Not reachable at the shipped width, and cheaper to answer
  // than to leave as a loop that could not terminate.
  if (hi <= lo) return;

  const dir = caromHeading(c);
  const next = c.col + dir * cfg.caromCols;
  if (next >= lo && next <= hi) {
    c.col = next;
    return;
  }

  // Over the edge. It lands *on* the wall and turns in the same beat, so there
  // is never a beat spent standing still against it — `caromOnSpawn` points a
  // fresh arrival inward, and every turn after that leaves the wall behind on
  // the following beat, so the two together mean a carom is always moving.
  const wall = dir > 0 ? hi : lo;
  c.col = wall;
  c.caromDir = dir === 1 ? -1 : 1;
  world.events.push({ type: "caromBounce", col: wall, row: c.row, dir: c.caromDir });
}

/**
 * What a whole one costs the hull when it reaches it. `damageCarom` rather
 * than `damageCreature`, and the reason is in that field's own comment: what
 * arrived is the rock it always was, and the shield was never offered it.
 *
 * It is a rule here rather than a branch in `hull.ts` for `ghostImpactDamage`'s
 * reason, and the two of them together are why `impact.ts` next door exists:
 * what a body costs the ship is a question about the body, and there are two
 * bodies that answer it differently now.
 */
export function caromImpactDamage(cfg: SimConfig): number {
  return cfg.damageCarom;
}

/**
 * A shot met a carom. Returns whether the bullet goes on, the same contract
 * `resolve` has — and it never does: what stopped the bolt is a rock, and a
 * rock stops a lance exactly as it stops anything else (`resolve`'s own rock
 * branch says so). A lance that tore through the crust and out the other side
 * would be a lance that answered the half of this creature the shield is
 * supposed to.
 *
 * A wrong colour is an ordinary colour miss. Both players see the body's
 * colour burning through the crust the whole way down, so getting it wrong is
 * the same mistake it would be against a slick and is scored as one.
 *
 * It lives here rather than in `bullet-hit.ts` for `recoilStruck`'s reason: it
 * is a rule about one creature, and that file is at its length limit.
 */
export function caromStruck(world: World, b: Bullet, hit: Creature): boolean {
  if (hit.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }

  metColor(world);
  world.score += world.cfg.scoreCaromCrack;
  // The width, written down before the kind changes. `spanOf` answers two for
  // a carom and one for a plain meteor, so a rock that inherited the fallback
  // would be half the thing the pair have been watching — and the shield would
  // have to cover a column that stopped existing at the moment of the shot.
  const span = spanOf(hit);
  world.events.push({
    type: "caromCrack",
    col: hit.col,
    row: hit.row,
    span,
    color: b.color,
  });
  hit.kind = "meteor";
  hit.span = span;
  // The light goes out. A rock carries no colour, and `resolve`'s rock branch
  // ahead of every colour test is what makes that the whole answer from here:
  // the next shot up this column leaves a crater and nothing else.
  hit.color = null;
  // And the crossing stops being a fact about it. The kind is what `beat.ts`
  // reads to choose the fall, so this changes nothing on its own — it is here
  // so the fingerprint of a rock is the fingerprint of a rock, whatever made
  // it, and two devices cannot carry a heading for a body that has none.
  hit.caromDir = undefined;
  return false;
}
