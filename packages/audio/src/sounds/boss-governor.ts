/**
 * THE GOVERNOR's twelve, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a brass governor with a needle running round a dial**, and
 * everything here is brass and bearings: the enter is the flyweights spun up,
 * a low swell under a whirr; the light is a mark struck on the dial, one bright
 * tick. A tap landed on a mark is a short high tick, pitched up through the
 * step's marks; a skid is a scrape of brass. The hub
 * lighting is a ring, the retap a smaller one, the sway a wobble of air and
 * the dim a ring cut off. The hit is a shot into the hub, the miss the hull's
 * dull strike, the spent the flyweights falling, and the out the field
 * clearing. Low and soft under the band, or short and high above it, as ever
 * (`docs/spec/audio.md` §1).
 */

import { after, air, glint, metal, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_GOVERNOR_SOUNDS: SoundDef[] = [
  {
    id: "boss.governorEnter",
    family: "boss",
    blurb: "Flyweights spun up: a low swell under a whirr.",
    status: "bound",
    use: "THE GOVERNOR arriving, the needle turning on its dial.",
    level: 0.42,
    layers: [swell(64, 1.1, 0.12), after(0.2, air(500, 1800, 0.6, 0.06, 2.4))],
  },
  {
    id: "boss.governorLight",
    family: "boss",
    blurb: "One bright tick: a mark struck on the dial.",
    status: "bound",
    use: "A step lit: marks to tap, marks to tap again, or the hub to shoot.",
    level: 0.34,
    layers: [tick(0.2, 0, 3100), after(0.06, tick(0.08, 0, 3600))],
  },
  {
    id: "boss.governorTick",
    family: "boss",
    blurb: "A short high tick on the mark.",
    status: "bound",
    use: "A tap landed as the needle crossed a mark. Pitched up through the step's marks.",
    level: 0.38,
    layers: [tick(0.24, 0, 4600), after(0.02, glint(3600, 0.06, 0.08))],
  },
  {
    id: "boss.governorSkid",
    family: "boss",
    blurb: "A scrape of brass: a tap off the mark.",
    status: "bound",
    use: "A tap with the needle away from the mark; it goes round again.",
    level: 0.26,
    layers: [noise(700, { type: "bandpass", freq: 700, q: 1.4 }, 0.01, 0.1, 0.09)],
  },
  {
    id: "boss.governorHub",
    family: "boss",
    blurb: "A brass ring: the hub lit.",
    status: "bound",
    use: "Three taps each; the hub lights to be shot.",
    level: 0.44,
    layers: [metal(220, 0.35, 0.18, 280), after(0.04, glint(3600, 0.25, 0.12))],
  },
  {
    id: "boss.governorRetap",
    family: "boss",
    blurb: "A smaller ring: the hub lit again.",
    status: "bound",
    use: "A retap landed on the mark; the hub lights again.",
    level: 0.38,
    layers: [metal(640, 0.35, 0.14, 1100), after(0.02, tick(0.12, 0, 4200))],
  },
  {
    id: "boss.governorSway",
    family: "boss",
    blurb: "A wobble of air: a mark gone by untapped.",
    status: "bound",
    use: "A tap window ran out; the same mark is asked again.",
    level: 0.3,
    layers: [air(1400, 600, 0.35, 0.08, 2)],
  },
  {
    id: "boss.governorDim",
    family: "boss",
    blurb: "A ring cut off: the hub gone dark.",
    status: "bound",
    use: "A retap window ran out; the hub is dark until the retap is made.",
    level: 0.34,
    layers: [metal(480, 0.12, 0.14, 700), after(0.06, thud(200, 120, 0.06, 0.1))],
  },
  {
    id: "boss.governorHit",
    family: "boss",
    blurb: "A flash: a bright ring and a knock into the hub.",
    status: "bound",
    use: "A shot in the step's colour into the lit hub. Pitched up per hit.",
    level: 0.44,
    layers: [glint(2800, 0.3, 0.18), after(0.02, thud(260, 130, 0.1, 0.22))],
  },
  {
    id: "boss.governorMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(200, 90, 0.14, 0.34), after(0.05, sub(42, 0.45, 0.36))],
  },
  {
    id: "boss.governorSpent",
    family: "boss",
    blurb: "The flyweights falling: a low fall under a winding-down whirr.",
    status: "bound",
    use: "Every step answered — the hub spent, the needle stalled.",
    level: 0.46,
    layers: [sub(52, 0.7, 0.3), after(0.02, air(6400, 3400, 0.8, 0.12, 2))],
  },
  {
    id: "boss.governorOut",
    family: "boss",
    blurb: "The governor sliding away, and the field clearing.",
    status: "bound",
    use: "THE GOVERNOR gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE FLUE's own out (`sounds/boss-flue.ts`).
    layers: [
      sub(48, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3100, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
