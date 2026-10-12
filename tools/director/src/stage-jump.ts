import { ackBriefing, bossScript, slowing, ticksPerBeat, type World } from "@neon-spore/sim";

/**
 * **A jump to any step of a boss's choreography** (`docs/spec/living-bosses.md`
 * §3): ◀ and ▶ beside the step readout, and a list of every step by number and
 * pose name. The world is rebuilt and replayed headless with AUTO on both
 * seats until the boss's `cursor` arrives on the step asked for, and on past
 * whatever the boss plays before it wants anything — a leap, a crawl, a
 * morph — to the tick the step **asks the pair** (THE SLOW opened as an ask,
 * `sim/slow.ts`). The owner, 12 October 2026, on THE LAMPREY: *skip also
 * animations of boss between the players need to take action*. A step that
 * never asks is landed on the tick it was reached, as before. The stage plays
 * on from there: ▶ is a way to the next step, not to a still of it.
 *
 * **Remembered.** Every step a replay passes is written down with the tick it
 * first asked on — or, for a step seen out without asking, the tick it was
 * reached — so a later jump to it replays straight to that tick and watches
 * no cursor. `forget` drops the lot; the stage calls it from its
 * own `rebuild`, which is what a restart, a wave change and an edit all go
 * through, and the jump rebuilds through `restage`, which forgets nothing.
 *
 * **Bounded.** A replay stops when the wave does, or after `JUMP_CAP_BEATS`
 * of a wave that never ends — a boss AUTO has no hand for, whose cursor never
 * moves. It then stands on the furthest step it reached, paused, and says so.
 *
 * Nothing here reads the DOM: the pieces arrive as calls, the way
 * `stage-step.ts` takes its own, so `bun test` drives it on a real world.
 */
export interface StageJumpParts {
  world(): World;
  /** A fresh world, the way the stage stands one up, without forgetting. */
  restage(): void;
  /** One tick with AUTO's commands in it. */
  stepOnce(): void;
  /** Put AUTO on both seats for the replay, and back on what it was after. */
  autoBoth(): () => void;
  /** The stage runs on from where the jump left it, or is held there. */
  land(running: boolean): void;
}

export interface JumpResult {
  /** The step asked for, counting from 0. */
  asked: number;
  /** The step the world stands on; below `asked` when it was out of reach. */
  reached: number;
  /** Ticks stepped in this replay. */
  ticks: number;
}

export interface StageJump {
  /** To step `step`, counting from 0; null on a wave with no script. */
  to(step: number): JumpResult | null;
  /** The step before and the step after the one that is up. */
  back(): JumpResult | null;
  forward(): JumpResult | null;
  /** The tick a jump to each step lands on — its first ask, else the tick it
   * was first reached — as far as anything has looked. */
  remembered(): ReadonlyMap<number, number>;
  forget(): void;
}

/** How long a replay watches a wave that never ends, in beats. */
export const JUMP_CAP_BEATS = 4000;

const ended = (w: World): boolean => w.over || w.restBeat !== 0;

/** Whether the pair is being asked for something this tick. */
const asking = (w: World): boolean => slowing(w) && w.slowAsks;

export function stageJump(parts: StageJumpParts): StageJump {
  /** The tick each step was first reached on, and first asked on. */
  const reachedAt = new Map<number, number>();
  const askedAt = new Map<number, number>();
  /** Steps seen out from first tick to last without asking. */
  const quiet = new Set<number>();

  const note = (w: World): number | null => {
    const s = bossScript(w);
    if (s === null) return null;
    if (!reachedAt.has(s.at)) reachedAt.set(s.at, w.tick);
    if (!askedAt.has(s.at) && asking(w)) askedAt.set(s.at, w.tick);
    // The step before is over; if it never asked, it never will.
    const before = s.at - 1;
    if (reachedAt.has(before) && !askedAt.has(before)) quiet.add(before);
    return s.at;
  };

  const tick = (): void => {
    const w = parts.world();
    // Both seats are done with any card at once, as SEEK does (`stage-step.ts`).
    ackBriefing(w, 1);
    ackBriefing(w, 2);
    parts.stepOnce();
    note(parts.world());
  };

  /** Steps from a fresh world to `until`; the ticks stepped. */
  const replayTo = (until: number): number => {
    parts.restage();
    note(parts.world());
    let ticks = 0;
    while (parts.world().tick < until && !ended(parts.world())) {
      tick();
      ticks++;
    }
    return ticks;
  };

  const known = (step: number): number | undefined =>
    askedAt.get(step) ?? (quiet.has(step) ? reachedAt.get(step) : undefined);

  const to = (asked: number): JumpResult | null => {
    const script = bossScript(parts.world());
    if (script === null) return null;
    const target = Math.max(0, Math.min(asked, script.of - 1));
    const restore = parts.autoBoth();
    const remembered = known(target);
    let ticks = 0;
    let at: number;
    if (remembered !== undefined) {
      ticks = replayTo(remembered);
      at = bossScript(parts.world())?.at ?? -1;
    } else {
      parts.restage();
      at = note(parts.world()) ?? -1;
      const cap = JUMP_CAP_BEATS * ticksPerBeat(parts.world().cfg);
      while (at <= target && ticks < cap && !ended(parts.world())) {
        if (at === target && asking(parts.world())) break;
        tick();
        ticks++;
        at = bossScript(parts.world())?.at ?? at;
      }
      const start = reachedAt.get(target);
      if (!askedAt.has(target) && start !== undefined) {
        // Reached and never asked: back to where it was reached.
        ticks += replayTo(start);
        at = target;
      }
    }
    restore();
    const reached = Math.min(at, target);
    parts.land(reached === target);
    return { asked: target, reached, ticks };
  };

  const by = (d: -1 | 1): JumpResult | null => {
    const s = bossScript(parts.world());
    if (s === null) return null;
    const next = Math.min(s.at, s.of - 1) + d;
    // ◀ at the first step and ▶ at the last do nothing.
    if (next < 0 || next >= s.of) return null;
    return to(next);
  };

  const remembered = (): ReadonlyMap<number, number> => {
    const out = new Map<number, number>();
    for (const [step, tick] of reachedAt) out.set(step, askedAt.get(step) ?? tick);
    return out;
  };

  return {
    to,
    back: () => by(-1),
    forward: () => by(1),
    remembered,
    forget: () => {
      reachedAt.clear();
      askedAt.clear();
      quiet.clear();
    },
  };
}
