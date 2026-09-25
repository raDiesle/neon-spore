import type { DragTargetD } from "./drag-targets-d.js";

/**
 * **Every thing on this field a hand may take hold of, the third page** — the
 * names from THE TASTER's fan on.
 *
 * Cut when THE LEDGER's four hands would have put `drag-targets-b.ts` six
 * lines over its 250-line limit, exactly as that page was cut off the first,
 * and along the same seam: build order, with the *last* boss on the full page
 * handed across so that the set being written keeps its own comment. THE
 * TASTER's three came over with this file; THE LEDGER's four were written on
 * it. `drag-targets.ts` unions the pages together, so `DragTarget` is one name
 * and nothing that reaches for it knows there are four.
 *
 * **This page is full.** It stood at 246 lines of 250 once THE HIVE's underside
 * went on it — four lines and one comment from red, with §6.2's brief still in
 * the queue for five more bosses — so the same cut was made a second time and
 * `drag-targets-d.ts` carries THE HIVE and every boss from here on.
 */
export type DragTargetC =
  | "tasterBlade"
  | "tasterGap"
  | "tasterLock"
  | "ledgerFoot"
  | "ledgerSocket"
  | "ledgerBead"
  | "ledgerCord"
  | "leadStalk"
  | "scuttlePart"
  | "antiphonRail"
  | "wellSeam"
  // THE HIVE's one, argued beside itself on the fourth page: this one filled
  // the way the other two did.
  | DragTargetD;

/**
 * `tasterBlade`, `tasterGap` and `tasterLock` are the forty-sixth, -seventh and
 * -eighth, and the first three that are **one per movement of one fight**.
 * THE FLEET's three are one gesture per state of a *hull*; these are a
 * different seat's hand in each of three movements of the same boss, which is
 * the §6.2 ask taken literally (`taster-hand.ts`).
 *
 * They are also the first set on a boss **no part of which is hidden from
 * either seat**. Every other split in this game keeps some of the body off one
 * screen, so whose thumb may reach a handle is half decided by who can see it;
 * the fan is drawn whole on both, and what decides here is only whose hands
 * are free in that movement (`render/src/taster-read.ts`).
 *
 * `tasterBlade` is the pilot's thumb on a blade that is out of the crest and
 * has not decided, in `fanning` alone. It holds the blade out of its decision
 * for `tasterPinBeats`, which is the navigator's window to turn the ledger the
 * blade will read. `id` is the column, for `undertowPin`'s reason: three grow
 * at once there, and which one he took is the whole of what the hand says.
 *
 * `tasterGap` is the navigator's carry across a column a blade was struck off
 * in, in `hurrying` alone, and it cuts the crest the way a bolt into that
 * column does — with **no colour spent**, which is the one move in this fight
 * the boss cannot taste. `id` is the column and `fromMilli` is the carry;
 * unlike `pinTable` and `throatTube` its **sign says nothing**, because a gap
 * is wiped from either side.
 *
 * `tasterLock` is the pilot's carry on the closed interlock, `fromYMilli`
 * against `tasterPryMilli`. No `id`: there
 * is one interlock, and it is the boss. What it buys is the window behind it
 * — `tasterPryBeats` in which her beam is worth something and outside which
 * the fan refuses it — so the fight ends on the two seats doing different
 * things inside one window, and not on a seventh bolt.
 */

