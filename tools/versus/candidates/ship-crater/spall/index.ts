import * as craterLook from "../../../../../packages/render/src/crater-look.js";
import { patch, type Variant } from "../../../variant.js";
import { spall } from "./paint.js";

/**
 * `ship:crater` / `spall` — the skin around a hole, taken with it.
 *
 * **What the shipped side is.** A flat opaque silhouette of the rock that made
 * the hole, with a hot hairline along the cut (`crater-pit.ts`). It is right
 * about the important thing — the hull's own rim is broken over the mouth
 * rather than carried across it, so the outline stops where the ship stops —
 * and it says nothing about the material that is *still there*. The membrane
 * meets the hole at full brightness, as though the ship had been punched
 * cleanly by something very sharp, when what actually happened is that a rock
 * the size of a tile went into it.
 *
 * **What this argues.** A hole in a skin takes the skin with it. So the hole's
 * own outline, at 1.7 times its radius, is cut into eleven plates whose inner
 * edges are exactly the hole's rim, and each is pulled a little toward the pit
 * and turned a degree or two out of true. The material is still there and it is
 * no longer flat: darker the nearer it gets to what went through, back to the
 * hull's own violet where the intact membrane resumes.
 *
 * This is the same fracture the creature break uses (`shatter.ts`) spent the
 * other way round — on a **permanent deformation** rather than on debris. That
 * is deliberate, and it is half of why the slot is worth opening: if a cut
 * contour reads as damage when nothing about it is moving, the engine is worth
 * more than one effect.
 *
 * **It is watched rather than photographed, and the owner asked for that.** It
 * opened as a still on the argument that a crater is cut once and then simply
 * sits there, which is true of the hole and false of everything around it: a
 * crater is *revealed*, by the rock rolling out of it a second and a half after
 * it landed (`rock-drift.ts`), so the look does not exist on any frame until
 * something has moved. And the way this candidate loses — a hull carrying
 * several holes at once stops reading as one surface — cannot be seen on a
 * picture of one hole at all. The pose is `BREACH · ROCKS COMING THROUGH`
 * (`poses-damage.ts`): four rocks into four columns, one of them two tiles
 * wide, replayed every seven and a half seconds, of which the last two are
 * five holes across a hull with nothing moving on it.
 *
 * **How it can lose, and the pair should watch for exactly this.** *The hull
 * stops reading as one surface.* The membrane is what the whole field is read
 * against — the pair judges every falling body by where it is relative to that
 * line — and eleven plates around each hole is texture placed on the one thing
 * that was deliberately plain. Three or four craters across the hull late in a
 * run is where this decides itself, and the honest test is not whether one
 * crater looks better: it is whether the hull with four of them still reads as
 * a ship rather than as a wall.
 *
 * **What it may not touch, and does not.** The mouth. `scars.ts` starts a
 * crack on a crater's measured rim and `clipOutMouths` breaks the hull's
 * outline over it, so the mouth is where the damage *is* rather than what it
 * looks like. The record is only the pit for that reason (`crater-look.ts`).
 */
export const CRATER_SPALL: Variant = {
  slot: "ship:crater",
  name: "spall",
  sentence:
    "the membrane around a hole is cut into plates and pulled into it — the skin was taken with the rock, not punched cleanly out",
  dir: "tools/versus/candidates/ship-crater/spall",
  patches: [
    patch({
      target: craterLook.CRATER_LOOK,
      // No accessor: `drawCraters` reads the export itself, once per crater per
      // frame. The module namespace is the whole route there is.
      reached: () => craterLook.CRATER_LOOK,
      where: {
        file: "packages/render/src/crater-look.ts",
        symbol: "CRATER_LOOK",
      },
      fields: { pit: spall },
    }),
  ],
};
