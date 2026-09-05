import { kindCode } from "./creature-kinds.js";
import { spanOf } from "./span.js";
import type { Creature } from "./types.js";

/**
 * One body's half of the world fingerprint.
 *
 * Split out of `hash.ts` the day THE WISP's next tile pushed that file past
 * its 250-line limit, and along the seam `hash-boss.ts` already cut: what is
 * left in `hash.ts` is the *shape* of the world — the ship, the wave's clock,
 * how many of each thing there are — and this is one entry of the longest of
 * its lists. It is also the list that grows: nearly every creature added to
 * this game since THE DART has brought a field with it, and a fingerprint that
 * ran out of room would be a fingerprint somebody was tempted to leave a field
 * out of.
 *
 * The contract is `bossHashParts`', which took it from `mazeHashParts`: a flat
 * list of numbers in a fixed order, pushed by the caller. Nothing here reads or
 * writes the running hash, so there is no second copy of the FNV step and no
 * way for the two files to disagree about how a number is folded in.
 *
 * **Order is the contract.** Two devices fold these in the same sequence or
 * they do not agree, so a field is appended rather than inserted, and the
 * comments below say what each one can desync rather than what it is — the
 * type already says what it is. `hash-coverage.test.ts` walks a populated
 * creature field by field and fails on one that is missing.
 */
