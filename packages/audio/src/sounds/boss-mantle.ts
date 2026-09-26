/**
 * THE MANTLE's twenty-two, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **hinged carapace shell over a soft core**, and everything
 * here is the sound of hinged metal giving way rather than turned metal —
 * THE GIMBAL's own bearing, pulled apart instead of spun. The enter is the
 * shell dropping shut with a heavy clap; the light is the two handles waking,
 * a pair of small clicks. The shear is a hinge tearing, a low metal crack
 * pitched down as the pairs go — the shell getting emptier reads as the crack
 * dropping rather than rising, THE GIMBAL's shear turned the other way round.
 * The split is the last hinge letting go all at once, a heavier tear opening
 * onto silence; the leak is the bared core's spark starting, a thin hiss; the
 * sparkOut is the bolt through it, short and bright; the sparkHit is the
 * spark arriving on the hull, a dull heavy strike. The beat is the finish's
 * own alternating tap, a small dry click pitched up per tap landed; the dark
 * is the core going out, a soft low thud; the out is the hatch dropping away.
 * The brace before the last pair is a low groan under the seam's glow; the
 * slip is the groan catching, a dull knock; the steady is the groan settling
 * onto one held note; the lapse is the stiff last pair clapping back shut.
 * Between: a creak, a knock, a hiss, its click, a crack, and loose hinges.
 * Low and soft under the band, or short and high above it, as ever
 * (`docs/spec/audio.md` §1).
 */

