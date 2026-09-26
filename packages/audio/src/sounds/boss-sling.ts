/**
 * THE SLING's twelve, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a forked arm with two bands**, and everything here is a band
 * pulled and let go: the enter is the fork bolting in, a low swell with a
 * faint creak; the light is a step waking, one bright tick. A slack is a band
 * let go too soon, a short limp flap; a loose is a draw let fly true, a taut
 * twang, pitched up on an arm's second draw; the spring is an arm snapping
 * back undrawn, a falling whistle. The yoke is both arms locked and the yoke
 * lighting, the hit a shot into it — a flash — the steady both arms redrawn
 * under it, a quieter hum, and the dim the yoke springing loose. The miss is
 * the hull's dull strike, the free the fork snapping forward, and the out the
 * field clearing. Low and soft under the band, or short and high above it, as
 * ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_SLING_SOUNDS: SoundDef[] = [
  {
    id: "boss.slingEnter",
    family: "boss",
    blurb: "A fork bolting into frame: a low swell and a faint creak.",
    status: "bound",
    use: "THE SLING arriving, both arms slack and the yoke dark.",
    level: 0.42,
    layers: [
      swell(58, 1.0, 0.12),
      after(0.3, noise(700, { type: "bandpass", freq: 700, toFreq: 950, q: 6 }, 0.02, 0.2, 0.08)),
    ],
  },
  {
    id: "boss.slingLight",
    family: "boss",
    blurb: "One bright tick: a step on the fork waking.",
    status: "bound",
    use: "A step lit: an arm's draw, a shot at the yoke, or both arms redrawn.",
    level: 0.36,
    layers: [tick(0.24, 0, 3000), after(0.05, tick(0.1, 0, 3600))],
  },
  {
    id: "boss.slingSlack",
    family: "boss",
    blurb: "A short limp flap: a band let go too soon or the wrong way.",
    status: "bound",
    use: "A lift too early, toward the wrong side or with no swipe; the count starts again.",
    level: 0.32,
    layers: [thud(180, 120, 0.05, 0.1), after(0.02, air(1600, 1100, 0.1, 0.08, 1.5))],
  },
  {
    id: "boss.slingLoose",
    family: "boss",
    blurb: "A taut twang: a draw let fly true.",
    status: "bound",
    use: "A draw held home and loosed toward the lit side. Pitched up per draw.",
    level: 0.44,
    layers: [glint(1400, 0.28, 0.16), after(0.01, air(2400, 4200, 0.12, 0.1, 1.5))],
  },
  {
    id: "boss.slingSpring",
    family: "boss",
    blurb: "A falling whistle: an arm snapping back undrawn.",
    status: "bound",
    use: "A one-arm draw step run out before it was loosed true.",
    level: 0.38,
    layers: [air(3200, 1500, 0.22, 0.12, 1.5), after(0.05, thud(200, 110, 0.06, 0.14))],
  },
  {
    id: "boss.slingYoke",
    family: "boss",
    blurb: "A yoke lighting: a rising shimmer over a low hum.",
    status: "bound",
    use: "Both arms drawn, and the yoke lit to a shot.",
    level: 0.44,
    layers: [sub(64, 0.3, 0.16), after(0.04, air(2400, 5200, 0.35, 0.14, 1.5))],
  },
  {
    id: "boss.slingHit",
    family: "boss",
    blurb: "A flash: a bright ring and a soft knock into the yoke.",
    status: "bound",
    use: "A shot in the step's colour into the lit yoke. Pitched up per hit.",
    level: 0.44,
    layers: [glint(3000, 0.3, 0.18), after(0.02, thud(240, 115, 0.1, 0.22))],
  },
  {
    id: "boss.slingSteady",
    family: "boss",
    blurb: "A quieter hum: both arms redrawn under the yoke.",
    status: "bound",
    use: "Both draws loosed true together, keeping the yoke lit.",
    level: 0.34,
    layers: [sub(58, 0.35, 0.14), after(0.05, glint(1900, 0.2, 0.08))],
  },
  {
    id: "boss.slingDim",
    family: "boss",
    blurb: "A fading hum: the yoke springing loose.",
    status: "bound",
    use: "A both-draws step run out: the yoke dark, and the step lights again.",
    level: 0.36,
    layers: [swell(68, 0.4, 0.14), after(0.1, air(1700, 850, 0.25, 0.08, 1.5))],
  },
  {
    id: "boss.slingMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.slingFree",
    family: "boss",
    blurb: "A fork snapping forward: a bright crack over a low fall.",
    status: "bound",
    use: "Every step answered — the fork snaps forward, spent.",
    level: 0.46,
    layers: [
      sub(50, 0.7, 0.3),
      after(
        0.02,
        noise(3800, { type: "bandpass", freq: 3800, toFreq: 2400, q: 2 }, 0.005, 0.3, 0.18),
      ),
    ],
  },
  {
    id: "boss.slingOut",
    family: "boss",
    blurb: "The spent fork falling away, and the field clearing.",
    status: "bound",
    use: "THE SLING gone — then the wave-end light.",
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
