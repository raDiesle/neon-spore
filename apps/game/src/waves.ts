import {
  buildBoss,
  buildPods,
  buildQueue,
  controlSetForWave,
  placedFaults,
  setLance,
  WAVES,
  waveGuideSteps,
  waveHasGuide,
} from "@neon-spore/content";
import { introSeconds } from "@neon-spore/render";
import {
  endRun,
  introHolds,
  playSeconds,
  resetRun,
  type SimConfig,
  type SimEvent,
  startWave,
  type World,
} from "@neon-spore/sim";
import type { GameAudio } from "./audio.js";
import type { InputBuffer } from "./input.js";
import { reachedWith } from "./pairing.js";
import { reached, timed, updateProgress } from "./progress.js";
import { clearQuit, sayQuit } from "./quit.js";

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
 * How long the introduction stands — long enough to read a short sentence
 * twice; at 2.6 s the old banner's hint was gone before anyone had finished it,
 * which made every wave feel like it started mid-sentence.
 *
 * **The number lives in `render/wave-intro.ts` and is imported.** The words fade
 * out over the last half-second of it, and the fade is drawn there while the
 * countdown is run here — two places that have to agree about one duration,
 * which is the definition of a number that should only be written once.
 */

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
  /** Whether this run's final clock has already been written down. */
  let ended = false;

  /**
   * `retry` is the same wave after a hit, `guided` is that retry asked for
   * with its tutorial put back in front of it (`sim/wave-fail.ts`). The two
   * are separate because they answer different questions: `retry` decides
   * whether this device has *reached* anywhere new, and `guided` decides only
   * what stands in front of the field. A guided retry is still a retry.
   */
  const open = (wave: number, retry = false, guided = false): void => {
    // The wave after the last authored one is the end of the run: the pair
    // has cleared every wave the game has, and the balance sheet is what is
    // left to see. There used to be generated waves out here, without end
    // and without a lesson; the run's clock and its retries want a finish
    // line (`sim/wave-fail.ts`).
    if (wave >= WAVES.length) {
      endRun(world);
      return;
    }
    // How far this device has got, remembered here because here is where a
    // wave is reached — and the clock with it, so a run put down mid-way still
    // leaves the figures it was on. Solo and per device: it never touches the
    // room (`progress.ts`). A wave gone again was reached already.
    if (!retry) {
      updateProgress((p) => timed(reached(p, wave), playSeconds(world), world.retries));
      // And against the person in the other seat, where there is one, so the
      // PLAY page can offer to carry on from here with *them* (`pairing.ts`).
      // Nothing at all off the wire: a solo run is this device's own.
      reachedWith(wave);
    }
    startWave(
      world,
      wave,
      buildQueue(wave, cfg.cols),
      buildPods(wave, cfg.cols),
      buildBoss(wave, cfg.cols),
      // A wave gone again after a hit opens on its introduction and not on
      // its guide: the pair has read it, and what they need is the field.
      // Unless they asked for it back, which is the whole of what the lost
      // screen's third button does — from here a guided retry and a first
      // entry are the same call.
      (!retry || guided) && waveHasGuide(wave),
      // How many pages this wave's guide has, which is the whole of what the
      // simulation knows about a rehearsal (`sim/guide-steps.ts`).
      !retry || guided ? waveGuideSteps(wave) : 0,
      // And the faults it places, with the beat each enters on. Read off the
      // wave beside its boss, because they are the same kind of fact: read
      // once, before the first tick, and identical on both devices
      // (`sim/fault-placed.ts`, `content/wave-faults.ts`).
      placedFaults(WAVES[wave]?.faults),
      // And whether this wave's panel fills the cannon lobe under a held
      // colour, off the set the wave names — the same place `field-input.ts`
      // reads which buttons are drawn. Every rung of the ladder holds the
      // gesture back, STANDARD 5 is the full panel that still does, and the
      // sim may not ask content for itself (`content/control-sets.ts`).
      setLance(controlSetForWave(wave)),
    );
    // Armed only for an opening that has an introduction in it. A guided wave
    // crosses its gate straight onto the field (`sim/briefing.ts`), so a clock
    // set here would be counting down a screen nobody will see.
    // Read after `startWave`, which is what counts this try: a wave gone again
    // stands for half as long (`RETRY_INTRO_SECONDS`).
    left = introHolds(world) ? introSeconds(world.waveTries) : 0;
    sentAtTick = -1;
    clearQuit();
  };

  const handle = (events: readonly SimEvent[]): void => {
    for (const e of events) {
      if (e.type === "needWave") open(e.wave, e.retry === true, e.guide === true);
      // One seat answered QUIT on the lost screen: the run is over here and on
      // the other phone alike, and the menu is about to say who (`quit.ts`).
      else if (e.type === "quit") sayQuit(e.player);
    }
    // The end of a run is the one clock worth keeping that no wave opening
    // will ever record, because there is no wave after it.
    if (world.over && !ended) {
      ended = true;
      updateProgress((p) => timed(p, playSeconds(world), world.retries));
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
