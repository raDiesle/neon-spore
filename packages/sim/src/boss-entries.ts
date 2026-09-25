import type { MazeEntry, RepriseEntry, WellEntry } from "./boss-entries-b.js";
import type {
  BatonEntry,
  CurtainEntry,
  GorgeEntry,
  HaspEntry,
  LeadEntry,
  LedgerEntry,
  ScuttleEntry,
  SinewEntry,
  StareEntry,
  SurgeEntry,
  TasterEntry,
  ThroatEntry,
  UndertowEntry,
} from "./boss-entries-clocks.js";
import type {
  AntiphonEntry,
  HiveEntry,
  RatchetEntry,
  SpoolEntry,
} from "./boss-entries-clocks-b.js";
import type {
  FleetEntry,
  GaugeEntry,
  PinballEntry,
  PulseEntry,
  ScoutEntry,
  SnakeEntry,
  SpliceEntry,
} from "./boss-entries-round.js";
import type { FilamentEntry } from "./filament.js";
import type { GimbalEntry } from "./gimbal.js";
import type { InstarEntry } from "./instar.js";
import type { MirrorStep } from "./simon.js";

/**
 * **What a wave authors when it wants a boss that stands on the field** — and
 * the union of every boss there is, field, round and clock together. The
 * bosses that take the picture away are in `boss-entries-round.ts` and the
 * ones that are a beat count in `boss-entries-clocks.ts`, both re-exported
 * whole; the two questions anything asks about the union are next door in
 * `boss-kinds.ts`.
 *
 * Cut out of `entries.ts` when THE CRAWLER's two fields took that file over
 * its 250-line limit, and the seam is the one that file was always going to be
 * cut along: next door is what a wave hands the field a *body* on, and this is
 * what it hands the field a whole *encounter* on. Twelve of these against two
 * of those, and the twelve are the half that grows — every round in
 * `docs/spec/bosses.md` still to come is one more interface here.
 *
 * `entries.ts` re-exports every name below and both questions, so nothing
 * that already reaches for a `BossEntry` through that file had to move.
 */

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
 * What a wave authors when it wants THE CAIRN. No column: the pile stands dead
 * centre at `cairnRow`, and one placed off centre would have a long side and a
 * short one — so the two lanes a pull offers would be a different distance
 * from the shield's home depending on which way the hand went, which is the
 * one thing the choice must not be.
 *
 * Only how many rocks are stacked, which is how long the fight is — the
 * Warden's `plates` arrived at from the other end. There the number is damage
 * the ring can take; here it is the number of rocks the pair will have to ward
 * before it is over, and the two are the same sentence because the units *are*
 * the health: every one that leaves the pile leaves as a body the field still
 * has to answer.
 */
export interface CairnEntry {
  kind: "cairn";
  units?: number;
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

/** The boss counterpart of `PodEntry`: whichever boss a wave carries. */
export type BossEntry =
  | QueenEntry
  | MirrorEntry
  | WardenEntry
  | CairnEntry
  | VaneEntry
  | MazeEntry
  | GaugeEntry
  | FleetEntry
  | SnakeEntry
  | PinballEntry
  | PulseEntry
  | WellEntry
  | RepriseEntry
  | SpliceEntry
  | ScoutEntry
  | StareEntry
  | BatonEntry
  | ThroatEntry
  | UndertowEntry
  | GorgeEntry
  | CurtainEntry
  | TasterEntry
  | SinewEntry
  | LedgerEntry
  | SurgeEntry
  | LeadEntry
  | ScuttleEntry
  | AntiphonEntry
  | HiveEntry
  | SpoolEntry
  | HaspEntry
  | RatchetEntry
  // The one that authors a script: the beat list a scene is (`instar.ts`).
  | InstarEntry
  // The one that authors a line: the filaments a pair draws and follows (`filament.ts`).
  | FilamentEntry
  // The one that authors a turn: the alignments two rings are held on (`gimbal.ts`).
  | GimbalEntry;

// The three this page had no room left for, handed across on 22 September
// 2026 — the last rows it held, the way every overflowing page in the
// repository gives its end of the chain back (`boss-entries-b.ts`).
export type { MazeEntry, RepriseEntry, WellEntry } from "./boss-entries-b.js";
// The twenty-one that are a clock and author nothing, over two pages
// (`boss-entries-clocks.ts`, `boss-entries-clocks-b.ts`).
export type {
  BatonEntry,
  CurtainEntry,
  GorgeEntry,
  HaspEntry,
  LeadEntry,
  LedgerEntry,
  ScuttleEntry,
  SinewEntry,
  StareEntry,
  SurgeEntry,
  TasterEntry,
  ThroatEntry,
  UndertowEntry,
} from "./boss-entries-clocks.js";
export type {
  AntiphonEntry,
  HiveEntry,
  RatchetEntry,
  SpoolEntry,
} from "./boss-entries-clocks-b.js";
export type {
  FleetEntry,
  GaugeEntry,
  PinballEntry,
  PulseEntry,
  ScoutEntry,
  SnakeEntry,
  SpliceEntry,
} from "./boss-entries-round.js";
export type { FilamentEntry } from "./filament.js";
export type { GimbalEntry } from "./gimbal.js";
export type { InstarEntry } from "./instar.js";
