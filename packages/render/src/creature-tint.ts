import { type Color, otherColor } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * The three colours a body carries, and what they are mid-turn.
 *
 * THE RECOIL is the one creature on this field whose colour changes while it
 * is alive, and two files now have to agree about what colour it is on any
 * given frame: `living-draw.ts` paints the body, and `recoil.ts` lights the
 * cage around it in the same colour. A cage a shade behind the body it holds
 * would read as a second creature standing in the same tile, so the crossing
 * is written once here and called from both rather than copied.
 *
 * Nothing here knows about distance: every caller hazes what it gets back,
 * because where a colour is spent on depth is `depth.ts`'s business alone.
 */
export interface Tint {
  /** The bright edge of the body. */
  rim: string;
  /** Its fill. */
  hex: string;
  /** The shadow under it. */
  dark: string;
}

/**
 * The trio a colour is painted in. A colourless body — The Throb, which
 * carries none at all — comes back in the dim greys, because a null read as
 * cyan would paint a decoy in one of the two ammunition colours.
 */
export function colorTrio(color: Color | null): Tint {
  if (color === null) return { rim: PALETTE.sparkDim, hex: PALETTE.dim, dark: PALETTE.rockDark };
  if (color === "red") return { rim: PALETTE.redRim, hex: PALETTE.red, dark: PALETTE.redDark };
  return { rim: PALETTE.cyanRim, hex: PALETTE.cyan, dark: PALETTE.cyanDark };
}

/**
 * The trio partway through a turn: `turn` is 1 for every body on the field but
 * THE RECOIL on the beat a shot knocked it (`recoilTurn`), and over that beat
 * the red it was crosses to the cyan it has become while it travels.
 *
 * Eased at both ends so the crossing is a change of state rather than a
 * dissolve running at a constant rate.
 */
export function turnedTrio(color: Color | null, turn: number): Tint {
  const k = turn >= 1 || color === null ? 1 : smoothstep(turn);
  const to = colorTrio(color);
  if (k >= 1 || color === null) return to;
  const from = colorTrio(otherColor(color));
  return {
    rim: mixHex(from.rim, to.rim, k),
    hex: mixHex(from.hex, to.hex, k),
    dark: mixHex(from.dark, to.dark, k),
  };
}
