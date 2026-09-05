import { hullRow, type SimConfig } from "./config.js";
import { livingKindForColor } from "./kinds.js";
import type { Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * THE VOLLEY: a rock with a slick or a bulb sealed inside it, and the first
 * arrival the shield **does not finish**.
 *
 * Every warded body in this game so far has been a rock, and a rock answered
 * is a rock gone: the pair says a column, the shield is there, the thing
 * leaves the field. What the pair has learned from that is a reflex — *ward
 * it, and stop looking at it* — and this creature is written to charge for it.
 * A ward does not destroy a volley. It hits it straight back up the field on a
 * jet of its own dust, and one plate of shell comes off on the way; it falls
 * again from higher up, down the same column, with one less plate on it. Three
 * times. Only the third ward leaves nothing holding the shell together, and at
 * the top of that last climb — the middle of the field, in plain air, on both
 * screens — it bursts and what was inside comes out as a plain slick or a
 * plain bulb, falling, with a colour, which is the cannon's problem and
 * nobody else's.
 *
 * **It is a rock in every way but one, and that is deliberate.** It falls a
 * tile a beat because `fallTilesPerBeat` answers one for anything it does not
 * name; it drops through the same line of `beat.ts` every other body drops
 * through; it is clamped onto the ship's row by the same rule that keeps a
 * rock answerable at the plating; and `resolveHull` turns it at `shieldRow`
 * through the same branch that turns a meteor. Nothing here re-derives any of
 * that. What this file owns is only the part a meteor has no answer for: where
 * a turned body *goes*, and what is left once it has been turned enough times.
 *
 * It used to come in on a diagonal of its own and be answered a row lower, on
 * the ship rather than at the dome, and the owner's report was that neither
 * read: a ball that crosses the field is not a ball, and a ward taken a row
 * late looks like the shield swallowing something rather than hitting it back.
 *
 * **The count is the shell, and that is why there is no health bar.** THE
 * RECOIL's cage is its own readout and this one's plating is: render fills one
 * sector of the ball per plate still on and leaves the rest as bare skeleton
 * (`render/volley.ts`), so how many wards are left is a thing both seats read
 * off the body from where they are sitting.
 *
 * **Nothing the cannon does touches it while the shell is on.** A whole volley
 * is `isWardable`, so `resolve` gives a shot the same crater a rock gets — and
 * the body's colour is on the seams the whole way down, which is THE CAROM's
 * arrangement and its reason: the colour is the sentence the pair has to have
 * ready before the shell opens, and there is no time to read it afterwards.
 */

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
 * `beat.ts` asks it to decide whether this body falls like a rock or climbs
 * like nothing else in the game, and render asks it to decide which way the
 * shell is worn — and a second spelling of the fallback is a shell drawn
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
 * The fields a volley arrives with: every plate on, and nothing else. It falls
 * like a rock from here and needs no state of its own to do it.
 */
export function volleyOnSpawn(cfg: SimConfig): { volleyPlates: number } {
  return { volleyPlates: cfg.volleyPlates };
}

/**
 * The body a volley is drawn as — the slick or the bulb its colour names,
 * sealed inside the shell, and the body it actually becomes when the shell
 * goes. Reached through `wornKind` and never called at a draw site directly,
 * for the reason every other worn body has one: what a thing *is* and what it
 * *looks like* are two questions, and a second copy of the pairing is how a
 * body comes to be drawn in a colour a shot does not match.
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
 * The row a whole volley is clamped onto, which is the ship's — exactly a
 * rock's clamp, and it is the same call `beat.ts` makes. It is here so a test
 * can name it without spelling the rule out a second time beside the one that
 * already reads it.
 */
export function volleyFloor(cfg: SimConfig): number {
  return hullRow(cfg);
}

/**
 * One beat of a volley that is **climbing**, in place of the fall it would
 * otherwise take. A falling one is never brought here: `beat.ts` lets it
 * through to the ordinary fall, which is the whole of "it is a rock until the
 * shield says otherwise".
 *
 * The climb has no clamp of its own beyond the top of the field: a ward taken
 * in the first rows leaves it on row zero and it comes down again, which is
 * the honest picture of a hit that had nowhere left to push it.
 */
export function stepVolley(world: World, c: Creature): void {
  c.row = Math.max(0, c.row - world.cfg.volleyRiseRows);
  c.volleyRise = volleyClimbLeft(c) - 1;
  // The top of the climb. A shell with nothing left holding it comes apart
  // here — in mid-air, on both screens, where the pair can see what falls out
  // and still has half a field to answer it in.
  if (c.volleyRise === 0) {
    c.volleyRise = undefined;
    if (volleyPlatesLeft(c) <= 0) hatchVolley(world, c);
  }
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
  world.events.push({ type: "volleyReturn", id: c.id, col: c.col, row: c.row, left });
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
 * on owning. The count goes with the kind, so the fingerprint of a slick is
 * the fingerprint of a slick whatever made it.
 */
function hatchVolley(world: World, c: Creature): void {
  const color = c.color;
  c.kind = volleyBecomes(c);
  c.volleyPlates = undefined;
  world.events.push({
    type: "volleyHatch",
    col: c.col,
    row: c.row,
    kind: c.kind,
    ...(color === null ? {} : { color }),
  });
}
