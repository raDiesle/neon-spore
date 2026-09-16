import { hitFor } from "../../../../../packages/render/src/body-hit.js";
import { BREAK_LOOK } from "../../../../../packages/render/src/break-look.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:splinters` / `shards` — six slivers come off the faces the cut
 * opened, out ahead of the wedges and gone before they land.
 *
 * **What the shipped side is.** Nothing. `systems.md` 5.6 has asked for "three
 * to six splinters off the broken edge" since before any of the destruction
 * existed, and the fracture that landed on 9 September 2026 gave a body pieces
 * without giving it one splinter — so `BREAK_LOOK.splinters` is 0 and the
 * field's answer to that sentence is none.
 *
 * **What this argues.** That the cut is what makes them possible and it is a
 * waste not to use it. Cutting a body into pieces that tile it exactly opens
 * surfaces that were *inside* it, and a splinter is a sliver off one of those:
 * it starts with its tip on the contour, so the body is still whole on the
 * frame it dies, and leaves at a bit over half again the wedges' speed along
 * the ray it was on. For the first fifth of a second that is the only thing
 * moving — six needles out of a body that has not visibly come apart yet —
 * and it is what makes the break read as *a hit* rather than as a body
 * dissolving on a schedule.
 *
 * **How it can lose.** Six more things in a lane, on the same complaint the
 * pieces already answer for: a column has to be readable the moment it is
 * clear, and these are the fastest thing in it and the first to cross into the
 * column next door. And they are thin — at 26 px across a phone, a needle a
 * third of a body long is two pixels wide, and two pixels of red over the
 * plating is what the ordinary kill's sparks already look like. If a pair
 * cannot tell a splinter from a spark, this buys a rule nobody can see.
 *
 * The tuning is `SLICK · SPLINTERED` on `bun run breaks`, directly comparable
 * to `SLICK · SPALLED` two rows up: same cut, same fall, the slivers the only
 * difference between them.
 */
export const SPLINTERS_SHARDS: Variant = {
  slot: "creature:splinters",
  name: "shards",
  sentence:
    "six slivers off the faces the cut opened — they leave along the ray they were on at half again the wedges' speed, ahead of the pieces and gone before those land",
  dir: "tools/versus/candidates/creature-splinters/shards",
  patches: [
    patch({
      // The same route `creature:debris` takes, and for the same reason: every
      // kind's `pieces` is this one object today (`body-hit.ts`), and what the
      // drawing code reaches is the lookup and never the export. A slick,
      // because a slick is the body the pose kills.
      target: BREAK_LOOK,
      reached: () => hitFor("slick").pieces,
      where: {
        file: "packages/render/src/break-look.ts",
        symbol: "BREAK_LOOK",
        type: "BreakLook",
      },
      fields: { splinters: 6 },
    }),
  ],
};
