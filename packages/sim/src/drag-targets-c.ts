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
 * and nothing that reaches for it knows there are three.
 */
export type DragTargetC =
  | "tasterBlade"
  | "tasterGap"
  | "tasterLock"
  | "ledgerFoot"
  | "ledgerSocket"
  | "ledgerBead"
  | "ledgerCord"
  | "leadStalk";

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
 * against `tasterPryMilli` the way THE CANDLE's wick is read. No `id`: there
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
 * `ledgerHaulMilli` as THE CANDLE's wick is read, and it is the one handle in
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
