/**
 * THE FILAMENT's eleven, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **bundle of loose lines hanging from a body**, and
 * everything here is the sound of a line under tension and what happens to
 * one: the enter is a weight settling and the filaments swinging under it;
 * the arm is one filament lighting at its free end, a plucked note that
 * hangs; the drawn is a tile lit, a short plucked tick, pitched up as the
 * thumb climbs; the followed is the same tick softer and duller, the
 * navigator's, so the ear can tell the two thumbs apart; the snap is the
 * line breaking, a short bright crack and the slack falling; the recoil is
 * the two thumbs meeting, a dull knock and the line twanging back; the dark
 * is the light going out of the line, a falling air and nothing after it;
 * the late is a line left standing past its clock, a low sag and a drop.
 * The pulled is a filament coming out of the body, a long rising slide and
 * a release, pitched up per filament; the down is the last one out under
 * THE SLOW, the body loosening; the out is it dropping away. Low and soft
 * under the band, or short and high above it, as ever (docs/spec/audio.md
 * §1).
 */

import { after, air, glint, noise, soft, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_FILAMENT_SOUNDS: SoundDef[] = [
  {
    id: "boss.filamentEnter",
    family: "boss",
    blurb: "A weight settling over the field and the filaments swinging under it.",
    status: "bound",
    use: "THE FILAMENT arriving, no filament armed yet.",
    level: 0.36,
    layers: [swell(52, 1.3, 0.1), after(0.3, soft(0.5, spore(320, 0.6, 0.14, 60)))],
  },
  {
    id: "boss.filamentArm",
    family: "boss",
    blurb: "One filament lighting at its free end: a plucked note that hangs.",
    status: "bound",
    use: "A filament of THE FILAMENT armed — the thumbs may take it.",
    level: 0.4,
    layers: [glint(1800, 0.5, 0.16), after(0.05, soft(0.5, spore(900, 0.4, 0.12, 40)))],
  },
  {
    id: "boss.filamentDrawn",
    family: "boss",
    blurb: "A tile lit under the pilot's thumb: a short plucked tick, higher as it climbs.",
    status: "bound",
    use: "The pilot's thumb reaching the next tile of a filament. Pitched up per row.",
    level: 0.3,
    layers: [tick(0.2, 0, 2600), after(0.02, glint(1400, 0.16, 0.1))],
  },
  {
    id: "boss.filamentFollowed",
    family: "boss",
    blurb: "The same tick, softer and duller: the navigator's thumb on a lit tile.",
    status: "bound",
    use: "The navigator's thumb reaching the next lit tile. Pitched up per row.",
    level: 0.26,
    layers: [soft(0.5, tick(0.2, 0, 1800)), after(0.02, soft(0.5, spore(700, 0.14, 0.1, 30)))],
  },
  {
    id: "boss.filamentSnap",
    family: "boss",
    blurb: "The line breaking: a short bright crack and the slack falling.",
    status: "bound",
    use: "The pilot carrying faster than a tile a beat — the filament back to its free end.",
    level: 0.4,
    layers: [
      tick(0.26, 0, 3400),
      after(
        0.02,
        noise(0.05, { type: "highpass", freq: 2800, toFreq: 3800, q: 0.9 }, 0.002, 0.03, 0.4),
      ),
      after(0.08, air(2200, 600, 0.3, 0.12, 1.5)),
    ],
  },
  {
    id: "boss.filamentRecoil",
    family: "boss",
    blurb: "Two thumbs meeting: a dull knock and the line twanging back.",
    status: "bound",
    use: "The navigator's thumb reaching the pilot's — the filament back to its free end.",
    level: 0.36,
    layers: [
      thud(280, 140, 0.08, 0.3),
      after(0.03, spore(520, 0.3, 0.14, 80)),
      after(0.1, soft(0.4, sub(70, 0.25, 0.3))),
    ],
  },
  {
    id: "boss.filamentDark",
    family: "boss",
    blurb: "The light going out of the line: a falling air, and nothing after it.",
    status: "bound",
    use: "The gap past the window — the filament dark, back to its free end.",
    level: 0.34,
    layers: [air(1800, 400, 0.4, 0.14, 1.6), after(0.2, soft(0.4, sub(60, 0.3, 0.3)))],
  },
  {
    id: "boss.filamentLate",
    family: "boss",
    blurb: "A line left standing too long: a low sag and a drop.",
    status: "bound",
    use: "THE FILAMENT's clock run out with the line still — a strike on the hull.",
    level: 0.36,
    layers: [sub(90, 0.5, 0.3), after(0.12, soft(0.35, spore(260, 0.4, 0.12, -80)))],
  },
  {
    id: "boss.filamentPulled",
    family: "boss",
    blurb: "A filament coming out of the body: a long rising slide and a release.",
    status: "bound",
    use: "A filament traced end to end and pulled. Pitched up per filament.",
    level: 0.44,
    layers: [
      air(500, 2200, 0.28, 0.14, 1.6),
      after(0.16, glint(3200, 0.24, 0.16)),
      after(0.2, tick(0.16, 0, 3400)),
    ],
  },
  {
    id: "boss.filamentDown",
    family: "boss",
    blurb: "The last filament out: the whole body loosening, and the beat slowing under it.",
    status: "bound",
    use: "THE FILAMENT's seventh filament pulled — under THE SLOW.",
    level: 0.5,
    layers: [
      noise(0.1, { type: "highpass", freq: 3400, toFreq: 4600, q: 0.9 }, 0.002, 0.04, 0.5),
      after(0.05, air(5200, 7400, 0.4, 0.16, 1.4)),
      after(0.15, sub(44, 0.6, 0.4)),
    ],
  },
  {
    id: "boss.filamentOut",
    family: "boss",
    blurb: "The body dropping away: a weight going, and the field clearing.",
    status: "bound",
    use: "THE FILAMENT gone — then the wave-end light.",
    level: 0.5,
    layers: [
      sub(56, 0.5, 0.35),
      after(0.1, air(4200, 7000, 0.6, 0.14, 1.5)),
      after(0.4, glint(3200, 0.5, 0.14)),
      after(0.5, air(4200, 9000, 0.9, 0.16, 1.5)),
    ],
  },
];
