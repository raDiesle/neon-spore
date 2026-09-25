import type { SimEvent } from "@neon-spore/sim";
import type { Burst } from "./effects-spark.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { QUEEN_FIGURE } from "./queen-figure.js";

/**
 * The bursts for the bodies answered by hands alone (`creatures-handed.ts`),
 * cut out of `burstFor` when that file reached its limit.
 * The same table, the same rule — a burst is a request, scaled with what it
 * cost — and `burstFor`'s exhaustive switch still names every case here, so
 * an event added to one of these bodies and forgotten in both is a type error
 * there rather than a silence. `at` is that file's, copied rather than
 * imported so the two files do not reach for each other at load.
 */
export function handedBurst(
  e: Extract<
    SimEvent,
    {
      type:
        | "balloonSplit"
        | "balloonTopped"
        | "gumFlung"
        | "clingGrip"
        | "clingFreed"
        | "clingBlast"
        | "weightCrushed"
        | "cairnPulled"
        | "cairnShed"
        | "queenFlinch";
    }
  >,
  l: Layout,
): Burst {
  switch (e.type) {
    // A balloon given: rock grey and narrow, since a balloon carries no colour.
    case "balloonSplit":
      return at(l, e.col, e.row, 12, PALETTE.rock);
    // One that reached the top and **turned into a torch there** — the owner's
    // rule of 14 September 2026. Rock grey and few: nothing has gone off, a
    // body has changed into another body, and the wide amber this used to be
    // would say the hull had just been charged for it (`sim/balloon.ts`
    // `topOut`).
    case "balloonTopped":
      return at(l, e.col, e.row, 10, PALETTE.rock);
    // THE GUM in its own material, flung: the flick itself, thrown where the
    // hand caught it. Its landing is a `breach` (`effects-breach.ts`).
    case "gumFlung":
      return at(l, e.col, e.row, 24, PALETTE.venom);
    // THE LIMPET and THE LEECH, in the malfunction's blue: the grab where it
    // landed, a move shaking sparks off it, letting go — and the blast, which
    // is the breach's own burst made louder in the fire's colour, because the
    // wave has just been lost to a control that stood still (`cling.ts`).
    case "clingGrip":
      return { x: tileCX(l, e.from), y: l.hullY, n: 14, hex: PALETTE.arc };
    case "clingFreed":
      return { x: tileCX(l, e.col), y: l.hullY, n: 24, hex: PALETTE.arc };
    case "clingBlast":
      return { x: tileCX(l, e.col), y: l.hullY, n: 40, hex: PALETTE.ember };
    // THE WEIGHT given between two thumbs: rock grey, because it carries no
    // colour, and **narrow** — a dozen, against the balloon's twenty-six at the
    // top of the field. A body that has been pressed does not throw itself
    // outward; it goes inward and stops being there, and a wide shower would
    // read as something that burst rather than something that gave.
    case "weightCrushed":
      return at(l, e.col, e.row, 12, PALETTE.rock);
    // A unit out of THE CAIRN, rock grey for the weight's reason — it carries
    // no colour and nothing about it was destroyed. **Small**: eight, and
    // fewer than the weight's dozen, because nothing here gave at all. A rock
    // came loose from a pile of rocks, and the dust off a seam is the whole of
    // what a pair should see — a shower would say the boss had been hurt, and
    // the only thing that has happened is that the field now has one more rock
    // in it (`sim/cairn.ts`).
    case "cairnPulled":
      return at(l, e.col, e.row, 8, PALETTE.rock);
    // The one the pile let go of itself, and the only difference is that it is
    // louder. Nobody chose this rock, so it is the one moment in the fight that
    // has to be noticed without a thumb on it.
    case "cairnShed":
      return at(l, e.col, e.row, 14, PALETTE.rock);
    // THE BULB QUEEN flinching: player 1's thumb on the mark that was not the
    // real one under BROOD, and the window shut before it opened
    // (`sim/queen-hand.ts`). Rock grey and the cairn's few — nothing opened,
    // a thumb bounced off armour — and thrown from the mark itself, which
    // hangs `weakCy` under her row (`queen-figure.ts`), not from the tile.
    case "queenFlinch":
      return {
        x: tileCX(l, e.col),
        y: tileCY(l, e.row) + QUEEN_FIGURE.weakCy * l.tile,
        n: 8,
        hex: PALETTE.rock,
      };
  }
}

function at(l: Layout, col: number, row: number, n: number, hex: string): Burst {
  return { x: tileCX(l, col), y: tileCY(l, row), n, hex };
}
