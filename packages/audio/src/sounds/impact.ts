/**
 * What a shot does when it arrives.
 *
 * The pair has to tell four outcomes apart across a voice channel without
 * looking at the same screen: it died, it went through, it was the wrong
 * colour, the shield turned it. So these four are separated by *shape*, not by
 * pitch — a burst, a hole, a refusal and a ricochet — because pitch is the
 * first thing a phone speaker in a noisy room throws away.
 */

import { after, air, burst, chime, glint, metal, soft, spore, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const IMPACT_SOUNDS: SoundDef[] = [
  {
    id: "impact.destroyRed",
    family: "impact",
    blurb: "A wet burst: something with pressure in it opening all at once.",
    status: "bound",
    use: "A slick destroyed.",
    level: 0.44,
    layers: [
      thud(260, 60, 0.16, 0.7),
      {
        source: "noise",
        freq: 2200,
        gain: 0.5,
        attack: 0.002,
        release: 0.13,
        filter: { type: "bandpass", freq: 2600, toFreq: 380, q: 1.1 },
      },
      after(0.03, soft(0.5, air(6000, 3400, 0.16, 0.18, 2.4))),
    ],
  },
  {
    id: "impact.destroyCyan",
    family: "impact",
    blurb: "The same burst with glass in it — the bulb's ring of light coming apart.",
    status: "bound",
    use: "A bulb destroyed.",
    level: 0.44,
    layers: [
      thud(320, 74, 0.14, 0.65),
      {
        source: "noise",
        freq: 3000,
        gain: 0.45,
        attack: 0.002,
        release: 0.11,
        filter: { type: "bandpass", freq: 3400, toFreq: 620, q: 1.2 },
      },
      after(0.02, chime(5400, 0.26, 0.2, 1500)),
      after(0.05, soft(0.5, glint(7600, 0.18))),
    ],
  },
  {
    id: "impact.hole",
    family: "impact",
    blurb: "A shot passing through: a short punch and the hole ringing behind it.",
    status: "bound",
    use: "A hit that goes through instead of destroying — a strand's body, a queen's plate.",
    level: 0.36,
    layers: [
      tick(0.55, 0, 3200),
      thud(180, 90, 0.07, 0.5),
      after(0.02, soft(0.6, chime(4400, 0.2, 0.14))),
    ],
  },
  {
    id: "impact.reject",
    family: "impact",
    blurb: "A refusal. Dead, damped, no ring at all — the sound of nothing happening.",
    status: "bound",
    use: "The wrong colour, or a rock, which is never destroyed by a shot.",
    level: 0.34,
    layers: [
      {
        source: "noise",
        freq: 400,
        gain: 0.55,
        attack: 0.001,
        release: 0.045,
        filter: { type: "lowpass", freq: 260, q: 2.6 },
      },
      metal(46, 0.09, 0.5, 100),
    ],
  },
  {
    id: "impact.deflect",
    family: "impact",
    blurb: "Metal turning something aside, and the something going off sideways.",
    status: "bound",
    use: "The shield catching an arrival — the warded rock.",
    level: 0.46,
    layers: [
      tick(0.6, 0, 4800),
      metal(120, 0.12, 0.55, 130),
      after(0.01, air(4200, 9500, 0.2, 0.24, 2.8)),
      after(0.04, soft(0.5, glint(6200, 0.16))),
    ],
  },
  {
    id: "impact.petal",
    family: "impact",
    blurb: "A plate coming off something much bigger than the shot that took it.",
    status: "bound",
    use: "A petal knocked off the Bulb Queen.",
    level: 0.46,
    layers: [
      thud(150, 52, 0.24, 0.7),
      {
        source: "noise",
        freq: 1800,
        gain: 0.4,
        attack: 0.003,
        release: 0.18,
        filter: { type: "bandpass", freq: 2000, toFreq: 300, q: 2.4 },
      },
      after(0.06, chime(4400, 0.34, 0.18, 900)),
    ],
  },
  {
    id: "impact.graze",
    family: "impact",
    blurb: "A shot going past close enough to hear. Air, no body.",
    status: "spare",
    use: "A near miss, if a wave ever wants to reward aim it did not quite need.",
    level: 0.2,
    layers: [air(9000, 4200, 0.09, 0.2, 4)],
  },
  {
    id: "impact.chain",
    family: "impact",
    blurb: "One burst dragging three more behind it, each smaller and higher.",
    status: "spare",
    use: "Chain reaction, and the strand losing more than one segment at once.",
    level: 0.4,
    layers: [
      thud(240, 60, 0.14, 0.6),
      after(0.04, burst(chime(4200, 0.16, 0.2, 900), 4, 0.075, 0.72, 7)),
    ],
  },
  {
    id: "impact.split",
    family: "impact",
    blurb: "A crack, then two halves ringing at once and slightly out of tune.",
    status: "spare",
    use: "The crystal breaking into two halves (bestiary 10.1).",
    level: 0.42,
    layers: [
      tick(0.6, 0, 5200),
      thud(300, 110, 0.09, 0.5),
      after(0.03, chime(5000, 0.3, 0.17, 1400)),
      after(0.035, chime(5240, 0.3, 0.15, 1400)),
    ],
  },
  {
    id: "impact.absorb",
    family: "impact",
    blurb: "The shot swallowed: it arrives and the sound closes over it.",
    status: "spare",
    use: "The gum, the colony's fibre — anything that takes a hit and keeps it.",
    level: 0.32,
    layers: [
      {
        source: "noise",
        freq: 900,
        gain: 0.5,
        attack: 0.004,
        release: 0.2,
        filter: { type: "lowpass", freq: 700, toFreq: 140, q: 1.6 },
      },
      spore(96, 0.22, 0.35, 55),
    ],
  },
  {
    id: "impact.bounce",
    family: "impact",
    blurb: "A shot changing its mind: a short click and a bolt leaving sideways.",
    status: "spare",
    use: "The Prism (ideas.md) — a hit that re-launches left or right.",
    level: 0.36,
    layers: [
      tick(0.5, 0, 6400),
      after(0.008, glint(7200, 0.05, 0.2)),
      after(0.02, air(8000, 5200, 0.12, 0.2, 3.4)),
    ],
  },
  {
    id: "impact.wrongTarget",
    family: "impact",
    blurb: "A burst that curdles halfway — it worked, and it should not have.",
    status: "spare",
    use: "Hitting the runt, which costs points (bestiary 10.1).",
    level: 0.38,
    layers: [
      thud(210, 58, 0.12, 0.6),
      after(0.05, {
        source: "sawtooth",
        freq: 150,
        toFreq: 60,
        gain: 0.4,
        attack: 0.01,
        release: 0.26,
        filter: { type: "lowpass", freq: 280, toFreq: 120, q: 3 },
      }),
    ],
  },
  {
    id: "impact.overkill",
    family: "impact",
    blurb: "Two shots landing in the same tile in the same beat: one burst, doubled.",
    status: "spare",
    use: "Marking waste, if the balance sheet ever grows a line for it.",
    level: 0.38,
    layers: [
      thud(260, 60, 0.16, 0.6),
      after(0.018, thud(250, 58, 0.16, 0.5)),
      after(0.03, soft(0.6, air(5200, 2800, 0.14, 0.2, 2))),
    ],
  },
  {
    id: "impact.pierceThrough",
    family: "impact",
    blurb: "One shot punching through a line of them — four holes in a row.",
    status: "spare",
    use: "Shooting the length of a strand (bestiary 10.1).",
    level: 0.4,
    layers: [
      burst(tick(0.5, 0, 3400), 4, 0.055, 0.86),
      thud(200, 80, 0.2, 0.5),
      after(0.16, soft(0.7, chime(4600, 0.24, 0.16))),
    ],
  },
];
