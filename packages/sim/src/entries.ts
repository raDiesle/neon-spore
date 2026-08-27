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

/** The boss counterpart of `PodEntry`: whichever boss a wave carries. */
export type BossEntry = QueenEntry | MirrorEntry | WardenEntry;

/**
 * The bosses that exist, as data. `tools/director` reads this to say which of
 * the twelve names in `docs/spec/bosses.md` are actually in the game — the
 * same question `CREATURES` answers for the bestiary, and one a tool must
 * never answer from a list of its own.
 */
export const BOSS_KINDS: readonly BossEntry["kind"][] = ["queen", "mirror", "warden"];
