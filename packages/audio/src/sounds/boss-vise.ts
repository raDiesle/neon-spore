/**
 * THE VISE's twelve, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a dry seed-case in two lobes**, and everything here is husk
 * and hinge: the enter is the case settling, a low woody swell; the light is
 * a step waking, one dry tick. A slip is a gap widening, a short rasp; a crack
 * is a seam giving, §28's soft hull-shock thud, pitched up as the seams go;
 * the spring is a lobe creaking back wide. The bare is the husk peeling off
 * the kernel, the hit a shot into it, the brace the lobes held off it — a
 * quieter thud, §28's reseal — and the cover the lobes closing back over. The
 * miss is the hull's dull strike, the split the case parting down its spine,
 * and the out the field clearing. Low and soft under the band, or short and
 * high above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_VISE_SOUNDS: SoundDef[] = [
  {
    id: "boss.viseEnter",
    family: "boss",
    blurb: "A seed-case settling into frame: a low woody swell.",
    status: "bound",
    use: "THE VISE arriving, both lobes whole.",
    level: 0.42,
    layers: [swell(54, 1.0, 0.12), after(0.3, tick(0.12, 0, 3400))],
  },
  {
    id: "boss.viseLight",
    family: "boss",
    blurb: "One dry tick: a step on the case waking.",
    status: "bound",
    use: "A step lit: pinch a lobe, fire at the kernel, or hold both lobes off it.",
    level: 0.36,
    layers: [tick(0.24, 0, 3000), after(0.05, tick(0.1, 0, 3600))],
  },
  {
    id: "boss.viseSlip",
    family: "boss",
    blurb: "A short rasp: a pinched gap widening again.",
    status: "bound",
    use: "A gap let open past shut in a lit pinch step; the count starts again.",
    level: 0.34,
    layers: [noise(1200, { type: "bandpass", freq: 1200, toFreq: 800, q: 2 }, 0.01, 0.12, 0.16)],
  },
  {
    id: "boss.viseCrack",
    family: "boss",
    blurb: "A soft dull thud and a dry tick: a seam giving.",
    status: "bound",
    use: "A lobe pinched shut long enough to crack a seam. Pitched up per seam.",
    level: 0.46,
    layers: [thud(240, 110, 0.12, 0.3), after(0.02, tick(0.2, 0, 3600))],
  },
  {
    id: "boss.viseSpring",
    family: "boss",
    blurb: "A creak and a breath: a lobe springing back wide.",
    status: "bound",
    use: "A one-lobe pinch run out before it was held long enough.",
    level: 0.38,
    layers: [tick(0.18, 0, 2400), after(0.03, air(1600, 3200, 0.18, 0.12, 1.5))],
  },
  {
    id: "boss.viseBare",
    family: "boss",
    blurb: "A husk peeling open: a dry tear over a soft low fall.",
    status: "bound",
    use: "Both lobes split, and the kernel bare to a shot.",
    level: 0.44,
    layers: [
      sub(60, 0.3, 0.18),
      after(
        0.04,
        noise(4200, { type: "highpass", freq: 4200, toFreq: 3400, q: 1 }, 0.01, 0.3, 0.14),
      ),
    ],
  },
  {
    id: "boss.viseHit",
    family: "boss",
    blurb: "A bright ring and a soft knock: a shot into the kernel.",
    status: "bound",
    use: "A shot in the step's colour into the bared kernel. Pitched up per hit.",
    level: 0.44,
    layers: [glint(2600, 0.3, 0.16), after(0.02, thud(240, 110, 0.1, 0.26))],
  },
  {
    id: "boss.viseBrace",
    family: "boss",
    blurb: "A quieter thud: both lobes held off the kernel.",
    status: "bound",
    use: "Both lobes pinched long enough to keep the kernel bare.",
    level: 0.34,
    layers: [thud(200, 100, 0.1, 0.24), after(0.06, sub(58, 0.25, 0.14))],
  },
  {
    id: "boss.viseCover",
    family: "boss",
    blurb: "A low woody close: the lobes shutting over the kernel.",
    status: "bound",
    use: "A both-lobes hold run out: the kernel covered, and the step lights again.",
    level: 0.38,
    layers: [thud(170, 85, 0.2, 0.3), after(0.06, sub(46, 0.3, 0.2))],
  },
  {
    id: "boss.viseMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.viseSplit",
    family: "boss",
    blurb: "The case parting down its spine: a dry snap over a low fall.",
    status: "bound",
    use: "Every step answered — the case splits.",
    level: 0.46,
    layers: [
      sub(50, 0.8, 0.3),
      after(
        0.03,
        noise(4800, { type: "highpass", freq: 4800, toFreq: 3600, q: 1 }, 0.01, 0.5, 0.18),
      ),
    ],
  },
  {
    id: "boss.viseOut",
    family: "boss",
    blurb: "The split husk drifting away, and the field clearing.",
    status: "bound",
    use: "THE VISE gone — then the wave-end light.",
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
