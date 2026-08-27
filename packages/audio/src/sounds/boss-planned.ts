/**
 * The nine bosses that are names holding a slot in the act structure.
 *
 * `docs/spec/bosses.md` has two of eleven worked out. The rest are a name and
 * a number, and a name is hard to argue with. A voice is easier: the Choir is
 * many voices on one note with one of them wrong, and either that is a fight
 * or it is not — which is a more useful thing to disagree about than the word
 * "Choir".
 */

import { after, air, burst, chime, metal, soft, spore, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_PLANNED_SOUNDS: SoundDef[] = [
  {
    id: "boss.strandNest",
    family: "boss",
    blurb: "Many segments breathing slightly out of step with each other.",
    status: "spare",
    use: "Strand Nest, act 20.",
    level: 0.34,
    layers: [
      burst(spore(66, 0.5, 0.4, 60), 5, 0.19, 0.9, -3),
      soft(0.5, air(300, 900, 1.4, 0.14, 1.2)),
    ],
  },
  {
    id: "boss.conductor",
    family: "boss",
    blurb: "A beat that is not yours: four clicks, and the fourth one lands early.",
    status: "spare",
    use: "The Conductor, act 30 — a boss that owns the beat.",
    level: 0.36,
    layers: [
      burst(tick(0.5, 0, 4200), 3, 0.625, 1),
      after(1.72, tick(0.6, 0, 3000)),
      after(1.72, sub(64, 0.2, 0.5)),
    ],
  },
  {
    id: "boss.choir",
    family: "boss",
    blurb: "Many voices on one note, and one of them wrong.",
    status: "spare",
    use: "The Choir, act 40.",
    level: 0.34,
    layers: [
      spore(90, 1.2, 0.35, 20),
      spore(90.7, 1.2, 0.3, 20),
      spore(89.2, 1.2, 0.3, 20),
      soft(0.5, spore(96, 1.2, 0.28, 40)),
    ],
  },
  {
    id: "boss.warden",
    family: "boss",
    blurb: "A door in something enormous, opening once and shutting once.",
    status: "spare",
    use: "The Warden, act 50.",
    level: 0.42,
    layers: [
      metal(44, 0.9, 0.55, 130),
      after(0.5, air(120, 400, 0.7, 0.12, 3)),
      after(1.3, soft(0.8, metal(40, 0.8, 0.5, 110))),
    ],
  },
  {
    id: "boss.heart",
    family: "boss",
    blurb: "Two beats, the second one softer. It does not stop for anything.",
    status: "spare",
    use: "The Heart, act 60 — the boss the rhythm pillar is built on.",
    level: 0.44,
    layers: [
      thud(96, 40, 0.26, 0.7),
      after(0.3, soft(0.6, thud(88, 36, 0.22, 0.6))),
      soft(0.4, air(160, 500, 0.7, 0.14, 1.4)),
    ],
  },
  {
    id: "boss.mother",
    family: "boss",
    blurb: "Something opening that has more inside it than it should.",
    status: "spare",
    use: "The Mother, act 70 — reactive, but announced (bosses.md 11.1).",
    level: 0.44,
    layers: [
      { source: "sine", freq: 46, toFreq: 78, gain: 0.6, attack: 0.6, hold: 0.4, release: 0.8 },
      after(0.7, burst(spore(196, 0.24, 0.26, 60), 6, 0.13, 0.86, 6)),
    ],
  },
  {
    id: "boss.codex",
    family: "boss",
    blurb: "A page turning, then a stamp. Nothing organic in it at all.",
    status: "spare",
    use: "The Codex, act 80 — the boss the codebook table belongs to.",
    level: 0.36,
    layers: [
      air(2000, 6000, 0.24, 0.22, 2.4),
      after(0.3, metal(120, 0.2, 0.5, 130)),
      after(0.3, tick(0.5, 0, 3400)),
    ],
  },
  {
    id: "boss.echoes",
    family: "boss",
    blurb: "One sound arriving four times, each further away than the last.",
    status: "spare",
    use: "The Echoes, act 90.",
    level: 0.38,
    layers: [
      burst(chime(4200, 0.3, 0.22, 1200), 4, 0.28, 0.6, -4),
      burst(soft(0.5, sub(80, 0.2, 0.5)), 4, 0.28, 0.6),
    ],
  },
  {
    id: "boss.kernel",
    family: "boss",
    blurb: "A pure tone with nothing alive in it, and a lot of weight underneath.",
    status: "spare",
    use: "The Kernel, act 100.",
    level: 0.4,
    layers: [
      { source: "sine", freq: 5000, gain: 0.2, attack: 0.6, hold: 0.8, release: 0.6 },
      { source: "sine", freq: 38, gain: 0.6, attack: 0.4, hold: 1, release: 0.8 },
    ],
  },
  {
    id: "boss.vessel",
    family: "boss",
    blurb: "The hull's own material, much larger, and moving under its own power.",
    status: "spare",
    use: "The Vessel, the finale — the boss that needs the second device.",
    level: 0.46,
    layers: [
      metal(38, 1.4, 0.6, 120),
      after(0.6, air(90, 340, 1, 0.12, 3)),
      after(1.4, soft(0.7, thud(120, 34, 0.9, 0.6))),
    ],
  },
];
