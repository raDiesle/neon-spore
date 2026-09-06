import type { CrawlerSide } from "./crawler.js";
import type { GhostPath } from "./ghost.js";
import type { RockSize } from "./span.js";
import type { Color, CreatureKind, PodKind } from "./types.js";

/**
 * What a wave hands the simulation. Every one of these is authored in
 * `packages/content` and translated once on the way in; the sim itself never
 * knows about waves, acts or the seven-column field they are written against.
 *
 * Their own file rather than fields of `world.ts`, because they are the
 * *input* to a world and not part of one — and because the boss entry is now a
 * union of two bosses that will keep growing.
 */

export interface SpawnEntry {
  beat: number;
  col: number;
  kind: CreatureKind;
  color: Color | null;
  /**
   * Which body a `lure` wears, and absent on every other kind. Authored by the
   * wave rather than rolled: random would be a second place where the trap is
   * decided, and a wave cannot be composed against a shape its author does not
   * know. See `Creature.wears`.
   */
  wears?: CreatureKind;
  /**
   * How many tiles wide this rock arrives, and absent on every other kind.
   * Two is a rock that fills a 2x2 square, which is the torch's geometry
   * offered to the plain tiers as a choice — see `RockSize`, which says why a
   * width is a number here rather than five more kinds.
   *
   * Named `span` and not `size` on purpose: the wave authors a `size`
   * (`WaveEntry.size`) and everything downstream of `queueFromWave` — this,
   * `Creature.span`, `Scar.span` — carries the same field under the same name,
   * so `spanOf` answers "how wide is this" for a queue entry, a body on the
   * field and the dent it leaves without any of the three needing its own
   * spelling of the fallback.
   */
  span?: RockSize;
  /**
   * How a `ghost` travels, and absent on every other kind. Absent on a ghost
   * too means `"down"` — it falls and holds its lane like any other body — so
   * every arrival written before crossing existed is byte-for-byte the same
   * world, exactly as an unsized rock is.
   *
   * Authored rather than rolled, for `wears`' reason: a wave cannot be
   * composed against a path its author does not know, and a ghost that might
   * or might not prowl is a wave whose whole shape is decided after it starts.
   */
  path?: GhostPath;
  /**
   * How many beads a `strand` arrives with, and absent on every other kind —
   * and on a strand the author left at the default, which is what
   * `strandBeadCount` answers. Two to five; the clamp is that function's and
   * is never re-derived here, because the field's own width has a say in it.
   *
   * Authored rather than rolled, for `wears`' reason: how long the order is
   * *is* how long the exchange is, and a wave cannot be composed against a
   * length its author does not know. What is rolled is which end of the thread
   * the order starts at, which is the half neither player may plan against
   * (`stringStrand`).
   */
  beads?: number;
  /**
   * How many segments a `crawler` arrives with between its two ends, and
   * absent on every other kind — and on a worm the author left at the default,
   * which is what `crawlerSegmentCount` answers. Two to seven; the clamp is
   * that function's and is never re-derived here.
   *
   * Authored rather than rolled, for `beads`' reason: how long the body is
   * *is* how many times the pair has to change control, and a wave cannot be
   * composed against a length its author does not know. Nothing about this
   * creature is rolled at all — the order along the body is a rule
   * (`segmentColor`) and the side is either authored or read off the column.
   */
  segments?: number;
  /**
   * Which wall a `crawler` comes over, and absent on every other kind. Absent
   * on a crawler too means *the wall the authored column is nearest*, so a
   * worm placed on the left of the director's map comes over the left edge and
   * a wave that names nothing still reads the way it looks
   * (`crawlerSide`).
   *
   * It is an override rather than the only way of saying it, because the two
   * facts can want to differ: the column is what the radar strip announces,
   * and a wave may want a worm called out on one side of the field and
   * entering over the other.
   */
  side?: CrawlerSide;
  /**
   * The columns THE FENCE is open in, on the real field, and absent on every
   * other kind. Never absent on a wall: `queueFromWave` writes the cell the
   * author painted it in as its first gap, so a wave that named none still
   * arrives with exactly one. An **empty list is a real answer** — a wall with
   * no way through at all — and it is answerable because such a wall always
   * carries a crack, authored or given to it by the same default (`cracksRed`
   * below): a wall nobody can pass and nobody can cut is a price with a
   * picture on it rather than a creature.
   *
   * A list here and a bitmask on the body (`Creature.fenceGaps`): the two
   * shapes answer two questions. An author names places, in the order they
   * were painted; the field asks *is this column open*, of one column, on
   * every beat — and `fenceMask` is the one crossing between them.
   *
   * Authored rather than rolled, for `wears`' reason with the most riding on
   * it of any of them: the way through **is** the sentence one player has to
   * say to the other, and a wave cannot be composed against a sentence its
   * author does not know.
   */
  gaps?: number[];
  /**
   * Where this wall's **cracks** are, one list per colour a cannon can load,
   * on the real field and already remapped (`queueFromWave`). A crack is the
   * only column a bolt opens and the colour is the only bolt that opens it
   * (`fence-crack.ts`).
   *
   * Two lists rather than one list of places-and-colours, and it is the shape
   * `gaps` already has said twice: an author names columns, the field asks
   * *what colour opens this one*, and `fenceCracksOnSpawn` is the one crossing
   * between them. Absent on every other kind, and absent on a wall the wave
   * gave no breaking point.
   */
  cracksRed?: number[];
  cracksCyan?: number[];
}

/**
 * Where a pod is left hanging. Its own queue rather than an entry in the spawn
 * queue: a pod is not a creature, it is never cleared, and a wave that ends
 * with one still hanging has still ended (docs/spec/systems.md 5.7).
 */
export interface PodEntry {
  beat: number;
  col: number;
  /** Row it hangs at, from the top. Never the hull row. */
  row: number;
  /** What the pod gives when swallowed. A wave that does not say means `mend`. */
  kind?: PodKind;
  /**
   * Which way it crosses the field, and absent for a pod that hangs where it
   * was left — which is every pod authored before THE CLAW.
   *
   * A crossing pod enters at the edge it is authored in and travels its row
   * until it leaves the far side, so it is a *window* rather than a place: the
   * pair has as long as it takes to cross, and a pod that got away is a missed
   * gift rather than a punishment, exactly as one that breaks on the skin is.
   */
  cross?: -1 | 1;
  /**
   * How fast it crosses, in tiles per beat. Absent means
   * `cfg.podCrossTilesPerBeat`, and it is meaningless on a pod that does not
   * cross. Authored rather than rolled for `wears`' reason: how long the pair
   * has is the whole of the difficulty, and a wave cannot be composed against
   * a speed its author does not know.
   */
  speed?: number;
}

// **What a wave authors when it wants a boss** is `boss-entries.ts` next door,
// cut out when THE CRAWLER's two fields took this file over its limit: nine
// shapes, the union of them, and `bossFillsWave`. Re-exported here so nothing
// that already reached for one through this file had to move.
export {
  BOSS_KINDS,
  type BossEntry,
  bossFillsWave,
  type FleetEntry,
  type GaugeEntry,
  type MazeEntry,
  type MirrorEntry,
  type PinballEntry,
  type QueenEntry,
  type SnakeEntry,
  type VaneEntry,
  type WardenEntry,
} from "./boss-entries.js";
