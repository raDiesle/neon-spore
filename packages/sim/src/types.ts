/** The two ammunition colours. Colour is bioluminescence, not decoration. */
export type Color = "red" | "cyan";

export type CreatureKind =
  | "slick"
  | "bulb"
  | "meteor"
  | "meteorMedium"
  | "meteorFast"
  | "meteorFaster"
  | "meteorFastest"
  | "torch"
  | "queen";

/**
 * The single source of the colour-to-silhouette pairing. `packages/content`
 * checks its own bestiary against this, and nothing may spell the mapping out
 * by hand a second time.
 */
export function livingKindForColor(color: Color): CreatureKind {
  if (color === "red") return "slick";
  return "bulb";
}

/**
 * The five numbered tiers, in speed order, one tile per beat apart. `torch` is
 * a rock too but is not a tier — see `fallTilesPerBeat`, which is why it is
 * not in this list.
 */
const METEOR_TIER_KINDS: readonly CreatureKind[] = [
  "meteor",
  "meteorMedium",
  "meteorFast",
  "meteorFaster",
  "meteorFastest",
];

/** Every rock: the five tiers plus the torch. */
const METEOR_KINDS: readonly CreatureKind[] = [...METEOR_TIER_KINDS, "torch"];

/**
 * The `CreatureKind` values `isMeteorKind` accepts, spelled out once so a
 * wave that names a rock kind (`packages/content/src/waves.ts`) can be typed
 * against exactly that set instead of the bare `CreatureKind` union, which
 * would let a wave author a living kind where only a rock belongs.
 */
export type RockKind =
  | "meteor"
  | "meteorMedium"
  | "meteorFast"
  | "meteorFaster"
  | "meteorFastest"
  | "torch";

/**
 * True for any rock — dead, indestructible, warded rather than shot. Call
 * this instead of writing `kind === "meteor"` by hand: that shape checks only
 * the original, slowest tier and silently drops every rock added since.
 */
export function isMeteorKind(kind: CreatureKind): boolean {
  return METEOR_KINDS.includes(kind);
}

/**
 * Tiles a creature falls each beat. Only the rock kinds ever differ from one
 * — five tiers, one tile per beat apart, `meteor` the original and slowest.
 *
 * `torch` is deliberately not appended to `METEOR_TIER_KINDS`: that would
 * silently make it tier six, one beat faster than intended, and drift the
 * next time a tier is added. It stays the fastest thing in the field instead,
 * by calling this function rather than repeating the number — `+ 2` is tuned
 * so it crosses the field (`hullRow` at the default `rows`) in three beats,
 * fast enough that the pair still has to call it, not so fast it is gone
 * before the trail behind it (`drawTorch`'s tail) reads as a fall at all.
 */
export function fallTilesPerBeat(kind: CreatureKind): number {
  if (kind === "torch") return fallTilesPerBeat("meteorFastest") + 2;
  const tier = METEOR_TIER_KINDS.indexOf(kind);
  return tier === -1 ? 1 : tier + 1;
}

/**
 * Columns wide a kind occupies. Every kind is one tile except the torch,
 * which is two — twice a plain rock's width.
 */
export function colSpan(kind: CreatureKind): number {
  return kind === "torch" ? 2 : 1;
}

/**
 * Whether a creature occupies the given column — true for every column its
 * span covers, not only `col` itself. Call this instead of `c.col === col`
 * wherever a column test decides a hit, a hull impact or a shield match: a
 * one-column comparison silently misses the torch's second column.
 *
 * `c.col` is always the *leftmost* column a creature occupies — a span wider
 * than one tile has no single integer column at its centre, so there is
 * nothing else `col` could consistently mean once a kind spans an even
 * number of tiles. See `spanCenterCol` for where the centre is needed.
 */
export function occupiesCol(c: Creature, col: number): boolean {
  return col >= c.col && col < c.col + colSpan(c.kind);
}

/** Clamp a spawn column so a wide creature's whole span stays on the field. */
export function clampSpanCol(col: number, cols: number, kind: CreatureKind): number {
  return Math.max(0, Math.min(cols - colSpan(kind), Math.round(col)));
}

/**
 * The tile column at a creature's visual centre, in tile units. Needed
 * anywhere a wide creature (only the torch, today) must be drawn or reported
 * as one thing rather than as its leftmost column — `col` itself is always
 * an integer, but a two-wide creature's centre sits half a tile past it.
 */
export function spanCenterCol(kind: CreatureKind, col: number): number {
  return col + (colSpan(kind) - 1) / 2;
}

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
}

export interface BossState {
  /** The id of the queen in `world.creatures`. */
  creatureId: number;
  /** 0-based phase index. */
  phase: number;
  /** The world beat the current phase started on. */
  phaseBeat: number;
  /** The column the announced bloom will open in, -1 when nothing is announced. */
  tellCol: number;
  /** The colour that bloom is vulnerable to. */
  tellColor: Color | null;
  /** The beat the announced bloom opens on, -1 for none. */
  openBeat: number;
  /** The first beat it is closed again, -1 for none. */
  closeBeat: number;
  /** Petals she started the fight with, so a drop in petals can be measured. */
  startPetals: number;
  /** The side her next scripted rock will emerge from: -1 left, 1 right, 0 none pending. */
  dropSide: -1 | 0 | 1;
  /** Integers owned by `boss.ts`. Nothing outside it reads them. */
  scratch: number[];
}

export interface Bullet {
  id: number;
  col: number;
  /** Tile row, counted from the hull upwards. Bullets sit on tile centres. */
  row: number;
  /** Progress towards the next tile, 0..999. Interpolation only. */
  subMilli: number;
  color: Color;
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
  | { kind: "restart" };

export interface TimedCommand {
  /** Simulation tick the command takes effect on. */
  tick: number;
  /** 1 = pilot, 2 = navigator. Kept for validation and statistics. */
  player: 1 | 2;
  command: Command;
}
