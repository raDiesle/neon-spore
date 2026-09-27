/**
 * THE FLUE's sixteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a sooted iron flue with an ember in its slot**, and
 * everything here is draught and cinder: the enter is the flue drawing, a
 * low swell under a breath of air; the light is a step waking, one dry
 * tick. The steadying is the draught dropping, a hiss cut short; the stir is
 * it rising again, a soft puff. A landed tap is a short bright tick, THE
 * RATCHET's weight as §40 asks, pitched up per tap; a skid is a dull scrape
 * of cinder; the lapse is the count lost, a falling sigh. A vent is a gust
 * through the slot, the bare a low hum with a glint. The choke is the
 * draught failing, the held a damper swinging back with a knock, the shut
 * a damper coming down. The hit is a shot into the core, the miss the hull's
 * dull strike, the spent the damper swung open wide, and the out the field
 * clearing. Low and soft under the band, or short and high above it, as
 * ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_FLUE_SOUNDS: SoundDef[] = [
  {
    id: "boss.flueEnter",
    family: "boss",
    blurb: "A flue drawing: a low swell under a breath of air.",
    status: "bound",
    use: "THE FLUE arriving, the ember drifting in its slot.",
    level: 0.42,
    layers: [swell(58, 1.1, 0.12), after(0.25, air(600, 1400, 0.5, 0.06, 1.8))],
  },
  {
    id: "boss.flueLight",
    family: "boss",
    blurb: "One dry tick: a step on the flue waking.",
    status: "bound",
    use: "A step lit: a vent, the damper creeping shut, or the core to shoot.",
    level: 0.34,
    layers: [tick(0.2, 0, 2300), after(0.07, tick(0.08, 0, 2700))],
  },
  {
    id: "boss.flueSteady",
    family: "boss",
    blurb: "A hiss cut short: the draught dropping and the ember still.",
    status: "bound",
    use: "The resting seat sent nothing to the threshold; the ember stops dead.",
    level: 0.32,
    layers: [noise(2400, { type: "highpass", freq: 2400, q: 0.8 }, 0.02, 0.08, 0.1)],
  },
  {
    id: "boss.flueStir",
    family: "boss",
    blurb: "A soft puff: the draught rising again.",
    status: "bound",
    use: "The resting seat moved with the ember steady; it drifts on.",
    level: 0.28,
    layers: [air(700, 1300, 0.18, 0.08, 2.2)],
  },
  {
    id: "boss.flueTick",
    family: "boss",
    blurb: "A short bright tick on the ember.",
    status: "bound",
    use: "A tap landed on the steady ember; panned to its column. Pitched up per tap.",
    level: 0.38,
    layers: [tick(0.24, 0, 4200), after(0.02, glint(3400, 0.06, 0.08))],
  },
  {
    id: "boss.flueSkid",
    family: "boss",
    blurb: "A dull scrape of cinder: a tap that landed nowhere.",
    status: "bound",
    use: "A tap on a drifting ember, or on another column.",
    level: 0.26,
    layers: [noise(500, { type: "bandpass", freq: 500, q: 1.5 }, 0.01, 0.1, 0.09)],
  },
  {
    id: "boss.flueLapse",
    family: "boss",
    blurb: "A falling sigh: the taps landed lost.",
    status: "bound",
    use: "The resting seat moved mid-count; every tap of the vent goes back to nought.",
    level: 0.34,
    layers: [air(1600, 500, 0.35, 0.1, 2), after(0.08, thud(190, 110, 0.06, 0.1))],
  },
  {
    id: "boss.flueVent",
    family: "boss",
    blurb: "A gust through the slot.",
    status: "bound",
    use: "Three taps spent a vent.",
    level: 0.4,
    layers: [air(900, 3000, 0.4, 0.14, 1.2), after(0.05, glint(2000, 0.14, 0.1))],
  },
  {
    id: "boss.flueBare",
    family: "boss",
    blurb: "A low hum and a glint: the core bared.",
    status: "bound",
    use: "Both vents spent; the core lies bared to be shot.",
    level: 0.44,
    layers: [sub(62, 0.4, 0.16), after(0.05, glint(2500, 0.25, 0.12))],
  },
  {
    id: "boss.flueChoke",
    family: "boss",
    blurb: "The draught failing: a choked cough of air.",
    status: "bound",
    use: "A vent window ran out; the same vent is asked again.",
    level: 0.32,
    layers: [noise(300, { type: "lowpass", freq: 300, q: 1 }, 0.02, 0.2, 0.12)],
  },
  {
    id: "boss.flueHeld",
    family: "boss",
    blurb: "A damper swinging back, and a knock.",
    status: "bound",
    use: "Both hands kept off to the threshold; the core stays bared.",
    level: 0.38,
    layers: [air(1100, 700, 0.2, 0.08, 2), after(0.1, thud(300, 170, 0.05, 0.12))],
  },
  {
    id: "boss.flueShut",
    family: "boss",
    blurb: "A damper coming down: a heavy iron clap.",
    status: "bound",
    use: "A damper window ran out; it shuts over the core until held open.",
    level: 0.38,
    layers: [thud(230, 100, 0.08, 0.2), after(0.02, sub(54, 0.3, 0.14))],
  },
  {
    id: "boss.flueHit",
    family: "boss",
    blurb: "A flash: a bright ring and a knock into the core.",
    status: "bound",
    use: "A shot in the step's colour into the bared core. Pitched up per hit.",
    level: 0.44,
    layers: [glint(2600, 0.3, 0.18), after(0.02, thud(250, 120, 0.1, 0.22))],
  },
  {
    id: "boss.flueMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(200, 90, 0.14, 0.34), after(0.05, sub(42, 0.45, 0.36))],
  },
  {
    id: "boss.flueSpent",
    family: "boss",
    blurb: "The damper swung open wide: a low fall under a rising hiss.",
    status: "bound",
    use: "Every step answered — the core spent, the ember gone still.",
    level: 0.46,
    layers: [sub(50, 0.7, 0.3), after(0.02, air(1000, 3400, 0.5, 0.14, 1.5))],
  },
  {
    id: "boss.flueOut",
    family: "boss",
    blurb: "The flue sliding away, and the field clearing.",
    status: "bound",
    use: "THE FLUE gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE BURGEE's own out (`sounds/boss-burgee.ts`).
    layers: [
      sub(48, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3100, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
