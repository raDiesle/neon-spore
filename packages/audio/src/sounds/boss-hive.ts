/**
 * THE HIVE's twelve, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **mass over the field with breaches in its underside**, and
 * everything here is the sound of a membrane: the swell is a stretch, skin
 * tightening over something pushing at it; the open is that skin giving —
 * a wet tear and a sigh of air out of it; the spill is a rock dropping out
 * of the breach, a wet plop and a weight going; the skin is a bolt landing
 * on the shut membrane and going dull; the wrong colour is the mass
 * clenching, every breach at once; the seal is the pair's own sound, a hiss
 * and a click as a breach closes for good, pitched up as fewer are left. The
 * down is the last seal under THE SLOW, the whole mass tightening shut; the
 * out is it lifting away. Low and soft under the band, or short and high
 * above it, as ever (docs/spec/audio.md §1).
 *
 * **The three the mass's own states make are the same membrane, heard from
 * further in.** The clench is the whole underside drawing up and away — a
 * long low haul of air with the spills going quiet behind it, so the pair
 * hear the field empty. The haul is the pilot's thumb pulling it back: a
 * strain that gives, short, and a soft settling under it, because a clench
 * answered costs nothing and should not sound like it did. The wrung lobe
 * is the one gesture that is a *squeeze*: a wet wring high over the band
 * with the colour going out of it, close kin to the seal because it is the
 * seal's promise made early (`hive-lobe.ts`).
 */