/**
 * `ledgerFoot`, `ledgerSocket`, `ledgerBead` and `ledgerCord` are the
 * forty-ninth to -second, and the first set whose seats were decided by **what
 * each seat can see**. THE TASTER's three are on a fan drawn whole to both, so
 * whose hand takes which was a question about free thumbs; half of this cord
 * is off each screen, and a handle a seat cannot see is not a handle
 * (`render/src/ledger-read.ts`).
 *
 * `ledgerFoot` and `ledgerSocket` are the navigator's, because the socket end
 * is hers. The first is her carry along the plating while the cord is still
 * paying out, `fromMilli` from the column she grabbed the foot in, and it
 * decides where the walk starts. The second is her thumb in the socket once it
 * is in: what lands on a plugged socket is rolled back onto the cord instead of
 * warded, out of `ledgerPlugBeats` for the whole fight. No `id` on either —
 * there is one cord and one hole, and each is the boss.
 *
 * `ledgerBead` and `ledgerCord` are the pilot's, because the cord's length is
 * his. The first hauls the soonest return one beat down, in `whipping` alone,
 * where a warded return is the weapon; it carries no `id` for `mazeString`'s
 * reason with the picture behind it — the beads are drawn in the order they
 * land, so the lowest one is the next bill and the only one a thumb is on. The
 * second is his carry down the `taut` cord, `fromYMilli` against
 * `ledgerHaulMilli`, and it is the one handle in
 * this union the simulation refuses **for something the holder cannot see**:
 * it will not come while the plate is still in the socket's column, which is
 * the last return being let through, said with two hands (`ledger-hand.ts`).
 */

/**
 * `leadStalk` is the fifty-third, and the only one on this page taken by a
 * boss that **already shipped without a handle**. THE LEAD is a fixture:
 * `grippable.ts` refuses a hand on a boss body, and that refusal is not
 * incidental to this fight, it is the reason the fight exists — a thumb on
 * the body would steer every shot into it, and steering a shot to where a
 * body *will be* is the whole question the boss asks.
 *
 * The still is the hole in that argument, and the only one. With one segment
 * left the body stops dead and `leadShootable` goes false, so `lead-shot.ts`
 * registers no flight at all: a thumb there can steer nothing, because there
 * is nothing in the air to steer. What it has instead is **time**. While it
 * is held the still does not run out, and the beat she lets go is the beat it
 * passes — her hand on the clock the beam has to fill inside (`lead-hand.ts`).
 *
 * **The navigator's alone**, and decided the way THE LEDGER's four were, by
 * what each seat is drawn: `leadFootCol` puts the stalk over the body's own
 * column on her screen and in the middle of the field on his, so his stalk is
 * a readout and not a body, and a handle a seat cannot see is not a handle.
 * The pilot's press is dropped without a sound, as `queenMark`'s is.
 *
 * No `id` and no carry: there is one stalk, it is the boss, and the gesture
 * is down or up. `on: false` is the command this boss was given a handle for
 * — the same shape as `surgeBulb`, and the same argument, one seat instead of
 * two.
 */

/**
 * `scuttlePart` is the fifty-fourth, and the second on this page taken by a
 * boss that **already shipped without a handle**. THE SCUTTLE is a fixture
 * too, and more thoroughly than THE LEAD: nothing of it is among the
 * creatures, no shot touches its slab, and `grippable.ts` refuses a hand on a
 * boss body outright. The hole is the same shape as the still — the one
 * moment a piece of this boss is **not** the boss. A part that has come loose
 * has left its socket and has not landed, and for the length of one cadence
 * it is a thing hanging on a thread.
 *
 * What it buys is a **place**, and it is the only handle in this union that
 * buys one. Every other thumb in this game buys time — a beat of still, a
 * window, a count held open — because time is what a fixed hull with a
 * sliding cannon is short of. This boss is short of something else: it
 * throws a part down a column every cadence and the pair own two columns at
 * once, the cannon's and the shield's. Carrying a hanging part one column
 * along the frame moves where the throw lands, so a rock due over the shield
 * walks off it and a body due away from the cannon walks onto it
 * (`scuttlePartCol` is what every reader of a hanging part's column asks).
 *
 * **The pilot's alone**, and decided by what each seat is drawn, as THE
 * LEDGER's four were: `showsScuttleCount` gives him every socket and every
 * hanging part uncoloured and unlocked, so his thumb on one teaches him
 * nothing about which is live and the gesture leaks no part of her half.
 * `showsScuttleLive` is hers, and a hand of hers on the frame would be her
 * steering the column her own readout names.
 *
 * `id` is the socket, for `undertowPin`'s reason: two parts hang at once once
 * the frame is thin, and which one he took is most of what the hand says.
 * `fromMilli` is the carry against `scuttleSwingMilli`, and unlike
 * `tasterGap`'s its **sign is the whole point** — it is the direction the
 * part goes. One a cycle, and never while the frame winds up: the last part
 * is burned where it stands, and a column the pilot could move under her beam
 * would make the one moment this fight ends on a moving target
 * (`scuttle-hand.ts`).
 */

