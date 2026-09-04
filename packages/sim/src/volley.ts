import { hullRow, type SimConfig } from "./config.js";
import { type CrossDir, crossAwayFromWall, crossField } from "./cross.js";
import { livingKindForColor } from "./kinds.js";
import { spanOf } from "./span.js";
import type { Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * THE VOLLEY: a rock coming in on a diagonal with a body sealed inside it, and
 * the first arrival the shield **does not finish**.
 *
 * Every warded body in this game so far has been a rock, and a rock answered
 * is a rock gone: the pair says a column, the shield is there, the thing
 * leaves the field. What the pair has learned from that is a reflex — *ward
 * it, and stop looking at it* — and this creature is written to charge for it.
 * A ward does not destroy a volley. It hits it back up the field, eight rows
 * on a jet of its own dust, and one plate of shell comes off on the way; it
 * falls again from higher up, on a new diagonal, into a column that is not the
 * one anybody agreed on. Three times. Only the third ward leaves nothing
 * holding the shell together, and at the top of that last climb — the middle
 * of the field, in plain air, on both screens — it bursts and what was inside
 * comes out as a plain slick or a plain bulb, falling, with a colour, which is
 * the cannon's problem and nobody else's.
 *
 * **It is THE CAROM read backwards, and that is deliberate.** A carom is
 * opened by the cannon and finished by the shield; a volley is opened by the
 * shield — three times — and finished by the cannon. The two together are the
 * pair's two controls in series in both orders, which is the only way either
 * of them stops being a thing one player owns.
 *
 * **The count is the shell, and that is why there is no health bar.** THE
 * RECOIL's cage is its own readout and this one's plating is: render draws one
 * plate per plate still on (`render/volley.ts`), so how many wards are left is
 * a thing both seats read off the body from where they are sitting. It also
 * means the answer changes at the moment of the ward rather than a beat later,
 * which is the only time either of them is looking at it.
 *
 * **Nothing the cannon does touches it while the shell is on.** A whole volley
 * is `isWardable`, so `resolve` gives a shot the same crater a rock gets — and
 * the body's colour burns through the seams the whole way down, which is THE
 * CAROM's arrangement and its reason: the colour is the sentence the pair has
 * to have ready before the shell opens, and there is no time to read it
 * afterwards.
 */

/** Which way across the field it is going. `1` is to the right. */
export type VolleyDir = CrossDir;

/**
 * Which way this one is going. Call it rather than reading `volleyDir` by
 * hand: the step, the lean render draws and the wall it is heading for are
 * three readings of one number, and a second copy of the fallback is how they
 * come to disagree about which side of the field the pair should be watching.
 */
export function volleyHeading(c: Creature): VolleyDir {
  return c.volleyDir ?? 1;
}

/**
 * How many plates of shell are still on, which is how many wards this body
 * still takes before the thing inside is loose.
 *
 * Call this rather than reading `c.volleyPlates` by hand, for
 * `recoilBouncesLeft`'s reason: the ward, the picture and the hatch are three
 * readings of one count, and a second spelling of the fallback is how the
 * shell drawn and the shell the simulation is holding come to disagree about
 * whether the next ward is the last one.
 */
export function volleyPlatesLeft(c: Creature): number {
  return c.volleyPlates ?? 0;
}

/**
 * Beats of climb this body still has, and zero for one that is falling —
 * which is every body on the field but a volley on its way back up.
 *
 * A count of beats and not a target row, so the climb is the same length
 * whichever row the ward happened on. Read it through here and never directly:
 * render asks the same question to decide which way to lean the dust
 * (`render/volley.ts`), and a second spelling of the fallback is a shell drawn
 * falling while the simulation is carrying it upwards.
 */
export function volleyClimbLeft(c: Creature): number {
  return c.volleyRise ?? 0;
}

/** Whether it is on its way back up rather than coming down. */
export function volleyIsClimbing(c: Creature): boolean {
  return volleyClimbLeft(c) > 0;
}

/**
 * The fields a volley arrives with: every plate on, and a heading away from
 * the nearer wall so the first diagonal is the long one (`crossAwayFromWall`).
 *
 * Nothing is rolled. Both screens see the whole path from the first frame, and
 * what the pair cannot do is agree on a column once and keep it — a ward is
 * what makes their own sentence stale, and a rolled heading would make it
 * stale for a reason neither of them caused.
 */
export function volleyOnSpawn(
  cfg: SimConfig,
  col: number,
  span: number,
): { volleyDir: VolleyDir; volleyPlates: number } {
  return {
    volleyDir: crossAwayFromWall(cfg.cols, col, span),
    volleyPlates: cfg.volleyPlates,
  };
}

/**
 * The body a volley is drawn as — the slick or the bulb its colour names, lit
 * inside the shell, and the body it actually becomes when the shell goes.
 * Reached through `wornKind` and never called at a draw site directly, for the
 * reason every other worn body has one: what a thing *is* and what it *looks
 * like* are two questions, and a second copy of the pairing is how a body
 * comes to be drawn in a colour a shot does not match.
 *
 * A slick for a volley built without a colour, the same fallback
 * `caromBecomes` and `recoilBecomes` reach for and for the same reason: a body
 * has to be drawn as some body. Nothing in the game builds one — a wave
 * authors red or cyan, because that colour is what the pair has to have ready
 * before the shell opens.
 */
export function volleyBecomes(c: Creature): CreatureKind {
  return c.color === null ? "slick" : livingKindForColor(c.color);
}

/**
 * One beat of a volley, in place of the fall every other body takes.
 *
 * Deliberately not through `grippedFallTiles` — a volley refuses a hand
 * (`isGrippable`), for THE CAROM's reason: it crosses on a diagonal and climbs
 * on a ward, so there is no rate for a brake to scale, and a hand on one would
 * drag at nothing while showing every sign of working.
 *
 * The drop is clamped to the ship's row exactly as a rock's is (`beat.ts`), so
 * the last tile of the fall is a tile the shield is still asked about. The
 * climb has no clamp of its own beyond the top of the field: a ward taken in
 * the first rows leaves it on row zero and it comes down again, which is the
 * honest picture of a hit that had nowhere left to push it.
 */
export function stepVolley(world: World, c: Creature): void {
  const cfg = world.cfg;
  const climb = volleyClimbLeft(c);
  if (climb > 0) {
    c.row = Math.max(0, c.row - cfg.volleyRiseRows);
    c.volleyRise = climb - 1;
    crossVolley(world, c);
    // The top of the climb. A shell with nothing left holding it comes apart
    // here — in mid-air, on both screens, where the pair can see what falls
    // out and still has half a field to answer it in.
    if (c.volleyRise === 0) {
      c.volleyRise = undefined;
      if (volleyPlatesLeft(c) <= 0) hatchVolley(world, c);
    }
    return;
  }
  c.row = Math.min(c.row + cfg.volleyRows, hullRow(cfg));
  crossVolley(world, c);
}

/**
 * The sideways half of a beat, up or down: `crossField` is the whole of it,
 * the wall included. A turn is deliberately silent — THE CAROM's wall is an
 * event because a carom crosses four lanes a beat and the seat looking at the
 * cannon strip cannot see it happen, and a volley crosses one, which is a
 * thing both screens can watch. A pip at every wall of an arrival this long
 * would be a metronome rather than a warning.
 */
function crossVolley(world: World, c: Creature): void {
  const step = crossField(world.cfg.cols, c.col, spanOf(c), volleyHeading(c), world.cfg.volleyCols);
  c.col = step.col;
  c.volleyDir = step.dir;
}

/**
 * A ward met a whole volley. Returns true when the body **stays on the field**,
 * which it always does — a plate comes off, the shell throws it back up the
 * way it came, and only the plate count says whether this was the last one.
 *
 * Called from `ward.ts` rather than from `hull.ts`, so that what the shield
 * does to a body is one question with one answer and the exception is owned by
 * the creature that has it (`impactDamage` is the same arrangement pointed at
 * the hull).
 */
export function volleyReturn(world: World, c: Creature): boolean {
  const left = Math.max(0, volleyPlatesLeft(c) - 1);
  c.volleyPlates = left;
  c.volleyRise = world.cfg.volleyRiseBeats;
  world.score += world.cfg.scoreVolleyReturn;
  world.events.push({
    type: "volleyReturn",
    id: c.id,
    col: c.col,
    row: c.row,
    left,
  });
  return true;
}

/**
 * The shell coming apart at the top of the last climb, and the body inside
 * standing in the field with a colour on it for the first time.
 *
 * The kind changes, which is `caromStruck`'s move in the other direction: what
 * is left is not a volley with nothing on it, it is a slick or a bulb, and
 * every rule from here — the fall, the shot that kills it, the hand that may
 * be put on it — is the ordinary one rather than a branch this file has to go
 * on owning. The heading and the count go with the kind, so the fingerprint of
 * a slick is the fingerprint of a slick whatever made it.
 */
function hatchVolley(world: World, c: Creature): void {
  const color = c.color;
  c.kind = volleyBecomes(c);
  c.volleyDir = undefined;
  c.volleyPlates = undefined;
  world.events.push({
    type: "volleyHatch",
    col: c.col,
    row: c.row,
    kind: c.kind,
    ...(color === null ? {} : { color }),
  });
}
