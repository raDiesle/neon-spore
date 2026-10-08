/**
 * THE CAPSTAN's fourteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a rusted drum worked bright**, and everything here is iron
 * turned and scoured: the enter is the drum settling on its cradle, a low
 * swell under a grating hiss; the light is a step waking, one soft tick. The
 * rock is the cradle tipping a face over, a heavy creak and a knock; the
 * drift is it settling back, a lighter creak. The wear is one reversal
 * scouring a band, a short rasp, pitched up as the band brightens; the bright
 * is a band worn clean, a ring. The bare is the core showing, a hum with a
 * glint; the kept is the rust held off, a firm clank; the stall is a window
 * run out, the drum grinding to a halt; the cover is rust closing over the
 * core, a dull fall. The hit is a shot into the core, a flash; the miss is the
 * hull's dull strike; the open is the cap swinging wide, spent, and the out
 * the field clearing. Low and soft under the band, or short and high above
 * it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_CAPSTAN_SOUNDS: SoundDef[] = [
  {
    id: "boss.capstanEnter",
    family: "boss",
    blurb: "A drum settling on its cradle: a low swell under a grating hiss.",
    status: "bound",
    use: "THE CAPSTAN arriving, both bands rusted and the core covered.",
    level: 0.42,
    layers: [
      swell(54, 1.0, 0.12),
      after(0.3, noise(1800, { type: "bandpass", freq: 1800, q: 2 }, 0.02, 0.3, 0.04)),
    ],
  },
  {
    id: "boss.capstanLight",
    family: "boss",
    blurb: "One soft tick: a step on the drum waking.",
    status: "bound",
    use: "A step lit: a band to steer and rub, a hold, or the core to shoot.",
    level: 0.34,
    layers: [tick(0.2, 0, 2900), after(0.06, tick(0.08, 0, 3300))],
  },
  {
    id: "boss.capstanRock",
    family: "boss",
    blurb: "A heavy creak and a knock: the cradle tipping a face over.",
    status: "bound",
    use: "The steering seat's lean passed the mark and bared a face.",
    level: 0.36,
    layers: [air(700, 500, 0.22, 0.1, 3), after(0.12, thud(190, 120, 0.05, 0.14))],
  },
  {
    id: "boss.capstanDrift",
    family: "boss",
    blurb: "A lighter creak: the cradle settling back to centre.",
    status: "bound",
    use: "The steering seat's lean came back inside the mark; no face is bared.",
    level: 0.28,
    layers: [air(600, 800, 0.18, 0.08, 3)],
  },
  {
    id: "boss.capstanWear",
    family: "boss",
    blurb: "A short rasp: one reversal scouring a band.",
    status: "bound",
    use: "The rubbing seat wore fresh reversals into the bared face. Pitched up as the band brightens.",
    level: 0.3,
    layers: [noise(2200, { type: "bandpass", freq: 2200, q: 4 }, 0.005, 0.07, 0.1)],
  },
  {
    id: "boss.capstanBright",
    family: "boss",
    blurb: "A clean ring: a band worn bright.",
    status: "bound",
    use: "The lit step's band reached its reversals and shone.",
    level: 0.42,
    layers: [glint(2600, 0.35, 0.14), after(0.02, thud(260, 130, 0.04, 0.1))],
  },
  {
    id: "boss.capstanBare",
    family: "boss",
    blurb: "A low hum and a glint: the core showing.",
    status: "bound",
    use: "Both bands bright; the core lies bare to a shot.",
    level: 0.44,
    layers: [sub(62, 0.35, 0.16), after(0.04, glint(2300, 0.25, 0.12))],
  },
  {
    id: "boss.capstanKept",
    family: "boss",
    blurb: "A firm clank: the rust held off the core.",
    status: "bound",
    use: "A hold made; the core stays bare.",
    level: 0.4,
    layers: [thud(230, 110, 0.07, 0.18), after(0.03, glint(1900, 0.18, 0.08))],
  },
  {
    id: "boss.capstanStall",
    family: "boss",
    blurb: "A grind and a halt: the drum stalling.",
    status: "bound",
    use: "A steer-and-rub window ran out; the step is tried again after a rest, its wear kept.",
    level: 0.34,
    layers: [air(900, 500, 0.3, 0.1, 3), after(0.1, thud(150, 110, 0.05, 0.1))],
  },
  {
    id: "boss.capstanCover",
    family: "boss",
    blurb: "A dull fall: rust closing over the core.",
    status: "bound",
    use: "A hold ran out; the core is covered until the hold is made again.",
    level: 0.36,
    layers: [
      thud(160, 100, 0.06, 0.18),
      after(0.03, noise(800, { type: "lowpass", freq: 800, toFreq: 400, q: 1 }, 0.02, 0.25, 0.08)),
    ],
  },
  {
    id: "boss.capstanHit",
    family: "boss",
    blurb: "A flash: a bright ring and a knock into the core.",
    status: "bound",
    use: "A shot in the step's colour into the bared core. Pitched up per hit.",
    level: 0.44,
    layers: [glint(2900, 0.3, 0.18), after(0.02, thud(240, 115, 0.1, 0.22))],
  },
  {
    id: "boss.capstanMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.capstanOpen",
    family: "boss",
    blurb: "The cap swinging wide: a low fall under a rising hiss.",
    status: "bound",
    use: "Every step answered — the cap swings open, spent.",
    level: 0.46,
    layers: [sub(48, 0.7, 0.3), after(0.02, air(1300, 3400, 0.5, 0.14, 1.5))],
  },
  {
    id: "boss.capstanOut",
    family: "boss",
    blurb: "The spent drum falling away, and the field clearing.",
    status: "bound",
    use: "THE CAPSTAN gone — then the wave-end light.",
    level: 0.5,
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
