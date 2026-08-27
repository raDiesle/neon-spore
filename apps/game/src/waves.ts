import { buildBoss, buildPods, buildQueue, WAVES } from "@neon-spore/content";
import { resetRun, type SimConfig, type SimEvent, startWave, type World } from "@neon-spore/sim";
import type { GameAudio } from "./audio.js";
import { enterInterludeIfDue } from "./interlude.js";

/**
 * Wave progression: the two ways a wave starts, and the banner that names it.
 *
 * The simulation asks for a queue when it needs one; it cannot fetch one
 * itself, because waves live in `content/` and nothing points back into the
 * sim. The test rig and the main menu ask for a wave directly, jumping there
 * instead of waiting for the sim to ask. Both end in the same three calls
 * into `content` — queue, pods, boss — because a wave is content's idea and
 * the sim only knows its number.
 */

/**
 * How long the wave's name and hint stand. Long enough to read a short one
 * twice: at 2.6 s the hint was gone before anyone had finished it, which made
 * every wave feel like it started mid-sentence.
 */
const BANNER_SECONDS = 5.5;

export interface Banner {
  title: string;
  hint: string;
  remaining: number;
}

export interface WaveProgressionOptions {
  world: World;
  cfg: SimConfig;
  audio: GameAudio;
}

export interface WaveProgression {
  /** Feed this the sim's events every tick they arrive. */
  handle(events: readonly SimEvent[]): void;
  /** Jump to a wave in the test build: a fresh run, not a continuation. */
  jumpToWave(wave: number): void;
  banner(): Banner;
  /** Counts the banner down. A briefing card holds it — see `briefing.ts`. */
  tickBanner(dtSeconds: number, held: boolean): void;
}

export function createWaveProgression({
  world,
  cfg,
  audio,
}: WaveProgressionOptions): WaveProgression {
  let banner = openingBanner(0);

  function openingBanner(wave: number): Banner {
    const w = WAVES[wave];
    return w
      ? { title: w.name, hint: w.hint, remaining: BANNER_SECONDS }
      : {
          title: `WAVE ${wave + 1}`,
          hint: "Beyond the authored waves.",
          remaining: BANNER_SECONDS,
        };
  }

  const handle = (events: readonly SimEvent[]): void => {
    for (const e of events) {
      if (e.type !== "needWave") continue;
      // A third thing a `needWave` can mean: the gap in front of this wave
      // carries a round that is not the field, and the wave waits behind it.
      // The round leaves by asking for the same wave again, and the second
      // ask comes back through here and builds it (`interlude.ts`).
      if (enterInterludeIfDue(world, e.wave)) continue;
      startWave(
        world,
        e.wave,
        buildQueue(e.wave, cfg.cols),
        buildPods(e.wave, cfg.cols),
        buildBoss(e.wave, cfg.cols),
      );
      banner = openingBanner(e.wave);
    }
  };

  const jumpToWave = (wave: number): void => {
    const target = Math.max(0, wave);
    resetRun(world);
    // The tick counter goes back to zero with the run, so anything remembered
    // against it — in render/ and in audio/ alike — is about to be read as this
    // run's own. See CLAUDE.md on `world.beat` not being monotonic.
    audio.restarted();
    startWave(
      world,
      target,
      buildQueue(target, cfg.cols),
      buildPods(target, cfg.cols),
      buildBoss(target, cfg.cols),
    );
    banner = openingBanner(target);
  };

  return {
    handle,
    jumpToWave,
    banner: () => banner,
    tickBanner: (dtSeconds, held) => {
      if (banner.remaining > 0 && !held) banner.remaining -= dtSeconds;
    },
  };
}
