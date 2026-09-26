/**
 * THE VANE's two hands on the picture, in a file of their own for
 * `boss-warden.ts`' reason: the boss had no sounds of its own until 18
 * September 2026, because nothing about it happened that was not a state both
 * screens already drew. These four are a sweeping arm caught under a thumb, a
 * caught arm let go, a seized housing hauled off its bearing and a pin knocked
 * out of it — and all four stay out of the 300–3000 Hz band, because under VEER and SEIZE the
 * pair is saying a column to each other across a voice delay
 * (docs/spec/audio.md §1).
 */

import { after, air, metal, soft, sub, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_VANE_SOUNDS: SoundDef[] = [
  {
    id: "boss.vanePin",
    family: "boss",
    blurb: "A swinging arm caught and held: one dull catch, and the ring of it dying under a hand.",
    status: "bound",
    use: "THE VANE's arm pinned under player 1's thumb — the fold line stands still.",
    level: 0.38,
    // A catch under the band and the ring above it, damped rather than left to
    // sing: a held thing sounds like a thing that has stopped.
    layers: [thud(150, 90, 0.12, 0.4), after(0.03, soft(0.5, metal(88, 0.22, 0.18, 240)))],
  },
  {
    id: "boss.vaneSlip",
    family: "boss",
    blurb: "An arm tearing out of a hand and swinging on: a scrape, and the weight going with it.",
    status: "bound",
    use: "THE VANE's pin lost — lifted, or torn free when its beats ran out. The window is gone.",
    level: 0.44,
    // Falling where the pin was flat, and nothing rising in it: both seats
    // have to hear a window gone as different from one opening.
    layers: [
      { source: "triangle", freq: 150, toFreq: 62, gain: 0.26, attack: 0.01, release: 0.32 },
      after(0.04, sub(46, 0.38, 0.34)),
      after(0.02, soft(0.55, air(5400, 3200, 0.45, 0.08, 1.2))),
    ],
  },
  {
    id: "boss.vaneHaul",
    family: "boss",
    blurb: "A seized housing hauled off a bearing: iron dragging, and a stop when it is clear.",
    status: "bound",
    use: "THE VANE's housing hauled open by player 2 under SEIZE — the shot counts now.",
    level: 0.42,
    // A drag that rises to its stop, the way THE WARDEN's thrown hatch does:
    // the seat that did not do it hears the window open. Triangle and not saw,
    // for that sound's reason: a saw's harmonics put a fifth of a second of it
    // in the 300-3000 Hz band, over a pair saying a column to each other.
    layers: [
      { source: "triangle", freq: 58, toFreq: 132, gain: 0.22, attack: 0.03, release: 0.26 },
      after(0.2, metal(76, 0.32, 0.3, 210)),
      after(0.2, sub(50, 0.34, 0.3)),
    ],
  },
  {
    id: "boss.vaneKnock",
    family: "boss",
    blurb: "A pin knocked out of a bearing: an iron crack, and the weight of the arm settling.",
    status: "bound",
    use: "A shot through THE VANE's split takes a pin out of the bearing — one fewer, and the last ends it.",
    level: 0.46,
    // The landing, THE HASP's `haspOpen` in shape: a struck metal under the
    // band first, then the mass of the thing it held dropping after it.
    layers: [
      metal(120, 0.5, 0.32, 150),
      after(0.04, thud(190, 70, 0.2, 0.38)),
      after(0.16, soft(0.5, sub(48, 0.4, 0.3))),
    ],
  },
];
