import { ackBriefing, bossScript, ticksPerBeat, type World } from "@neon-spore/sim";

/**
 * **A jump to any step of a boss's choreography** (`docs/spec/living-bosses.md`
 * §3): ◀ and ▶ beside the step readout, and a list of every step by number and
 * pose name. The world is rebuilt and replayed headless with AUTO on both
 * seats until the boss's `cursor` arrives on the step asked for — the tick it
 * arrives is the tick its morph begins (`instar-step.ts`) — and the stage is
 * paused there, drawn.
 *
 * **Remembered.** Every step a replay passes is written down with the tick it
 * was first reached on, so a later jump to it replays straight to that tick
 * and watches no cursor. `forget` drops the lot; the stage calls it from its
 * own `rebuild`, which is what a restart, a wave change and an edit all go
 * through, and the jump rebuilds through `restage`, which forgets nothing.
 *
 * **Bounded.** A replay stops when the wave does, or after `JUMP_CAP_BEATS`
 * of a wave that never ends — a boss AUTO has no hand for, whose cursor never
 * moves. It then stands on the furthest step it reached and says so.
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
  /** The stage is held where the jump left it. */
  pause(): void;
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
  /** The tick each step was first reached on, as far as anything has looked. */
  remembered(): ReadonlyMap<number, number>;
  forget(): void;
}

/** How long a replay watches a wave that never ends, in beats. */
export const JUMP_CAP_BEATS = 4000;

const ended = (w: World): boolean => w.over || w.restBeat !== 0;

export function stageJump(parts: StageJumpParts): StageJump {
  const seen = new Map<number, number>();

  const note = (w: World): number | null => {
    const s = bossScript(w);
    if (s === null) return null;
    if (!seen.has(s.at)) seen.set(s.at, w.tick);
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

  const to = (asked: number): JumpResult | null => {
    const script = bossScript(parts.world());
    if (script === null) return null;
    const target = Math.max(0, Math.min(asked, script.of - 1));
    const known = seen.get(target);
    const restore = parts.autoBoth();
    parts.restage();
    let ticks = 0;
    let at = note(parts.world()) ?? -1;
    if (known !== undefined) {
      while (parts.world().tick < known && !ended(parts.world())) {
        tick();
        ticks++;
      }
      at = bossScript(parts.world())?.at ?? at;
    } else {
      const cap = JUMP_CAP_BEATS * ticksPerBeat(parts.world().cfg);
      while (at !== target && ticks < cap && !ended(parts.world())) {
        tick();
        ticks++;
        at = bossScript(parts.world())?.at ?? at;
      }
    }
    restore();
    parts.pause();
    return { asked: target, reached: Math.min(at, target), ticks };
  };

  const by = (d: -1 | 1): JumpResult | null => {
    const s = bossScript(parts.world());
    if (s === null) return null;
    const next = Math.min(s.at, s.of - 1) + d;
    // ◀ at the first step and ▶ at the last do nothing.
    if (next < 0 || next >= s.of) return null;
    return to(next);
  };

  return {
    to,
    back: () => by(-1),
    forward: () => by(1),
    remembered: () => seen,
    forget: () => seen.clear(),
  };
}
