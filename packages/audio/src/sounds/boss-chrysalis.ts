/**
 * THE CHRYSALIS's fifteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a living cocoon around an alien grub**, and everything here
 * is wet and alive where THE BASTION's is metal: the enter a slow heave with
 * a gurgle under it; a skin lighting a breath drawn; a turn of the rub a
 * squelch, and a half rubbed clear a wet slap. A quill ripped is a fleshy
 * pop, one let go a soft drag back; a sac swelling a rising wet whine and
 * its burst a splatter; spores sprayed unanswered a dry hiss, and a bolt in
 * the heart a deep beat. A skin peeled is a long tearing sigh with a bright
 * ring after it — the step won — and a skin regrown a slow ooze. Low and soft
 * under the band, or short and high above it, as ever (`docs/spec/audio.md`
 * §1).
 */

import { after, air, glint, noise, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_CHRYSALIS_SOUNDS: SoundDef[] = [
  {
    id: "boss.chrysalisEnter",
    family: "boss",
    blurb: "A slow heave, and a gurgle under it.",
    status: "bound",
    use: "THE CHRYSALIS coming in over the field, every skin on.",
    level: 0.44,
    layers: [
      sub(52, 0.6, 0.3),
      after(0.12, noise(260, { type: "lowpass", freq: 300, q: 2 }, 0.08, 0.5, 0.12)),
      after(0.2, swell(380, 0.5, 0.05)),
    ],
  },
  {
    id: "boss.chrysalisSkin",
    family: "boss",
    blurb: "A breath drawn: this skin can come off now.",
    status: "bound",
    use: "A skin of THE CHRYSALIS lit; pitched lower the deeper it lies.",
    level: 0.36,
    layers: [air(600, 1400, 0.3, 0.12, 1.2), after(0.14, glint(1700, 0.2, 0.07))],
  },
  {
    id: "boss.chrysalisRub",
    family: "boss",
    blurb: "A squelch: one turn of the rub on the slime.",
    status: "bound",
    use: "A turn of the rub on a half of THE CHRYSALIS's slime.",
    level: 0.3,
    layers: [noise(900, { type: "bandpass", freq: 900, q: 2.5 }, 0.01, 0.09, 0.14)],
  },
  {
    id: "boss.chrysalisWipe",
    family: "boss",
    blurb: "A wet slap: a half of the slime rubbed clear.",
    status: "bound",
    use: "A half of THE CHRYSALIS's slime rubbed clear.",
    level: 0.4,
    layers: [thud(380, 160, 0.06, 0.18), after(0.03, air(1800, 700, 0.25, 0.1, 1.6))],
  },
  {
    id: "boss.chrysalisRip",
    family: "boss",
    blurb: "A fleshy pop: a quill ripped out.",
    status: "bound",
    use: "A quill of THE CHRYSALIS pulled far enough out, ripped free.",
    level: 0.42,
    layers: [thud(620, 240, 0.05, 0.18), after(0.04, spore(880, 0.18, 0.12, 40))],
  },
  {
    id: "boss.chrysalisSnap",
    family: "boss",
    blurb: "A soft drag back: the quill let go too soon.",
    status: "bound",
    use: "A quill of THE CHRYSALIS let go short; it sinks back and starts over.",
    level: 0.34,
    layers: [
      thud(300, 180, 0.12, 0.14),
      noise(500, { type: "lowpass", freq: 700, q: 1 }, 0.02, 0.15, 0.08),
    ],
  },
  {
    id: "boss.chrysalisWrong",
    family: "boss",
    blurb: "A low hiss: that half is the other's.",
    status: "bound",
    use: "A thumb on the partner's half of THE CHRYSALIS, taking hold of nothing.",
    level: 0.32,
    layers: [air(700, 500, 0.18, 0.1, 2)],
  },
  {
    id: "boss.chrysalisSwell",
    family: "boss",
    blurb: "A rising wet whine: a sac filling.",
    status: "bound",
    use: "A spore sac of THE CHRYSALIS begins to swell over its column.",
    level: 0.34,
    layers: [swell(420, 0.6, 0.06), after(0.1, spore(520, 0.5, 0.08, 60))],
  },
  {
    id: "boss.chrysalisBurst",
    family: "boss",
    blurb: "A splatter: the spores thrown back burst the sac.",
    status: "bound",
    use: "The shield threw a sac's spores back and the sac of THE CHRYSALIS burst.",
    level: 0.42,
    layers: [
      tick(0.24, 0, 2600),
      thud(480, 200, 0.06, 0.16),
      after(0.04, air(2200, 800, 0.3, 0.12, 1.4)),
    ],
  },
  {
    id: "boss.chrysalisSpray",
    family: "boss",
    blurb: "A dry hiss: spores sprayed with nothing to stop them.",
    status: "bound",
    use: "A sac of THE CHRYSALIS sprayed with no shield under it, and swells again.",
    level: 0.34,
    layers: [air(2400, 1200, 0.4, 0.1, 1.2)],
  },
  {
    id: "boss.chrysalisHeart",
    family: "boss",
    blurb: "A deep beat: a bolt in the heart.",
    status: "bound",
    use: "A bolt in THE CHRYSALIS's heart, in the colour it beat in.",
    level: 0.44,
    layers: [sub(64, 0.3, 0.3), after(0.16, sub(58, 0.35, 0.24))],
  },
  {
    id: "boss.chrysalisShed",
    family: "boss",
    blurb: "A long tearing sigh and a bright ring: a skin off, a step won.",
    status: "bound",
    use: "THE CHRYSALIS's lit skin peels away whole and the cocoon shrinks.",
    level: 0.46,
    layers: [
      air(1400, 500, 0.5, 0.14, 1.2),
      sub(50, 0.45, 0.2),
      after(0.2, glint(3100, 0.5, 0.12)),
      after(0.3, glint(3800, 0.45, 0.1)),
    ],
  },
  {
    id: "boss.chrysalisRegrow",
    family: "boss",
    blurb: "A slow ooze: the skin grows back.",
    status: "bound",
    use: "A skin of THE CHRYSALIS ran out of time and grows back whole.",
    level: 0.38,
    layers: [
      noise(400, { type: "lowpass", freq: 500, q: 2 }, 0.08, 0.45, 0.14),
      after(0.3, thud(220, 150, 0.05, 0.12)),
    ],
  },
  {
    id: "boss.chrysalisSpent",
    family: "boss",
    blurb: "The grub dying: a crack, a deep fall, a long sigh.",
    status: "bound",
    use: "THE CHRYSALIS beaten: the last skin off, the grub dies.",
    level: 0.46,
    layers: [
      tick(0.28, 0, 2600),
      after(0.06, sub(42, 0.6, 0.34)),
      after(0.2, air(1400, 400, 0.8, 0.08, 1.4)),
    ],
  },
  {
    id: "boss.chrysalisOut",
    family: "boss",
    blurb: "The cocoon gone, and the field clearing.",
    status: "bound",
    use: "THE CHRYSALIS gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE BASTION's own out (`sounds/boss-bastion.ts`).
    layers: [
      sub(48, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3100, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