/**
 * `antiphonRail` is the fifty-fifth, and the **second handle on a boss that
 * already had one** — the first in this union to be a boss's *other* hand
 * rather than its only one. `antiphonOrgan` is the pilot's thumb resting on
 * the organ, and it is a viewing angle: it changes nothing, by design. This
 * one changes the fight, and it is the navigator's.
 *
 * What it buys is **an answer that is not a shot**. Every other way this pair
 * can say anything to the boss is a bolt in a colour up a column, which is
 * one guess and one punishment; the rail in front of her holds three to six
 * candidates and she is often sure about two of them long before she is sure
 * about the third. The pull is that certainty spent: she carries a candidate
 * down off the rail, `fromYMilli` against `antiphonPullMilli`, and it stops
 * counting — a bolt into its column and colour is nothing rather than a
 * hardening, and it cannot fall on them when the cycle ends on a pit. The
 * rule is one sentence in any language: *pull off the ones you know are
 * wrong.*
 *
 * **The cost is the bolt's own**, and that is what keeps it from being free:
 * pull off the one he is describing and the cycle hardens exactly as firing a
 * decoy does. Three candidates crossed off is three of those risks where a
 * bolt is one, so there is nothing to work out and no way to play it that
 * beats describing the shape.
 *
 * **The navigator's alone**, and decided as THE LEAD's stalk was, by what
 * each seat is drawn: `showsAntiphonRail` puts the rail on her screen and
 * never on his, and a handle a seat cannot see is not a handle. His press is
 * dropped without a sound, and — this one alone in this union — **the sound
 * is seated too** (`audio/bind-antiphon.ts`): a pan on his phone would hand
 * him a column she had eliminated, which is the one thing this boss exists to
 * make them say out loud.
 *
 * `id` is the index on the rail, for `scuttlePart`'s reason: three to six
 * stand at once and which one she took is most of what the hand says. It is
 * an index and not a column because a crossing has to stay where it was
 * made, so the rail is never re-ordered. `fromYMilli` is the pull and its
 * sign is not the point — only *down*, as `curtainHem`'s is *up*, because up off
 * a rail hung over the top of the field is off the screen.
 */

/**
 * `wellSeam` is the fifty-sixth, and the first handle in this union that is a
 * hand on **nothing** — not a body, not a part of a boss, not a fixture the
 * field owns, but the one sector of THE WELL's clock face that holds no
 * column at all.
 *
 * Rolled into a circle, the field's two walls meet there: eleven o'clock and
 * one o'clock are the two ends of the row, and between them is a gap the
 * picture has always drawn and nothing has ever answered. That is what makes
 * it safe to hand over. A thumb on it takes no column off the cannon, covers
 * nothing with the shield and reaches for no creature, so this boss's two
 * gestures cost the pair nothing they were already using.
 *
 * **Two meanings, read off the face and not off the thumb.** While the face
 * is slipping, a thumb resting on the seam holds it still, on a budget; once
 * it has slipped as far as it goes, the same thumb carries it back to twelve.
 * One handle answering differently in two states is the whole of §6.2's ask,
 * and it is why there is one name here rather than two: a pair who find the
 * seam once have found both halves of the fight, and each half is four words
 * — *hold it*, then *turn it home*.
 *
 * `fromMilli` is the carry, one tile of thumb to one sector of face, with no
 * gearing in between on purpose (`well-hand.ts`). No `id`: there is one seam
 * and there is only ever one. **The pilot's alone**, because `showsWell` puts
 * the clock on his phone and never on hers — hers is the flat field with
 * plain columns on it, which is exactly why he has to ask her what the
 * numerals mean once the face has turned. Her press is dropped without a
 * sound.
 */
