import type { SimEvent } from "@neon-spore/sim";
import type { Burst } from "./effects-spark.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The bursts for the bodies answered by hands alone (`creatures-handed.ts`),
 * cut out of `burstFor` when THE CHOKE's three took that file past its limit.
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
        | "chokeGrip"
        | "chokeTap"
        | "chokeFreed";
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
    // THE CHOKE in its own material: taking the cannon, on the hull; every tap
    // player 1 lands, on the strip's knob rather than on the field — the one
    // burst in this table that is on the band, because the thing that
    // happened happened there and the pair has to see that a tap *did*
    // something; and letting go, at the cannon (`choke.ts`).
    case "chokeGrip":
      return { x: tileCX(l, e.col), y: l.hullY, n: 14, hex: PALETTE.bile };
    case "chokeTap":
      return { x: tileCX(l, e.col), y: l.cannonStrip.y, n: 4, hex: PALETTE.bileRim };
    case "chokeFreed":
      return { x: tileCX(l, e.col), y: l.hullY, n: 24, hex: PALETTE.bile };
  }
}

function at(l: Layout, col: number, row: number, n: number, hex: string): Burst {
  return { x: tileCX(l, col), y: tileCY(l, row), n, hex };
}
