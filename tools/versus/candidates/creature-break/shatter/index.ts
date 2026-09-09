import * as breakLook from "../../../../../packages/render/src/break-look.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:break` / `shatter` — a killed body comes apart into pieces of
 * itself, instead of throwing a dozen squares and vanishing.
 *
 * **What the shipped side is.** Twelve three-pixel particles thrown outwards in
 * the body's colour (`effects-spark.ts`), and the body simply stops being
 * drawn. That is the whole answer the field has ever had to the most common
 * event in the game. A square says *something happened here*; it has never had
 * the shape of the thing that died, so a slick and a bulb and a throb all come
 * apart identically, and none of them comes apart into anything.
 *
 * **What this argues.** The pieces should be pieces *of that body*. The
 * fracture is cut from the same contour `livingPath` draws it with
 * (`shatter.ts`), so the pieces put back together are the body again with no
 * gaps, and the cut faces — the surfaces that were *inside* it, which no player
 * has ever seen — are dark where the rim is bright. Nine wedges, cut again at
 * half their reach, which is the tuning `bun run breaks` settles on: a
 * shattered core and slabs of skin off the rim, the difference between a body
 * quartered and a body that took a hit.
 *
 * Then they fall, land on the hull and fade there — the owner's answer, given
 * on 9 September 2026, to whether a break may leave anything behind.
 *
 * **The sparks come down to five rather than out.** A candidate that adds
 * pieces has to be able to quieten the old effect in the same breath, or the
 * pair is judging two effects at once and cannot say which one it liked. Five
 * is the flash — the instant of the hit, which the fracture is too slow to
 * carry — with the pieces doing the rest.
 *
 * **How it can lose, and the pair should watch for exactly this.** *The column
 * stops being readable.* Two people calling columns to each other need a lane
 * to be clear the moment it is clear, and this puts eighteen fragments in one
 * for most of a second and then leaves them lying on the ship. If the pair find
 * themselves hesitating over whether something is still falling in a lane they
 * have already cleared, that is this look, and no amount of fading fixes it —
 * the debris *is* the claim.
 *
 * **And one thing that is wrong on purpose, at this stage.** The `destroy`
 * event carries a colour and no kind, so the contour is asked of
 * `kindForColor`: a red kill breaks as a slick and a cyan one as a bulb. For
 * every ordinary kill that is exactly right. For a magnet, a throb or a recoil
 * — which all emit the same plain `destroy` — the pieces are cut from the wrong
 * silhouette. `docs/queue.md` carries the fix as its own item, and it is a
 * change to `packages/sim`; the pose this is judged on is a slick, so nobody is
 * being shown the defect and told it is the look.
 */
export const BREAK_SHATTER: Variant = {
  slot: "creature:break",
  name: "shatter",
  sentence:
    "a killed body comes apart into eighteen pieces of its own outline — dark on the faces that were inside it, thrown, and left to land on the hull",
  dir: "tools/versus/candidates/creature-break/shatter",
  patches: [
    patch({
      target: breakLook.BREAK_LOOK,
      // No accessor: `Debris.break` reads the export itself, on the frame the
      // body dies. The module namespace is the whole route there is.
      reached: () => breakLook.BREAK_LOOK,
      where: {
        file: "packages/render/src/break-look.ts",
        symbol: "BREAK_LOOK",
        type: "BreakLook",
      },
      fields: {
        wedges: 9,
        innerAt: 0.5,
        speedTiles: 1.2,
        spin: 6,
        gravityTiles: 14,
        life: 1,
        fade: 0.4,
        skid: 0.3,
        sparkScale: 0.4,
      },
    }),
  ],
};
