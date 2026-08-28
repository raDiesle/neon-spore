/** The two ammunition colours. Colour is bioluminescence, not decoration. */
export type Color = "red" | "cyan";

export type { RockKind } from "./kinds.js";
export {
  clampSpanCol,
  colSpan,
  fallTilesPerBeat,
  isBossBody,
  isGrippable,
  isMeteorKind,
  livingKindForColor,
  occupiesCol,
  spanCenterCol,
  WARDEN_COLS,
} from "./kinds.js";

export type CreatureKind =
  | "slick"
  | "bulb"
  | "meteor"
  | "meteorMedium"
  | "meteorFast"
  | "meteorFaster"
  | "meteorFastest"
  | "torch"
  | "queen"
  | "warden"
  | "tether"
  /**
   * Tiny and helpless, and carries no colour — a shot of either colour costs
   * points rather than earning them (`resolveRunt`, bullet-hit.ts). Reaching
   * the hull is not special-cased: it costs the hull exactly what any other
   * missed creature would, same as `damageCreature` for anything else.
   */
  | "runt"
  /**
   * Swells and shrinks on the shared beat instead of carrying a colour.
   * `throbOpen` on the `Creature` says whether this beat is one it can be hit
   * on — see `throbIsOpen` in `creature-rules.ts`, which is the only place
   * that cycle is decided.
   */
  | "throb"
  /**
   * Armoured, two columns wide, and wearing one piece of shell in front of
   * each. Any colour chips a piece off; the body underneath has no colour at
   * all until the last one goes, and then it has one neither player has ever
   * seen. `shell.ts` holds the arithmetic and `shell-round.ts` the two phases.
   */
  | "shell";

/**
 * What a pod gives when it is swallowed. Every pod is one of exactly these:
 * `mend` gives hull back, `purge` sweeps the field, `ward` holds the shield
 * armed without a trigger.
 */
export type PodKind = "mend" | "purge" | "ward";

export interface Creature {
  id: number;
  kind: CreatureKind;
  /** Column it occupies. The first two kinds never change lanes. */
  col: number;
  /** Row after the most recent beat. Row `hullRow` means it has reached the hull. */
  row: number;
  /** Row before the most recent beat, for interpolation in render/. */
  fromRow: number;
  /** null for meteors, which cannot be shot. */
  color: Color | null;
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

/** A broken segment of the hull. Damage is visible and stays visible. */
export interface Scar {
  col: number;
  /** Beat at which it was made, for the render fade-in. */
  beat: number;
  /** What hit here — a rock crater is only ever drawn for a rock kind. */
  kind: CreatureKind;
}

export interface GuardStats {
  /** Every meteor that reached the hull. The denominator of the HUD balance. */
  tries: number;
  /** Right column and right moment. */
  deflected: number;
  /** Right column, wrong moment — the interesting failure class. */
  mistimed: number;
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
   * This seat has read the briefing card that is up and is done with it. Both
   * seats have to send one before the card goes and the wave starts moving —
   * neither of them was shown the whole of it, so one player skipping ahead
   * skips a sentence the pair never finished (`briefing.ts`).
   *
   * Handled in `step` rather than in `applyCommand`, because while a card is
   * up nothing else reaches the ship at all.
   */
  | { kind: "brief" }
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
  | { kind: "restart" };

export interface TimedCommand {
  /** Simulation tick the command takes effect on. */
  tick: number;
  /** 1 = pilot, 2 = navigator. Kept for validation and statistics. */
  player: 1 | 2;
  command: Command;
}