export function creatureHashParts(c: Creature): number[] {
  const out: number[] = [];
  out.push(c.id);
  // Which body this is. Not needed while every creature died the kind it
  // was born: the wave's queue fixed that on both devices. THE CLASP turns
  // into a slick or a bulb mid-fall, on a trigger (`clasp.ts`), so two
  // devices can now hold one body at one row in one colour and disagree
  // about whether its shield is still on. Without this the fingerprints
  // would match while one player shoots what the other cannot hit.
  out.push(kindCode(c.kind));
  out.push(c.col);
  // How wide it is. A rock's width is authored rather than fixed by its
  // kind now (`RockSize`), so two devices can hold one body at one column
  // and disagree about which columns the shield has to cover — a desync
  // that shows up as a deflection on one screen and a hull breach on the
  // other. `spanOf` rather than `c.span`, so an unsized body is hashed as
  // the width it actually has.
  out.push(spanOf(c));
  out.push(c.row);
  out.push(c.color === null ? 0 : c.color === "red" ? 1 : 2);
  out.push(c.holes);
  out.push(c.petals);
  out.push(c.dragMilli);
  out.push(c.throbOpen ? 1 : 0);
  // Which pieces of THE SHELL are still on. In for the plainest possible
  // version of the rule above: two devices that disagree about a piece
  // disagree about whether the next shot chips armour or has to carry a
  // colour, and one of them is playing a body the other one has already
  // opened. The colour underneath needs no field of its own — it is drawn
  // into `c.color` at the break, and `rng.state` a few lines up is what
  // makes both devices draw the same one.
  out.push(c.shell);
  // Which way the dart goes next, and whether the next beat is the one it
  // goes on. Both decide where the body will be, so two devices that
  // disagree about either are two devices playing different fields — and
  // one of them has player 1 standing in a column nothing arrives in.
  // `fromCol` beside them is deliberately out, for `fromRow`'s reason: where
  // a body came from is a fact about the picture and not about the world.
  out.push(c.dartDir ?? 0);
  out.push(c.dartFloat ? 1 : 0);
  // And the side after that one, which is rolled a beat early and is
  // therefore already a fact about the world rather than a guess about it.
  out.push(c.dartNext ?? 0);
  // When a veil was last struck in the wrong colour. It decides whether the
  // next shot reaches the body at all (`veilIsArmoured`), so two devices
  // that disagree about it disagree about whether a kill happened — and the
  // body inside needs no field of its own, being `c.color` a few lines up,
  // which is what the morph turns over.
  out.push(c.veilStruckTick ?? 0);
  // And when an ordinary body was last struck in the wrong colour, for the
  // same reason one line up: inside `colourArmourMs` no shot reaches it at
  // all, so two devices that disagree about the tick disagree about whether
  // the bolt player 2 just fired was a kill or a spark off a shut body.
  out.push(c.colourStruckTick ?? 0);
  // Which way a crossing ghost is walking, and how many walls it has turned
  // at. Both decide where the body will be on the next beat — and the lap
  // count decides more than that: at `ghostChargeLaps` it stops walking and
  // comes down at the hull, so two devices that disagree about it disagree
  // about whether the ship is about to be hit. `-2` for a ghost that falls,
  // which is a value no direction can take, so "no path" and "going left"
  // are never the same number in the fingerprint.
  out.push(c.ghostDir ?? -2);
  out.push(c.ghostLaps ?? 0);
  // How many divisions THE ECHO has left. It decides whether this body is
  // two bodies on the next beat, how far apart they stand, and what a shot
  // at it pays — so two devices that disagree about it disagree about how
  // many things are on the field a beat later, which is the loudest desync
  // there is. `-1` for a kind that never divides, which is a value no count
  // can take, so "not an echo" and "done dividing" are never the same
  // number in the fingerprint.
  out.push(c.echoSplits ?? -1);
  // And the beat it started waiting from, which with the count above decides
  // *when* it divides. Two devices that agree about how many divisions are
  // left and disagree about the moment hold the same field a beat apart, and
  // a beat apart is one screen with four bodies on it and one with eight.
  out.push(c.echoBeat ?? -1);
  // THE GYRE's four. The hub's turn and its age decide where all six bodies
  // on its rim stand on the next beat, how fast the rim is going and how far
  // the diamond has sunk — so two devices that disagree about either are two
  // devices firing at different columns. The mount's two are the attachment
  // itself: `carryMounts` moves whatever names a hub, and `breakSpentGyres`
  // counts the same field to decide whether the wheel is still there.
  //
  // `-1` for a body that carries none, which is a value none of the four can
  // take, so "not a wheel" and "upright, brand new, riding slot zero" are
  // never the same number in the fingerprint.
  out.push(c.gyreTurnMilli ?? -1);
  out.push(c.gyreStep ?? -1);
  out.push(c.gyreId ?? -1);
  out.push(c.gyreSlot ?? -1);
  // The body a lure wears. Authored rather than rolled, so it is in here for
  // the reason the maze's wheel is: the assumption that both devices were
  // handed the same wave is exactly the one worth checking, and a disguise
  // that differed would put player 1 in front of a body player 2 cannot see.
  // How many layers THE RIND still wears. It decides whether the next
  // matching shot takes a layer or the body, so two devices that disagree
  // about it disagree about whether the thing is still on the field — one
  // screen with a column to keep and one with a column to leave. `-1` for a
  // kind that never sheds, which is a value no count can take, so "not a
  // rind" and "cut down to size" are never the same number in the
  // fingerprint.
  out.push(c.rindLayers ?? -1);
  // The tile THE WISP is going to next, rolled on the beat it lands
  // (`wisp.ts`) — `dartNext`'s reason exactly: two devices that disagreed
  // would put the navigator's square and the body's arrival on different
  // tiles. `-1` for a body carrying none, a value no tile index can take.
  out.push(c.wispNext ?? -1);
  out.push(c.wears === undefined ? 0 : kindCode(c.wears) + 1);
  // THE LID's cord, as two numbers rather than one. Whether a hand is on it
  // decides whether the plates are shut, and how far it has been carried
  // decides whether a shot lands — so two devices that disagree about either
  // disagree about whether the body player 2 just fired at was open. They
  // cannot be folded into one: the pull is signed and a grab reports zero, so
  // there is no value of it left over to mean "nobody is holding this".
  out.push(c.lidPullMilli === undefined ? 0 : 1);
  out.push(c.lidPullMilli ?? 0);
  // And the other half of it. A hand may carry a cord any way it likes, so two
  // devices that agreed about the x and not the y would disagree about how far
  // the plates stand apart — which is to say about whether the shot player 2
  // just fired counted.
  out.push(c.lidPullYMilli ?? 0);
  // And where the hand took the cord, for the reason above one more time: two
  // devices that disagree about the anchor draw the handle in two places.
  out.push(c.lidAnchorMilli ?? -1);
  out.push(c.lidAnchorYMilli ?? -1);
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
  return out;
}