import { after, air, glint, metal, noise, soft, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_MANTLE_SOUNDS: SoundDef[] = [
  {
    id: "boss.mantleEnter",
    family: "boss",
    blurb: "A hinged shell dropping shut: a heavy clap.",
    status: "bound",
    use: "THE MANTLE arriving, closed and both handles dark.",
    level: 0.4,
    layers: [thud(190, 90, 0.16, 0.3), after(0.08, sub(50, 0.5, 0.3))],
  },
  {
    id: "boss.mantleLight",
    family: "boss",
    blurb: "Two small clicks: a movement's handles waking.",
    status: "bound",
    use: "The next pull movement's handles lighting.",
    level: 0.36,
    layers: [glint(1500, 0.4, 0.14), after(0.05, soft(0.6, glint(1900, 0.36, 0.1)))],
  },
  {
    id: "boss.mantleShear",
    family: "boss",
    blurb: "A hinge tearing off each valve: a low metal crack.",
    status: "bound",
    use: "A plate-pair sheared. Pitched down as the pairs go.",
    level: 0.46,
    layers: [
      tick(0.24, 0, 2400),
      after(0.01, metal(340, 0.4, 0.28, 220)),
      after(0.06, soft(0.5, sub(60, 0.32, 0.32))),
    ],
  },
  {
    id: "boss.mantleSplit",
    family: "boss",
    blurb: "The last hinge letting go at once: a heavier tear opening onto silence.",
    status: "bound",
    use: "The shell fully split — the bare core is showing.",
    level: 0.5,
    // The slide starts above the speech band rather than climbing through it,
    // the same reason THE GIMBAL's own hatch does (`sounds/boss-gimbal.ts`).
    layers: [
      air(3400, 6600, 0.42, 0.16, 1.5),
      after(0.18, metal(180, 0.5, 0.22, 150)),
      after(0.24, sub(46, 0.6, 0.4)),
    ],
  },
  {
    id: "boss.mantleLeak",
    family: "boss",
    blurb: "The bared core's spark starting: a thin hiss.",
    status: "bound",
    use: "The core's hazard spark begins leaking, unanswered.",
    level: 0.38,
    layers: [
      swell(56, 0.9, 0.09),
      after(
        0.1,
        noise(0.5, { type: "bandpass", freq: 2200, toFreq: 2800, q: 1.4 }, 0.02, 0.2, 0.2),
      ),
    ],
  },
  {
    id: "boss.mantleSparkOut",
    family: "boss",
    blurb: "The bolt through the spark: short and bright, and the hiss gone.",
    status: "bound",
    use: "The leaking spark shot out, in either colour.",
    level: 0.4,
    layers: [glint(2600, 0.28, 0.18), after(0.04, air(2400, 800, 0.22, 0.12, 1.5))],
  },
  {
    id: "boss.mantleSparkHit",
    family: "boss",
    blurb: "The spark arriving on the hull: a dull, heavy strike.",
    status: "bound",
    use: "Nobody shot the spark — one strike on the hull, which is the wave.",
    level: 0.46,
    layers: [thud(230, 105, 0.12, 0.34), after(0.04, sub(46, 0.4, 0.36))],
  },
  {
    id: "boss.mantleBeat",
    family: "boss",
    blurb: "A small dry click: the alternating finish's own tap.",
    status: "bound",
    use: "A correct alternating tap landed. Pitched up per tap.",
    level: 0.34,
    layers: [tick(0.1, 0, 2600), after(0.01, soft(0.4, glint(2000, 0.2, 0.08)))],
  },
  {
    id: "boss.mantleDark",
    family: "boss",
    blurb: "The core going out: a soft, low thud.",
    status: "bound",
    use: "The last tap landed — the core goes dark and the fight ends.",
    level: 0.42,
    layers: [sub(52, 0.5, 0.34), after(0.08, thud(160, 70, 0.1, 0.24))],
  },
  {
    id: "boss.mantleOut",
    family: "boss",
    blurb: "The dark hatch dropping away, and the field clearing.",
    status: "bound",
    use: "THE MANTLE gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE GIMBAL's own out (`sounds/boss-gimbal.ts`): the
    // glint sits exactly on the band's own edge, which is not inside it.
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
  {
    id: "boss.mantleGlow",
    family: "boss",
    blurb: "A low groan under the seam: the shell fighting to shut.",
    status: "bound",
    use: "The seam glows before the last pair: hold both handles still.",
    level: 0.4,
    layers: [swell(58, 1.2, 0.1), after(0.1, soft(0.5, metal(180, 0.8, 0.14, 200)))],
  },
  {
    id: "boss.mantleSlip",
    family: "boss",
    blurb: "The groan catching: a dull knock in the shell.",
    status: "bound",
    use: "A hand lifted mid-brace: the shudder worsens, and the hold starts over.",
    level: 0.4,
    layers: [thud(150, 80, 0.12, 0.3), after(0.03, metal(220, 0.3, 0.16, 200))],
  },
  {
    id: "boss.mantleSteady",
    family: "boss",
    blurb: "The groan settling onto one held note.",
    status: "bound",
    use: "The brace held: the shudder settles and the last pull lights.",
    level: 0.38,
    layers: [sub(64, 0.6, 0.28), after(0.08, soft(0.5, glint(1700, 0.4, 0.1)))],
  },
  {
    id: "boss.mantleLapse",
    family: "boss",
    blurb: "The stiff last pair clapping back shut.",
    status: "bound",
    use: "The last pull's window ran out unsheared: it resets, and asks again.",
    level: 0.42,
    layers: [tick(0.2, 0, 2000), after(0.01, thud(200, 110, 0.1, 0.28))],
  },
  {
    id: "boss.mantleBuckle",
    family: "boss",
    blurb: "The weakened valve bulging: a low metal creak.",
    status: "bound",
    use: "The third shear: the last pair bulges out, to be held down eased.",
    level: 0.4,
    layers: [sub(58, 0.5, 0.3), after(0.06, metal(180, 0.4, 0.14, 160))],
  },
  {
    id: "boss.mantleFlat",
    family: "boss",
    blurb: "The bulge pressed back: a soft dull knock.",
    status: "bound",
    use: "Both handles held eased for its beats: the buckle lies flat.",
    level: 0.36,
    layers: [thud(170, 90, 0.1, 0.26), after(0.03, soft(0.5, glint(1400, 0.3, 0.08)))],
  },
  {
    id: "boss.mantleVent",
    family: "boss",
    blurb: "A seam aperture hissing open.",
    status: "bound",
    use: "The vent opens along the crack: one tap on it shuts it.",
    level: 0.34,
    layers: [air(2200, 900, 0.3, 0.12, 1.2), after(0.02, tick(0.12, 0, 2400))],
  },
  {
    id: "boss.mantleSeal",
    family: "boss",
    blurb: "The vent clicked shut.",
    status: "bound",
    use: "A tap on the open vent: it shuts, and no spark is fed.",
    level: 0.36,
    layers: [tick(0.16, 0, 2800), after(0.02, thud(210, 110, 0.08, 0.24))],
  },
  {
    id: "boss.mantleCross",
    family: "boss",
    blurb: "A second crack crossing the first, the core's light behind it.",
    status: "bound",
    use: "The crosswise crack: a picture beat before the brace.",
    level: 0.4,
    layers: [metal(240, 0.3, 0.18, 220), after(0.1, soft(0.6, glint(1600, 0.5, 0.1)))],
  },
  {
    id: "boss.mantleTurn",
    family: "boss",
    blurb: "The halves swinging loose on their hinges.",
    status: "bound",
    use: "The last shear: the halves swing, to be guided open with both handles.",
    level: 0.4,
    layers: [swell(90, 0.6, 0.14), after(0.2, metal(200, 0.3, 0.12, 180))],
  },
  {
    id: "boss.mantleSwing",
    family: "boss",
    blurb: "The halves swinging back to shut.",
    status: "bound",
    use: "The turn's window ran out: the halves swing back, and ask again.",
    level: 0.38,
    layers: [thud(180, 100, 0.1, 0.28), after(0.04, metal(220, 0.25, 0.1, 200))],
  },
  {
    id: "boss.mantleTurned",
    family: "boss",
    blurb: "The hinges opening wide onto the core.",
    status: "bound",
    use: "Both handles guided the halves open: the core is bared.",
    level: 0.42,
    layers: [swell(120, 0.4, 0.16), after(0.12, sub(48, 0.5, 0.3))],
  },
];
