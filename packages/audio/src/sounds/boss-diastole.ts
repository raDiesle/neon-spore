/**
 * THE DIASTOLE's two, in a file of their own for `boss-candle.ts`' reason.
 *
 * The boss had no sounds of its own until the clamp: a hit on it is the
 * ordinary `metColor`, and the burst is the phase. These are the thumb's —
 * a grip closing on a beat, and a chamber refusing the grip — and both stay
 * out of the 300–3000 Hz band, because the whole fight is two people
 * counting out loud (docs/spec/audio.md §1).
 */

import { after, air, soft, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_DIASTOLE_SOUNDS: SoundDef[] = [
  {
    id: "boss.diastoleClamp",
    family: "boss",
    blurb: "A grip closing on a beat: a short dull knock, and the air held.",
    status: "bound",
    use: "THE DIASTOLE's right chamber clamped on its contraction — the beat the beam lands on.",
    level: 0.42,
    // A knock under the band and a held breath above it: over inside a
    // beat, because the next thing the pair does is fire on it.
    layers: [thud(150, 70, 0.16, 0.5), after(0.03, air(5200, 4400, 0.22, 0.12, 2))],
  },
  {
    id: "boss.diastoleSpasm",
    family: "boss",
    blurb: "A chamber refusing a grip: a low shudder, then a long fall of air going slack.",
    status: "bound",
    use: "THE DIASTOLE clamped on the wrong beat, or held too long — nothing lands for eight beats.",
    level: 0.4,
    // Longer than any hit and lower than any of them, so it cannot be heard
    // as one: the shudder is three knocks under 120 Hz and the slack is a
    // fall from the top of the range.
    layers: [
      thud(120, 60, 0.3, 0.45),
      after(0.1, thud(110, 55, 0.3, 0.35)),
      after(0.2, thud(100, 50, 0.4, 0.3)),
      after(0.25, soft(0.6, air(7000, 3400, 0.9, 0.12, 1.2))),
    ],
  },
];
