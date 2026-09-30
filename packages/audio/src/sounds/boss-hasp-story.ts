/**
 * THE HASP's story between the hasps (`sim/hasp-story.ts`, §20 S1–S4): the two
 * openings that needed a voice of their own, beside `boss-hasp.ts`, which is
 * full.
 *
 * **The rattle is a loose pin knocking in its hinge** — five quick dry knocks
 * above the voice, over a low door-weight thud — because the borrowed lit was
 * one knock and said *a clasp is ready*, where the rattle is a door that will
 * not stop shaking until his grip is kept on it.
 *
 * **The rust is a crusted grind**, low and rough, with a crackle of flakes
 * over it. It borrowed the seize, and a seize is the one sound on this boss
 * that tells her to take her thumb off the rim; the rust asks her to rock it.
 * Two openings with the same voice and opposite answers is the thing a pair
 * would learn wrongly by ear, so it is the one that could not stay borrowed.
 *
 * The other ten stay on the door's voice (`bind-hasp.ts` says why). Low under
 * the band or short and high above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, noise, soft, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

/** The pin's knocks: how many, and how far apart in seconds. */
const KNOCKS = 5;
const KNOCK_GAP = 0.045;
/** The flakes' crackle over the grind. */
const FLAKES = 6;
const FLAKE_GAP = 0.05;

export const BOSS_HASP_STORY_SOUNDS: SoundDef[] = [
  {
    id: "boss.haspRattle",
    family: "boss",
    blurb: "A loose pin knocking in its hinge, quick and dry, over the door's weight.",
    status: "bound",
    use: "THE HASP's rattle — a door shaking on its hinge until player 1's grip is kept.",
    level: 0.34,
    layers: [
      thud(150, 90, 0.12, 0.3),
      ...Array.from({ length: KNOCKS }, (_, k) =>
        soft(1 - k * 0.12, tick(0.22, k * KNOCK_GAP, 4200 + (k % 2) * 700)),
      ),
    ],
  },
  {
    id: "boss.haspRust",
    family: "boss",
    blurb: "A crusted grind, low and rough, with a crackle of flakes over it.",
    status: "bound",
    use: "THE HASP's rust — the hasp furred shut; she rocks the wheel while he holds.",
    level: 0.36,
    layers: [
      noise(180, { type: "lowpass", freq: 200, q: 1.4 }, 0.02, 0.28, 0.3),
      after(0.02, soft(0.6, sub(56, 0.34, 0.3))),
      ...Array.from({ length: FLAKES }, (_, k) =>
        soft(0.8 - k * 0.08, tick(0.18, 0.04 + k * FLAKE_GAP, 5600 - (k % 3) * 500)),
      ),
    ],
  },
];
