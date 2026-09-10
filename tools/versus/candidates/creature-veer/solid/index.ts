import * as veerLook from "../../../../../packages/render/src/veer-look.js";
import { patch, type Variant } from "../../../variant.js";
import { solidRider } from "./paint.js";

/**
 * `creature:veer` / `solid` — the same clown, lit as a thing with a round
 * side, and shadowed onto the stone it sits on.
 *
 * **What the shipped side is.** A figure of flat discs — five beads, a head,
 * a cone, a pompom — each a fill with an outline, drawn over a rock the key
 * light already models as a ball. The rock is solid and the rider is paper.
 *
 * **What this argues.** That the rider should take the same light as the
 * stone: every disc lit by `litRound` under the field's own key, the cone
 * split down its axis into a lit face and a shadow face that swap when the
 * hat whips over, and a contact shadow pooled on the rock under the collar —
 * the one mark that says *on* rather than *beside*. Nothing moves and
 * nothing is re-proportioned; the figure is `clownFigure`'s. It is the
 * smallest possible answer, and it is the one `.claude/skills/depth` says is
 * cheap and safe on a big body.
 *
 * **How it can lose.** *It reads as the same clown.* If at the pair a lit
 * head and a flat head are one head, the light was spent on a body too small
 * to carry it and the shadow under the collar is the only thing that stays.
 */
export const VEER_SOLID: Variant = {
  slot: "creature:veer",
  name: "solid",
  sentence:
    "the same clown lit as a solid — every disc under the field's key light, the cone split into a lit face and a shadow face, and a contact shadow pooled on the stone under the collar so the rider is on the rock and not beside it",
  dir: "tools/versus/candidates/creature-veer/solid",
  patches: [
    patch({
      target: veerLook.VEER_LOOK,
      // No accessor: `veer-clown.ts` reads the export itself. The module
      // namespace is the whole route there is.
      reached: () => veerLook.VEER_LOOK,
      where: {
        file: "packages/render/src/veer-look.ts",
        symbol: "VEER_LOOK",
        type: "VeerLook",
      },
      fields: { rider: solidRider },
    }),
  ],
};
