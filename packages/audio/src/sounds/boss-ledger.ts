/**
 * THE LEDGER's twelve, in a file of their own for `boss-taster.ts`' reason.
 *
 * The boss is **one cord**, and everything here is that cord under load:
 * rooting is a thing driven into plating, a return is a bead travelling down
 * it, a ward is the cord snapping taut, a whip is the same snap thrown the
 * other way, and the tear is it coming out of the ship with the hull's own
 * metal in it. Nothing here is a blade — one boss over is the fan, and a
 * phone speaker must never confuse the two — and nothing here is wet.
 *
 * Thin and bright above the band or short and low under it, and the two the
 * pair hears dozens of times — `ledgerBead` and `ledgerWard` — are the
 * shortest (docs/spec/audio.md §1).
 */

import { after, air, glint, metal, noise, soft, sub, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_LEDGER_SOUNDS: SoundDef[] = [
  {
    id: "boss.ledgerRoot",
    family: "boss",
    blurb: "The cord paying out and going into the plating: a long slide, then one deep seat.",
    status: "bound",
    use: "THE LEDGER arriving — the cord rooted in the hull, nothing billed yet.",
    level: 0.38,
    layers: [
      air(8600, 4400, 1.0, 0.2, 1.4),
      after(0.55, sub(58, 1.2, 0.36)),
      after(0.62, soft(0.5, thud(210, 90, 0.2, 0.34))),
    ],
  },
  {
    id: "boss.ledgerSeam",
    family: "boss",
    blurb: "The split widening: metal parting under tension, ringing once.",
    status: "bound",
    use: "THE LEDGER hit in the colour its seam was showing — one hit of five.",
    level: 0.42,
    layers: [metal(4900, 0.6, 0.28, 230), after(0.05, glint(6800, 0.26, 0.13))],
  },
  {
    id: "boss.ledgerRefused",
    family: "boss",
    blurb: "A bolt off the plating: a short flat knock with no ring in it.",
    status: "bound",
    use: "THE LEDGER struck off the seam, or in the colour it is not showing.",
    level: 0.28,
    layers: [thud(230, 120, 0.1, 0.3)],
  },
  {
    id: "boss.ledgerBead",
    family: "boss",
    blurb: "A return starting down the cord: one bright pluck, falling away.",
    status: "bound",
    use: "THE LEDGER billing the pair for a shot — the bead is on the cord. Pitched by how few beats it has.",
    level: 0.3,
    layers: [glint(5600, 0.22, 0.16), after(0.03, soft(0.4, sub(120, 0.3, 0.22)))],
  },
  {
    id: "boss.ledgerWard",
    family: "boss",
    blurb: "The cord snapping taut: the return turned in the socket.",
    status: "bound",
    use: "THE LEDGER's return warded — the plate in the socket's column, the trigger on the beat.",
    level: 0.4,
    layers: [
      noise(0.12, { type: "bandpass", freq: 5200, toFreq: 8200, q: 1.8 }, 0.004, 0.02, 0.44),
      after(0.03, sub(74, 0.36, 0.3)),
    ],
  },
  {
    id: "boss.ledgerWhip",
    family: "boss",
    blurb: "The same snap thrown the other way: a rising crack that goes up and away.",
    status: "bound",
    use: "THE LEDGER's warded return thrown back up the cord — the seam widens and nothing is billed.",
    level: 0.44,
    layers: [
      noise(0.2, { type: "bandpass", freq: 4200, toFreq: 9000, q: 1.5 }, 0.004, 0.03, 0.5),
      after(0.08, metal(5400, 0.34, 0.2, 240)),
    ],
  },
  {
    id: "boss.ledgerBill",
    family: "boss",
    blurb: "The return arriving in the socket unanswered: one low, close impact.",
    status: "bound",
    use: "THE LEDGER's return nobody warded — the hull takes it, and the wave is lost.",
    level: 0.5,
    layers: [thud(150, 52, 0.4, 0.5), after(0.04, sub(46, 0.6, 0.4))],
  },
  {
    id: "boss.ledgerSocket",
    family: "boss",
    blurb: "The root sliding one column along the plating: a short dragged scrape.",
    status: "bound",
    use: "THE LEDGER's socket walking — the next return lands somewhere else.",
    level: 0.26,
    layers: [noise(0.16, { type: "bandpass", freq: 3400, toFreq: 4600, q: 1.2 }, 0.02, 0.05, 0.34)],
  },
  {
    id: "boss.ledgerLast",
    family: "boss",
    blurb: "The fifth return: the bead's own pluck, far lower and far longer, humming under it.",
    status: "bound",
    use: "THE LEDGER's last return on the cord — the one the pair is asked to let through.",
    level: 0.46,
    layers: [
      // The bead's sine, dropped as far as it can go and stay out of the
      // speech band, rather than the bell this was: a chime at 2800 Hz rings
      // sidebands down to 1900 and held one for a fifth of a second on top of
      // whatever the pair was saying about the socket — which on this one
      // return is the only sentence in the fight that matters
      // (`band.ts`, `docs/spec/audio.md` §1).
      glint(3300, 0.5, 0.24),
      after(0.04, sub(52, 1.0, 0.34)),
      after(0.2, soft(0.5, air(4400, 7200, 0.5, 0.16, 1.6))),
    ],
  },
  {
    id: "boss.ledgerHeld",
    family: "boss",
    blurb: "The last return refused: the taut cord answering, and nothing giving.",
    status: "bound",
    use: "THE LEDGER's last return warded anyway — it goes back up, and the fight holds open.",
    level: 0.34,
    layers: [metal(3600, 0.46, 0.22, 200), after(0.1, soft(0.4, sub(88, 0.4, 0.24)))],
  },
  {
    id: "boss.ledgerPlug",
    // A stopper in a hole in plating, and the only sound the four hands
    // brought: the other four borrow one of the eleven, because each of them
    // is a thing this cord already does happening again by hand
    // (`bind-ledger.ts`). Nothing of it is in the speech band — a thumb going
    // into the socket is said while the navigator is saying the column, which
    // is the one sentence this fight is played with (`docs/spec/audio.md` §1).
    family: "boss",
    blurb: "A stopper going into the socket: one dull seat, and the hole closing over it.",
    status: "bound",
    use: "THE LEDGER's socket plugged — what lands there is rolled back onto the cord, not warded.",
    level: 0.3,
    layers: [
      thud(190, 74, 0.16, 0.34),
      after(0.04, sub(64, 0.4, 0.26)),
      after(0.06, soft(0.35, air(5200, 4400, 0.22, 0.1, 1.2))),
    ],
  },
  {
    id: "boss.ledgerTear",
    family: "boss",
    blurb: "The cord out of the ship: plating going with it, then the halves parting.",
    status: "bound",
    use: "THE LEDGER over — the last return landed unwarded and tore the cord out.",
    level: 0.54,
    layers: [
      noise(0.34, { type: "bandpass", freq: 9000, toFreq: 3200, q: 1.2 }, 0.004, 0.03, 0.52),
      after(0.08, sub(44, 1.1, 0.42)),
      after(0.3, soft(0.5, metal(4200, 0.6, 0.2, 220))),
    ],
  },
];
