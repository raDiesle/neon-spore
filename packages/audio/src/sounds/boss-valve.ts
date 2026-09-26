/**
 * THE VALVE's thirteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a drum with a wheel in its face and a pin beside it**, and
 * everything here is iron and steam: the enter is the drum settling, a low
 * hollow boom; the light is the mark on the rim waking, one bright tick; the
 * hold is the wheel seating on it, a soft catch. The slip and the lapse are
 * the wheel running on, a ratchet's short whirr; the freeze is the tap
 * stopping it dead, one hard clack; the thaw is the ice letting go, a hiss.
 * The pull is the pin drawn, a pop pitched up as the pins run out; the spark
 * a crackle, shot out a bright snap, and on the hull the hull's dull strike.
 * The open is the face falling away, a long exhale of steam, and the out the
 * field clearing. Low and soft under the band, or short and high above it, as
 * ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, soft, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_VALVE_SOUNDS: SoundDef[] = [
  {
    id: "boss.valveEnter",
    family: "boss",
    blurb: "An iron drum settling over the field: a low hollow boom.",
    status: "bound",
    use: "THE VALVE arriving, every pin in.",
    level: 0.42,
    layers: [swell(48, 1.0, 0.12), after(0.18, thud(150, 70, 0.16, 0.28))],
  },
  {
    id: "boss.valveLight",
    family: "boss",
    blurb: "One bright tick: the mark on the rim waking.",
    status: "bound",
    use: "A movement's mark lit; the wheel is the pilot's to turn.",
    level: 0.36,
    layers: [glint(1900, 0.28, 0.14), after(0.04, tick(0.1, 0, 2800))],
  },
  {
    id: "boss.valveHold",
    family: "boss",
    blurb: "A soft catch: the wheel seating on its mark.",
    status: "bound",
    use: "The wheel on its mark; the freeze window is open.",
    level: 0.38,
    layers: [tick(0.18, 0, 2200), after(0.02, thud(260, 180, 0.06, 0.22))],
  },
  {
    id: "boss.valveSlip",
    family: "boss",
    blurb: "A short whirr: the wheel running on past the mark.",
    status: "bound",
    use: "The wheel turned off its mark before the tap.",
    level: 0.32,
    layers: [noise(900, { type: "bandpass", freq: 900, toFreq: 600, q: 2 }, 0.01, 0.1, 0.18)],
  },
  {
    id: "boss.valveLapse",
    family: "boss",
    blurb: "A longer whirr and a low knock: the wheel kicked off its mark.",
    status: "bound",
    use: "The freeze window ran out untapped.",
    level: 0.34,
    layers: [
      noise(800, { type: "bandpass", freq: 800, toFreq: 400, q: 2 }, 0.01, 0.14, 0.2),
      after(0.14, thud(160, 90, 0.1, 0.22)),
    ],
  },
  {
    id: "boss.valveFreeze",
    family: "boss",
    blurb: "One hard clack: the wheel stopped dead.",
    status: "bound",
    use: "The navigator's tap landed while the wheel was on its mark.",
    level: 0.44,
    layers: [tick(0.26, 0, 3000), after(0.01, thud(300, 140, 0.06, 0.3))],
  },
  {
    id: "boss.valveThaw",
    family: "boss",
    blurb: "A hiss and a knock: the wheel let go and kicked off its mark.",
    status: "bound",
    use: "The pull window ran out with the pin still in.",
    level: 0.36,
    layers: [air(5200, 3000, 0.35, 0.12, 1.5), after(0.16, thud(160, 90, 0.1, 0.22))],
  },
  {
    id: "boss.valvePull",
    family: "boss",
    blurb: "A pop and a low settle: a pin drawn out.",
    status: "bound",
    use: "A frozen pin pulled. Pitched up as the pins run out.",
    level: 0.46,
    layers: [
      tick(0.24, 0, 2400),
      after(0.02, thud(220, 100, 0.12, 0.3)),
      after(0.1, sub(56, 0.4, 0.26)),
    ],
  },
  {
    id: "boss.valveSpark",
    family: "boss",
    blurb: "A crackle falling away: a spark leaking from the drum.",
    status: "bound",
    use: "The first pin out leaked a spark down the drum's column.",
    level: 0.4,
    layers: [noise(3000, { type: "highpass", freq: 3000, toFreq: 2000, q: 1 }, 0.01, 0.12, 0.2)],
  },
  {
    id: "boss.valveSparkOut",
    family: "boss",
    blurb: "A bright snap: the spark shot out.",
    status: "bound",
    use: "The spark shot out, in either colour.",
    level: 0.4,
    layers: [glint(2800, 0.24, 0.16), after(0.03, air(2600, 900, 0.2, 0.1, 1.5))],
  },
  {
    id: "boss.valveSparkHit",
    family: "boss",
    blurb: "The spark on the hull: a dull, heavy strike.",
    status: "bound",
    use: "Nobody shot the spark — it reached the hull.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.valveOpen",
    family: "boss",
    blurb: "The face falling open: a long exhale of steam.",
    status: "bound",
    use: "The last pin out — the drum's face falls open.",
    level: 0.44,
    layers: [sub(50, 0.8, 0.3), after(0.08, soft(0.5, air(3600, 6200, 0.8, 0.12, 1.5)))],
  },
  {
    id: "boss.valveOut",
    family: "boss",
    blurb: "The open drum drifting away, and the field clearing.",
    status: "bound",
    use: "THE VALVE gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE KEEL's own out (`sounds/boss-keel.ts`).
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
