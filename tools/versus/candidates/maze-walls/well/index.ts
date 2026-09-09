import * as mazeLook from "../../../../../packages/render/src/maze-look.js";
import { patch, type Variant } from "../../../variant.js";
import { well } from "./paint.js";

/**
 * `maze:walls` / `well` — the drum is a well sunk into the screen, and a
 * corridor further in is a corridor further **down**.
 *
 * **This is the first candidate on this page for an interlude at all.** Every
 * slot before it was a creature, the ship, a control or a boss's armour — the
 * field. The rounds are whole screens a pair reads for a minute at a time, and
 * not one of them had ever been offered a second answer to anything it draws,
 * because `versus-pose.ts` had no pose that handed the pair one.
 * `poses-rounds.ts` is that pose now.
 *
 * **What the shipped side is.** Circles with gaps cut in them and radial walls
 * between them, every line at one of two weights and one of two colours. It is
 * an honest picture of the *sheet* — the walls are exactly the walls the route
 * was solved from, which is why it stopped looking like a target — and it says
 * nothing whatever about depth. Which ring is nearer is a thing the pair has to
 * work out from the numbers rather than see, and they have to work it out while
 * the drum is turning.
 *
 * **What this argues.** Give the corridors a floor. Each annulus between two of
 * the sheet's own circles is filled, darker the further in it is, drawn back to
 * front so a deeper one lies over the shallower one it sits inside; and a band
 * of shadow just inside the rim is the lip of the well, the one edge that says
 * the whole drum is sunk into the screen rather than lying on it. Not one line
 * of the geometry moves — `drawMazeWalls` is called last, over the floors.
 *
 * **How it can lose, and the pair should watch for exactly this.** *The gaps
 * stop reading.* What a pair is actually hunting for is a break in a circle,
 * and a break is visible because the line stops — against a floor that changes
 * value at exactly that circle, the eye may find the change of value first and
 * take the boundary for the wall. If they start missing openings that are
 * plainly there, that is this look, and darkening it further only makes it
 * worse. RAIL beside it is the opposite bet: leave the space alone, and put the
 * depth on the walls.
 */
export const MAZE_WELL: Variant = {
  slot: "maze:walls",
  name: "well",
  sentence:
    "each corridor gets a floor, darker the further in it is, with a lip of shadow inside the rim — so the drum reads as a well sunk into the screen and a deeper ring is plainly deeper",
  dir: "tools/versus/candidates/maze-walls/well",
  patches: [
    patch({
      target: mazeLook.MAZE_LOOK,
      // No accessor: `maze-draw.ts` reads the export itself, once a frame.
      reached: () => mazeLook.MAZE_LOOK,
      where: {
        file: "packages/render/src/maze-look.ts",
        symbol: "MAZE_LOOK",
        type: "MazeLook",
      },
      fields: { walls: well },
    }),
  ],
};
