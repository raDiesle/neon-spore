/**
 * THE TRIVET's twelve, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a gunmetal stand on three splayed feet**, and everything here
 * is metal on metal: the enter is the stand dropping onto the field, a low
 * swell with a dull ring; the light is a step waking, one bright tick. A slip
 * is a pad lifting off, a short scrape; a plant is a foot driven home, §28's
 * soft hull-shock thud, pitched up as the foot goes deeper; the spring is a
 * leg jumping back up, a short metallic ring. The hub is the ring lighting,
 * the hit a shot into it — a flash — the brace both feet held under it, a
 * quieter thud, and the rock the stand tipping back up. The miss is the
 * hull's dull strike, the collapse all three feet buckling at once, and the
 * out the field clearing. Low and soft under the band, or short and high
 * above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_TRIVET_SOUNDS: SoundDef[] = [
  {
    id: "boss.trivetEnter",
    family: "boss",
    blurb: "A stand dropping into frame: a low swell and a dull ring.",
    status: "bound",
    use: "THE TRIVET arriving, both feet lifted and the hub dark.",
    level: 0.42,
    layers: [swell(52, 1.0, 0.12), after(0.3, glint(1800, 0.3, 0.1))],
  },
  {
    id: "boss.trivetLight",
    family: "boss",
    blurb: "One bright tick: a step on the stand waking.",
    status: "bound",
    use: "A step lit: a foot's chord, a shot at the hub, or both chords held.",
    level: 0.36,
    layers: [tick(0.24, 0, 3400), after(0.05, tick(0.1, 0, 4000))],
  },
  {
    id: "boss.trivetSlip",
    family: "boss",
    blurb: "A short scrape: a pad lifting off in a held chord.",
    status: "bound",
    use: "A pad let up in a lit chord step; the count starts again.",
    level: 0.34,
    layers: [noise(1600, { type: "bandpass", freq: 1600, toFreq: 1100, q: 3 }, 0.01, 0.1, 0.16)],
  },
  {
    id: "boss.trivetPlant",
    family: "boss",
    blurb: "A soft dull thud and a clink: a foot driven home.",
    status: "bound",
    use: "A foot's chord held long enough to plant it. Pitched up per plant.",
    level: 0.46,
    layers: [thud(230, 105, 0.12, 0.3), after(0.02, glint(2200, 0.12, 0.1))],
  },
  {
    id: "boss.trivetSpring",
    family: "boss",
    blurb: "A short metallic ring: a leg springing back up.",
    status: "bound",
    use: "A one-foot chord run out before it was held long enough.",
    level: 0.38,
    layers: [glint(1400, 0.22, 0.14), after(0.03, air(1800, 3400, 0.16, 0.1, 1.5))],
  },
  {
    id: "boss.trivetHub",
    family: "boss",
    blurb: "A ring lighting: a rising shimmer over a low hum.",
    status: "bound",
    use: "Both feet home, and the hub lit to a shot.",
    level: 0.44,
    layers: [sub(62, 0.3, 0.16), after(0.04, air(2400, 5200, 0.35, 0.14, 1.5))],
  },
  {
    id: "boss.trivetHit",
    family: "boss",
    blurb: "A flash: a bright ring and a soft knock into the hub.",
    status: "bound",
    use: "A shot in the step's colour into the lit hub. Pitched up per hit.",
    level: 0.44,
    layers: [glint(3000, 0.3, 0.18), after(0.02, thud(240, 110, 0.1, 0.24))],
  },
  {
    id: "boss.trivetBrace",
    family: "boss",
    blurb: "A quieter thud: both feet held under the hub.",
    status: "bound",
    use: "Both chords held long enough to keep the hub down and lit.",
    level: 0.34,
    layers: [thud(200, 100, 0.1, 0.24), after(0.06, sub(58, 0.25, 0.14))],
  },
  {
    id: "boss.trivetRock",
    family: "boss",
    blurb: "A low tilt and a clank: the stand rocking back up.",
    status: "bound",
    use: "A both-chords hold run out: the hub dark, and the step lights again.",
    level: 0.38,
    layers: [thud(170, 85, 0.2, 0.3), after(0.08, glint(1200, 0.18, 0.1))],
  },
  {
    id: "boss.trivetMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.trivetCollapse",
    family: "boss",
    blurb: "Three feet buckling at once: a metal crunch over a low fall.",
    status: "bound",
    use: "Every step answered — the stand collapses.",
    level: 0.46,
    layers: [
      sub(50, 0.8, 0.3),
      after(
        0.03,
        noise(3800, { type: "bandpass", freq: 3800, toFreq: 2400, q: 2 }, 0.01, 0.45, 0.18),
      ),
    ],
  },
  {
    id: "boss.trivetOut",
    family: "boss",
    blurb: "The fallen stand drifting away, and the field clearing.",
    status: "bound",
    use: "THE TRIVET gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE VISE's own out (`sounds/boss-vise.ts`).
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
