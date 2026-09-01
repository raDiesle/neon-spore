import type { CreatureKind } from "./creature-kinds.js";
import type { DartDir } from "./dart.js";

/** The two ammunition colours. Colour is bioluminescence, not decoration. */
export type Color = "red" | "cyan";

export { CREATURE_KINDS, type CreatureKind, kindCode } from "./creature-kinds.js";
export type { GuardStats, Scar } from "./hull-types.js";
export type { RockKind } from "./kinds.js";
export {
  bodyCenterCol,
  clampSpanCol,
  colSpan,
  fallTilesPerBeat,
  isBossBody,
  isGrippable,
  isMeteorKind,
  livingKindForColor,
  METEOR_TIER_KINDS,
  occupiesCol,
  type RockSize,
  spanCenterCol,
  spanOf,
  WARDEN_COLS,
} from "./kinds.js";

/**
 * What a pod gives when it is swallowed. Every pod is one of exactly these:
 * `mend` gives hull back, `purge` sweeps the field, `ward` holds the shield
 * armed without a trigger.
 */
export type PodKind = "mend" | "purge" | "ward";

export interface Creature {
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
  /**
   * The dart's three fields, and `dart.ts` is the whole of what they mean.
   * `dartDir` is the side it is concerned with now (`-1` left, `1` right),
   * `dartNext` the side of the move after that — rolled a beat early, which is
   * what lets a path be previewed while the body is still in the air — and
   * `dartFloat` says which beat of the two it is on: true while it hangs.
   *
   * Read the two sides through `dartHeading` and `dartNextHeading`, never
   * directly: the lean, the jet, the arrow and the previewed legs are five
   * pictures of two numbers, and a second copy of the fallback is how they
   * come to disagree.
   */
  dartDir?: DartDir;
  dartFloat?: boolean;
  dartNext?: DartDir;
}

export interface Bullet {
  id: number;
  col: number;
  /** Tile row, counted from the hull upwards. Bullets sit on tile centres. */
  row: number;
  /** Progress towards the next tile, 0..999. Interpolation only. */
  subMilli: number;
  color: Color;
  /**
   * True for a shot that left a full lobe — THE LANCE. It travels at
   * `lanceTilesPerBeat` instead of `bulletTilesPerBeat` and passes through
   * bodies of its own colour rather than stopping at the first one. Decided
   * once, when the shot leaves: a charge that fills while the shot is in the
   * air arms the *next* one (`lance.ts`).
   */
  lance: boolean;
  /** Bodies this shot has already gone through. 0 for everything but a lance. */
  pierced: number;
}

/**
 * A supply pod. It is not a creature: it does not live, does not travel of its
 * own accord and is never a target that must be cleared. It hangs where it was
 * left until a shot knocks it loose, and then falls like a burning wreck —
 * which is the only reason its position is not a plain row and column.
 *
 * Both coordinates are in thousandths of a tile, counted the way the grid is:
 * `colMilli` from the left edge, `rowMilli` down from the top.
 */
export interface Pod {
  id: number;
  colMilli: number;
  rowMilli: number;
  /**
   * Sideways travel per tick, in thousandths, signed. Zero while it is moored;
   * drawn from the seeded rng the moment a shot frees it, because which way a
   * wreck falls away is the one thing neither player may know in advance
   * (docs/spec/structure.md).
   */
  driftMilli: number;
  /** False while it hangs, true once it is falling. */
  loose: boolean;
  /** What it gives when it is swallowed. Authored, never random. */
  kind: PodKind;
}

/** Player commands. One flat list, so a replay is just a list of these. */
export type Command =
  | { kind: "cannonCol"; col: number }
  | { kind: "shieldCol"; col: number }
  | { kind: "fire"; color: Color }
  | { kind: "guard" }
  | { kind: "intake" }
  /**
   * A hand on something falling, or `NO_GRIP` for the hand lifted again.
   * Either player may send it — it is the one command that is not half of the
   * split. The id is safe to name across the wire because ids are dealt out
   * by the simulation, so both devices already agree about which creature is
   * which (see `setGrip` in grip.ts for what happens when it is stale).
   */
  | { kind: "grip"; id: number }
  /**
   * Player 1's thumb on the lance, down (`on`) and up again. The hold is the
   * whole of it: the lobe fills for as long as the thumb stays and the cannon
   * stands still, and nothing in the simulation keeps it filled once the
   * thumb lifts (`lance.ts`).
   */
  | { kind: "prime"; on: boolean }
  /**
   * This seat's thumb on the wave's opening. Both seats have to be done before
   * the wave moves — neither was shown the whole guide (`briefing.ts`).
   * `on` is the hold, the contract `prime` and `valve` have: at the ready gate
   * ending a guide the circle fills while the thumb is down and empties if it
   * lifts early. It is **optional**: a command without it is a plain press —
   * all the introduction needed, and what a caller with no thumbs sends (its
   * timer in `waves.ts`, the director's loop, a replay).
   */
  | { kind: "brief"; on?: boolean }
  /**
   * THE GAUGE's own controls, and the reason they are here rather than
   * reusing the ship's: a round that is not the field has its own verbs, and a
   * pair told to "fire" at a dial would be learning that the words mean
   * whatever the screen currently needs (`docs/spec/interludes.md`).
   *
   * `valve` is player 1's, held rather than pressed — `dir` is which way it
   * pushes and `on` ends it, the same contract `prime` has. `call` is player
   * 2's, and it is the only thing in THE GAUGE that can be wrong. Which seat
   * may send which is checked in `gauge.ts`, not here: the command is what was
   * pressed, and whose press counts is the round's rule.
   */
  | { kind: "valve"; on: boolean; dir: -1 | 1 }
  | { kind: "call" }
  /**
   * A hand that grabbed something and moved: the second gesture, beside the
   * press-and-hold that only slows a fall (`grip.ts`). `on` is the hold, the
   * contract `prime` and `valve` have — true for the grab and every move after
   * it, false for the lift.
   *
   * **An absolute control names a place, a draggable control names a
   * displacement, both in simulation units, never pixels.** `cannonCol` is the
   * first kind: the finger's x is a column and where the press began does not
   * matter. A string is the second: what turns a wheel is how far the hand has
   * come from where it grabbed, so `fromMilli` is that distance in
   * **thousandths of a tile** — two phones of different widths share no pixel
   * and do share a tile. The origin never crosses at all, being resolved on the
   * device whose finger it is (`touchDown`, `packages/render/src/touch.ts`).
   *
   * **Cumulative from the grab, never an increment since the last one.** A move
   * coalesced away or lost has to heal itself, and only a distance from a fixed
   * origin does: the next supersedes it and says the same thing. An increment
   * that never arrived is gone for good and leaves the wheel a step out of true
   * — the same property that makes `cannonCol` send a column and not "one to the
   * left". `target` names the element, and the rounds to come add to that list.
   */
  | { kind: "drag"; target: DragTarget; on: boolean; fromMilli: number }
  | { kind: "restart" };

/** The draggable elements: one name per thing a hand may take hold of. A closed
 * list rather than a creature id, because THE MAZE's string is not a creature —
 * a drag that could only name one could not reach the first thing that wanted
 * it, and THE WARDEN's rope is one that is. */
export type DragTarget = "mazeString" | "wardenTether";

export interface TimedCommand {
  /** Simulation tick the command takes effect on. */
  tick: number;
  /** 1 = pilot, 2 = navigator. Kept for validation and statistics. */
  player: 1 | 2;
  command: Command;
}
