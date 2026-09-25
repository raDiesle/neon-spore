import { DEFAULT_CONFIG, type SimConfig } from "./config.js";

/**
 * **EASY, MEDIUM and HARD, and the one number they move: the tempo.**
 *
 * The owner asked for three difficulties chosen when a new game is started, and
 * for the thing they change to be *the falling speed of everything*. On this
 * field that is not a per-creature number and must not become one: everything
 * falls a tile a beat, so the falling speed **is** the beat, and one `bpm` is
 * the whole of it. He put today's game at Medium, so Medium is 96 and nothing a
 * pair has already played changes underneath them.
 *
 * **The three are divisors of the tick rate, and that is not a preference.**
 * `ticksPerBeat` is `tickHz * 60 / bpm` and the simulation counts in whole
 * ticks; a tempo that leaves a fraction of a tick in a beat is a wave whose
 * arrivals drift off the metronome by a tick every few bars, on both devices
 * and differently. At 120 Hz the beat is 7200 tick-seconds, so the tempi
 * available near the one shipped are 80 (90 ticks), 96 (75), 100 (72) and 120
 * (60). Easy is 80 and Hard is 120: a fifth slower and a quarter faster, which
 * are the two nearest values that are also a change a person can feel.
 *
 * **What it does *not* touch.** The guard and the intake windows are in
 * milliseconds (`config.ts`), so a faster beat tightens them against the beat
 * without anybody choosing a second number — which is the right direction and
 * is why the hull's hits stayed out of this. No wave is re-timed: a wave is
 * authored in beats and every beat is still a beat.
 *
 * **And one rule, on HARD only.** The owner, 25 September 2026: *in Difficulty
 * "Hard", i suggest wave is lost, if a shot is hitting nothing — basically
 * wasted and hitting the top line of game screen.* So on HARD a shot out of
 * the top that nothing up there took fails the wave the way a hit on the hull
 * does (`wastedShotFails`, `shot-out.ts`). EASY and MEDIUM keep every rule
 * they had. `playDifficulty` is the one place a level is written onto a
 * config, so the tempo and the rule cannot be set apart.
 */

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** The tempo each level plays at, in beats a minute. A total map, so a fourth
 * level is a build error here rather than a silent fall back to the default. */
export const DIFFICULTY_BPM: Record<Difficulty, number> = {
  easy: 80,
  medium: DEFAULT_CONFIG.bpm,
  hard: 120,
};

/** A level onto a live config: its tempo, and whether a wasted shot loses the
 * wave. Written onto the config rather than returned as a new one, because
 * `SimConfig` is read live by the world that already holds it. */
export function playDifficulty(cfg: SimConfig, level: Difficulty): void {
  cfg.bpm = DIFFICULTY_BPM[level];
  cfg.wastedShotFails = level === "hard";
}

/** What a run starts at when nobody has chosen: the game as it has always been. */
export const DEFAULT_DIFFICULTY: Difficulty = "medium";

/** Whether a string off the wire or out of a browser's storage is a level. */
export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && (DIFFICULTIES as readonly string[]).includes(value);
}

/**
 * The level, read back out of a tempo.
 *
 * For a screen that has a `SimConfig` and wants to say which of the three it is
 * playing — the menu's own row, and the director, which moves `bpm` on a slider
 * and is therefore allowed to be at none of them.
 */
export function difficultyOf(bpm: number): Difficulty | null {
  return DIFFICULTIES.find((level) => DIFFICULTY_BPM[level] === bpm) ?? null;
}
