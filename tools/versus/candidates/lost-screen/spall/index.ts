import * as look from "../../../../../packages/render/src/lost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { spallVeil, spallWords } from "./paint.js";

/**
 * SPALL — the screen is the thing that broke, and nothing on it is wet.
 *
 * **What the game draws today** is a liquid: thirteen violet rivulets down the
 * full width of the phone (`lost-blood.ts`), over two plates that draw back off
 * the field. Every answer this slot has been offered so far has been a fluid of
 * some kind, and a fluid is a mood — it says *something is leaking* and leaves
 * the whole question of how badly to the words.
 *
 * **What this argues** is damage as structure. The owner asked on 17 September
 * 2026 for *heavy damage across the full area*, and the heaviest thing this
 * engine can say is already built: `shatter.ts` cuts a contour into pieces that
 * tile it exactly, and the contour here is the screen. Fifteen slabs from the
 * hole outward, shoved a few pixels off each other, darkened by how far out of
 * the break they came from, with a red light behind everything that shows only
 * where two slabs no longer touch. The pair are looking through a windscreen
 * that went, and the only clear part of it is the piece the hole is in.
 *
 * It is the one answer in this slot that leaves nothing moving. That is
 * deliberate — the field is *held* under this screen, and a still picture is
 * the honest one for a stop — and it is also what it is least likely to be
 * forgiven for.
 *
 * **How it can lose.** A crazed screen is a cliché with a long history and it
 * belongs to a different kind of game: this is a ship seen from outside, not a
 * cockpit, so there is no glass for the pair to have been looking through and
 * the picture has to survive being read as an effect laid over the game rather
 * than as something that happened to it. And slabs are big: the one covering
 * the column the pair are about to talk about is dark whether or not the
 * geometry says the breach is elsewhere.
 */
export const LOST_SPALL: Variant = {
  slot: "lost:screen",
  name: "spall",
  sentence:
    "the screen itself spalled — fifteen slabs shoved off each other from the hole outward, dark at the corners, with red showing only in the cracks",
  dir: "tools/versus/candidates/lost-screen/spall",
  patches: [
    patch({
      target: look.LOST_LOOK,
      reached: () => look.LOST_LOOK,
      where: {
        file: "packages/render/src/lost-look.ts",
        symbol: "LOST_LOOK",
        type: "LostLook",
      },
      fields: { veil: spallVeil, words: spallWords },
    }),
  ],
};
