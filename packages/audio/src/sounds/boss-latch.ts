/**
 * THE LATCH's twelve, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a heavy slime on a wet rope**, and everything here is a rope
 * under strain: the enter is the wet slap of the hook biting the hull; a grip
 * a short creak of a hand closing on the rope, the turn passing a soft
 * double tick, and the partner's grip touched
 * a dull knock. A slip is the rope running back through the hands with a
 * hiss, a rear the slime drawing in a breath, a yank braced a taut thrum. A
 * knot is a wet pop through the hull's clamp, pitched up as they add up; the
 * miss a plate tearing, the spent the rope snapping and the slime falling,
 * and the out the field clearing. Low and soft under the band, or short and
 * high above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, metal, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_LATCH_SOUNDS: SoundDef[] = [
  {
    id: "boss.latchEnter",
    family: "boss",
    blurb: "A wet slap and a bite: the hook sinking into the hull.",
    status: "bound",
    use: "THE LATCH dropping in and hooking its rope into the hull.",
    level: 0.44,
    layers: [
      thud(300, 120, 0.04, 0.2),
      after(0.08, metal(180, 0.3, 0.16, 260)),
      after(0.04, noise(700, { type: "lowpass", freq: 700, q: 1 }, 0.01, 0.18, 0.12)),
    ],
  },
  {
    id: "boss.latchLevel",
    family: "boss",
    blurb: "The rope drawn taut with a creak: pull now.",
    status: "bound",
    use: "A level of THE LATCH lit: haul the rope in.",
    level: 0.38,
    layers: [metal(140, 0.4, 0.14, 240), after(0.25, glint(2200, 0.25, 0.1))],
  },
  {
    id: "boss.latchGrip",
    family: "boss",
    blurb: "A short creak: a hand closing on the rope.",
    status: "bound",
    use: "A thumb taking hold of its grip on THE LATCH's rope.",
    level: 0.3,
    layers: [tick(0.18, 0, 2400), thud(380, 240, 0.004, 0.06)],
  },
  {
    id: "boss.latchTurn",
    family: "boss",
    blurb: "A soft double tick: the other hand pulls now.",
    status: "bound",
    use: "A pull let go on THE LATCH's rope: the turn passes to the other grip.",
    level: 0.3,
    layers: [tick(0.16, 0, 2200), after(0.09, tick(0.16, 0, 2600))],
  },
  {
    id: "boss.latchWrong",
    family: "boss",
    blurb: "A dull knock: the other one's grip, and nothing taken.",
    status: "bound",
    use: "A thumb on the partner's grip: it is theirs to pull.",
    level: 0.3,
    layers: [thud(320, 300, 0.03, 0.12)],
  },
  {
    id: "boss.latchSlip",
    family: "boss",
    blurb: "A hiss: the rope running back through empty hands.",
    status: "bound",
    use: "Both hands off the rope, or a yank with one off: it slips back to the last knot.",
    level: 0.4,
    layers: [air(2400, 700, 0.45, 0.14, 1.6), after(0.3, thud(260, 140, 0.04, 0.14))],
  },
  {
    id: "boss.latchRear",
    family: "boss",
    blurb: "A deep breath drawn in: the slime rearing back.",
    status: "bound",
    use: "THE LATCH rearing back: a yank is coming, both of you hold on.",
    level: 0.4,
    layers: [swell(330, 0.6, 0.1), sub(60, 0.5, 0.18)],
  },
  {
    id: "boss.latchBraced",
    family: "boss",
    blurb: "A taut thrum: the yank held.",
    status: "bound",
    use: "THE LATCH yanked, and both hands held the rope.",
    level: 0.42,
    layers: [metal(110, 0.45, 0.2, 220), after(0.05, glint(1800, 0.2, 0.08))],
  },
  {
    id: "boss.latchKnot",
    family: "boss",
    blurb: "A wet pop: a knot through the clamp; the pitch climbs per knot.",
    status: "bound",
    use: "A knot of THE LATCH's rope pulled in, and a lobe torn off.",
    level: 0.44,
    layers: [thud(420, 260, 0.04, 0.12), after(0.06, glint(2400, 0.3, 0.12))],
  },
  {
    id: "boss.latchMiss",
    family: "boss",
    blurb: "A plate tearing: the slime wins the pull.",
    status: "bound",
    use: "A level run out: THE LATCH tears the hull plate its hook is in.",
    level: 0.46,
    layers: [metal(110, 0.5, 0.24, 220), sub(50, 0.4, 0.22)],
  },
  {
    id: "boss.latchSpent",
    family: "boss",
    blurb: "A rope snapping, and a heavy wet fall.",
    status: "bound",
    use: "THE LATCH beaten: torn loose, falling away down the field.",
    level: 0.44,
    layers: [
      tick(0.3, 0, 2800),
      after(0.08, sub(42, 0.6, 0.36)),
      after(0.2, air(1600, 400, 0.8, 0.08, 1.4)),
    ],
  },
  {
    id: "boss.latchOut",
    family: "boss",
    blurb: "The slime gone, and the field clearing.",
    status: "bound",
    use: "THE LATCH gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE MIMIC's own out (`sounds/boss-mimic.ts`).
    layers: [
      sub(48, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3100, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
