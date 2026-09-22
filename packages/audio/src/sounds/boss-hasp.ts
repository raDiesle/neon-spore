/**
 * THE HASP's fourteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **door of iron clasps with a wheel across it**, and everything
 * here is hardware: the enter is a great slab settling against its frame; the
 * lit is the next clasp taking the light, one small bright knock; the grip is
 * the latch going down under a thumb, a solid dropped clack, and the let is
 * the same bar coming back up on its spring, which is a shorter and higher
 * sound because it is the one nobody meant to make.
 *
 * **The burn and the seize are two sounds for one moment on purpose.** The
 * burn is his, a scald off hot iron with the bar falling out from under it,
 * and it is the loudest thing in the fight; the seize is hers, the wheel
 * grinding to a dead stop with nothing under it. They arrive together and
 * they are panned together, but a pair playing this hears two different
 * accidents and says two different words for them, which is the encounter
 * (`sim/hasp-step.ts`, `events-hasp.ts`). The cool is his bar going cold,
 * a soft settle; the free is her rim catching again, a short clean ratchet.
 *
 * The open is a whole clasp swinging off, low and final; the bolt is one
 * working loose over the middle column, a rattle that will not stop; the
 * boltOut is the shot taking it and the boltHit is it arriving on the hull.
 * The clear is the door swinging wide — a long groan under everything — and
 * the out is it gone. Low and soft under the band, or short and high above
 * it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, metal, noise, soft, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_HASP_SOUNDS: SoundDef[] = [
  {
    id: "boss.haspEnter",
    family: "boss",
    blurb: "A slab of iron settling against its frame.",
    status: "bound",
    use: "THE HASP arriving, every clasp shut and the wheel still.",
    level: 0.4,
    layers: [thud(190, 72, 0.22, 0.4), after(0.14, soft(0.5, metal(210, 0.5, 0.2, 180)))],
  },
  {
    id: "boss.haspLit",
    family: "boss",
    blurb: "One small bright knock: the next clasp taking the light.",
    status: "bound",
    use: "A hasp lighting — the latch and the wheel will answer now.",
    level: 0.36,
    layers: [tick(0.24, 0, 3000), after(0.05, soft(0.55, metal(260, 0.3, 0.2, 220)))],
  },
  {
    id: "boss.haspGrip",
    family: "boss",
    blurb: "A solid dropped clack: the latch bar going down.",
    status: "bound",
    use: "Player 1 has the latch, and the wheel will turn while he holds.",
    level: 0.3,
    layers: [thud(300, 150, 0.09, 0.3), after(0.02, soft(0.5, tick(0.16, 0, 2200)))],
  },
  {
    id: "boss.haspLet",
    family: "boss",
    blurb: "The bar coming back up on its spring, short and high.",
    status: "bound",
    use: "Player 1 let the latch go — nothing she does turns now.",
    level: 0.28,
    layers: [metal(420, 0.22, 0.24, 320), after(0.04, soft(0.4, tick(0.14, 0, 3400)))],
  },
  {
    id: "boss.haspBurn",
    family: "boss",
    blurb: "A scald off hot iron, and the bar falling out from under it.",
    status: "bound",
    use: "He held the latch past its fuse: his hand is off it and cooling.",
    level: 0.46,
    layers: [
      noise(0.34, { type: "bandpass", freq: 3400, toFreq: 1800, q: 1.2 }, 0.005, 0.2, 0.24),
      after(0.06, thud(260, 110, 0.14, 0.34)),
      after(0.16, soft(0.5, sub(52, 0.38, 0.3))),
    ],
  },
  {
    id: "boss.haspCool",
    family: "boss",
    blurb: "The bar going cold: a soft settle, and it can be taken again.",
    status: "bound",
    use: "The burn run out — player 1 may hold the latch once more.",
    level: 0.26,
    layers: [soft(0.7, metal(230, 0.34, 0.2, 190)), after(0.1, glint(2800, 0.3, 0.1))],
  },
  {
    id: "boss.haspSeize",
    family: "boss",
    blurb: "The wheel grinding to a dead stop with nothing under it.",
    status: "bound",
    use: "She is turning a rim the latch is not holding open.",
    level: 0.38,
    layers: [
      noise(0.26, { type: "bandpass", freq: 700, toFreq: 420, q: 1.6 }, 0.01, 0.16, 0.26),
      after(0.04, thud(170, 90, 0.1, 0.3)),
    ],
  },
  {
    id: "boss.haspFree",
    family: "boss",
    blurb: "A short clean ratchet: her rim catching again.",
    status: "bound",
    use: "The latch went down under a wheel she was already turning.",
    level: 0.3,
    layers: [tick(0.2, 0, 2400), after(0.05, soft(0.5, metal(340, 0.24, 0.2, 260)))],
  },
  {
    id: "boss.haspOpen",
    family: "boss",
    blurb: "A whole clasp swinging off: low, and final.",
    status: "bound",
    use: "The wheel wound the whole way — one hasp given, and the next lights.",
    level: 0.46,
    layers: [
      metal(160, 0.6, 0.3, 140),
      after(0.06, thud(210, 80, 0.2, 0.36)),
      after(0.2, soft(0.5, sub(60, 0.42, 0.32))),
    ],
  },
  {
    id: "boss.haspBolt",
    family: "boss",
    blurb: "A rattle that will not stop: a bolt working its way loose.",
    status: "bound",
    use: "Two hasps left — a bolt is loose and takes either colour.",
    level: 0.34,
    layers: [
      swell(58, 0.9, 0.08),
      after(
        0.06,
        noise(0.5, { type: "bandpass", freq: 2400, toFreq: 3000, q: 1.5 }, 0.02, 0.2, 0.2),
      ),
    ],
  },
  {
    id: "boss.haspBoltOut",
    family: "boss",
    blurb: "The shot taking it: bright, and the rattle gone.",
    status: "bound",
    use: "The loose bolt shot away, in either colour.",
    level: 0.4,
    layers: [glint(3100, 0.24, 0.18), after(0.04, air(2800, 1000, 0.2, 0.12, 1.5))],
  },
  {
    id: "boss.haspBoltHit",
    family: "boss",
    blurb: "The bolt arriving on the hull: dull, and heavy.",
    status: "bound",
    use: "Nobody shot the bolt — one strike on the hull, which is the wave.",
    level: 0.46,
    layers: [thud(250, 110, 0.12, 0.34), after(0.04, sub(48, 0.4, 0.36))],
  },
  {
    id: "boss.haspClear",
    family: "boss",
    blurb: "A long groan under everything: the door swinging wide.",
    status: "bound",
    use: "The last hasp given — the door is open and the fight is over.",
    level: 0.5,
    // The groan runs **under** the speech band rather than down through it —
    // the whole sweep is below 300 Hz — because it is the longest sound in the
    // fight and the pair are talking across it (`docs/spec/audio.md` §1). It
    // swept 600 down to 300 first, which spent a quarter of a second in the
    // band and is what `catalogue.test.ts` is for; 280 down to 150 was still
    // 0.008s over, because a bandpass has shoulders.
    layers: [
      metal(140, 0.8, 0.3, 130),
      after(0.18, air(210, 120, 0.7, 0.16, 2)),
      after(0.3, sub(44, 0.6, 0.4)),
    ],
  },
  {
    id: "boss.haspOut",
    family: "boss",
    blurb: "The door gone, and the field clearing behind it.",
    status: "bound",
    use: "THE HASP gone — then the wave-end light.",
    level: 0.5,
    layers: [
      sub(54, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
