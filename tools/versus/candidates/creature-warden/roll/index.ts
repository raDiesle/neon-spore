import * as wardenLook from "../../../../../packages/render/src/warden-look.js";
import { patch, type Variant } from "../../../variant.js";
import { roll } from "./paint.js";

/**
 * `creature:warden` / `roll` — the ring is a smoke ring: a tube turning
 * inside-out, its surface rolling in over the crest and down into the hole.
 *
 * **What the shipped side is.** A flat fill of dark rock with marks on it —
 * five veins running in from the rim, twenty-four eyelets blinking where they
 * were scattered, two soft patches of wet light — and the one thing on it
 * with a thickness is the armour BEVEL gave it. The body under the armour is
 * a disc with a hole, and every mark on it stays exactly where it is.
 *
 * **What this argues.** That a ring is a *tube*, and a tube has a crest, a
 * near side, and two edges that fall away from you. `tube.ts` reads the
 * material at every bearing as a circle in section, from the lip of the hole
 * up over the crest to the rim, and lights it by calling `surfaceLit` on that
 * circle's own normal: a radial gradient per sector, darkest at the lip, a wet
 * specular along the crest where it faces the key, and a cool floor on the
 * side turned away. Then the whole surface **rolls**: every eyelet and every
 * vein is pinned at a bearing and a tube latitude, and the latitude advances
 * on an eighteen-second clock, so a mark surfaces at the outer edge as a
 * sliver, widens as it crosses the crest, and narrows into the lip of the
 * hole — foreshortened across the tube by `cos β`, the tangent plane's own
 * map, and lit by where it stands. The material is being *swallowed*, which
 * is the one motion a body whose middle is a hole should have. The eyelets
 * keep the shipped count, size and blink; the fringe, the two edges and the
 * armour are the shipped passes called as they are, so the readouts on both
 * phones are the same readouts.
 *
 * **How it can lose.** *It is a treadmill.* A surface that never stops
 * flowing is a thing the eye tracks, and this boss stands on the field for
 * the whole fight beside a pupil the pair has to watch drift from column to
 * column. If at the pair the roll pulls the eye off the pupil, or the sectors
 * show as spokes on a phone, the roll has to slow or the shade has to go
 * smooth, and the second of those is most of the frame cost.
 */
export const WARDEN_ROLL: Variant = {
  slot: "creature:warden",
  name: "roll",
  sentence:
    "the ring read as a tube — lit from the lip over a wet crest to the rim, and turning inside-out on a slow clock so every eyelet and vein surfaces at the outer edge, crosses the crest and is swallowed into the hole",
  dir: "tools/versus/candidates/creature-warden/roll",
  patches: [
    patch({
      target: wardenLook.WARDEN_LOOK,
      // No accessor: `warden.ts` reads the export itself, once per frame. The
      // module namespace is the whole route there is.
      reached: () => wardenLook.WARDEN_LOOK,
      where: {
        file: "packages/render/src/warden-look.ts",
        symbol: "WARDEN_LOOK",
        type: "WardenLook",
      },
      fields: { surface: roll },
    }),
  ],
};
