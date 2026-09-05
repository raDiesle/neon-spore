import type { CreatureKind } from "./creature-kinds.js";
import type { CreatureState } from "./creature-state.js";
import type { Color } from "./types.js";

/**
 * What a **body on the field** is made of.
 *
 * Split out of `types.ts` when THE RECOIL's own field took that file past its
 * 250-line limit for the fifth time, and along the seam that file had already
 * written down: it grows in exactly one place, and the place is this. Nearly
 * every kind added to the bestiary since THE DART has brought a field with it,
 * and four halves have been carried out of `types.ts` already —
 * `hull-types.ts`, `pod-types.ts`, `command-types.ts`, `bullet-types.ts` —
 * each of them the part that was *not* growing. This was the part that was,
 * and it was the last cut `types.ts` needed: what is left there is `Color` and
 * a barrel of re-exports, and neither has changed in a year.
 *
 * **Then it grew again, and it has been cut the same way.** The fields one
 * kind carries and no other does are `creature-state.ts` next door, and this
 * file keeps what a body *is* — an id, a kind, a column, a row, a colour, a
 * width, the craters on it. That list is closed; the other one has grown by a
 * field for nearly every creature since THE DART, and THE CAROM is where it
 * stopped fitting. `Creature extends CreatureState`, so nothing moved.
 *
 * `Color` comes back from `types.js`, which is a type-only cycle and the one
 * `bullet-types.ts` already stands in: the two colours are what the whole
 * simulation is written in terms of, so they stay at the door.
 *
 * Re-exported from `types.ts`, so nothing that already reaches for a
 * `Creature` through that file had to move.
 */
export interface Creature extends CreatureState {
  id: number;
  kind: CreatureKind;
  /** Column it occupies. Every kind but the dart holds the one it arrived in. */
  col: number;
  /** Row after the most recent beat. Row `hullRow` means it has reached the hull. */
  row: number;
  /** Row before the most recent beat, for interpolation in render/. */
  fromRow: number;
  /**
   * Column before the most recent beat, for the same interpolation — absent on
   * every kind that never changes lanes, which is every kind but the dart.
   *
   * Read through `drawnCol` (render/depth.ts) and nowhere else: absent means
   * "it is where it has always been", and a site that reached for the field
   * directly would slide every other body from column zero on its first beat.
   * Deliberately outside `hashWorld` for `fromRow`'s reason — where a body
   * came from is a fact about the picture, not about the world.
   */
  fromCol?: number;
  /** null for meteors, which cannot be shot. */
  color: Color | null;
  /**
   * Columns this body occupies, when that is not simply its kind's own width.
   * Absent on everything a wave does not size — which is everything but a
   * rock, whose arrival may be authored one tile wide or two (`RockSize`).
   *
   * Never read directly: `spanOf` is the rule, and it is in the fingerprint
   * below because two devices that disagree about how wide a rock is disagree
   * about which columns the shield has to cover.
   */
  span?: number;
  /** The kind a `lure` is drawn as, absent otherwise. Read it via `wornKind` —
   * the ternary by hand is how player 1 gets a tell (creature-rules.ts). */
  wears?: CreatureKind;
  /**
   * Craters left by shots. A meteor keeps its size and stays indestructible —
   * the holes are the only trace. render/ places crater `k` from the id.
   */
  holes: number;
  /** Petals left on a queen, 0 on every other kind. */
  petals: number;
  /**
   * Thousandths of a tile a grip has held back and not yet spent. Zero unless
   * a hand is on it — see `grippedFallTiles` in grip.ts, which is the only
   * thing that reads or writes it.
   */
  dragMilli: number;
  /**
   * Whether a `throb` can be hit this beat. False on every other kind. Set
   * once a beat, in `onBeat`, from `throbIsOpen` — never computed a second
   * time from `world.beat` at hit time, so render/ and bullet-hit.ts agree
   * about the same instant without either owning the cycle.
   */
  throbOpen: boolean;
  /**
   * Pieces of shell still on, one bit each, bit `k` for the piece in front of
   * column `col + k`. `NO_SHELL` on every other kind, and on a shell whose
   * last piece is off — which is exactly when `color` stops being null.
   *
   * A mask and not a count, because which of them is gone is what the pair has
   * to say out loud. Never read by hand: `shellHasPiece`, `shellPiecesLeft`
   * and `shellIsBare` in `shell.ts` are the rules, and purity.test.ts holds
   * everything else to calling them.
   */
  shell: number;
}

// The fields one kind carries and no other does — `dartDir` through
// `veerDir` — are `creature-state.ts` next door, cut out when THE CAROM took
// this file over its limit, with the four a *hand* writes cut out of that one
// in turn (`creature-state-held.ts`). `Creature` extends the lot, so every
// call site still reads `c.ghostLaps` and nothing had to move.
export type { CreatureState } from "./creature-state.js";
export type { HeldState } from "./creature-state-held.js";
