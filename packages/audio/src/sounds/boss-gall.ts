/**
 * THE GALL's ten, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a small creature charged by taps and thrown across the
 * hull**, and everything here is wet and elastic: the enter is it dropping
 * onto the seam, a low swell under a damp hiss; the light is a step waking,
 * one soft tick. A tap is a short squelch, pitched up as the charge builds;
 * a refused hand is a rising puff. The leap is it springing loose, a pop and
 * a rush of air; the landing is a soft knock on the other half. The hit is a
 * shot into it, a flash; the miss is the hull's dull strike; the flat is it
 * dropping dead, and the out the field clearing. Low and soft under the
 * band, or short and high above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_GALL_SOUNDS: SoundDef[] = [
  {
    id: "boss.gallEnter",
    family: "boss",
    blurb: "A seam rising under the hull: a low swell under a damp hiss.",
    status: "bound",
    use: "THE GALL arriving, dropping onto the seam's first point.",
    level: 0.42,
    layers: [
      swell(58, 1.0, 0.12),
      after(0.3, noise(1200, { type: "bandpass", freq: 1200, q: 1.5 }, 0.03, 0.3, 0.04)),
    ],
  },
  {
    id: "boss.gallLight",
    family: "boss",
    blurb: "One soft tick: a step waking.",
    status: "bound",
    use: "A step lit: THE GALL to tap and throw, or to shoot where it sits.",
    level: 0.34,
    layers: [tick(0.2, 0, 2700), after(0.06, tick(0.08, 0, 3100))],
  },

  {
    id: "boss.gallTap",
    family: "boss",
    blurb: "A short squelch: the creature wound tighter by a tap.",
    status: "bound",
    use: "A tap charged THE GALL. Pitched up per tap, so the charge is heard building.",
    level: 0.32,
    layers: [spore(420, 0.12, 0.18, 40), after(0.02, thud(300, 180, 0.04, 0.08))],
  },
  {
    id: "boss.gallWhiff",
    family: "boss",
    blurb: "A rising puff: a hand the creature would not take.",
    status: "bound",
    use: "A tap or pull refused: the other half, an empty point, a pull too early, or the wrong way.",
    level: 0.3,
    layers: [air(500, 1400, 0.18, 0.1, 2)],
  },
  {
    id: "boss.gallLeap",
    family: "boss",
    blurb: "A pop and a rush of air: the creature springing loose.",
    status: "bound",
    use: "A charged pull threw THE GALL toward the other half.",
    level: 0.42,
    layers: [glint(1800, 0.12, 0.12), after(0.04, air(600, 2400, 0.4, 0.12, 1.5))],
  },
  {
    id: "boss.gallLand",
    family: "boss",
    blurb: "A soft knock: the creature coming down on the other half.",
    status: "bound",
    use: "THE GALL landed; panned to where it landed, and the clock starts again.",
    level: 0.4,
    layers: [thud(260, 140, 0.05, 0.14), after(0.03, spore(300, 0.1, 0.12, 30))],
  },
  {
    id: "boss.gallHit",
    family: "boss",
    blurb: "A flash: a bright ring and a knock into the creature.",
    status: "bound",
    use: "A shot in the step's colour into THE GALL where it sits. Pitched up per hit.",
    level: 0.44,
    layers: [glint(2800, 0.3, 0.18), after(0.02, thud(240, 115, 0.1, 0.22))],
  },
  {
    id: "boss.gallMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.gallFlat",
    family: "boss",
    blurb: "The creature dropping dead: a low fall under a rising hiss.",
    status: "bound",
    use: "Every step answered — THE GALL drops dead.",
    level: 0.46,
    layers: [sub(50, 0.7, 0.3), after(0.02, air(1200, 3200, 0.5, 0.14, 1.5))],
  },
  {
    id: "boss.gallOut",
    family: "boss",
    blurb: "The dead creature sinking away, and the field clearing.",
    status: "bound",
    use: "THE GALL gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE CAPSTAN's own out (`sounds/boss-capstan.ts`).
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
