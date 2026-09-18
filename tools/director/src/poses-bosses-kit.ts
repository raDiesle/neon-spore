import { buildBoss, buildPods, buildQueue, placedFaults, WAVES } from "@neon-spore/content";
import type { TimedCommand, World } from "@neon-spore/sim";
import { type BossKind, bossTitle } from "./boss-states.js";
import { fresh, POSE_CONFIG, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * **How a boss state is posed**: its own wave, run until the state arrives.
 *
 * Every pose in the BOSSES category is built the same way, and the rule that
 * makes the category worth having is `pose-kit.ts`'s: a pose never sets a
 * state field by hand, it runs the simulation until the phase comes, and
 * throws when it does not. A phase table that gains a name, a clock retuned
 * so a phase no longer arrives inside the budget, a wave that stops carrying
 * its boss — every one of those is `test/poses.test.ts` red rather than a
 * caption over the wrong picture.
 *
 * **The boss's own wave, not an arrangement of its parts.** `bossWorld`
 * stands the wave up the way the game does — its queue, its pods, its faults,
 * its boss, its index for the band — so the picture is the encounter and not
 * a boss over an empty field with the wrong controls under it. The hull is
 * invulnerable (`POSE_CONFIG`) so a wave that would end on a hit still holds
 * the frame.
 */

/** The wave that carries this boss, stood at beat 0 as the game starts it. */
export function bossWorld(kind: BossKind): World {
  const index = WAVES.findIndex((w) => w.boss?.kind === kind);
  if (index === -1) throw new Error(`no wave carries the ${kind}`);
  const cols = POSE_CONFIG.cols;
  return fresh(
    buildQueue(index, cols),
    buildPods(index, cols),
    buildBoss(index, cols),
    {},
    index,
    placedFaults(WAVES[index]?.faults),
  );
}

/** The phase or stage the boss stores, whichever a boss calls it, or undefined for one that stores neither. */
export function phaseOf(world: World): string | undefined {
  const b = world.boss as { phase?: unknown; stage?: unknown } | null;
  const p = b?.phase ?? b?.stage;
  return typeof p === "string" ? p : undefined;
}

/** What a boss pose may say beyond its state and its sentence. */
export interface BossPoseExtra {
  crop?: Pose["crop"];
  role?: Pose["role"];
  lookAt?: string;
  at?: Pose["at"];
  span?: number;
  /** Commands to send on the way — the pair's own answer, where a state needs one. */
  cmds?: TimedCommand[];
  /** The state's own arrival, where it is not the stored phase by that name. */
  want?: (world: World) => boolean;
  /** Ticks to run on after arriving, for a frame past the first flash of it. */
  hold?: number;
  /** The run's budget in beats, for a state further off than sixty. */
  budgetBeats?: number;
}

/**
 * A pose of one boss in one of its states: `THE STARE · LOOKING`. The name
 * is the title the sheet groups by and the state `BOSS_STATES` lists, so the
 * coverage test and the reader see the same words.
 */
export function bossPose(kind: BossKind, state: string, note: string, x: BossPoseExtra = {}): Pose {
  const want = x.want ?? ((w: World) => w.boss?.kind === kind && phaseOf(w) === state);
  return {
    name: `${bossTitle(kind)} · ${state.toUpperCase()}`,
    note,
    lookAt: x.lookAt,
    crop: x.crop ?? "field",
    role: x.role,
    at: x.at,
    span: x.span,
    boss: { kind, state },
    build: () => {
      const w = bossWorld(kind);
      runUntil(w, `${bossTitle(kind)} ${state}`, x.cmds ?? [], want, (x.budgetBeats ?? 60) * TPB);
      if (x.hold) run(w, x.hold);
      return w;
    },
  };
}
