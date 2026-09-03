import { DEFAULT_CONFIG, ROCK_CYCLE } from "@neon-spore/sim";
import { BEAT_SECONDS } from "./types.js";

/**
 * The one clock the three whole-body BULB QUEEN VARIANTS run on.
 *
 * `holders-panel.ts` already insists on this for the torch-only cards — three
 * drafts letting go at three private moments is not a comparison — and a
 * whole body raises the same problem three times over, because it has three
 * things worth showing rather than one: which socket drops, which of the two
 * marks is real, and how many petals are left. Each is pulled straight off
 * the numbers the real boss uses (`ROCK_CYCLE`, `queenEggGrowShare`) so a
 * card is judged against her actual cadence, and each runs on its own period
 * so a viewer reads three independent facts rather than one clock in three
 * colours.
 */

/** Petals a demo cycle starts at — one slot per starting petal, same as `queen.ts`'s health bar. */
const DEMO_START_PETALS = 5;

/** Full health-loss cycles before she is shown healed again. */
const HEALTH_CYCLES = DEMO_START_PETALS;

/**
 * Cycles between one alternation of which mark is real, chosen against 2 (the
 * drop's own alternation) so the two tells are never in step — a variant
 * whose drop and whose weak side always change together would be teaching one
 * fact twice rather than two.
 */
const WEAK_SIDE_CYCLES = 3;

export interface QueenCycle {
  /** Seconds on the page clock, for anything free-running. */
  t: number;
  /** 0..1 through the current beat. */
  beatFrac: number;
  /** The socket that drops this `ROCK_CYCLE`. */
  releaseSide: -1 | 1;
  /** True on the one beat that socket lets go. */
  isReleaseBeat: boolean;
  /** 0 while held, 0 → 1 across the beat `releaseSide` lets go. */
  release: number;
  /** The socket growing its replacement back this beat, or 0 for neither. */
  regrowSide: -1 | 1 | 0;
  /** 0 → 1 across the regrow beat, floored above 0 so nothing draws at a literal zero radius. */
  regrowShare: number;
  /** Which of the two marks is the real one right now. */
  weakSide: -1 | 1;
  petals: number;
  startPetals: number;
  /** `petals / startPetals` — the fraction a variant sinks or hides by. */
  healthShare: number;
}

export function queenCycleAt(t: number): QueenCycle {
  const totalBeats = t / BEAT_SECONDS;
  const beatIndex = Math.floor(totalBeats);
  const beatFrac = totalBeats - beatIndex;
  const cycleIndex = Math.floor(beatIndex / ROCK_CYCLE);
  const beatInCycle = beatIndex - cycleIndex * ROCK_CYCLE;

  const sideOf = (n: number): -1 | 1 => (((n % 2) + 2) % 2 === 0 ? -1 : 1);
  const releaseSide = sideOf(cycleIndex);
  const isReleaseBeat = beatInCycle === ROCK_CYCLE - 1;
  const release = isReleaseBeat ? beatFrac : 0;

  // The regrow beat is the first beat of the *next* cycle, so the socket that
  // just let go is the one growing back — there is no beat in between where a
  // socket is drawn simply empty, because a beat is exactly how long the
  // release itself already takes.
  const isRegrowBeat = beatInCycle === 0 && cycleIndex > 0;
  const regrowSide: -1 | 1 | 0 = isRegrowBeat ? sideOf(cycleIndex - 1) : 0;
  const regrowShare = isRegrowBeat
    ? Math.max(0.02, Math.min(1, beatFrac / DEFAULT_CONFIG.queenEggGrowShare))
    : 1;

  const weakSide: -1 | 1 = sideOf(Math.floor(cycleIndex / WEAK_SIDE_CYCLES));

  // A step, not a slide: petals are a count and `queen.ts` never interpolates
  // one. She loses one per `ROCK_CYCLE` and heals whole on the wrap.
  const healthCycle = ((cycleIndex % HEALTH_CYCLES) + HEALTH_CYCLES) % HEALTH_CYCLES;
  const petals = DEMO_START_PETALS - healthCycle;

  return {
    t,
    beatFrac,
    releaseSide,
    isReleaseBeat,
    release,
    regrowSide,
    regrowShare,
    weakSide,
    petals,
    startPetals: DEMO_START_PETALS,
    healthShare: petals / DEMO_START_PETALS,
  };
}

/** How large a socket's rock is drawn this beat, 0..1. */
export function socketScale(cycle: QueenCycle, side: -1 | 1): number {
  if (cycle.regrowSide === side) return cycle.regrowShare;
  return 1;
}

/** How far a socket's rock has drifted clear of the body while letting go, 0..1. */
export function socketDrift(cycle: QueenCycle, side: -1 | 1): number {
  return cycle.releaseSide === side && cycle.isReleaseBeat ? cycle.release : 0;
}
