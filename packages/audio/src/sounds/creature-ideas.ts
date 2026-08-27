/**
 * The bestiary's second half: the nine newly accepted creatures
 * (`docs/spec/bestiary.md` 10.2) and the ones still in the idea store
 * (`docs/spec/ideas.md`).
 *
 * The split from `creature.ts` is the spec's own: the first thirteen are a
 * settled list, these are not. A sound here is an argument for the creature as
 * much as a sound for it — several of them exist because the idea only makes
 * sense if the pair can tell it apart by ear, and writing the sound is the
 * cheapest way to find out whether they could.
 */

import { after, air, burst, glint, metal, soft, spore, sub, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const CREATURE_IDEA_SOUNDS: SoundDef[] = [
  {
    id: "creature.threadFuture",
    family: "creature",
    blurb: "A tone arriving before its own body — the trace one player can see.",
    status: "spare",
    use: "Thread (bestiary 10.2), whose radar shows where it is going to be.",
    level: 0.22,
    layers: [soft(0.5, glint(6800, 0.12)), after(0.35, spore(150, 0.3, 0.4, 40))],
  },
  {
    id: "creature.shadowHide",
    family: "creature",
    blurb: "A sound stepping behind another one and being covered by it.",
    status: "spare",
    use: "The Shadow — invulnerable while it lies behind another creature.",
    level: 0.24,
    layers: [
      spore(180, 0.3, 0.4, 30),
      after(0.06, {
        source: "noise",
        freq: 500,
        gain: 0.4,
        attack: 0.06,
        release: 0.3,
        filter: { type: "lowpass", freq: 700, toFreq: 140, q: 1.4 },
      }),
    ],
  },
  {
    id: "creature.whisper",
    family: "creature",
    blurb: "Two half-sounds that only make one sound when they land together.",
    status: "spare",
    use: "The Whisperer — reacts only when both inputs hit the same beat.",
    level: 0.26,
    layers: [
      soft(0.5, air(3000, 4600, 0.16, 0.2, 3)),
      soft(0.5, air(4600, 3000, 0.16, 0.2, 3)),
      after(0.1, soft(0.6, glint(5600, 0.14))),
    ],
  },
  {
    id: "creature.doppel",
    family: "creature",
    blurb: "One sound and its near-copy, close enough to be argued about.",
    status: "spare",
    use: "The Doppelgänger — one player knows the shape, the other the behaviour.",
    level: 0.24,
    layers: [spore(160, 0.3, 0.4, 30), after(0.02, soft(0.8, spore(163, 0.3, 0.34, 34)))],
  },
  {
    id: "creature.blindOne",
    family: "creature",
    blurb: "Interference where a creature should be: noise with a shape inside it.",
    status: "spare",
    use: "The Blind One — visible to one player, static to the other.",
    level: 0.26,
    layers: [
      {
        source: "noise",
        freq: 2000,
        gain: 0.4,
        attack: 0.02,
        release: 0.4,
        filter: { type: "bandpass", freq: 3600, toFreq: 6400, q: 2.2 },
        wobble: { rate: 17, cents: 200 },
      },
      soft(0.4, burst(tick(0.3, 0, 6000), 6, 0.06, 0.9)),
    ],
  },
  {
    id: "creature.clampJoin",
    family: "creature",
    blurb: "Two bodies becoming one line, and the line going taut.",
    status: "spare",
    use: "The Clamp — three ways out, chosen together.",
    level: 0.3,
    layers: [
      metal(96, 0.2, 0.45, 120),
      after(0.12, {
        source: "sawtooth",
        freq: 130,
        toFreq: 190,
        gain: 0.4,
        attack: 0.06,
        release: 0.3,
        filter: { type: "lowpass", freq: 400, toFreq: 240, q: 3 },
      }),
    ],
  },
  {
    id: "creature.beatBreaker",
    family: "creature",
    blurb: "A click on its own offset. The global beat is still right; this is not on it.",
    status: "spare",
    use: "The Beat-breaker.",
    level: 0.26,
    layers: [tick(0.45, 0, 3800), sub(90, 0.08, 0.45), after(0.31, soft(0.6, tick(0.35, 0, 3800)))],
  },
  {
    id: "creature.silentOne",
    family: "creature",
    blurb: "Almost nothing: a movement of air with no tone in it at all.",
    status: "spare",
    use: "The Silent — neither radar announces it, and it must be slow.",
    level: 0.12,
    layers: [air(160, 380, 0.8, 0.24, 0.9)],
  },
  {
    id: "creature.jammer",
    family: "creature",
    blurb: "A radar going out: a sweep collapsing into hiss.",
    status: "spare",
    use: "The Jammer — it blanks the other player's strip.",
    level: 0.3,
    layers: [
      air(9000, 3800, 0.4, 0.2, 2.4),
      after(0.3, {
        source: "noise",
        freq: 3000,
        gain: 0.35,
        attack: 0.05,
        release: 0.6,
        filter: { type: "bandpass", freq: 4600, q: 2.2 },
        wobble: { rate: 23, cents: 300 },
      }),
    ],
  },
];
