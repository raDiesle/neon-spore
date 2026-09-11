import type { CreatureKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";

/**
 * **The bodies answered by hands alone**, and today there are two of them.
 *
 * Every other family in this bestiary is cut by what is *on* a body — a
 * costume (`creatures-worn.ts`), nothing at all (`creatures-bare.ts`), a split
 * in what the two screens are shown (`creatures-split.ts`) — or by what a body
 * is made of (`creatures-hazards.ts`). This one is cut by what **answers** it,
 * and it is the only cut that could have held THE BALLOON: its `controls` list
 * is empty, which no other arrival's is, because neither the cannon nor the
 * shield reaches it. Two hands do, one per seat, at the same instant
 * (`sim/balloon-pull.ts`).
 *
 * A file of its own rather than four more rows in `creatures-table.ts`, which
 * was at its 250-line limit — and the family is the one with somewhere to go:
 * THE LID and THE MAGNET are already half here, each needing a hand *and* a
 * trigger, and a second body answered by hands and nothing else has a place to
 * land rather than a table to overflow.
 */
export type HandedKind = Extract<CreatureKind, "balloon" | "gum">;

export const HANDED_CREATURES: Record<HandedKind, CreatureDef> = {
  balloon: {
    kind: "balloon",
    // **Neither control, and it is the first row in the bestiary to say so.**
    // THE CHOIR's row in `creatures-table.ts` argues that a gesture is not a `ControlGroup` and
    // then names `aim` anyway, because a membrane becomes a body the cannon
    // has to finish. Nothing finishes a balloon but the two hands on it, so
    // there is no group a wave's panel has to be able to answer — which is
    // what `categoryOf` reads as `special`, the category the tether opened and
    // the first arrival to land in it.
    controls: [],
    // No colour at all, and none ever authored — the wisp's blank rather than
    // the dart's. A colour is what the cannon has to match, and no bolt
    // reaches this body in any colour (`balloonStruck`), so one offered here
    // would be a promise the field refuses.
    color: null,
    // **Neither strip**, and the third `"none"` this table has ever wanted.
    // A radar announces what is coming *down*; a balloon appears a row above
    // the ship and leaves upward, so a blip at the top of either screen would
    // be pointing at the one edge of the field it has not reached yet. Both
    // seats see the body itself from the frame it swells in, which is the
    // whole announcement it needs.
    radar: "none",
    blurb:
      "It appears out of nothing one row above the ship, swells there for a beat or two, then climbs — a row up and a lane across every beat, turning at the walls. Reach the top and it goes off, and the hull pays for it wherever the ship is standing. No shot touches it. Both of you take a handle — the pilot the one on its left, the navigator the one on its right — and pull at the same instant: the first time the skin gives it splits into two smaller ones, and the second pops them for nothing. The only thing left to say out loud is which one.",
  },
  gum: {
    kind: "gum",
    // `aim`, and it is the cannon this asks for rather than a shot: nothing
    // fired reaches it, but a swipe counts only while the cannon is standing
    // under it (`sim/gum.ts`), so a wave with one on it must show the rail
    // player 1 parks the cannon on. The swipe itself is a gesture on the body
    // and no panel's, the balloon's arrangement — which is why it is in this
    // family and not among the bodies the cannon answers.
    controls: ["aim"],
    // No colour, and none authored: no bolt reaches it in any colour, and a
    // colour here would be a promise the field refuses.
    color: null,
    // Player 1's strip: the seat that has to park the cannon under it is the
    // seat that cannot swipe, so the pair has to talk — where it is coming
    // down, and then which way it goes.
    radar: "p1",
    blurb:
      "A sticky mass that falls straight down one lane. No shot touches it and the shield does not stop it; it lands on the ship and sticks there, and the cannon cannot fire from any column it covers until it is gone. Player 1 parks the cannon under it and leaves it there; player 2 swipes it toward the nearer wall and it comes off. Swiped away from that wall it spreads a lane wider instead, and the hand has to lift before it can try again.",
  },
};
