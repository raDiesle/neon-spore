import type { GhostPath } from "./ghost.js";
import type { RockSize } from "./kinds.js";
import type { MazeWheel } from "./maze-wheel.js";
import type { MirrorStep } from "./simon.js";
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
}

/**
 * What a wave authors when it wants the queen. The sim turns it into one
 * creature of kind `"queen"` plus a filled `QueenState`.
 */
export interface QueenEntry {
  kind: "queen";
  /** The column she starts on. */
  col: number;
  /** Petals she starts with. */
  petals: number;
}

/**
 * What a wave authors when it wants THE MIRROR: the sequences, in order, one
 * per round. No column and no health — it stands over the ship wherever the
 * ship is, and how much of it a round takes off follows from how many rounds
 * there are (`mirror.ts`), so the author sets the fight by writing it out
 * rather than by tuning a number beside it.
 */
export interface MirrorEntry {
  kind: "mirror";
  rounds: MirrorStep[][];
}

/**
 * What a wave authors when it wants THE WARDEN. No column: it is a fixture,
 * dead centre, and a Warden placed anywhere else would be a Warden with a
 * short side. Only how many plates it wears, which is how long the fight is.
 */
export interface WardenEntry {
  kind: "warden";
  plates?: number;
}

/**
 * What a wave authors when it wants THE VANE. No column: the bearing hangs dead
 * centre off the top edge, and an arm on an off-centre pivot would have a long
 * side and a short one, so the fold would mean a different thing depending on
 * which half of the field a body came down in. Only how many pins hold the
 * bearing, which is how long the fight is.
 */
export interface VaneEntry {
  kind: "vane";
  pins?: number;
}

/**
 * What a wave authors when it wants THE MAZE: the wheels, in order, one per
 * round. No column and no health, for the same two reasons THE MIRROR has
 * neither — the mouths are spread across the field by `mazeMouthCol` rather
 * than placed, and how much of it a round takes off follows from how many
 * rounds there are (`maze-round.ts`). The author sets the fight by writing the
 * wheel out, and `mazeFault` says whether what they wrote is a round at all.
 */
export interface MazeEntry {
  kind: "maze";
  rounds: MazeWheel[];
}

/**
 * What a wave authors when it wants THE GAUGE, which is nothing at all.
 *
 * No column, no health and no rounds: the whole encounter is one dial, and how
 * long it lasts, how far the band walks and how many marks pass it are tuning
 * rather than content (`config-gauge.ts`). It is the shortest entry in this
 * file on purpose — the eleven rounds behind it are eleven more bosses, and
 * the point of the shape is that a round with nothing to author costs one line
 * here and one line in `waves.ts`.
 */
export interface GaugeEntry {
  kind: "gauge";
}

/** The boss counterpart of `PodEntry`: whichever boss a wave carries. */
export type BossEntry = QueenEntry | MirrorEntry | WardenEntry | VaneEntry | MazeEntry | GaugeEntry;

/**
 * Whether this boss *is* the wave, or only bends what the wave sends.
 *
 * All but one are the whole encounter and a creature placed beside one is
 * a wave nobody designed — THE GAUGE most of all, which does not draw a field
 * for a creature to stand on. THE VANE is the opposite — it spawns nothing at all,
 * and a wave without arrivals for it to throw is a mechanism turning over an
 * empty field. So the director's guard against a creature brush on a boss wave
 * asks this rather than `wave.boss !== undefined`, and there is one place the
 * answer lives.
 */
export function bossFillsWave(kind: BossEntry["kind"]): boolean {
  return kind !== "vane";
}

/**
 * The bosses that exist, as data. `tools/director` reads this to say which of
 * the twelve names in `docs/spec/bosses.md` are actually in the game — the
 * same question `CREATURES` answers for the bestiary, and one a tool must
 * never answer from a list of its own.
 */
export const BOSS_KINDS: readonly BossEntry["kind"][] = [
  "queen",
  "mirror",
  "warden",
  "vane",
  "maze",
  "gauge",
];
