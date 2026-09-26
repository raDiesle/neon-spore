/**
 * THE GRINDSTONE's thirteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a wheel on an axle in a caliper**, and everything here is
 * stone rubbed and jaws shut: the enter is the wheel rolling in, a low swell
 * with a gritty hiss; the light is a step waking, one bright tick. A shave is
 * a thumb's reversal taking grit off, a short rasp, pitched up as the flat
 * comes clean; the clear is a flat ground true, a clean ring; the regrit is a
 * pass run out and the flat caking over, a dull crumble. The bite is the
 * caliper shutting on two clean flats, a heavy clack and a hum; the slip is a
 * pad lifting, a scrape; the clamp is the jaws held home, a firm knock; the
 * loose is the caliper springing open, a falling whistle. The hit is a shot
 * into the axle — a flash — the miss the hull's dull strike, the free the
 * wheel spinning off true, and the out the field clearing. Low and soft under
 * the band, or short and high above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_GRINDSTONE_SOUNDS: SoundDef[] = [
  {
    id: "boss.grindstoneEnter",
    family: "boss",
    blurb: "A wheel rolling into frame: a low swell and a gritty hiss.",
    status: "bound",
    use: "THE GRINDSTONE arriving, both flats gritted and the caliper open.",
    level: 0.42,
    layers: [
      swell(56, 1.0, 0.12),
      after(
        0.25,
        noise(1800, { type: "bandpass", freq: 1800, toFreq: 1200, q: 3 }, 0.05, 0.4, 0.07),
      ),
    ],
  },
  {
    id: "boss.grindstoneLight",
    family: "boss",
    blurb: "One bright tick: a step on the wheel waking.",
    status: "bound",
    use: "A step lit: a flat to grind, a clamp to hold, or a shot at the axle.",
    level: 0.36,
    layers: [tick(0.24, 0, 2800), after(0.05, tick(0.1, 0, 3400))],
  },
  {
    id: "boss.grindstoneShave",
    family: "boss",
    blurb: "A short rasp: a reversal taking grit off the flat.",
    status: "bound",
    use: "A fresh reversal on the lit flat by its own seat. Pitched up as the flat comes clean.",
    level: 0.28,
    layers: [noise(2600, { type: "bandpass", freq: 2600, toFreq: 3200, q: 4 }, 0.005, 0.07, 0.1)],
  },
  {
    id: "boss.grindstoneClear",
    family: "boss",
    blurb: "A clean ring: a flat ground true.",
    status: "bound",
    use: "A pass answered: the lit flat's grit down to nought. Pitched up per pass.",
    level: 0.42,
    layers: [glint(1600, 0.3, 0.16), after(0.02, air(2600, 4400, 0.14, 0.1, 1.5))],
  },
  {
    id: "boss.grindstoneRegrit",
    family: "boss",
    blurb: "A dull crumble: the flat caking over.",
    status: "bound",
    use: "A pass run out: the flat solid again and its first pass asked once more.",
    level: 0.36,
    layers: [
      thud(170, 110, 0.06, 0.16),
      after(0.03, noise(900, { type: "lowpass", freq: 900, toFreq: 500, q: 1 }, 0.02, 0.25, 0.08)),
    ],
  },
  {
    id: "boss.grindstoneBite",
    family: "boss",
    blurb: "A heavy clack and a hum: the caliper shutting on the axle.",
    status: "bound",
    use: "Both flats clean: the caliper locks and the axle lights to a shot.",
    level: 0.44,
    layers: [thud(260, 120, 0.04, 0.14), after(0.04, sub(62, 0.3, 0.16))],
  },
  {
    id: "boss.grindstoneSlip",
    family: "boss",
    blurb: "A short scrape: a pad lifting off the jaw.",
    status: "bound",
    use: "A pad lifted while a clamp was being held; the count starts again.",
    level: 0.32,
    layers: [air(1800, 1100, 0.1, 0.1, 1.5), after(0.02, thud(190, 130, 0.04, 0.08))],
  },
  {
    id: "boss.grindstoneClamp",
    family: "boss",
    blurb: "A firm knock: the jaws held home.",
    status: "bound",
    use: "Every pad of both jaws held down for the clamp's beats.",
    level: 0.4,
    layers: [thud(230, 105, 0.08, 0.2), after(0.04, glint(1800, 0.18, 0.08))],
  },
  {
    id: "boss.grindstoneLoose",
    family: "boss",
    blurb: "A falling whistle: the caliper springing open.",
    status: "bound",
    use: "A clamp run out: the caliper loose, the axle dark, and the clamp asked again.",
    level: 0.38,
    layers: [air(3000, 1400, 0.24, 0.12, 1.5), after(0.06, swell(66, 0.35, 0.12))],
  },
  {
    id: "boss.grindstoneHit",
    family: "boss",
    blurb: "A flash: a bright ring and a soft knock into the axle.",
    status: "bound",
    use: "A shot in the step's colour into the locked axle. Pitched up per hit.",
    level: 0.44,
    layers: [glint(3000, 0.3, 0.18), after(0.02, thud(240, 115, 0.1, 0.22))],
  },
  {
    id: "boss.grindstoneMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.grindstoneFree",
    family: "boss",
    blurb: "A wheel spinning off true: a rising whirr over a low fall.",
    status: "bound",
    use: "Every step answered — the wheel spins free, spent.",
    level: 0.46,
    layers: [sub(50, 0.7, 0.3), after(0.02, air(1400, 3600, 0.5, 0.14, 1.5))],
  },
  {
    id: "boss.grindstoneOut",
    family: "boss",
    blurb: "The spent wheel rolling away, and the field clearing.",
    status: "bound",
    use: "THE GRINDSTONE gone — then the wave-end light.",
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
