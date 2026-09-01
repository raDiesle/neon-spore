/**
 * The bestiary, heard.
 *
 * Three of twenty are built (`docs/spec/bestiary.md`). Every one of the rest
 * gets a voice here anyway, and the reason is the same one that governs their
 * names: the pair plays across a voice channel with a delay on it, so a
 * creature has to be **distinct when spoken** — and a creature that has a
 * sound has to be distinct when *heard*, which is a second filter on the same
 * list. A name and a silhouette that survive the filter but a sound that does
 * not is a creature that will be argued about in the wrong beat.
 *
 * Each of these is the creature's own-motion, not its death — deaths live in
 * `impact.ts`, because what a shot does is the shot's business.
 */

import { after, air, burst, chime, glint, metal, soft, spore, sub, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const CREATURE_SOUNDS: SoundDef[] = [
  {
    id: "creature.slickGlide",
    family: "creature",
    blurb: "Something flat and wide tilting through a lane. Air, no edge.",
    status: "spare",
    use: "The slick's own-motion, if the field is ever given voices of its own.",
    level: 0.16,
    layers: [air(240, 700, 0.5, 0.24, 1.2), soft(0.4, spore(84, 0.5, 0.3, 40))],
  },
  {
    id: "creature.bulbPump",
    family: "creature",
    blurb: "A swell and a release, once per beat. Round, and slightly wet.",
    status: "spare",
    use: "The bulb pumping — pitch by how close it is to the hull.",
    level: 0.18,
    layers: [spore(140, 0.3, 0.4, 50), soft(0.4, glint(4400, 0.2, 0.2))],
  },
  {
    id: "creature.meteorTumble",
    family: "creature",
    blurb: "Dead weight turning over. No glow in it at all.",
    status: "spare",
    use: "A rock falling. The one kind that is never destroyed by a shot.",
    level: 0.2,
    layers: [metal(58, 0.4, 0.45, 110), soft(0.4, air(200, 600, 0.4, 0.14, 1.6))],
  },
  {
    id: "creature.dart",
    family: "creature",
    blurb: "Small, banded and quick. One short zip, gone before it is placed.",
    status: "spare",
    use: "The dart (bestiary 10.1).",
    level: 0.24,
    layers: [air(4000, 9000, 0.09, 0.24, 3), soft(0.4, glint(7200, 0.06))],
  },
  {
    id: "creature.veilFlash",
    family: "creature",
    blurb: "Opaque, then one bright moment where the core shows.",
    status: "bound",
    use: "THE VEIL coming apart on a shot that matched (`veilTorn`) — the one instant player 2 sees what was in the cloud.",
    level: 0.3,
    layers: [
      air(400, 3000, 0.14, 0.2, 1.4),
      after(0.1, glint(6600, 0.12, 0.4)),
      after(0.1, soft(0.5, chime(5200, 0.2, 0.16))),
    ],
  },
  {
    id: "creature.strandSegment",
    family: "creature",
    blurb: "One link of a chain moving, with the rest of the chain behind it.",
    status: "spare",
    use: "The strand, once per segment per beat.",
    level: 0.18,
    layers: [burst(soft(0.6, tick(0.3, 0, 4600)), 4, 0.045, 0.8), sub(78, 0.16, 0.4)],
  },
  {
    id: "creature.crystalFacet",
    family: "creature",
    blurb: "Facets catching light: two very short high tones, a semitone apart.",
    status: "spare",
    use: "The crystal's own-motion — the one that breaks into halves.",
    level: 0.2,
    layers: [glint(7400, 0.05, 0.4), after(0.03, glint(7840, 0.06, 0.3))],
  },
  {
    id: "creature.gumStick",
    family: "creature",
    blurb: "Something adhesive taking hold and not letting go.",
    status: "spare",
    use: "The gum docking on — the one that costs three evasive manoeuvres.",
    level: 0.3,
    layers: [
      {
        source: "noise",
        freq: 800,
        gain: 0.5,
        attack: 0.02,
        release: 0.3,
        filter: { type: "lowpass", freq: 900, toFreq: 160, q: 1.8 },
      },
      spore(90, 0.4, 0.4, 70),
    ],
  },
  {
    id: "creature.throbSwell",
    family: "creature",
    blurb: "A body growing over two beats and shrinking over one. Timing you can hear.",
    status: "spare",
    use: "The throb — timing instead of a snap call.",
    level: 0.24,
    layers: [
      {
        source: "triangle",
        freq: 110,
        toFreq: 170,
        gain: 0.45,
        attack: 0.8,
        hold: 0.2,
        release: 0.4,
        filter: { type: "lowpass", freq: 280, q: 2 },
        wobble: { rate: 3, cents: 25 },
      },
    ],
  },
  {
    id: "creature.lureFold",
    family: "creature",
    blurb: "A body closing on itself: a short breath in, and a soft click where it ends.",
    status: "bound",
    use: "A lure leaving the field on its own, two rows short of the hull. Both devices hear it — it is the one moment of that creature both screens show identically.",
    level: 0.26,
    layers: [
      // Downward and inward, which is the ear's half of the same reversal the
      // picture makes: every other end-of-a-body sound in this catalogue opens
      // outward. Body well under 300 Hz, so it never reaches the speech band.
      {
        source: "sine",
        freq: 240,
        toFreq: 90,
        gain: 0.4,
        attack: 0.02,
        hold: 0.05,
        release: 0.26,
        filter: { type: "lowpass", freq: 280, toFreq: 150, q: 1.2 },
      },
      // The point it ends on, above the band rather than through it.
      after(0.22, glint(5600, 0.03, 0.28)),
    ],
  },
  {
    id: "creature.runtPeep",
    family: "creature",
    blurb: "A small, harmless, faintly pathetic pip.",
    status: "spare",
    use: "Written for the runt, which THE LURE retired. Spare, and waiting for the next creature that is small enough to sound helpless.",
    level: 0.18,
    layers: [
      {
        source: "sine",
        freq: 5200,
        toFreq: 6200,
        gain: 0.35,
        attack: 0.02,
        release: 0.1,
        wobble: { rate: 12, cents: 40 },
      },
    ],
  },
  {
    id: "creature.chokeDock",
    family: "creature",
    blurb: "A clamp closing over a control, and the control going dead under it.",
    status: "spare",
    use: "The choke shutting one control — the inverted instruction.",
    level: 0.34,
    layers: [
      metal(140, 0.12, 0.5, 130),
      after(0.1, {
        source: "noise",
        freq: 600,
        gain: 0.45,
        attack: 0.01,
        release: 0.24,
        filter: { type: "lowpass", freq: 400, toFreq: 90, q: 2.4 },
      }),
    ],
  },
  {
    id: "creature.glyphTurn",
    family: "creature",
    blurb: "A pattern shifting across a skin: four pips in an order you could write down.",
    status: "spare",
    use: "The glyph — the one you look up in a table.",
    level: 0.22,
    layers: [
      glint(4400, 0.05, 0.4),
      after(0.09, glint(5900, 0.05, 0.4)),
      after(0.18, glint(4900, 0.05, 0.4)),
      after(0.27, glint(6600, 0.07, 0.4)),
    ],
  },
];
