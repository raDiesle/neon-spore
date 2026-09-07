import { after, air, chime, glint, metal, noise, soft, spore, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

/**
 * THE PULSE, as a song made of the catalogue's own grains.
 *
 * **The chart is the song and there is no recording under it.** That was the
 * owner's choice between three, and it is the one that costs nothing and
 * cannot drift: an arrow arriving plays its lane's voice, the grid plays a
 * kick and a bass under it, and every one of those is fired from the
 * simulation's own tick clock (`mixer-pulse.ts`). A backing track would run on
 * the browser's audio clock while the arrows ran on the tick clock, and over a
 * minute on a slow phone the two would part company — which in a rhythm game
 * is not a blemish, it is the game being wrong.
 *
 * **Four lane voices, one per direction, and they are a chord.** Left, down,
 * up, right are a minor-seventh spread — 220, 262, 330, 392 Hz — so a bar of
 * arrows is a melody rather than four unrelated beeps, and a jump is an
 * interval. They are short and plucked, well under the 0.16 s the band budget
 * allows a single sound, because a hundred of them go past in a minute
 * (`band.ts`).
 *
 * **The bass is under the voice and the kick is under everything.** The one
 * rule this file could break is `docs/spec/audio.md`'s: nothing may sit in
 * 300–3000 Hz for long, because that is where the pair are talking, and this
 * is the only place in the game where sound runs continuously for a minute. So
 * the bed is a sub and a transient and nothing in between, and the lane voices
 * are the only thing near the speech band — one at a time, for a tenth of a
 * second.
 *
 * `family: "boss"` and not a family of its own: the catalogue's families are a
 * fixed set (`types.ts`), and a round is a boss whatever picture it draws.
 */
export const PULSE_SOUNDS: SoundDef[] = [
  {
    id: "boss.pulseLeft",
    family: "boss",
    blurb: "A plucked low string, dry, with a breath of air off it.",
    status: "bound",
    use: "An arrow arriving in the left lane. The root of the chord.",
    level: 0.3,
    layers: [spore(220, 0.16, 0.3, 18), soft(0.4, glint(2200, 0.05))],
  },
  {
    id: "boss.pulseDown",
    family: "boss",
    blurb: "The same pluck a minor third up, a little rounder.",
    status: "bound",
    use: "An arrow arriving in the down lane.",
    level: 0.3,
    layers: [spore(262, 0.15, 0.3, 18), soft(0.4, glint(2620, 0.05))],
  },
  {
    id: "boss.pulseUp",
    family: "boss",
    blurb: "The fifth, and the brightest of the four.",
    status: "bound",
    use: "An arrow arriving in the up lane.",
    level: 0.3,
    layers: [spore(330, 0.14, 0.3, 18), soft(0.45, glint(3300, 0.05))],
  },
  {
    id: "boss.pulseRight",
    family: "boss",
    blurb: "The seventh: the one that wants to move somewhere.",
    status: "bound",
    use: "An arrow arriving in the right lane.",
    level: 0.3,
    layers: [spore(392, 0.13, 0.3, 18), soft(0.45, glint(3920, 0.05))],
  },
  {
    id: "boss.pulseKick",
    family: "boss",
    blurb: "A soft round kick, all body and no click.",
    status: "bound",
    use: "The first step of every beat of a stage. The floor of the song.",
    level: 0.38,
    layers: [thud(110, 42, 0.16, 0.7)],
  },
  {
    id: "boss.pulseBass",
    family: "boss",
    blurb: "A sub that walks a step under the chord, well below the voice.",
    status: "bound",
    use: "The bass note, once a bar and once on the half of it.",
    level: 0.3,
    layers: [sub(55, 0.32, 0.62), after(0.01, sub(110, 0.14, 0.18))],
  },
  {
    id: "boss.pulseHat",
    family: "boss",
    blurb: "A thin dry tick, high above everything anybody says.",
    status: "bound",
    use: "The two steps of a beat that are not the first. The shuffle.",
    level: 0.14,
    layers: [tick(0.3, 0, 7200)],
  },
  {
    id: "boss.pulseHit",
    family: "boss",
    blurb: "A short bright ring over the arrow's own note. A thumb on time.",
    status: "bound",
    use: "A clean hit, either seat.",
    level: 0.24,
    layers: [chime(1760, 0.1, 0.22), soft(0.3, glint(5200, 0.04))],
  },
  {
    id: "boss.pulseMiss",
    family: "boss",
    blurb: "The song coming apart for a moment: a detuned scrape under a dull knock.",
    status: "bound",
    use: "An arrow either seat ran out of time on, and a press at nothing.",
    level: 0.34,
    layers: [
      metal(148, 0.2, 0.34, 300),
      after(0.02, noise(900, { type: "bandpass", freq: 900, q: 1.4 }, 0.002, 0.09, 0.24)),
    ],
  },
  {
    id: "boss.pulseVeil",
    family: "boss",
    blurb: "A swallowed, wobbling tone with no pitch you could name.",
    status: "bound",
    use: "A veiled arrow entering the top of the lanes. Both devices play it: the seat who has to make the call needs the warning as much as the seat who cannot see.",
    level: 0.26,
    layers: [spore(196, 0.22, 0.3, 120), soft(0.5, air(1200, 600, 0.2, 0.12, 1.6))],
  },
  {
    id: "boss.pulseClear",
    family: "boss",
    blurb: "The chord all at once, opening upward.",
    status: "bound",
    use: "A stage finished with the meter still alive.",
    level: 0.42,
    // The chord an octave down from where it was first written, so the whole
    // of it sits under the speech band: a verdict is the one sound a pair are
    // most likely to talk over, and `pierce` is a permission the catalogue
    // only grants five times in the whole game (`band.ts`).
    layers: [
      chime(131, 0.42, 0.34),
      after(0.06, chime(165, 0.42, 0.3)),
      after(0.12, chime(196, 0.5, 0.28)),
      sub(82, 0.4, 0.4),
    ],
  },
  {
    id: "boss.pulseFlat",
    family: "boss",
    blurb: "The song stopping dead, and a long fall under it.",
    status: "bound",
    use: "The meter emptied and the stage lost.",
    level: 0.46,
    // The fall starts under the band rather than sweeping down through it.
    layers: [thud(140, 32, 0.5, 0.72), after(0.05, metal(96, 0.6, 0.32, 190))],
  },
];
