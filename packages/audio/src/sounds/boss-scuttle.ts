/**
 * THE SCUTTLE's eleven, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **frame of parts over the field**, and everything here is
 * the sound of a thing coming apart on purpose: a part coming loose is a
 * creak with a click at the end of it, hanging; the throw is a whip and a
 * weight leaving; a strike is the same part cracking off clean, pitched up
 * as the frame empties; a rebuff is the bolt going dull against the wrong
 * colour. The swing is the one sound here a *hand* makes: a part dragged a
 * column along the rail, a scrape with the thread singing under it and a
 * knock as it settles over somewhere else. The slack is the one soft sound
 * on the page, a settle — the pair bought a beat. The wind is the long one, a rising strain over the last
 * socket; the last is the frame's own weight hitting the hull; the down is
 * the beam cutting the strain short, and the out is the frame coming down
 * on nothing. Low and soft under the band, or short and high above it, as
 * ever (docs/spec/audio.md §1).
 */

import { after, air, burst, glint, noise, soft, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_SCUTTLE_SOUNDS: SoundDef[] = [
  {
    id: "boss.scuttleEnter",
    family: "boss",
    blurb:
      "The frame settling over the middle: a low swell and a rack of parts clicking into their sockets.",
    status: "bound",
    use: "THE SCUTTLE arriving, every socket full.",
    level: 0.36,
    layers: [swell(65, 1.2, 0.1), after(0.3, burst(tick(0.14, 0, 3300), 7, 0.07, 0.9, 0))],
  },
  {
    id: "boss.scuttleLoose",
    family: "boss",
    blurb: "A part coming loose: a creak, then the click of it hanging by a thread.",
    status: "bound",
    use: "THE SCUTTLE letting a part slip in a socket — the count starts. Lower for the second of a pair.",
    level: 0.3,
    layers: [
      noise(0.16, { type: "bandpass", freq: 600, toFreq: 1100, q: 2.2 }, 0.005, 0.08, 0.4),
      after(0.12, tick(0.16, 0, 3000)),
    ],
  },
  {
    id: "boss.scuttleThrow",
    family: "boss",
    blurb: "The throw: a whip through the air and a weight leaving the frame.",
    status: "bound",
    use: "THE SCUTTLE throwing a hanging part down its column, as rock, body or pod.",
    level: 0.36,
    layers: [air(2200, 700, 0.22, 0.14, 1.6), after(0.04, thud(160, 80, 0.14, 0.32))],
  },
  {
    id: "boss.scuttleStruck",
    family: "boss",
    blurb:
      "A part cracked off the frame before it was thrown: a brittle snap and a chip falling away.",
    status: "bound",
    use: "THE SCUTTLE's live part hit in its column and colour while it hangs. Pitched up as the frame empties.",
    level: 0.44,
    layers: [
      noise(0.05, { type: "highpass", freq: 2600, toFreq: 4200, q: 0.9 }, 0.001, 0.02, 0.5),
      after(0.02, glint(2900, 0.28, 0.16)),
      after(0.1, thud(140, 70, 0.2, 0.3)),
    ],
  },
  {
    id: "boss.scuttleSwing",
    family: "boss",
    blurb:
      "A hanging part dragged a column along the rail: a scrape, the thread singing, a knock as it settles.",
    status: "bound",
    use: "The pilot carrying one of THE SCUTTLE's hanging parts a column — it is thrown down the column he put it in.",
    level: 0.32,
    layers: [
      noise(0.22, { type: "bandpass", freq: 900, toFreq: 1500, q: 3.2 }, 0.02, 0.1, 0.45),
      after(0.06, soft(0.5, spore(680, 0.22, 0.1, 30))),
      after(0.18, thud(240, 150, 0.1, 0.28)),
    ],
  },
  {
    id: "boss.scuttleRebuff",
    family: "boss",
    blurb: "A bolt of the wrong colour going dull against the part: a thud with nothing in it.",
    status: "bound",
    use: "THE SCUTTLE's live part hit in its column but not its colour.",
    level: 0.3,
    layers: [thud(200, 110, 0.12, 0.3), after(0.03, soft(0.4, tick(0.1, 0, 2800)))],
  },
  {
    id: "boss.scuttleSlack",
    family: "boss",
    blurb: "The frame slackening: a settle and a soft ring, one beat bought.",
    status: "bound",
    use: "A pod THE SCUTTLE threw, taken — the next window a beat longer.",
    level: 0.28,
    layers: [soft(0.6, sub(70, 0.35, 0.3)), after(0.1, spore(420, 0.3, 0.12, 20))],
  },
  {
    id: "boss.scuttleWind",
    family: "boss",
    blurb: "The wind-up: a strain rising over the last socket, and the beat slowing under it.",
    status: "bound",
    use: "THE SCUTTLE down to its last part, winding up to throw it — and THE SLOW with it.",
    level: 0.4,
    layers: [
      air(3200, 5200, 0.55, 0.14, 1.6),
      after(0.1, swell(85, 0.9, 0.12)),
      after(0.5, burst(tick(0.1, 0, 3400), 3, 0.08, 0.85, 0)),
    ],
  },
  {
    id: "boss.scuttleLast",
    family: "boss",
    blurb: "The last part thrown: the frame's whole weight hitting the hull.",
    status: "bound",
    use: "THE SCUTTLE's wind-up finishing with the beam not up — the hull hit, the wave lost.",
    level: 0.5,
    layers: [thud(110, 40, 0.4, 0.55), after(0.06, sub(45, 0.5, 0.4))],
  },
  {
    id: "boss.scuttleDown",
    family: "boss",
    blurb:
      "The strain cut short: the beam through the last part, and the frame going slack all at once.",
    status: "bound",
    use: "THE SCUTTLE's last part taken by the beam in the wind-up.",
    level: 0.5,
    layers: [
      noise(0.1, { type: "highpass", freq: 3400, toFreq: 5200, q: 0.9 }, 0.002, 0.04, 0.5),
      after(0.04, air(6200, 3000, 0.4, 0.18, 1.4)),
      after(0.1, sub(50, 0.5, 0.4)),
    ],
  },
  {
    id: "boss.scuttleOut",
    family: "boss",
    blurb: "The frame coming down on nothing: a rack of sockets clattering, then the air clearing.",
    status: "bound",
    use: "THE SCUTTLE gone — then the wave-end light.",
    level: 0.5,
    layers: [
      thud(130, 45, 0.4, 0.5),
      after(0.1, burst(tick(0.14, 0, 3200), 6, 0.05, 0.85, 20)),
      after(0.3, glint(3400, 0.5, 0.14)),
      after(0.4, air(4200, 9000, 0.9, 0.16, 1.5)),
    ],
  },
];
