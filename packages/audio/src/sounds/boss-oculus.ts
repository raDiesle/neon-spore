/**
 * THE OCULUS's twelve, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **an eye behind six leaves**, and everything here is lens and
 * iris: the enter is the eye rising, a low glassy swell; the light is a step
 * waking, one bright tick. A slip is a thumb lifting, a short dry scrape; a
 * shut is two leaves closing, a hard click pitched up as they close, and the
 * spring is the leaves snapping back open. The break is the lens cracking to
 * show its socket, the hit a shot into it, the reseal the socket covered and
 * the swallow a shot it took back. The miss is the hull's dull strike, the
 * shatter the lens bursting, and the out the field clearing. Low and soft
 * under the band, or short and high above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_OCULUS_SOUNDS: SoundDef[] = [
  {
    id: "boss.oculusEnter",
    family: "boss",
    blurb: "An eye rising into frame behind its leaves: a low glassy swell.",
    status: "bound",
    use: "THE OCULUS arriving, its leaves open.",
    level: 0.42,
    layers: [swell(58, 1.0, 0.12), after(0.3, glint(1800, 0.6, 0.08))],
  },
  {
    id: "boss.oculusLight",
    family: "boss",
    blurb: "One bright tick: a step on the eye waking.",
    status: "bound",
    use: "A step lit: shut the leaves, fire into the socket, or reseal it.",
    level: 0.36,
    layers: [glint(2200, 0.26, 0.14), after(0.04, tick(0.1, 0, 2800))],
  },
  {
    id: "boss.oculusSlip",
    family: "boss",
    blurb: "A short dry scrape: a thumb lifted off a leaf too soon.",
    status: "bound",
    use: "One leaf let go while both were held; the count starts again.",
    level: 0.34,
    layers: [noise(1400, { type: "bandpass", freq: 1400, toFreq: 900, q: 2 }, 0.01, 0.12, 0.16)],
  },
  {
    id: "boss.oculusShut",
    family: "boss",
    blurb: "A hard click and a low settle: two leaves closed.",
    status: "bound",
    use: "Two leaves shut. Pitched up as the leaves close.",
    level: 0.46,
    layers: [tick(0.26, 0, 3200), after(0.02, thud(300, 140, 0.1, 0.3))],
  },
  {
    id: "boss.oculusSpring",
    family: "boss",
    blurb: "A sprung snap: the leaves flying open again.",
    status: "bound",
    use: "A shut run out before both leaves were held long enough.",
    level: 0.38,
    layers: [tick(0.2, 0, 2000), after(0.03, air(1800, 3600, 0.18, 0.12, 1.5))],
  },
  {
    id: "boss.oculusBreak",
    family: "boss",
    blurb: "A glassy crack: the lens splitting to show its socket.",
    status: "bound",
    use: "The lens broken, and the socket open to a shot.",
    level: 0.44,
    layers: [
      glint(3000, 0.3, 0.16),
      after(
        0.04,
        noise(2600, { type: "highpass", freq: 2600, toFreq: 1800, q: 1 }, 0.01, 0.3, 0.14),
      ),
    ],
  },
  {
    id: "boss.oculusHit",
    family: "boss",
    blurb: "A bright ring and a low knock: a shot into the socket.",
    status: "bound",
    use: "A shot in the step's colour into the open socket. Pitched up per hit.",
    level: 0.44,
    layers: [glint(2400, 0.3, 0.16), after(0.02, thud(260, 120, 0.1, 0.26))],
  },
  {
    id: "boss.oculusReseal",
    family: "boss",
    blurb: "A soft closing hush: the socket covered over.",
    status: "bound",
    use: "Both leaves held over the socket long enough to reseal it.",
    level: 0.38,
    layers: [air(3000, 1200, 0.3, 0.12, 1.5), after(0.1, sub(62, 0.3, 0.18))],
  },
  {
    id: "boss.oculusSwallow",
    family: "boss",
    blurb: "A low gulp: the socket closing on its own.",
    status: "bound",
    use: "A reseal run out: the socket shuts and the step lights again.",
    level: 0.38,
    layers: [thud(180, 90, 0.2, 0.3), after(0.06, sub(48, 0.3, 0.2))],
  },
  {
    id: "boss.oculusMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.oculusShatter",
    family: "boss",
    blurb: "The lens bursting: a spray of glass over a low fall.",
    status: "bound",
    use: "Every step answered — the eye shatters.",
    level: 0.46,
    layers: [
      sub(52, 0.8, 0.3),
      after(
        0.03,
        noise(5200, { type: "highpass", freq: 5200, toFreq: 3600, q: 1 }, 0.01, 0.6, 0.18),
      ),
    ],
  },
  {
    id: "boss.oculusOut",
    family: "boss",
    blurb: "The broken eye drifting away, and the field clearing.",
    status: "bound",
    use: "THE OCULUS gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE SEAM's own out (`sounds/boss-seam.ts`).
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
