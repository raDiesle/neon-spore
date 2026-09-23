import type { SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * THE RATCHET: a toothed rack down the middle of the field, in full view of
 * both seats, and **the one boss where a step, once taken, is never taken
 * back** (`docs/spec/bosses-choreographed.md` §22).
 *
 * **The rule is one sentence**: she holds the catch, he presses the pawl, and
 * every press climbs the rack one tooth — clean if she was holding, wasted if
 * she was not.
 *
 * The split is the hands and not the eyes: both screens show the whole rack,
 * and neither shows the other seat's hand. He cannot see whether she is
 * holding; she cannot see when he is about to press. `SET` is hers to say.
 *
 * **Its health is seven teeth**, and the rack needs five clean advances to
 * open the catch at its top. A press always spends a tooth and nothing gives
 * one back, so the two it can afford to lose are the fight's whole margin —
 * and the moment five clean advances are out of reach the rack jams, which is
 * a hull strike and the wave (`ratchet-step.ts`).
 *
 * **The gate is not a primitive.** It is one read of her hand on the tick his
 * press lands, in this boss's own hand file — HASP's finding, used again
 * (`ratchet-hand.ts`).
 *
 * **One ordinary hazard, once.** The second clean advance shakes a bolt loose
 * down the centre column, shot out in either colour inside
 * `ratchetBoltBeats`, or it reaches the hull (`ratchet-shot.ts`).
 *
 * **The wave authors nothing**, so THE RATCHET is one of the clocks that take
 * an entry with a `kind` and no data (`boss-entries-clocks-b.ts`).
 */

/** No hand on the catch, and the depth that says so. */
export const NO_CATCH = -1;
/** No bolt loose, and the column value that says so. */
export const NO_BOLT = -1;

/**
 * The teeth on the rack at the top of the fight — the health, and a figure of
 * the **silhouette** rather than a tuning, `HASP_COUNT`'s argument: the
 * picture draws seven teeth and a rack with eight would be a different boss.
 */
export const RATCHET_TEETH = 7;
/** Clean advances that open the top catch — the two teeth between are the margin. */
export const RATCHET_CLEAN = 5;

/**
 * Where the scene is: the rack hanging still, a pawl lit and waiting for a
 * press, the rack climbing one tooth, the top catch open, or the rack jammed.
 */
export const RATCHET_PHASES = ["still", "work", "climb", "open", "jam"] as const;
export type RatchetPhase = (typeof RATCHET_PHASES)[number];

export interface RatchetState {
  kind: "ratchet";
  phase: RatchetPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** Teeth not yet spent: `RATCHET_TEETH` down to nought. */
  teeth: number;
  /** Clean advances so far: nought up to `RATCHET_CLEAN`. */
  clean: number;
  /** How deep the navigator has the catch, `NO_CATCH` with her hand off. */
  catchMilli: number;
  /**
   * Whether the catch has just been spent by a clean advance and not yet
   * reset. A hand still down on a spent catch holds nothing: she has to lift
   * it, or draw it back above the grip, and set it again.
   */
  catchSpent: boolean;
  /** Whether the pilot's thumb is down on the pawl — so a press is an edge. */
  pawlDown: boolean;
  /** Whether the last tooth spent was a clean one — which climb the rack is in. */
  cleanLast: boolean;
  /** The column the loose bolt falls in, `NO_BOLT` while none is loose. */
  boltCol: number;
  /** `world.beat` the bolt came loose. */
  boltBeat: number;
}

export function ratchetBoss(world: World): RatchetState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "ratchet" ? boss : null;
}

/** Whether a press counts at all: the pawl is lit and a tooth is waiting. */
export function ratchetWorking(s: RatchetState): boolean {
  return s.phase === "work";
}

/**
 * **Whether the catch is set**, and the whole of the gate: a press while
 * this is true is a clean advance, and a press while it is not is a tooth
 * burned. A **level**, HASP's latch's reading — what the press asks is
 * whether her hand is down *now*.
 */
export function ratchetHeld(s: RatchetState, cfg: SimConfig): boolean {
  return s.catchMilli !== NO_CATCH && s.catchMilli >= cfg.ratchetGripMilli;
}

/**
 * Beats this tooth's window lasts before it is spent for nothing — twenty on
 * the first, and shorter for every tooth already gone, which is §22's tempo
 * tightening from one climb to the next.
 */
export function ratchetWindowBeats(s: RatchetState, cfg: SimConfig): number {
  const spent = Math.max(0, RATCHET_TEETH - s.teeth);
  return Math.max(1, cfg.ratchetWindowBeats - spent * cfg.ratchetWindowStepBeats);
}

/** Teeth the pair can still burn and open the rack — the margin, never shown as a number. */
export function ratchetMargin(s: RatchetState): number {
  return Math.max(0, s.teeth - (RATCHET_CLEAN - s.clean));
}

/** Whether a bolt is loose and there is something to shoot. */
export function ratchetLoose(s: RatchetState): boolean {
  return s.boltCol !== NO_BOLT;
}

/** The top catch has given, and nothing is left to press. */
export function ratchetOpen(s: RatchetState): boolean {
  return s.phase === "open";
}

/** Five clean advances are out of reach, and the rack has jammed. */
export function ratchetJammed(s: RatchetState): boolean {
  return s.phase === "jam";
}
