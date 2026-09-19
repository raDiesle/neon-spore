/**
 * THE THROAT's two hands on the picture, in a file of their own for
 * `boss-vane.ts`' reason: the boss had no sounds of its own until 19
 * September 2026, because nothing about it happened that was not a state both
 * screens already drew. These three are a gullet held shut under a thumb, that
 * hold let go, and the tube dragged sideways — and all three stay out of the
 * 300–3000 Hz band, because under CINCH and HAUL the pair is saying a column
 * to each other across a voice delay (docs/spec/audio.md §1).
 *
 * All three are wet where THE VANE's are iron: this is a gullet and not a
 * bearing, and the pair has to be able to tell a hand on the tube from a hand
 * on anything else without looking at the screen it is on.
 */

import { after, air, noise, soft, sub, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_THROAT_SOUNDS: SoundDef[] = [
  {
    id: "boss.throatCinch",
    family: "boss",
    blurb: "A wet tube pinched shut: a close, and the draw through it stopping dead.",
    status: "bound",
    use: "THE THROAT's slack ring caught under player 2's thumb — the gullet stops breathing.",
    level: 0.36,
    // A close under the band and the draw dying above it. What this gesture
    // buys is silence from a thing that was about to swallow, so the sound is
    // something *ending* and the pilot hears his window in the gap after it.
    layers: [thud(128, 74, 0.1, 0.36), after(0.02, soft(0.4, air(4200, 6200, 0.12, 0.18, 1.6)))],
  },
  {
    id: "boss.throatSlip",
    family: "boss",
    blurb: "A pinched tube opening again: the draw coming back, and weight settling into it.",
    status: "bound",
    use: "THE THROAT's cinch lost — lifted, or torn out when its beats ran out. The gullet breathes.",
    level: 0.42,
    // The cinch turned around: the draw comes back instead of stopping, and
    // the sub under it is the bill arriving. Both seats have to hear a window
    // shut as different from one opening, which is `boss.vaneSlip`'s rule.
    layers: [
      air(6400, 3600, 0.3, 0.16, 1.3),
      after(0.03, sub(52, 0.34, 0.36)),
      after(0.05, soft(0.5, thud(96, 58, 0.22, 0.3))),
    ],
  },
  {
    id: "boss.throatHaul",
    family: "boss",
    blurb: "Something heavy and wet dragged a pace sideways: a slide, and a soft stop.",
    status: "bound",
    use: "THE THROAT's mouth hauled a column by player 1 under HAUL — her column is stale now.",
    level: 0.44,
    // A slide that lands rather than rising to a stop: the mouth did not open,
    // it moved, and the navigator is being told the number she just said is
    // no longer true. Noise through a lowpass and not `metal`, because a
    // sawtooth's harmonics over a drag this long would sit in the band for a
    // quarter of a second — `boss.vaneHaul`'s own reason, said about mass.
    layers: [
      { source: "sine", freq: 84, toFreq: 118, gain: 0.3, attack: 0.02, release: 0.24 },
      soft(0.6, noise(180, { type: "lowpass", freq: 260, toFreq: 150, q: 0.9 }, 0.03, 0.26, 0.3)),
      after(0.22, sub(58, 0.26, 0.34)),
    ],
  },
];
