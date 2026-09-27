/**
 * THE GALL's eleven, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a soft nodule on a seam, pinched shut and moving**, and
 * everything here is wet and elastic: the enter is the seam rising, a low
 * swell under a damp hiss; the light is a step waking, one soft tick. The
 * pinch is the gall squeezed shut, a short squelch; the slip is it bulging
 * back out between the fingers, a rising puff. The close is the gall
 * popping loose and landing on another point, a pop and a soft knock, pitched
 * up per close; the swell is a window run out, the gall filling back. The
 * bare is the root showing, a hum with a glint; the hit is a shot into it, a
 * flash; the miss is the hull's dull strike; the flat is the seam smoothing
 * down, spent, and the out the field clearing. Low and soft under the band,
 * or short and high above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_GALL_SOUNDS: SoundDef[] = [
  {
    id: "boss.gallEnter",
    family: "boss",
    blurb: "A seam rising under the hull: a low swell under a damp hiss.",
    status: "bound",
    use: "THE GALL arriving, slack on the seam's first point.",
    level: 0.42,
    layers: [
      swell(58, 1.0, 0.12),
      after(0.3, noise(1200, { type: "bandpass", freq: 1200, q: 1.5 }, 0.03, 0.3, 0.04)),
    ],
  },
  {
    id: "boss.gallLight",
    family: "boss",
    blurb: "One soft tick: a step on the seam waking.",
    status: "bound",
    use: "A step lit: the gall to pinch shut where it sits, or the root to shoot.",
    level: 0.34,
    layers: [tick(0.2, 0, 2700), after(0.06, tick(0.08, 0, 3100))],
  },
  {
    id: "boss.gallPinch",
    family: "boss",
    blurb: "A short squelch: the gall squeezed shut.",
    status: "bound",
    use: "The pinch on the gall's point came shut; the count of beats begins.",
    level: 0.32,
    layers: [spore(420, 0.12, 0.18, 40), after(0.02, thud(300, 180, 0.04, 0.08))],
  },
  {
    id: "boss.gallSlip",
    family: "boss",
    blurb: "A rising puff: the gall bulging back out between the fingers.",
    status: "bound",
    use: "The shut pinch widened before the count was done; it starts again.",
    level: 0.3,
    layers: [air(500, 1400, 0.18, 0.1, 2)],
  },
  {
    id: "boss.gallClose",
    family: "boss",
    blurb: "A pop and a soft knock: the gall closing and landing somewhere else.",
    status: "bound",
    use: "A close landed and the gall jumped; panned to where it landed. Pitched up per close.",
    level: 0.42,
    layers: [glint(1800, 0.12, 0.12), after(0.08, thud(260, 140, 0.05, 0.14))],
  },
  {
    id: "boss.gallSwell",
    family: "boss",
    blurb: "A slow fill: the gall swelling back where it sits.",
    status: "bound",
    use: "A close window ran out; the same close is asked again, the gall where it was.",
    level: 0.34,
    layers: [air(400, 900, 0.3, 0.1, 2), after(0.1, thud(170, 120, 0.05, 0.1))],
  },
  {
    id: "boss.gallBare",
    family: "boss",
    blurb: "A low hum and a glint: the root showing.",
    status: "bound",
    use: "Three closes landed; the root lies bare to a shot.",
    level: 0.44,
    layers: [sub(64, 0.35, 0.16), after(0.04, glint(2200, 0.25, 0.12))],
  },
  {
    id: "boss.gallHit",
    family: "boss",
    blurb: "A flash: a bright ring and a knock into the root.",
    status: "bound",
    use: "A shot in the step's colour into the bared root. Pitched up per hit.",
    level: 0.44,
    layers: [glint(2800, 0.3, 0.18), after(0.02, thud(240, 115, 0.1, 0.22))],
  },
  {
    id: "boss.gallMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.gallFlat",
    family: "boss",
    blurb: "The seam smoothing down: a low fall under a rising hiss.",
    status: "bound",
    use: "Every step answered — the seam goes flat, spent.",
    level: 0.46,
    layers: [sub(50, 0.7, 0.3), after(0.02, air(1200, 3200, 0.5, 0.14, 1.5))],
  },
  {
    id: "boss.gallOut",
    family: "boss",
    blurb: "The flat seam sinking away, and the field clearing.",
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
