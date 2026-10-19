/**
 * Every **wave** on `@neon-spore/content`'s surface: the list, its types and
 * guides, and what is read off a wave — its faults, marks, pressure, talk,
 * whether it is regular, and what it may use (`wave-keys.ts`).
 *
 * Split out of `index.ts` on 16 October 2026, when the export that rule added
 * took it within twenty lines of its limit — by subject, the way
 * `index-shapes.ts` was. `index.ts` re-exports this file wholesale; there is
 * nothing here but names, and `@neon-spore/content` stays the one import path.
 */
export { placedFaults, type WaveFault } from "./wave-faults.js";
export { type Untaught, untaughtComplaint, untaughtKeys, waveKeys } from "./wave-keys.js";
export { WAVE_MARK_IDS, type WaveMarkId, waveMarksOn } from "./wave-marks.js";
export {
  type FastSlide,
  fastSlides,
  PACE_COLS_PER_BEAT,
  PACE_FAR_COLS,
  PACE_READY_BEATS,
  PACE_REST_BEATS,
  paceBeats,
  waveFastSlides,
} from "./wave-pace.js";
export {
  arrivalJob,
  entriesPressure,
  PRESSURE_DEFAULT_WEIGHT,
  PRESSURE_PER_FAULT,
  PRESSURE_WEIGHT,
  PRESSURE_WINDOW_BEATS,
  wavePressure,
} from "./wave-pressure.js";
export {
  isRegularWave,
  regularWaves,
  waveIntroduces,
  waveIntroductions,
} from "./wave-regular.js";
export {
  arrivalTalk,
  FAULT_TALK,
  KIND_TALK,
  TALK_COST,
  TALK_WINDOW_BEATS,
  type TalkFact,
  waveTalk,
} from "./wave-talk.js";
export { tapsClash } from "./wave-taps.js";
export { freshWaveId } from "./wave-types.js";
export {
  type BossType,
  type FilmedGuide,
  guideSteps,
  PROSE_PAGES,
  WAVES,
  type Wave,
  type WaveEntry,
  type WaveGuide,
  type WaveHintsId,
  type WordedGuide,
  waveGuideSteps,
  waveHasGuide,
  waveTeaches,
} from "./waves.js";
export {
  DEMONSTRATIONS,
  type Demonstration,
  demonstrationConfig,
  demonstrationIndex,
  demonstrationWave,
} from "./waves-demo.js";
