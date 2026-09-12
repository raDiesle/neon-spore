import type { CreatureKind } from "./creature-kinds.js";
import { isBossBody } from "./kinds.js";

/**
 * **Whether a hand may be put on a body at all**, and the fourteen refusals
 * that answer it.
 *
 * Cut out of `kinds.ts` when THE FENCE took that file over its 250-line limit,
 * and the seam is the one that file's own header draws: everything left there
 * answers a question about a *kind* in one or two lines — which colour, how
 * fast, how many tiles — and this one answers a question about a *gesture*,
 * in a paragraph per body. Nine tenths of the length was the argument, and the
 * argument is the thing: every kind here is refused for a reason somebody had
 * to work out, and the list is where the next creature's author reads them.
 *
 * `isBossBody` comes back from `kinds.js`, which is a cycle only in the file
 * graph: nothing here runs at module load, so by the time either function is
 * called both modules are whole. `types.ts` re-exports `isGrippable` the way it
 * always did, so nothing that reaches for it had to move.
 */

/**
 * Whether a hand may be put on this kind at all — meaning the grip, which is
 * only ever a brake on a fall (`grip.ts`).
 *
 * The tether is refused for the queen's own reason: it does not fall, so a hand
 * on it would drag at nothing while showing every sign of working. It is still
 * the one thing in the game a hand is the only answer to — it is *dragged*
 * rather than held now, by its handle, and that is a different verb with its
 * own hit test (`render/src/tether.ts`).
 *
 * The dart is refused for the same reason arrived at from the other side. It
 * *does* come down the field, but not by falling: `stepDart` moves it two rows
 * on the beats it moves and none on the beats it hangs, and it never goes near
 * `grippedFallTiles`. A brake scales a rate, and a dart has no rate to scale —
 * a hand on one would be the tether's defect wearing a body that visibly
 * travels, which is worse.
 *
 * The wisp is refused for all three reasons at once, and for a fourth that is
 * the whole creature: player 1 cannot see one, so a hand could only ever be
 * put on it by the seat that already knows where it is — which is a way of
 * marking the tile for the other player without saying anything, and saying it
 * out loud is the game.
 *
 * THE GYRE is refused on both halves, and it is the dart's refusal twice over:
 * a hub walks a diamond and a mount is carried around a rim, so neither has a
 * rate for a brake to scale. The pair's answer to a wheel is the maw, which
 * slows the *turn* and is the coupling the creature was built around
 * (`gyreSucked`).
 *
 * THE CAROM is refused for the dart's reason exactly: it crosses the field on
 * a diagonal rather than falling, so there is no rate for a brake to scale.
 * The rock it becomes is grippable again the instant the crust comes off, and
 * that is the creature rather than an inconsistency — a hand is worth nothing
 * against the half of it the cannon answers and buys the shield a beat against
 * the half it does not.
 *
 * THE CHUTE is refused for the third time on the same grounds, and it is the
 * one that most looks like it wants a hand: a body drifting down under a
 * canopy is exactly what a thumb reaches for. But it does not *fall* — it
 * takes a whole row on the beats `chuteFalls` names and none at all on the
 * others — so there is no rate for a brake to scale, and a hand on one would
 * drag at nothing while showing every sign of working. That is the tether's
 * defect wearing the most inviting body in the game, which is worse.
 *
 * A list rather than a chain of `!==`, now that there are eight of them: a
 * chain that long is one somebody extends by pattern rather than by argument.
 */
