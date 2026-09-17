/**
 * THE UNDERTOW's nine, in a file of their own for `boss-baton.ts`' reason.
 *
 * The fight is under the floor, so what these have to do is **be heard as the
 * hull**: not a body on the field but the plating the pair is standing on —
 * bending, parting, closing over. Everything is low and dull where THE
 * BATON's was high and clicking; the only bright thing in the set is the
 * seam-light on the bow, which is the one tell the navigator gets. The register
 * under 90 Hz that `boss.arrive` opened is where the body lives, and the body
 * is never seen, so it is the one sound of the nine that stays there
 * (docs/spec/audio.md §1).
 */

import { after, air, burst, glint, metal, noise, soft, spore, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_UNDERTOW_SOUNDS: SoundDef[] = [
  {
    id: "boss.undertowBow",
    family: "boss",
    blurb: "A plate of the hull starting to lift: a low creak, and light along a seam.",
    status: "bound",
    use: "THE UNDERTOW pushing up under one column — the floor bowing on the pilot's screen.",
    level: 0.34,
    layers: [
      metal(96, 0.5, 0.26, 130),
      { source: "sine", freq: 64, toFreq: 88, gain: 0.3, attack: 0.05, hold: 0.2, release: 0.4 },
      after(0.12, glint(5200, 0.3, 0.08)),
    ],
  },
  {
    id: "boss.undertowLobe",
    family: "boss",
    blurb: "The plate parting and a lobe standing up through it: a tear, then a wet body settling.",
    status: "bound",
    use: "THE UNDERTOW's lobe through the hull, standing in the breach where the maw can reach it.",
    level: 0.46,
    layers: [
      thud(200, 60, 0.36, 0.6),
      noise(0.35, { type: "bandpass", freq: 900, toFreq: 300, q: 1.1 }, 0.01, 0.12, 0.3),
      after(0.1, spore(74, 0.6, 0.3, 40)),
    ],
  },
  {
    id: "boss.undertowTaken",
    family: "boss",
    blurb: "A lobe drawn down into the maw and the plate closing over: a swallow, and a clank.",
    status: "bound",
    use: "THE UNDERTOW's lobe taken by the maw or the beam — the breach closed.",
    level: 0.44,
    layers: [
      air(260, 70, 0.3, 0.24, 1.6),
      after(0.2, thud(260, 120, 0.2, 0.5)),
      after(0.26, metal(140, 0.28, 0.22, 130)),
    ],
  },
  {
    id: "boss.undertowScar",
    family: "boss",
    blurb:
      "A lobe withdrawing untaken and the breach staying: a slide down, and the hull not closing.",
    status: "bound",
    use: "THE UNDERTOW's lobe standing its beats and going back under, leaving the column a scar.",
    level: 0.4,
    layers: [
      { source: "sine", freq: 220, toFreq: 60, gain: 0.3, attack: 0.02, hold: 0.1, release: 0.4 },
      soft(0.5, noise(0.35, { type: "lowpass", freq: 700, toFreq: 200, q: 0.8 }, 0.02, 0.2, 0.3)),
      after(0.4, soft(0.6, sub(52, 0.5, 0.35))),
    ],
  },
  {
    id: "boss.undertowWidened",
    family: "boss",
    blurb:
      "A breach grown wide enough for a second lobe next door: plating tearing, and two standing.",
    status: "bound",
    use: "THE UNDERTOW's breach reaching its width with no plate on it, and a second lobe through beside it.",
    level: 0.48,
    layers: [
      burst(metal(110, 0.2, 0.24, 200), 3, 0.07, 0.8, -3),
      after(0.22, thud(180, 56, 0.4, 0.6)),
      after(0.3, spore(70, 0.5, 0.26, 50)),
    ],
  },
  {
    id: "boss.undertowUnseated",
    family: "boss",
    blurb: "The floor coming up under the cannon: a jolt, and the mount ringing loose.",
    status: "bound",
    use: "THE UNDERTOW under the cannon's own column, the pilot not slid off in time — his seat swallowed for the next beats.",
    level: 0.46,
    layers: [
      thud(280, 90, 0.2, 0.6),
      after(0.04, metal(120, 0.4, 0.3, 130)),
      after(0.1, burst(tick(0.3, 0, 3600), 4, 0.09, 0.7)),
    ],
  },
  {
    id: "boss.undertowRise",
    family: "boss",
    blurb:
      "Every seam in the hull lighting at once: the whole edge lifting, and the body underneath.",
    status: "bound",
    use: "THE UNDERTOW's last lobe rising in the middle column with the whole body behind it.",
    level: 0.5,
    // Not `pierce`: the edge lifting is a sub swell and the seams glint above
    // the band, so nothing in it lands where a voice is.
    layers: [
      { source: "sine", freq: 40, toFreq: 72, gain: 0.4, attack: 0.3, hold: 0.6, release: 0.8 },
      metal(88, 1.2, 0.22, 160),
      after(0.3, burst(glint(5600, 0.25, 0.1), 5, 0.14, 0.85, 3)),
    ],
  },
  {
    id: "boss.undertowSwallowed",
    family: "boss",
    blurb:
      "The body following its lobe down through the hole: a long swallow, and the hull closing over it.",
    status: "bound",
    use: "THE UNDERTOW beaten — the maw held open under the last lobe, and the whole of it taken into the ship.",
    level: 0.55,
    layers: [
      air(180, 50, 1.0, 0.3, 1.2),
      after(0.5, soft(0.6, spore(48, 1.2, 0.36, 60))),
      after(1.1, thud(220, 80, 0.3, 0.6)),
      after(1.2, metal(120, 0.5, 0.26, 130)),
    ],
  },
  {
    id: "boss.undertowThrough",
    family: "boss",
    blurb: "The last lobe coming through the other way: the hull giving along its whole width.",
    status: "bound",
    use: "THE UNDERTOW's last lobe standing too long — through the hull, and the wave lost.",
    level: 0.55,
    layers: [
      thud(240, 30, 0.9, 0.8),
      burst(metal(100, 0.3, 0.28, 130), 5, 0.1, 0.8, -4),
      after(0.6, soft(0.5, sub(44, 1.0, 0.4))),
    ],
  },
];
