/**
 * THE RIME's twelve, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a frosted lens in two halves**, and everything here is ice
 * and glass: the enter is the lens settling cold, a low swell under a thin
 * ring; the light is a step waking, one bright tick. A shave is frost scraped
 * off, a short high hiss; a clear is a half wiped to glass, a glint pitched up
 * as the wipes go; the frost is a half icing back over, a breath and a creak.
 * The bare is the core showing through, the hit a shot into it, the block a
 * surge turned — §28's soft hull-shock thud, quieter — and the cloud the lens
 * fogging over whole. The miss is the hull's dull strike, the shatter the
 * lens bursting, and the out the field clearing. Low and soft under the band,
 * or short and high above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_RIME_SOUNDS: SoundDef[] = [
  {
    id: "boss.rimeEnter",
    family: "boss",
    blurb: "A frosted lens settling into frame: a low cold swell and a thin ring.",
    status: "bound",
    use: "THE RIME arriving, both halves frosted solid.",
    level: 0.42,
    layers: [swell(58, 1.0, 0.12), after(0.35, glint(3200, 0.4, 0.1))],
  },
  {
    id: "boss.rimeLight",
    family: "boss",
    blurb: "One bright tick: a step on the lens waking.",
    status: "bound",
    use: "A step lit: wipe a half, fire at the core, or shield the surge.",
    level: 0.36,
    layers: [tick(0.24, 0, 3800), after(0.05, tick(0.1, 0, 4400))],
  },
  {
    id: "boss.rimeShave",
    family: "boss",
    blurb: "A short high hiss: frost scraped off the glass.",
    status: "bound",
    use: "A wiping thumb turning back on itself over the lit half.",
    level: 0.3,
    layers: [noise(5200, { type: "highpass", freq: 5200, toFreq: 4400, q: 1 }, 0.005, 0.08, 0.12)],
  },
  {
    id: "boss.rimeClear",
    family: "boss",
    blurb: "A clean glint: a half wiped to bare glass.",
    status: "bound",
    use: "A half wiped to nought frost. Pitched up per wipe.",
    level: 0.42,
    layers: [glint(2800, 0.35, 0.16), after(0.03, tick(0.14, 0, 4200))],
  },
  {
    id: "boss.rimeFrost",
    family: "boss",
    blurb: "A breath and a creak: a half icing back over.",
    status: "bound",
    use: "A wipe run out: the half frosts solid, to be wiped from its first wipe again.",
    level: 0.38,
    layers: [air(2400, 1400, 0.3, 0.14, 1.5), after(0.1, tick(0.16, 0, 2200))],
  },
  {
    id: "boss.rimeBare",
    family: "boss",
    blurb: "The core showing through: a bright rising ring over a soft low fall.",
    status: "bound",
    use: "Both halves wiped clear, and the core bare to a shot.",
    level: 0.44,
    layers: [sub(60, 0.3, 0.18), after(0.04, glint(3400, 0.5, 0.14))],
  },
  {
    id: "boss.rimeHit",
    family: "boss",
    blurb: "A bright ring and a soft knock: a shot into the core.",
    status: "bound",
    use: "A shot in the step's colour into the bared core. Pitched up per hit.",
    level: 0.44,
    layers: [glint(3000, 0.3, 0.16), after(0.02, thud(240, 110, 0.1, 0.26))],
  },
  {
    id: "boss.rimeBlock",
    family: "boss",
    blurb: "A quieter thud and a spray of ice: a surge turned by the shield.",
    status: "bound",
    use: "The shield under the lens as the surge came: the core stays bare.",
    level: 0.36,
    layers: [
      thud(200, 100, 0.1, 0.24),
      after(
        0.03,
        noise(4600, { type: "highpass", freq: 4600, toFreq: 3800, q: 1 }, 0.01, 0.16, 0.1),
      ),
    ],
  },
  {
    id: "boss.rimeCloud",
    family: "boss",
    blurb: "A cold fog rolling over the glass: a low breath and a fall.",
    status: "bound",
    use: "A shield step run out: the surge frosts the lens over, and the step lights again.",
    level: 0.38,
    layers: [air(1800, 900, 0.45, 0.16, 1.5), after(0.08, sub(46, 0.3, 0.2))],
  },
  {
    id: "boss.rimeMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.rimeShatter",
    family: "boss",
    blurb: "The lens bursting: a bright crash of glass over a low fall.",
    status: "bound",
    use: "Every step answered — the lens shatters.",
    level: 0.46,
    layers: [
      sub(50, 0.8, 0.3),
      after(
        0.02,
        noise(6000, { type: "highpass", freq: 6000, toFreq: 4200, q: 1 }, 0.005, 0.5, 0.2),
      ),
      after(0.06, glint(3600, 0.5, 0.12)),
    ],
  },
  {
    id: "boss.rimeOut",
    family: "boss",
    blurb: "The last shards falling away, and the field clearing.",
    status: "bound",
    use: "THE RIME gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE OCULUS's own out (`sounds/boss-oculus.ts`).
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
