/**
 * THE ANTIPHON's eleven, in a file of their own for `boss-scuttle.ts`' reason.
 *
 * The boss is a **smooth body that grows things out of itself**, and
 * everything here is wet and slow where THE SCUTTLE's was dry and quick: the
 * enter is a swell with a skin over it; the grow is a push, a rising bandpass
 * that ends in a wet click as the contour resolves; the pit is the one crisp
 * sound on the page, the organ shrivelling in on a step, pitched up as the
 * pits mount; the harden is the same push run backwards and dulled, from the
 * decoy's column; the pull is the one sound that is not the boss's at all,
 * a candidate sliding off the rail under her thumb, dry and small, and it
 * plays on her phone alone; the sink is the organ drawing back under the
 * surface, a settle, lower when it fired first; the spill is bodies off the
 * rail. The still is the long one, the surface going glassy; the ship is a
 * push with the hull's own metal in it; the burst is every pit at once, and
 * the out is the body going down on nothing. Low and soft under the band, or
 * short and high above it, as ever (docs/spec/audio.md §1).
 */

import {
  after,
  air,
  burst,
  glint,
  metal,
  noise,
  soft,
  spore,
  sub,
  swell,
  thud,
  tick,
} from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_ANTIPHON_SOUNDS: SoundDef[] = [
  {
    id: "boss.antiphonEnter",
    family: "boss",
    blurb: "The body rising over the middle: a low swell with a skin drawn over it.",
    status: "bound",
    use: "THE ANTIPHON arriving, smooth, nothing on the rail.",
    level: 0.34,
    layers: [swell(60, 1.4, 0.1), after(0.4, soft(0.5, spore(380, 0.6, 0.12, 20)))],
  },
  {
    id: "boss.antiphonGrow",
    family: "boss",
    blurb:
      "An organ pushing out of the surface: a rising push and a wet click as the contour resolves.",
    status: "bound",
    use: "THE ANTIPHON growing an organ over a column — the window starts. Lower for the second of a pair.",
    level: 0.32,
    layers: [
      noise(0.3, { type: "bandpass", freq: 400, toFreq: 1400, q: 2.4 }, 0.02, 0.14, 0.4),
      after(0.26, tick(0.14, 0, 2600)),
    ],
  },
  {
    id: "boss.antiphonPit",
    family: "boss",
    blurb: "An organ shrivelling to a pit: a crisp step in and a small hollow left.",
    status: "bound",
    use: "THE ANTIPHON's organ named in its column and colour. Pitched up as the pits mount.",
    level: 0.44,
    layers: [
      noise(0.06, { type: "highpass", freq: 2400, toFreq: 4000, q: 0.9 }, 0.001, 0.02, 0.5),
      after(0.02, glint(2600, 0.26, 0.16)),
      after(0.08, thud(180, 90, 0.16, 0.28)),
    ],
  },
  {
    id: "boss.antiphonHarden",
    family: "boss",
    blurb: "The organ hardening: the push run backwards and dulled, from the decoy's column.",
    status: "bound",
    use: "THE ANTIPHON given the wrong candidate — the cycle lost, the next rail wider.",
    level: 0.32,
    layers: [
      noise(0.24, { type: "bandpass", freq: 1200, toFreq: 400, q: 2.2 }, 0.01, 0.1, 0.35),
      after(0.16, thud(160, 90, 0.14, 0.3)),
    ],
  },
  {
    id: "boss.antiphonPull",
    family: "boss",
    blurb:
      "A candidate dragged down off the rail: a short dry slide and the click of it letting go.",
    status: "bound",
    use: "THE ANTIPHON, the navigator crossing one off — her phone only, because the column is hers to say out loud.",
    level: 0.26,
    layers: [
      noise(0.18, { type: "bandpass", freq: 2200, toFreq: 700, q: 3.2 }, 0.01, 0.08, 0.3),
      after(0.12, tick(0.1, 0, 1800)),
    ],
  },
  {
    id: "boss.antiphonSink",
    family: "boss",
    blurb: "An organ drawing back under the surface: a settle and the skin closing over it.",
    status: "bound",
    use: "THE ANTIPHON's window run out. Lower when the organ fired a body first.",
    level: 0.3,
    layers: [soft(0.6, sub(75, 0.4, 0.3)), after(0.12, soft(0.5, spore(420, 0.3, 0.1, 20)))],
  },
  {
    id: "boss.antiphonSpill",
    family: "boss",
    blurb: "A rejected candidate dropping off the rail: a wet thud, one per body.",
    status: "bound",
    use: "THE ANTIPHON spilling what a pit rejected, from antiphonSpillPits on.",
    level: 0.3,
    layers: [thud(220, 100, 0.12, 0.3), after(0.03, soft(0.4, tick(0.1, 0, 2600)))],
  },
  {
    id: "boss.antiphonStill",
    family: "boss",
    blurb: "The surface going glassy: a long swell settling to nothing.",
    status: "bound",
    use: "THE ANTIPHON with every pit taken, still before the ship.",
    level: 0.36,
    layers: [swell(70, 1.6, 0.12), after(0.5, air(2400, 900, 0.9, 0.1, 1.4))],
  },
  {
    id: "boss.antiphonShip",
    family: "boss",
    blurb: "Their own ship pushing out of the body: the push with the hull's metal in it.",
    status: "bound",
    use: "THE ANTIPHON growing the last organ — the pair's own hull, on a rail of hulls.",
    level: 0.38,
    layers: [
      noise(0.12, { type: "bandpass", freq: 3600, toFreq: 5200, q: 2.4 }, 0.01, 0.06, 0.3),
      after(0.08, metal(120, 0.5, 0.26, 140)),
    ],
  },
  {
    id: "boss.antiphonBurst",
    family: "boss",
    blurb: "Every pit erupting at once: a rip and a rack of wet bursts.",
    status: "bound",
    use: "THE ANTIPHON's right ship named — the body ending.",
    level: 0.5,
    layers: [
      noise(0.1, { type: "highpass", freq: 3000, toFreq: 5000, q: 0.9 }, 0.002, 0.04, 0.5),
      after(0.06, burst(thud(200, 80, 0.14, 0.3), 6, 0.06, 0.85, 30)),
      after(0.1, sub(50, 0.5, 0.4)),
    ],
  },
  {
    id: "boss.antiphonOut",
    family: "boss",
    blurb: "The body going down on nothing: a slump, then the air clearing.",
    status: "bound",
    use: "THE ANTIPHON gone — then the wave-end light.",
    level: 0.5,
    layers: [
      thud(120, 45, 0.45, 0.5),
      after(0.3, glint(3200, 0.5, 0.14)),
      after(0.4, air(4200, 9000, 0.9, 0.16, 1.5)),
    ],
  },
];
