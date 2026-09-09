import type { Creature } from "./types.js";

/**
 * **The tail of one body's fingerprint**, from THE RECOIL's bounces to THE
 * BEATBOX's run.
 *
 * Cut out of `hash-creature.ts` on purpose rather than under pressure: that
 * file sat at 250 lines exactly, and every creature added to this game brings
 * a field, so the next one would have been split by whoever happened to be
 * adding it that day (`docs/queue.md`, 6 September 2026).
 *
 * **The seam is a position and not a subject, and that is deliberate.** Order
 * is the contract here — two devices fold these in the same sequence or they do
 * not agree — so a file grouped by *what* a field is about would be a standing
 * invitation to move a row into the group it belongs to, and moving a row is
 * how every replay ever recorded stops matching. A cut at a position cannot be
 * taken that way: everything before this line is next door, everything from it
 * is here, and a new field is appended at the bottom of this file.
 *
 * The comments say what each field can desync rather than what it is; the type
 * already says what it is. `hash-coverage.test.ts` walks a populated creature
 * field by field and fails on one that is missing, wherever it lives.
 */
export function lateHashParts(c: Creature): number[] {
  const out: number[] = [];
  // How many bounces THE RECOIL has left. It decides whether the next matching
  // shot throws the body two rows back up and a lane sideways or takes it off
  // the field, so two devices that disagree about it disagree about where the
  // body is a tick later and about whether the column is closed — the loudest
  // kind of desync there is. The colour the bounce turns over and the lane it
  // lands in need no fields of their own: they are `c.color` and `c.col` far
  // above, and `rng.state` in `hash.ts` is what makes both devices roll the
  // same side. `-1` for a kind that never bounces, which is a value no count
  // can take, so "not a recoil" and "out of bounces" are never the same number
  // in the fingerprint.
  out.push(c.recoilBounces ?? -1);
  // Which way THE CAROM is going. It decides which column the body reaches on
  // the next beat and which wall it turns at, so two devices that disagree
  // about it are two devices holding the same ball on opposite sides of the
  // field — and one of them has the cannon in a lane nothing arrives in. `0`
  // for a body that never crosses, which is a value no direction can take, so
  // "not a carom" and "going left" are never the same number in the
  // fingerprint. What it *becomes* needs no field of its own: the crust coming
  // off is `c.kind` at the top of this list, and the width it keeps is
  // `spanOf` beside it.
  out.push(c.caromDir ?? 0);
  // Whether THE CHUTE's canopy is out. It decides which *direction* the body
  // moves on the next beat, so two devices that disagree about it are two
  // devices holding one body at one row and pulling it apart — the loudest
  // desync a single boolean can buy. Absent and false are one state here
  // (`chuteIsOpen`), so they fold to the same number on purpose.
  out.push(c.chuteOpen ? 1 : 0);
  // THE VOLLEY's two. The plate count decides whether the next ward is the one
  // that opens it, and therefore whether the pair is holding a shield or a
  // trigger a beat later; and the climb decides whether the body is going up
  // or down, which is the loudest thing two devices could disagree about — one
  // screen with a rock arriving and one with a rock leaving. `-1` for a kind
  // that carries neither, a value no count can take, so "not a volley" and
  // "out of plates, falling" are never the same numbers in the fingerprint.
  // What it *becomes* needs no field of its own: the shell coming off is
  // `c.kind` at the top of this list, and the colour it comes off to reveal is
  // `c.color` beside it.
  out.push(c.volleyPlates ?? -1);
  out.push(c.volleyRise ?? -1);
  // Which side THE VEER's next change of lane takes, and how wide it is. They
  // decide the column the rock will be standing in three rows from now, and
  // therefore the column the shield has to be in when it lands — so two
  // devices that disagree about either are two devices holding one rock over
  // two lanes, and one of them wards an empty column. `0` for a kind that
  // never changes lane, a pair of values neither field can take on a live
  // veer, so "not a veer" is never the same pair as any real change. When the
  // next change falls needs no field of its own: it is `c.row` far above,
  // which `veerRowIsChange` divides.
  out.push(c.veerDir ?? 0);
  out.push(c.veerDist ?? 0);
  // THE STRAND's four. Which thread a bead hangs on, where it hangs along it
  // and whether it is spent decide between them which beads are still a run at
  // all; the lit flag decides *which one of that run may be shot*, and it is
  // rolled afresh after every change (`lightStrandEnd`). So two devices that
  // disagree about any of the four are two devices where one player's press
  // kills and the other's swells a raisin back — one field walking in two
  // directions. `-1` for a body that is not a bead, a value neither an id nor
  // a place can take, so "not a strand" and "the leftmost bead of one" are
  // never the same number in the fingerprint. The colour needs no field of its
  // own: it is `c.color` far above, drawn from the place by `beadColor` on the
  // beat the thread arrives.
  out.push(c.strandId ?? -1);
  out.push(c.strandOrder ?? -1);
  out.push(c.strandSpent ? 1 : 0);
  out.push(c.strandLit ? 1 : 0);
  // THE CRAWLER's three. Which worm a link belongs to and where it sits along
  // it decide, between them, *where every link on the field is standing*:
  // a link stands at its rank among the living, so two devices that disagree
  // about either put the same body in two columns — one player's cannon under
  // a red segment and the other's under a plate. The heading is the same fact
  // one beat ahead: it is which way the whole body is about to walk, and which
  // wall the head is going to reach. `-1` for a body that is not a link, a
  // value neither an id nor a place can take, and `0` for the heading, which
  // is a value no direction can take — so "not a crawler" and "the head of
  // one, walking left" are never the same numbers in the fingerprint.
  //
  // What answers each link needs no field of its own: it is `c.color` far
  // above, written once from `segmentColor` on the beat the worm comes on, and
  // which links are the two ends follows from the run itself (`linkIsEnd`).
  out.push(c.crawlerId ?? -1);
  out.push(c.crawlerOrder ?? -1);
  out.push(c.crawlerDir ?? 0);
  // Which columns THE FENCE is open in. It decides whether the wall breaks the
  // hull or goes over it, so two devices that disagree about it are two
  // devices where one has the ship intact and the other has it holed — and
  // they disagree about it *silently*, because the two screens are drawn
  // differently on purpose and neither player could see the other's. `0` for a
  // body that is not a wall, a mask no live fence can carry: `fenceMask` never
  // returns a solid line.
  out.push(c.fenceGaps ?? 0);
  // And the columns the cannon has cut in it. The loudest of the two: a burn
  // is written by a shot rather than by the wave, so it is the half two
  // devices could actually come to disagree about — and a device that missed
  // one has the ship holed where the other has it whole.
  out.push(c.fenceBurns ?? 0);
  // And where it is cracked, one mask per colour. A crack is the only column a
  // bolt opens, so two devices that disagree about one disagree about whether
  // a shot went through the wall or bounced off it — and they would go on
  // disagreeing, because the burn that follows is written from the crack.
  // `0` for a body that is not a wall, and for a wall the wave left uncracked.
  out.push(c.fenceCracksRed ?? 0);
  out.push(c.fenceCracksCyan ?? 0);
  // THE COIL's two. The heading decides which column the body reaches on the
  // next beat and which wall it sinks at, so two devices that disagree about
  // it hold one dome on opposite sides of the field — and the beat the charge
  // landed decides *when it comes open*, which is louder still: one screen has
  // a rock at a torch's speed coming down and the other has a dome still
  // crossing. The chain's roll needs no field of its own — it is `rng.state`
  // in `hash.ts` — and what a dome becomes needs none either, being `c.kind`
  // at the top of this list and `spanOf` beside it.
  //
  // `0` for a heading, which no live coil can carry, and `-1` for the beat,
  // which no beat can be — so "not a coil" and "crossing left, charge not sent
  // yet" are never the same pair of numbers in the fingerprint.
  out.push(c.coilDir ?? 0);
  out.push(c.coilLit ?? -1);
  // A crossing rock's two. The heading decides which column the body reaches
  // on the next beat and which wall it sinks at, and the row decides *when the
  // crossing starts at all* — so two devices that disagree about either are
  // two devices with one rock over two lanes, and one of them holds the shield
  // in a column nothing arrives in. `0` for a heading, which no crossing rock
  // can carry, and `-1` for the row, which no row can be — so "falls like any
  // other rock" and "walking left along the top row" are never the same pair
  // of numbers in the fingerprint.
  out.push(c.rockDir ?? 0);
  out.push(c.rockRow ?? -1);
  // THE CHOIR's fuse. Two devices that disagree about the tick the gesture
  // landed on disagree about the tick the body stops being a membrane — which
  // is to say about whether the shot player 2 just fired reached anything.
  // `-1` for a membrane nobody has opened, which no tick can be.
  out.push(c.choirFuseTick ?? -1);
  // THE BEATBOX's three. The count decides whether the run standing on this
  // body is right, the tally is that run, and the beat it stands on decides
  // *when it is committed* — so two devices that disagree about any of them
  // disagree about whether the box is about to be silenced or about to put a
  // wave of sound through the hull, which is as loud as a disagreement gets.
  // They are also the pair's most private numbers: only player 1 is drawn the
  // count and only player 2's thumb writes the other two, so nothing on either
  // screen would show the pair that their two worlds had come apart.
  //
  // `-1` for a body that is not a box, a value no count and no tally can take,
  // and `-2` for the beat, which no beat can be — so "not a beatbox" and "a
  // box asking for one beat, untouched, on beat nought" are never the same
  // three numbers in the fingerprint.
  out.push(c.beatboxWant ?? -1);
  out.push(c.beatboxHits ?? -1);
  out.push(c.beatboxBeat ?? -2);
  // And the two ticks the picture is timed from: the thumb that counted, and
  // the discharge. Neither decides anything about a run, and both are in here
  // anyway — a field a rule does not read is still a field two devices can
  // disagree about, and rule 4 admits no exceptions that are not named in
  // `hash.ts`. `-1` for the same reason as the three above: no tick is
  // negative, so absent and present can never be the same number.
  out.push(c.beatboxTick ?? -1);
  out.push(c.beatboxWrong ?? -1);
  out.push(c.beatboxMiss ?? -1);
  out.push(c.beatboxRan ?? -1);
  // THE BALLOON's six, and the loudest group in this list. The heading and the
  // speed decide which tile it reaches next; the beat it came into being
  // decides whether it is climbing at all yet; the count decides whether the
  // next rub makes two bodies or none. And the two pulls decide **when it
  // gives** — they are the only fields in a creature two different people
  // write, so two devices that disagree about either are two devices where one
  // pair has just done the thing together and the other has not
  // (`balloon-pull.ts`).
  //
  // `-1` for the count and the beat, `0` for the heading and the speed, which
  // are values none of the four can take on a live balloon — so "not a
  // balloon" and "brand new, climbing right at a row a beat" are never the
  // same numbers in the fingerprint. The two pulls hash absent as a value no
  // pull can be, because a hand at rest reports nought and no hand at all
  // reports nothing: `balloonHeld` is the difference and the fingerprint keeps
  // it (`-1000000`, past any distance the clamp allows).
  out.push(c.balloonSplits ?? -1);
  out.push(c.balloonBeat ?? -1);
  out.push(c.balloonDir ?? 0);
  out.push(c.balloonRise ?? 0);
  out.push(c.balloonPullP1 ?? NO_BALLOON_HAND);
  out.push(c.balloonPullP2 ?? NO_BALLOON_HAND);
  return out;
}

/** What "no hand on this side" folds in as. Past any distance `balloonHeard`
 * lets a pull reach, so a hand resting at nought and no hand at all are never
 * the same number. */
const NO_BALLOON_HAND = -1_000_000;