// THE VOLLEY is refused for THE CAROM's reason exactly: it crosses on a
// diagonal and climbs on a ward rather than falling, so `stepVolley` never
// goes near `grippedFallTiles` and there is no rate for a brake to scale. The
// body that comes out of the shell is grippable again the instant it is a
// slick or a bulb, which is the creature rather than an inconsistency — a hand
// is worth nothing against the half the shield answers and buys the cannon a
// beat against the half it does not.
const UNGRIPPABLE: readonly CreatureKind[] = [
  "tether",
  "dart",
  "wisp",
  "gyre",
  "mount",
  "carom",
  // And THE CRYSTAL, for the carom's reason with nothing left over: it
  // crosses on the same diagonal and never goes near `grippedFallTiles`.
  "crystal",
  // And THE GUM, which falls and could be slowed — but nothing can be done to
  // it in the air, so a brake would show every sign of working and buy
  // nothing. What answers it is a hand *after* it lands (`gum.ts`).
  "gum",
  // And THE CHOKE, for the gum's reason: nothing can be done to it in the
  // air, and what answers it is a thumb on the strip after it has the cannon
  // (`choke.ts`).
  "choke",
  // And the two clingers, for the same reason (`cling.ts`).
  "limpet",
  "leech",
  "chute",
  "volley",
  // And a bead, for a reason of its own: a thread is several bodies falling
  // level with each other, and a hand on one of them would slow that one while
  // its neighbours went on — a picture of a string stretching, drawn over a
  // world in which nothing is joined at all.
  "strand",
  // And a link of a worm, for the dart's reason with nothing left over: a
  // crawler does not fall in any degree — it holds one row and walks along it
  // — so a brake has no rate to scale and a hand on one would drag at nothing
  // while showing every sign of working.
  "crawler",
  // And THE FENCE, which is the tether's refusal wearing the one body a hand
  // would most obviously reach for. It falls, and fast, so there *is* a rate
  // for a brake to scale — but it is the width of the field, so a hand on it
  // has no column to be on, and either player could put one anywhere and slow
  // the whole wall. That is a way of buying the seconds this creature exists
  // to take away, and it would be bought by the seat that already knows where
  // the gaps are.
  "fence",
  // And THE GHOST, which is the one name on this list that arrived by
  // subtraction rather than by argument. A falling ghost *does* fall, so a
  // brake had a rate to scale and it was gripped for that alone — but a hand
  // is only a brake on a rock now (`hand.ts`), and the other thing a hand can
  // be is an aim, which is the one gesture this creature must never allow: its
  // column is the secret and player 1 is the seat kept from it, so a shot that
  // found one without being told which lane it was in would be the whole
  // creature undone (`lock.ts` refused it for exactly that). Brake gone and
  // aim refused, there is nothing left for a hand to do, and a hand that does
  // nothing is refused rather than accepted. A crossing ghost was already
  // refused one body at a time in `grip.ts`; both are refused here now, by
  // kind, and the special case went with them.
  "ghost",
  // And THE COIL, for THE CAROM's reason with nothing left over: it crosses the
  // field and sinks only at the walls, so `stepCoil` never goes near
  // `grippedFallTiles` and there is no rate for a brake to scale. The torch it
  // becomes is grippable again the instant the dome is off, which is the
  // creature rather than an inconsistency — a hand is worth nothing against
  // the half the ward answers and buys a beat against the half it does not.
  "coil",
  // And THE BEATBOX, which is THE GHOST's refusal arrived at from the other
  // side. A box falls, so a brake would have a rate to scale — but the field
  // already has a press on this body that means something, and it means it for
  // player 2 (`beatboxTapped`). A hand that also meant *slow it down* would be
  // one gesture answering two rules on one body, and a thumb that rested a
  // fraction too long would silently become the other one. So the tap is the
  // only thing a finger on a box does, and a hand is refused rather than
  // quietly overloaded.
  "beatbox",
  // And THE BALLOON, for THE CHUTE's reason arrived at from the other end: it
  // does not fall, it climbs, so `stepBalloon` never goes near
  // `grippedFallTiles` and a brake has no rate to scale. It is also the one
  // body a hand is *already* the answer to — two of them, one per seat, on
  // handles of its own (`balloon-pull.ts`) — so a grip here would be a third
  // hand doing nothing on a body covered in hands that do.
  "balloon",
];

export function isGrippable(kind: CreatureKind): boolean {
  return !isBossBody(kind) && !UNGRIPPABLE.includes(kind);
}
