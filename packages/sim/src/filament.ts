import type { SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * THE FILAMENT: a body over the field made of loose filaments, the way a
 * nerve is a bundle, and **the one boss whose question is whether you can
 * follow a line the other of you is still drawing**
 * (`docs/spec/bosses-choreographed.md` §17).
 *
 * Every trace mechanic elsewhere is one finger on a fixed glowing path, which
 * is a dexterity test and not a conversation. Here the path is not fixed. A
 * filament hangs down the field as a line of tiles nobody can see whole: the
 * pilot **draws** it, his thumb carried from the free end toward the root a
 * tile a beat, lighting the tiles it has passed and no others; the navigator
 * **follows**, her thumb on the lit part behind his, never further behind
 * than `filamentGapTiles` and never on his tile. She has the distance behind
 * her and he has the distance ahead, and neither has both — the gap is the
 * sentence this boss exists to make them say.
 *
 * **Its health is the filaments.** Each one traced end to end is a filament
 * pulled out and gone, and the body narrows as they go; no bar, and the
 * seventh is the width of the whole body. Three things undo a filament and
 * start it again from its free end: the pilot carrying faster than a tile a
 * beat **snaps** it; the navigator's thumb reaching his is the two thumbs
 * colliding and the filament **recoils**; a gap opened past the window is
 * the filament going **dark** — the slip THE INSTAR already has
 * (`filament-hand.ts`, `filament-step.ts`). Each is a strike on the hull too.
 *
 * **Both thumbs are one `drag` at the `filament` target** — `TraceDrag`, the
 * fourth gesture primitive on that page and the only one that is a boss
 * rather than a convenience. A drag carries a displacement from where the
 * hand grabbed, in thousandths of a tile, and what makes this a *trace* is
 * that the grab is at a tile the simulation already knows — the head for
 * the pilot, the tail for the navigator — so every move resolves to a tile
 * of the field, and the tile either is the next one on the filament or is
 * nothing. The path lit so far is the state, hashed whole (`filament-hash.ts`).
 *
 * **Every fault strikes the hull**, and so is the wave — the owner, 25
 * September 2026, answering the one figure the design left him: *when any
 * player failed, then wave is over and must be repeated.* A snap, a recoil,
 * a line gone dark, and a line left standing past its clock
 * (`filament-turn.ts`) are each one strike (`filament-step.ts`).
 */

/** One tile of the field, the unit a filament is made of. */
export interface FilamentTile {
  col: number;
  row: number;
}

/**
 * A filament as a wave authors it: the free end, and the steps from there to
 * the root — `U`, `D`, `L`, `R` a tile each — so a path is a word rather than
 * a list, and a path a hand could not follow (a step off the field, a tile
 * visited twice) fails `content/test` rather than the pair.
 */
export interface FilamentPath {
  col: number;
  row: number;
  moves: string;
}

/** What a wave authors: the filaments, free end first, and nothing else. */
export interface FilamentEntry {
  kind: "filament";
  filaments: readonly FilamentPath[];
}

/** Where the scene is: a filament lit at its free end and waiting for the
 * thumbs, the thumbs on it, a filament pulled out and the body narrowing, or
 * beaten. */
export const FILAMENT_PHASES = ["arm", "trace", "pull", "down"] as const;
export type FilamentPhase = (typeof FILAMENT_PHASES)[number];

export interface FilamentState {
  kind: "filament";
  /** Every filament's tiles, free end first, expanded from the wave's words
   * at install and never written to again (`scout-hash.ts`'s reason). */
  tiles: FilamentTile[][];
  /** Which filament is armed; `tiles.length` once the last is out. */
  cursor: number;
  phase: FilamentPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The pilot's index along the filament: tiles `0..head` are lit. */
  head: number;
  /** The navigator's index along the lit part, never past `head`. */
  tail: number;
  /** `world.beat` the head last advanced — `NOT_DRAWN` since the arm — so a
   * second tile in the same beat is the snap. */
  headBeat: number;
  /** `world.beat` the line last moved — either thumb, or the trace beginning —
   * from which its clock runs (`filament-turn.ts`). */
  stillBeat: number;
  /** The index each thumb grabbed at, `NO_GRAB` while it is off: player 1's
   * then player 2's. A move is a displacement from that tile. */
  grab: [number, number];
}

export const NOT_DRAWN = -1;
export const NO_GRAB = -1;

export function filamentBoss(world: World): FilamentState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "filament" ? boss : null;
}

/** The filament the scene is on, or null once every one is out. */
export function filamentTiles(s: FilamentState): FilamentTile[] | null {
  return s.tiles[s.cursor] ?? null;
}

/** Whether the thumbs count: the filament is armed and neither out nor dark. */
export function filamentTracing(s: FilamentState): boolean {
  return s.phase === "trace";
}

export function filamentDown(s: FilamentState): boolean {
  return s.phase === "down";
}

/** How many filaments are left in the body, the one health it has. */
export function filamentsLeft(s: FilamentState): number {
  return Math.max(0, s.tiles.length - s.cursor);
}

/** How far the navigator is behind the pilot, in tiles. */
export function filamentGap(s: FilamentState): number {
  return s.head - s.tail;
}

/** The tile at index `i` of the armed filament, or null off its ends. */
export function filamentTileAt(s: FilamentState, i: number): FilamentTile | null {
  return filamentTiles(s)?.[i] ?? null;
}

/** The index of `tile` on the armed filament, or `-1` when it is not on it. */
export function filamentIndexOf(s: FilamentState, tile: FilamentTile): number {
  const tiles = filamentTiles(s);
  if (tiles === null) return -1;
  for (let i = 0; i < tiles.length; i++) {
    const t = tiles[i];
    if (t !== undefined && t.col === tile.col && t.row === tile.row) return i;
  }
  return -1;
}

/** The column a filament's free end hangs in, for the events and the sounds. */
export function filamentCol(cfg: SimConfig, tiles: readonly FilamentTile[]): number {
  const end = tiles[0];
  return end === undefined ? 0 : Math.max(0, Math.min(cfg.cols - 1, end.col));
}

/**
 * A wave's word for a filament, walked into tiles. A letter that is not one
 * of the four is a step nowhere, which the content test refuses before a
 * wave ships it; here it simply does not move.
 */
export function walkFilament(path: FilamentPath): FilamentTile[] {
  const out: FilamentTile[] = [{ col: path.col, row: path.row }];
  let col = path.col;
  let row = path.row;
  for (const step of path.moves) {
    if (step === "U") row -= 1;
    else if (step === "D") row += 1;
    else if (step === "L") col -= 1;
    else if (step === "R") col += 1;
    else continue;
    out.push({ col, row });
  }
  return out;
}

/**
 * Whether a walked filament is one a hand can follow on this field: every
 * tile on it, no tile twice, and at least two tiles — a filament with one
 * tile has no line to draw.
 */
export function filamentWalkable(cfg: SimConfig, tiles: readonly FilamentTile[]): boolean {
  if (tiles.length < 2) return false;
  const seen = new Set<number>();
  for (const t of tiles) {
    if (t.col < 0 || t.col >= cfg.cols || t.row < 0 || t.row >= cfg.rows) return false;
    const key = t.row * cfg.cols + t.col;
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}
