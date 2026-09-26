/**
 * THE PLUMB's twelve, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a brass bob on two taut lines**, and everything here is a
 * weight on a string: the enter is the bob swinging in, a low swell with a
 * faint creak; the light is a step waking, one bright tick. A drift is a line
 * going slack, a short soft sigh; a settle is a weight hanging true, a clear
 * plucked note, pitched up as the line pulls tighter; the swing is a weight
 * lurching loose, a falling whistle. The core is the bob lighting, the hit a
 * shot into it — a flash — the steady both weights held under it, a quieter
 * hum, and the dim the core fading. The miss is the hull's dull strike, the
 * free both lines snapping at once, and the out the field clearing. Low and
 * soft under the band, or short and high above it, as ever
 * (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_PLUMB_SOUNDS: SoundDef[] = [
  {
    id: "boss.plumbEnter",
    family: "boss",
    blurb: "A bob swinging into frame: a low swell and a faint creak.",
    status: "bound",
    use: "THE PLUMB arriving, both weights loose and the core dark.",
    level: 0.42,
    layers: [
      swell(56, 1.0, 0.12),
      after(0.35, noise(900, { type: "bandpass", freq: 900, toFreq: 700, q: 6 }, 0.02, 0.2, 0.08)),
    ],
  },
  {
    id: "boss.plumbLight",
    family: "boss",
    blurb: "One bright tick: a step on the bob waking.",
    status: "bound",
    use: "A step lit: a weight's level, a shot at the core, or both levels held.",
    level: 0.36,
    layers: [tick(0.24, 0, 3200), after(0.05, tick(0.1, 0, 3800))],
  },
  {
    id: "boss.plumbDrift",
    family: "boss",
    blurb: "A short soft sigh: a line going slack as a phone leans off level.",
    status: "bound",
    use: "A lean drifting out of range in a lit level step; the count starts again.",
    level: 0.32,
    layers: [air(2200, 1400, 0.14, 0.1, 1.5)],
  },
  {
    id: "boss.plumbSettle",
    family: "boss",
    blurb: "A clear plucked note: a weight hanging true.",
    status: "bound",
    use: "A weight's phone held level long enough to settle it. Pitched up per settle.",
    level: 0.44,
    layers: [glint(1600, 0.3, 0.16), after(0.01, thud(220, 120, 0.08, 0.18))],
  },
  {
    id: "boss.plumbSwing",
    family: "boss",
    blurb: "A falling whistle: a weight lurching loose.",
    status: "bound",
    use: "A one-weight level step run out before it was held long enough.",
    level: 0.38,
    layers: [air(3000, 1600, 0.22, 0.12, 1.5), after(0.05, glint(1100, 0.16, 0.08))],
  },
  {
    id: "boss.plumbCore",
    family: "boss",
    blurb: "A bob lighting: a rising shimmer over a low hum.",
    status: "bound",
    use: "Both weights true, and the core lit to a shot.",
    level: 0.44,
    layers: [sub(66, 0.3, 0.16), after(0.04, air(2600, 5400, 0.35, 0.14, 1.5))],
  },
  {
    id: "boss.plumbHit",
    family: "boss",
    blurb: "A flash: a bright ring and a soft knock into the core.",
    status: "bound",
    use: "A shot in the step's colour into the lit core. Pitched up per hit.",
    level: 0.44,
    layers: [glint(3100, 0.3, 0.18), after(0.02, thud(250, 115, 0.1, 0.22))],
  },
  {
    id: "boss.plumbSteady",
    family: "boss",
    blurb: "A quieter hum: both weights held true under the core.",
    status: "bound",
    use: "Both phones held level long enough to keep the core lit.",
    level: 0.34,
    layers: [sub(60, 0.35, 0.14), after(0.05, glint(2000, 0.2, 0.08))],
  },
  {
    id: "boss.plumbDim",
    family: "boss",
    blurb: "A fading hum: the core dimming, a weight off true.",
    status: "bound",
    use: "A both-levels hold run out: the core dark, and the step lights again.",
    level: 0.36,
    layers: [swell(70, 0.4, 0.14), after(0.1, air(1800, 900, 0.25, 0.08, 1.5))],
  },
  {
    id: "boss.plumbMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.plumbFree",
    family: "boss",
    blurb: "Two lines snapping at once: a bright crack over a low fall.",
    status: "bound",
    use: "Every step answered — both weights snap loose.",
    level: 0.46,
    layers: [
      sub(52, 0.7, 0.3),
      after(
        0.02,
        noise(4200, { type: "bandpass", freq: 4200, toFreq: 2800, q: 2 }, 0.005, 0.3, 0.18),
      ),
    ],
  },
  {
    id: "boss.plumbOut",
    family: "boss",
    blurb: "The spent bob drifting away, and the field clearing.",
    status: "bound",
    use: "THE PLUMB gone — then the wave-end light.",
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
