import { buildBoss, buildPods, buildQueue, WAVES } from "@neon-spore/content";
import {
  introHolds,
  resetRun,
  type SimConfig,
  type SimEvent,
  startWave,
  type World,
} from "@neon-spore/sim";
import type { GameAudio } from "./audio.js";
import type { InputBuffer } from "./input.js";
import { reached, scored, updateProgress } from "./progress.js";

/**
 * Wave progression: the two ways a wave starts, and the clock that carries its
 * introduction past.
 *
 * The simulation asks for a queue when it needs one; it cannot fetch one
 * itself, because waves live in `content/` and nothing points back into the
 * sim. The test rig and the main menu ask for a wave directly, jumping there
 * instead of waiting for the sim to ask. Both end in the same four calls into
 * `content` — queue, pods, boss, and whether the wave carries a guide —
 * because a wave is content's idea and the sim only knows its number. The
 * guide is passed as a plain boolean, not as its words: the simulation decides
 * how many states hold the field and never reads one of them.
 *
 * **The introduction's seconds are counted here, and this is the only place
 * they could be.** `packages/sim` may not read a wall clock — that is what
 * makes lockstep possible — so the wave's opening is held in the world and let
 * go by a command, exactly like the guide's. Where the guide's command comes
 * from a thumb, the introduction's comes from this countdown, one seat's worth
 * per device. Two devices therefore leave the introduction a few frames apart
 * and the world agrees about it anyway, because the acks travel the same wire
 * every other press does.
 */

/**
 * How long the introduction stands. Long enough to read a short sentence
 * twice: at 2.6 s the old banner's hint was gone before anyone had finished
 * it, which made every wave feel like it started mid-sentence.
 */
const INTRO_SECONDS = 5.5;

/**
 * How long to wait, **in world ticks**, before asking again when the
 * introduction is somehow still standing.
 *
 * Ticks and not seconds, and that is the whole of what makes the retry safe.
 * An ack is scheduled `inputDelayTicks` into the future, so for a moment after
 * it is sent the introduction is legitimately still up — a retry on a wall
 * clock fires into that gap, the world moves on to the guide, and the second
 * pair of acks arrives to put away a guide nobody has read. That is not a race
 * that showed up under load: it happened on the first frame anybody looked at.
 *
 * Counting the world's own ticks fixes both halves at once. It cannot fire
 * before the first ack has had time to land, and it cannot fire while the game
 * is paused — which is the one case a retry exists for, since a paused loop
 * throws buffered commands away — because a paused world does not tick either.
 */
const RETRY_TICKS = 60;

export interface WaveProgressionOptions {
  world: World;
  cfg: SimConfig;
  audio: GameAudio;
  buffer: InputBuffer;
}

export interface WaveProgression {
  /** Feed this the sim's events every tick they arrive. */
  handle(events: readonly SimEvent[]): void;
  /** Jump to a wave in the test build: a fresh run, not a continuation. */
  jumpToWave(wave: number): void;
  /** Counts the introduction down, and lets it go when it runs out. */
  tickOpening(dtSeconds: number): void;
}

export function createWaveProgression({
  world,
  cfg,
  audio,
  buffer,
}: WaveProgressionOptions): WaveProgression {
  /** Seconds left on the introduction that is up, or 0 when none is. */
  let left = 0;
  /** The world tick the acks were sent on, or -1 while none has been sent. */
  let sentAtTick = -1;
  /** Whether this run's final score has already been written down. */
  let ended = false;

  const open = (wave: number): void => {
    // How far this device has got, remembered here because here is where a
    // wave is reached — and the score with it, so a run put down mid-way still
    // leaves the number it was on. Solo and per device: it never touches the
    // room (`progress.ts`).
    updateProgress((p) => scored(reached(p, wave), world.score));
    startWave(
      world,
      wave,
      buildQueue(wave, cfg.cols),
      buildPods(wave, cfg.cols),
      buildBoss(wave, cfg.cols),
      WAVES[wave]?.guide !== undefined,
    );
    left = INTRO_SECONDS;
    sentAtTick = -1;
  };

  const handle = (events: readonly SimEvent[]): void => {
    for (const e of events) {
      if (e.type !== "needWave") continue;
      open(e.wave);
    }
    // The end of a run is the one score worth keeping that no wave opening
    // will ever record, because there is no wave after it.
    if (world.over && !ended) {
      ended = true;
      updateProgress((p) => scored(p, world.score));
    }
    if (!world.over) ended = false;
  };

  const jumpToWave = (wave: number): void => {
    resetRun(world);
    // The tick counter goes back to zero with the run, so anything remembered
    // against it — in render/ and in audio/ alike — is about to be read as this
    // run's own. See CLAUDE.md on `world.beat` not being monotonic.
    audio.restarted();
    open(Math.max(0, wave));
  };

  return {
    handle,
    jumpToWave,
    tickOpening: (dtSeconds) => {
      // The world is the authority on whether the introduction is still up: a
      // headless check that acked it by hand, or a partner who was slower than
      // this device, both show up here as the phase having moved on.
      if (!introHolds(world)) {
        sentAtTick = -1;
        return;
      }
      if (sentAtTick >= 0) {
        // Already asked once. Ask again only when the world has ticked far
        // enough past that for the answer to have been lost rather than merely
        // to be in flight — see `RETRY_TICKS`, which is why this counts ticks.
        if (world.tick - sentAtTick < RETRY_TICKS) return;
      } else {
        left -= dtSeconds;
        if (left > 0) return;
      }
      buffer.push(1, { kind: "brief" });
      buffer.push(2, { kind: "brief" });
      sentAtTick = world.tick;
    },
  };
}
