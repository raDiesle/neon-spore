import type { SimEvent } from "@neon-spore/sim";
import type { Burst } from "./effects-spark.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

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
        | "balloonBurst"
        | "gumStick"
        | "gumFlung"
        | "gumBlock"
        | "clingGrip"
        | "clingShake"
        | "clingFreed"
        | "clingBlast";
    }
  >,
  l: Layout,
): Burst {
  switch (e.type) {
    // A balloon given: rock grey and narrow, since a balloon carries no colour.
    case "balloonSplit":
      return at(l, e.col, e.row, 12, PALETTE.rock);
    // One that reached the top: wide, in the pod's amber (hull damage lands at
    // the ship, `sim/balloon.ts`).
    case "balloonBurst":
      return at(l, e.col, e.row, 26, PALETTE.pod);
    // THE GUM in its own material: landing, flung, and at the muzzle for each
    // shot it refused. Everything between is read off the world (`gum.ts`).
    case "gumStick":
      return at(l, e.col, e.row, 14, PALETTE.venom);
    case "gumFlung":
      return at(l, e.col, e.row, 24, PALETTE.venom);
    case "gumBlock":
      return { x: tileCX(l, e.col), y: l.hullY, n: 6, hex: PALETTE.venom };
    // THE LIMPET and THE LEECH, in the malfunction's blue: the grab where it
    // landed, a move shaking sparks off it, letting go — and the blast, which
    // is the breach's own burst made louder in the fire's colour, because the
    // wave has just been lost to a control that stood still (`cling.ts`).
    case "clingGrip":
      return { x: tileCX(l, e.from), y: l.hullY, n: 14, hex: PALETTE.arc };
    case "clingShake":
      return { x: tileCX(l, e.col), y: l.hullY, n: 5, hex: PALETTE.arcRim };
    case "clingFreed":
      return { x: tileCX(l, e.col), y: l.hullY, n: 24, hex: PALETTE.arc };
    case "clingBlast":
      return { x: tileCX(l, e.col), y: l.hullY, n: 40, hex: PALETTE.ember };
  }
}

function at(l: Layout, col: number, row: number, n: number, hex: string): Burst {
  return { x: tileCX(l, col), y: tileCY(l, row), n, hex };
}
