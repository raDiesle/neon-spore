import { buildPods, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  DIFFICULTY_BPM,
  type Difficulty,
  PAIR_ON,
  resetClock,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import type { GameAudio } from "./audio.js";
import type { InputBuffer } from "./input.js";
import { readProgress } from "./progress.js";
import { createWaveProgression, type WaveProgression } from "./waves.js";

/**
 * **The world's opening**: the config this build plays at, the world built on
 * it, and the three ways a run is started from outside — a wave chosen, beat
 * zero, a tempo. Beside `main.ts` rather than inside it for `main-shell.ts`'s
 * reason: the file sat at the line ceiling, and this is one subject
 * (`docs/queue.md`, 21 September 2026).
 */
export interface OpenWorld {
  cfg: SimConfig;
  world: World;
  progression: WaveProgression;
  jumpToWave: (wave: number) => void;
  startTogether: (wave: number) => void;
  playAt: (level: Difficulty) => void;
}

export function openWorld(audio: GameAudio, buffer: InputBuffer): OpenWorld {
  // **The hull breaks here like it does anywhere else.** It used to be held by
  // default in this build so a wave being looked at could finish, and the
  // owner asked for that off — it made the one thing a player is meant to feel
  // invisible: a wave of sound went through the ship and the bar did not move,
  // so a mistake read as nothing having happened. The switch is still in the
  // test panel for whoever wants to sit and watch a wave, off until it is
  // asked for.
  // `PAIR_ON` is the other switch: the wave opening, on here and off by
  // default, because it wants two people. See `config-pair.ts`.
  //
  // `shotChargeBeats` sits beside it rather than inside it. Two forces set it:
  // a shot laid over half a beat is a press player 1 can *see happening*
  // rather than one that reaches him as a result (`shot-charge.ts`), and it is
  // also the window the mouth's own sequence needs to read in
  // (`cannon-maw.ts`). Shorten it on the director's TUNING → PAIR slider
  // rather than here. Off in `DEFAULT_CONFIG` so every replay keeps its timing
  // exact.
  // And the tempo this device last played at, which is the whole of a
  // difficulty (`sim/difficulty.ts`). Medium for a device that has never
  // chosen, which is `DEFAULT_CONFIG.bpm` and therefore no change at all.
  const cfg = { ...DEFAULT_CONFIG, ...PAIR_ON, shotChargeBeats: 0.5 };
  cfg.bpm = DIFFICULTY_BPM[readProgress().level];
  const world = createWorld(cfg, 0, buildQueue(0, cfg.cols), buildPods(0, cfg.cols));
  const progression = createWaveProgression({ world, cfg, audio, buffer });
  const jumpToWave = progression.jumpToWave;

  return {
    cfg,
    world,
    progression,
    jumpToWave,
    /**
     * Beat zero. Both devices land here within a few milliseconds of each
     * other, and from here the tick counter is the only clock either reads —
     * which is why the clock goes back to zero and not merely the run.
     *
     * **On the wave the room names**, which is the furthest the pair has
     * reached rather than the first (`link-types.ts`). It is the same number
     * on both phones because it arrived on the same message, and it opens on
     * that wave's guide if it has one, because `jumpToWave` is the door a wave
     * is chosen through everywhere else (`waves.ts`).
     */
    startTogether: (wave) => {
      resetClock(world, 0);
      jumpToWave(wave);
    },
    /**
     * The tempo the run is played at, which is the whole of a difficulty.
     *
     * Written onto the config the world already holds rather than into a
     * second one: `SimConfig` is read live by everything in the simulation, so
     * a new `bpm` takes effect on the next tick — which is why every caller of
     * this restarts the run in the same breath. A beat that changed under a
     * wave already falling would leave the arrivals timed against a beat that
     * no longer exists.
     */
    playAt: (level) => {
      cfg.bpm = DIFFICULTY_BPM[level];
    },
  };
}
