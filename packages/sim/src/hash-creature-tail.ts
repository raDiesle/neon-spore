import { POD_KINDS } from "./pod-types.js";
import type { Creature } from "./types.js";

/**
 * **The end of one body's fingerprint**, from THE BALLOON's eight to THE
 * CRYSTAL's leg.

 * Cut off the end of `hash-creature-late.ts` when THE CRYSTAL's leg took that
 * file past the limit, on exactly the terms it was itself cut off
 * `hash-creature.ts`: **the seam is a position and not a subject**. Order is
 * the contract — two devices fold these in the same sequence or they do not
 * agree — so a file grouped by what a field is *about* would be a standing
 * invitation to move a row into the group it belongs to, and moving a row is
 * how every replay ever recorded stops matching. Everything before the balloon
 * is next door, everything from it is here, and **this is the bottom of the
 * chain: a new field is appended at the end of this file.**
 *
 * Spread into the caller's array rather than concatenated by it, so the two
 * halves are one list in one order and nothing has to remember which came
 * first.
 */
export function tailHashParts(c: Creature): number[] {
  const out: number[] = [];
  // THE BALLOON's eight, and the loudest group in this list. The heading, the
  // way and the speed decide which tile it reaches next; the beat it came into
  // being decides whether it is climbing at all yet; the count decides whether
  // the next rub makes two bodies or none. And the two pulls and the tick they
  // both went taut decide **when it gives** — the pulls are the only fields in
  // a creature two different people write, so two devices that disagree about
  // either are two devices where one pair has just done the thing together and
  // the other has not, and the tick is when the hold they are in began
  // (`balloon-pull.ts`).
  //
  // `-1` for the count, the beat and the tick, `0` for the heading, the way
  // and the speed, which are values none of the six can take on a live balloon
  // — so "not a balloon" and "brand new, climbing right at a row a beat" are
  // never the same numbers in the fingerprint. The two pulls hash absent as a
  // value no pull can be, because a hand at rest reports nought and no hand at
  // all reports nothing: `balloonHeld` is the difference and the fingerprint
  // keeps it (`-1000000`, past any distance the clamp allows).
  out.push(c.balloonSplits ?? -1);
  out.push(c.balloonBeat ?? -1);
  out.push(c.balloonDir ?? 0);
  out.push(c.balloonSinks ? 1 : 0);
  out.push(c.balloonRise ?? 0);
  out.push(c.balloonPullP1 ?? NO_BALLOON_HAND);
  out.push(c.balloonPullP2 ?? NO_BALLOON_HAND);
  out.push(c.balloonTautTick ?? -1);
  // Where THE COUNT's rim stands in its period. It decides the one beat in
  // five a shot is let in on, so two devices that disagree about it are two
  // devices where one player's shot kills and the other's breaks the hull —
  // and it is the pair's most private number after the beatbox's: only the
  // pilot is drawn it, so neither screen would show them their worlds had
  // parted. `-1` for a body without a count, which no phase can be.
  out.push(c.countPhase ?? -1);
  // THE MINE's fuse and the seat it is drawn on. The fuse is the number both
  // screens read, so two devices that disagreed about it would be two devices
  // counting a different wave down; the seat is what decides which screen the
  // body is on at all, so a disagreement there is one phone showing a mine
  // that the other says is not there. `-1` and `0` for a body that is not a
  // mine, neither of which a live one can take.
  out.push(c.mineFuse ?? -1);
  out.push(c.mineSees ?? 0);
  // THE MOULT's cargo, by its index in `POD_KINDS` rather than by a ternary,
  // for that list's own reason: a third cargo added to the type and not to a
  // chain would hash as the second, and two devices would agree about a ship
  // they disagree about. `-1` for a body that is not a moult. Which *form* it
  // is in is not here and must not be: it is a pure function of `beat`, which
  // is hashed already, so a second copy could only ever be a way to disagree.
  out.push(c.moultCargo === undefined ? -1 : POD_KINDS.indexOf(c.moultCargo));
  // Whether THE REPRISE sent this body back unseen. It decides *what the two
  // players are shown*, which is the whole of that fight: a device that drew a
  // body the other one has hidden would have one player calling a column and
  // the other remembering one, and nothing on either screen would say so.
  // Absent and false fold to the same number, so every wave without a reprise
  // in it fingerprints as it always has.
  out.push(c.unseen ? 1 : 0);
  // How far into its leg THE CRYSTAL is: whether the next beat is a row down
  // the column it is holding or a column sideways with no fall at all
  // (`crystal.ts`). Two devices that disagree about it are two devices with
  // the middle lane in different places a beat later, and the middle lane is
  // the one thing four hands have to agree on. `-1` for a body that never
  // crosses, a value no count can take, so "not a crystal" and "the first beat
  // of a fall" are never the same number in the fingerprint.
  out.push(c.crystalLeg ?? -1);
  return out;
}

/** What "no hand on this side" folds in as. Past any distance `balloonHeard`
 * lets a pull reach, so a hand resting at nought and no hand at all are never
 * the same number. */
const NO_BALLOON_HAND = -1_000_000;
