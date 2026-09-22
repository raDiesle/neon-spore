/**
 * THE GIMBAL's ten, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **sealed drum in two metal rings**, and everything here is
 * the sound of turned metal and what a bearing does: the enter is a mass
 * dropping into a cradle and the rings ringing once under it; the marks are
 * two small bells, one per seat, struck together; the true is the pair of
 * them coming into one note and holding, which is the only sustained sound in
 * the fight and the one the hold is counted against; the slip is that note
 * bending apart and going out. The shear is a tooth breaking, a hard metal
 * crack pitched up as the teeth go; the leak is the drum swinging loose and a
 * spark starting, a thin hiss under a low swing; the seamOut is the bolt
 * shutting it, short and bright; the seamHit is the spark arriving on the
 * hull, a dull heavy strike. The hatch is the last pair gone and the two
 * rings spinning free, a rising metallic slide under THE SLOW; the out is the
 * drum dropping away. Low and soft under the band, or short and high above
 * it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, metal, noise, soft, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_GIMBAL_SOUNDS: SoundDef[] = [
  {
    id: "boss.gimbalEnter",
    family: "boss",
    blurb: "A mass settling into a cradle, and two rings ringing once under it.",
    status: "bound",
    use: "THE GIMBAL arriving, both rings dark and still.",
    level: 0.38,
    layers: [swell(48, 1.4, 0.1), after(0.25, soft(0.5, metal(420, 0.7, 0.16, 300)))],
  },
  {
    id: "boss.gimbalMarks",
    family: "boss",
    blurb: "Two small bells struck together: a mark on each ring.",
    status: "bound",
    use: "An alignment of THE GIMBAL lighting. Pitched up per alignment.",
    level: 0.4,
    layers: [glint(1700, 0.5, 0.16), after(0.03, soft(0.6, glint(2300, 0.44, 0.12)))],
  },
  {
    id: "boss.gimbalTrue",
    family: "boss",
    blurb: "The two bells coming into one note and holding it, low under the band.",
    status: "bound",
    use: "Both rings inside their marks together — the hold has begun.",
    level: 0.34,
    // The only held sound in the fight, so it is the one that most has to
    // stay out of the pair's way: the note is under the speech band and what
    // rides above it is a thin glint (`docs/spec/audio.md` §1).
    layers: [metal(220, 1.1, 0.22, 190), after(0.04, soft(0.5, glint(3400, 0.9, 0.12)))],
  },
  {
    id: "boss.gimbalSlip",
    family: "boss",
    blurb: "That note bending apart and going out.",
    status: "bound",
    use: "A ring left its mark before the hold was up.",
    level: 0.32,
    layers: [air(1300, 520, 0.36, 0.14, 1.6), after(0.16, soft(0.4, sub(64, 0.3, 0.28)))],
  },
  {
    id: "boss.gimbalShear",
    family: "boss",
    blurb: "A tooth breaking off each rim: a hard metal crack.",
    status: "bound",
    use: "A tooth pair sheared. Pitched up as the teeth go.",
    level: 0.44,
    layers: [
      tick(0.26, 0, 3200),
      after(0.01, metal(560, 0.34, 0.26, 280)),
      after(0.06, soft(0.5, sub(72, 0.28, 0.3))),
    ],
  },
  {
    id: "boss.gimbalLeak",
    family: "boss",
    blurb: "The drum swinging loose, and a thin spark starting from its seam.",
    status: "bound",
    use: "One tooth pair left — the seam is leaking and takes either colour.",
    level: 0.38,
    layers: [
      swell(58, 0.9, 0.09),
      after(
        0.1,
        noise(0.5, { type: "bandpass", freq: 2400, toFreq: 3000, q: 1.4 }, 0.02, 0.2, 0.2),
      ),
    ],
  },
  {
    id: "boss.gimbalSeamOut",
    family: "boss",
    blurb: "The bolt shutting it: short and bright, and the hiss gone.",
    status: "bound",
    use: "The leaking seam shot out, in either colour.",
    level: 0.4,
    layers: [glint(2800, 0.28, 0.18), after(0.04, air(2600, 900, 0.22, 0.12, 1.5))],
  },
  {
    id: "boss.gimbalSeamHit",
    family: "boss",
    blurb: "The spark arriving on the hull: a dull, heavy strike.",
    status: "bound",
    use: "Nobody shot the seam — one strike on the hull, which is the wave.",
    level: 0.46,
    layers: [thud(240, 110, 0.12, 0.34), after(0.04, sub(48, 0.4, 0.36))],
  },
  {
    id: "boss.gimbalHatch",
    family: "boss",
    blurb: "Both rings spinning free and the drum splitting: a rising metal slide.",
    status: "bound",
    use: "THE GIMBAL's last tooth pair sheared — under THE SLOW.",
    level: 0.5,
    // The slide starts above the speech band rather than climbing through it:
    // the hatch runs under THE SLOW, which is the longest the pair go without
    // being able to talk over a sound (`docs/spec/audio.md` §1).
    layers: [
      air(3400, 6600, 0.42, 0.16, 1.5),
      after(0.18, metal(180, 0.5, 0.22, 150)),
      after(0.24, sub(44, 0.6, 0.4)),
    ],
  },
  {
    id: "boss.gimbalOut",
    family: "boss",
    blurb: "The opened drum dropping away, and the field clearing.",
    status: "bound",
    use: "THE GIMBAL gone — then the wave-end light.",
    level: 0.5,
    layers: [
      sub(54, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
