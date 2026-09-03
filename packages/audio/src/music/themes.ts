/**
 * Nine pieces of music, none of which the game plays — the six below, and the
 * three `deep.ts` adds for a deep sea underground.
 *
 * They exist to be **chosen between**. The spec says no soundtrack
 * (`docs/spec/systems.md` 5.3) and the argument behind that is sound — a bed
 * of music under a game whose control scheme is talking is a bed under the
 * control scheme. But "no soundtrack" was decided without anything to listen
 * to, and these are answers to *what would it even be*, written cheaply enough
 * that throwing all but one away costs nothing.
 *
 * Each one names where it would sit. Two of the six here (`pulseFloor`,
 * `deepCurrent`) would run under a wave and are the ones the rule is really
 * about; the other four sit where nobody is talking — the title screen, the
 * menu, the pause after a boss — which is the loophole worth looking at first.
 *
 * **Bells never go down.** `BELL` and `STAR` sit just above 3 kHz, so a
 * negative degree walks them into the speech band; the bass has the same rule
 * upside down. `test/music.test.ts` fails a theme that forgets it, per note.
 */

import { ALIVE, BELL, BREATH, DUST, GRIND, HEART, PLUCK, STAR, STEP, WASH } from "./cells.js";
import { DEEP_THEMES } from "./deep.js";
import { again, line, type Note, pulse, type Theme } from "./model.js";

const join = (...parts: Note[][]): Note[] => parts.flat();

/** Slow, wide, and almost not there. */
const driftBloom: Theme = {
  id: "music.driftBloom",
  title: "Drift Bloom",
  blurb: "Four low chords opening over half a minute, with far-off bells above them.",
  use: "The title screen and the gap between waves — where nobody is talking yet.",
  bpm: 54,
  beats: 32,
  notes: join(
    line(BREATH, 0, 8, [0, 3, 7, 5]),
    line(BREATH, 0.5, 8, [7, 10, 14, 12], { gain: 0.45 }),
    line(BELL, 2, 4, [12, 7, null, 19, 12, null, 15, 7], { gain: 0.7 }),
    pulse(WASH, 0, 16, 2, { gain: 0.8 }),
    pulse(HEART, 0, 16, 2, { gain: 0.6 }),
  ),
};

/** The game's own 96 BPM, made audible as a floor rather than a click. */
const pulseFloor: Theme = {
  id: "music.pulseFloor",
  title: "Pulse Floor",
  blurb: "A heartbeat on every beat of the game's own clock, with a dry tick between.",
  use: "Under an ordinary wave. It is the click track with a body under it.",
  bpm: 96,
  beats: 32,
  notes: join(
    pulse(HEART, 0, 1, 32, { gain: 0.65 }),
    pulse(STEP, 0, 4, 8, { gain: 0.8 }),
    pulse(DUST, 1.5, 2, 16, { gain: 0.55 }),
    again(line(BELL, 2, 3, [12, 7]), 4, 8),
    pulse(BREATH, 0, 16, 2, { gain: 0.55 }),
  ),
};

/** Something moving under the field, on a loop short enough to learn. */
const deepCurrent: Theme = {
  id: "music.deepCurrent",
  title: "Deep Current",
  blurb: "A four-note bass figure turning over under a wavering low voice.",
  use: "Under a wave, when the wave itself is quiet — the bass is the only pulse.",
  bpm: 96,
  beats: 32,
  notes: join(
    again(line(PLUCK, 0, 1, [0, null, 7, null, 3, null, 5, null]), 4, 8),
    line(ALIVE, 2, 8, [0, 5, 3, 7], { gain: 0.8 }),
    line(STAR, 6, 8, [12, 19, 15, null], { gain: 0.6 }),
    pulse(HEART, 0, 8, 4, { gain: 0.7 }),
  ),
};

/** The palette upside down: everything above the voice, nothing below it. */
const glassRain: Theme = {
  id: "music.glassRain",
  title: "Glass Rain",
  blurb: "Bells falling in a pattern that never quite repeats. No bass at all.",
  use: "The menu and the results screen. It is the only piece with no floor.",
  bpm: 72,
  beats: 36,
  notes: join(
    again(line(BELL, 0, 1.5, [12, 7, 0, null, 3, 0, null, 7]), 2, 12),
    line(BELL, 24, 1.5, [19, 12, 7, null, 15, 7], { gain: 0.8 }),
    line(STAR, 4, 6, [19, 12, 24, 7, 12, 19], { gain: 0.7 }),
    pulse(DUST, 0.75, 3, 12, { gain: 0.5 }),
    pulse(WASH, 0, 12, 3, { gain: 0.7 }),
  ),
};

/** Weight arriving, and the room getting lower under it. */
const pressure: Theme = {
  id: "music.pressure",
  title: "Pressure",
  blurb: "A very low saw walking downwards while the pulse doubles behind it.",
  use: "A boss on the field. It is the only piece that gets faster rather than louder.",
  bpm: 96,
  beats: 32,
  notes: join(
    line(GRIND, 0, 4, [0, 0, -2, -2, -3, -3, -5, -5], { gain: 0.85 }),
    pulse(HEART, 0, 2, 8, { gain: 0.5 }),
    pulse(HEART, 16, 0.5, 32, { gain: 0.6 }),
    pulse(STEP, 8, 8, 3, { gain: 0.9 }),
    line(STAR, 12, 8, [0, 7, 12], { gain: 0.8 }),
  ),
};

/** Something cooling. The one piece that ends rather than loops. */
const ember: Theme = {
  id: "music.ember",
  title: "Ember",
  blurb: "Clicks scattering and slowing, then one chord opening under them.",
  use: "After a boss dies, and after a run ends. It is the sound of nothing arriving.",
  bpm: 60,
  beats: 32,
  notes: join(
    pulse(DUST, 0, 0.75, 8, { gain: 0.8 }),
    pulse(DUST, 8, 1.5, 6, { gain: 0.5 }),
    pulse(DUST, 18, 3, 4, { gain: 0.3 }),
    line(BREATH, 4, 4, [0, 7, 12], { gain: 0.8 }),
    line(BELL, 24, 4, [12, 19], { gain: 0.6 }),
    pulse(HEART, 0, 8, 2, { gain: 0.5 }),
  ),
};

/**
 * In the order they are worth hearing: the two that would run under a wave
 * first, because they are the ones the no-soundtrack rule is an argument about.
 */
export const THEMES: readonly Theme[] = [
  pulseFloor,
  deepCurrent,
  driftBloom,
  glassRain,
  pressure,
  ember,
  ...DEEP_THEMES,
];

export function theme(id: string): Theme {
  const found = THEMES.find((t) => t.id === id);
  if (!found) throw new Error(`no theme "${id}"`);
  return found;
}
