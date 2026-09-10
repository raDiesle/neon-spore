import * as echoLook from "../../../../../packages/render/src/echo-look.js";
import { patch, type Variant } from "../../../variant.js";
import { buds } from "./paint.js";

/**
 * `creature:echo` / `buds` — two lit cores under one skin, drawn apart along
 * the axis, with the furrow as the dark between them.
 *
 * **What the shipped side is.** One dark line across a body that is one blob
 * until the beat it is two. The line says where; nothing says what.
 *
 * **What this argues.** That the two should be inside it from the start:
 * two balls of the body's own colour, each lit from `KEY` however the body
 * leans, on top of each other on the first frame and pulled apart along the
 * field axis the halves will actually step along as the strain gathers —
 * one heart becoming two over three beats. The furrow is kept between them
 * and deepens as they separate.
 *
 * **How it can lose.** *Two bright discs on a small round body is a face*,
 * and this game already has one of those.
 */
export const ECHO_BUDS: Variant = {
  slot: "creature:echo",
  name: "buds",
  sentence:
    "two lit cores under one skin — one on top of the other at first and drawn apart along the axis as the parting comes, with the shipped furrow deepening between them",
  dir: "tools/versus/candidates/creature-echo/buds",
  patches: [
    patch({
      target: echoLook.ECHO_LOOK,
      // No accessor: `drawEchoSeam` reads the export itself. The module
      // namespace is the whole route there is.
      reached: () => echoLook.ECHO_LOOK,
      where: {
        file: "packages/render/src/echo-look.ts",
        symbol: "ECHO_LOOK",
        type: "EchoLook",
      },
      fields: { seam: buds },
    }),
  ],
};
