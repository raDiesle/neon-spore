import * as mazeLook from "../../../../../packages/render/src/maze-look.js";
import { patch, type Variant } from "../../../variant.js";
import { rail } from "./paint.js";

/**
 * `maze:walls` / `rail` — the radial walls stand up, and a corridor has sides
 * you can see.
 *
 * The other answer in this slot, and deliberately the opposite bet to WELL.
 * That one leaves every line exactly as it is and darkens the *space* between
 * them; this one leaves the space alone and gives the walls a thickness. They
 * cannot both be right about where a pair's eye should go on a turning drum,
 * which is the whole reason they are a pair rather than one look with a
 * setting.
 *
 * **What the shipped side is.** A radial wall is a 1.6-pixel line from one
 * circle to the next, at the same weight as the circles it joins. So the drum
 * is a lattice of identical strokes, and the one mark a pair actually navigates
 * by — the *end* of a wall, which is the corner they have to get round — looks
 * exactly like every other pixel on the wheel.
 *
 * **What this argues.** A wall is a thing standing on the floor. Two faces
 * either side of the line the sheet draws, the lit one decided by the wall's
 * own bearing against the key light so the whole drum agrees about where the
 * light is; and a brighter cap at the outer end, where the wall meets the ring
 * it is cut through, because that corner is what the pair is reading for. The
 * geometry is untouched: `wheel.walls` is read and `drawMazeWalls` is called
 * first, with all of this standing on top of it.
 *
 * **How it can lose, and the pair should watch for exactly this.** *The drum
 * gets busier.* This adds three marks per radial wall to a picture that is
 * already a lattice turning over a ship, and the thing a pair is hunting for is
 * an *absence* — a gap in a circle. Making the walls louder makes the gaps
 * quieter by exactly as much. If the wheel starts feeling like something to
 * study rather than something to read, that is this look, and the cap is the
 * first thing to suspect: it is the brightest new mark and it sits precisely
 * where a gap in the next circle out would be.
 */
export const MAZE_RAIL: Variant = {
  slot: "maze:walls",
  name: "rail",
  sentence:
    "each radial wall becomes a post with two faces and a lit cap at its outer end — so a corridor has sides you can see, and the corner a pair has to get round is the brightest mark on the drum",
  dir: "tools/versus/candidates/maze-walls/rail",
  patches: [
    patch({
      target: mazeLook.MAZE_LOOK,
      reached: () => mazeLook.MAZE_LOOK,
      where: {
        file: "packages/render/src/maze-look.ts",
        symbol: "MAZE_LOOK",
        type: "MazeLook",
      },
      fields: { walls: rail },
    }),
  ],
};
