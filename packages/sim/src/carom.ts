import { metColor, missedColor } from "./balance.js";
import type { SimConfig } from "./config.js";
import { type CrossDir, crossAwayFromWall, crossField } from "./cross.js";
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
 * pressed at one answers nothing, whatever column the shield is in. Only the
 * matching colour opens it.
 *
 * **And the shot that opens it kills nothing.** It splits one arrival into two
 * problems that are answered by different people. The crust becomes a plain
 * `meteor` and falls the rest of the way at a tile a beat, which the shield now
 * *must* take, because a rock is the one thing a cannon cannot touch. The body
 * sealed inside is blown out of the hatch and goes **up** — a `chute`, which
 * climbs to the top of the field, opens a canopy there and drifts back down at
 * half a slick's speed still wearing the colour it always had, and which the
 * cannon has to answer all over again (`chute.ts`).
 *
 * So the pair's two controls are in series rather than in parallel for the
 * first time, and the seat that has just finished is the seat that has to
 * start: player 2's colour opens it, then player 2's column and player 1's
 * trigger owe the rock, and player 1's column and player 2's trigger owe the
 * body. One shot, three sentences, and none of them can be said alone.
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
 * columns.
 */

/**
 * Which way across the field it is going. `1` is to the right, and it is
 * `CrossDir` under this creature's own name: the wall it turns at is
 * `cross.ts`, which THE VOLLEY crosses the field by as well.
 */
export type CaromDir = CrossDir;

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
  return { caromDir: crossAwayFromWall(cfg.cols, col, span) };
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

  // `crossField` is the whole of the sideways move, the wall included — a
  // fresh arrival is pointed inward by `caromOnSpawn` and every turn after
  // that leaves the wall behind on the following beat, so the two together
  // mean a carom is always moving.
  const step = crossField(cfg.cols, c.col, spanOf(c), caromHeading(c), cfg.caromCols);
  c.col = step.col;
  c.caromDir = step.dir;
  if (step.turned) {
    world.events.push({ type: "caromBounce", col: step.col, row: c.row, dir: step.dir });
  }
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
  // The body, thrown clear before the crust it came out of is touched. It
  // takes the colour with it — that is the whole of what makes it the same
  // creature the pair were already looking at — and it starts on the tile the
  // shot met, with the canopy stowed, so the climb is drawn out of the hatch
  // rather than beginning somewhere above it.
  const thrown: Creature = {
    id: world.nextId++,
    kind: "chute",
    col: hit.col,
    row: hit.row,
    fromRow: hit.row,
    fromCol: hit.col,
    color: b.color,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    throbOpen: false,
    shell: 0,
    chuteOpen: false,
  };
  world.creatures.push(thrown);
  world.events.push({
    type: "caromEject",
    id: thrown.id,
    col: hit.col,
    row: hit.row,
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