import { after, air, burst, glint, noise, soft, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_HIVE_SOUNDS: SoundDef[] = [
  {
    id: "boss.hiveEnter",
    family: "boss",
    blurb: "The mass settling over the field: a low swell and a wet shifting inside it.",
    status: "bound",
    use: "THE HIVE arriving, every site shut.",
    level: 0.36,
    layers: [swell(60, 1.3, 0.1), after(0.3, soft(0.5, spore(320, 0.5, 0.14, 40)))],
  },
  {
    id: "boss.hiveSwell",
    family: "boss",
    blurb: "Skin stretching over something pushing at it from inside: a rising strain.",
    status: "bound",
    use: "A site of THE HIVE swelling — it opens in three beats. Only the navigator is shown which.",
    level: 0.3,
    layers: [air(700, 1600, 0.4, 0.14, 1.8), after(0.2, soft(0.5, sub(80, 0.3, 0.3)))],
  },
  {
    id: "boss.hiveOpen",
    family: "boss",
    blurb: "The skin giving: a wet tear and a sigh of air out of the breach.",
    status: "bound",
    use: "A site of THE HIVE opening. Only the pilot is shown its colour.",
    level: 0.38,
    layers: [
      noise(0.14, { type: "bandpass", freq: 900, toFreq: 500, q: 2 }, 0.004, 0.08, 0.45),
      after(0.08, air(2400, 900, 0.3, 0.12, 1.5)),
    ],
  },
  {
    id: "boss.hiveSpill",
    family: "boss",
    blurb: "A rock dropping out of a breach: a wet plop and a weight going.",
    status: "bound",
    use: "An open breach of THE HIVE spilling a rock down its column — one per open breach, every three beats.",
    level: 0.3,
    layers: [thud(220, 90, 0.12, 0.3), after(0.03, soft(0.5, spore(380, 0.16, 0.1, 30)))],
  },
  {
    id: "boss.hiveSkin",
    family: "boss",
    blurb: "A bolt landing on shut skin: a dull slap, swallowed.",
    status: "bound",
    use: "A shot out of the top of the field between THE HIVE's open breaches — or into one already sealed.",
    level: 0.26,
    layers: [thud(180, 100, 0.1, 0.28), after(0.02, soft(0.3, tick(0.1, 0, 2600)))],
  },
  {
    id: "boss.hiveWrong",
    family: "boss",
    blurb: "The mass clenching: a low squeeze and every breach spitting at once.",
    status: "bound",
    use: "A bolt of the wrong colour into an open breach of THE HIVE — every open breach spills sooner.",
    level: 0.4,
    layers: [
      sub(55, 0.3, 0.4),
      after(0.06, burst(tick(0.12, 0, 3000), 4, 0.05, 0.85, 30)),
      after(0.1, air(1400, 600, 0.25, 0.12, 1.6)),
    ],
  },
  {
    id: "boss.hiveSeal",
    family: "boss",
    blurb:
      "A breach sealing for good: a hiss and the click of skin knitting shut, higher as fewer are left.",
    status: "bound",
    use: "THE HIVE's open breach hit in its column and its colour. Pitched up as the count comes down.",
    level: 0.44,
    layers: [
      noise(0.08, { type: "highpass", freq: 2400, toFreq: 3800, q: 0.9 }, 0.002, 0.04, 0.45),
      after(0.06, glint(2600, 0.3, 0.16)),
      after(0.12, tick(0.16, 0, 3200)),
    ],
  },
  {
    id: "boss.hiveClench",
    family: "boss",
    blurb:
      "The whole underside drawing up out of reach: a long low haul of air, and quiet behind it.",
    status: "bound",
    use: "THE HIVE clenching on every third scar — nothing spills and nothing seals while it is up.",
    level: 0.42,
    layers: [
      swell(48, 1.1, 0.12),
      // The air goes *over* the band rather than through it: a mass drawing
      // itself up is a long sound, and a long sound in the speech band is a
      // sound the pair have to talk over (`docs/spec/audio.md` §1).
      after(0.05, air(3400, 6200, 0.6, 0.13, 1.7)),
      after(0.5, soft(0.4, sub(64, 0.4, 0.3))),
    ],
  },
  {
    id: "boss.hiveHaul",
    family: "boss",
    blurb: "A clench pulled back down: a strain that gives, and the mass settling soft.",
    status: "bound",
    use: "The pilot's thumb hauling THE HIVE's clenched underside down — it relaxes early, owing nothing.",
    level: 0.4,
    layers: [
      air(2000, 700, 0.22, 0.14, 1.9),
      after(0.08, thud(200, 80, 0.2, 0.34)),
      after(0.14, soft(0.5, spore(300, 0.3, 0.12, 24))),
    ],
  },
  {
    id: "boss.hiveWrung",
    family: "boss",
    blurb: "The colour squeezed out of a swelling lobe: a wet wring, and a thin glint going.",
    status: "bound",
    use: "The navigator's thumb held on a swelling site of THE HIVE — it opens colourless, and either colour seals it.",
    level: 0.38,
    layers: [
      noise(0.1, { type: "bandpass", freq: 1400, toFreq: 2600, q: 2.2 }, 0.003, 0.06, 0.45),
      after(0.06, glint(2200, 0.26, 0.14)),
      after(0.14, soft(0.6, air(3000, 1200, 0.2, 0.12, 1.6))),
    ],
  },
  {
    id: "boss.hiveDown",
    family: "boss",
    blurb: "The last seal: the whole mass tightening shut, and the beat slowing under it.",
    status: "bound",
    use: "THE HIVE's ninth breach sealed — under THE SLOW.",
    level: 0.5,
    layers: [
      noise(0.1, { type: "highpass", freq: 3400, toFreq: 4600, q: 0.9 }, 0.002, 0.04, 0.5),
      after(0.05, air(5200, 7400, 0.4, 0.16, 1.4)),
      after(0.15, sub(44, 0.6, 0.4)),
    ],
  },
  {
    id: "boss.hiveOut",
    family: "boss",
    blurb: "The mass lifting away: a long release of air, and the field clearing.",
    status: "bound",
    use: "THE HIVE gone — then the wave-end light.",
    level: 0.5,
    layers: [
      sub(60, 0.5, 0.35),
      after(0.1, air(4200, 7000, 0.6, 0.14, 1.5)),
      after(0.4, glint(3200, 0.5, 0.14)),
      after(0.5, air(4200, 9000, 0.9, 0.16, 1.5)),
    ],
  },
];
