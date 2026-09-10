import * as echoLook from "../../../../../packages/render/src/echo-look.js";
import { patch, type Variant } from "../../../variant.js";
import { cleft } from "./paint.js";

/**
 * `creature:echo` / `cleft` — the furrow is a groove with a lit wall and a
 * shadowed one.
 *
 * **What the shipped side is.** One dark stroke across the body, cut deeper
 * as the beat comes. It says where and it says when, and it says both on a
 * flat plane — a line has no walls, so nothing about it can catch a light.
 *
 * **What this argues.** That the mark should be cut *into* the body: the
 * shipped floor exactly where it was, a thin line of the rim colour along
 * the wall that faces `KEY`, and a soft band of the body's dark along the lip
 * that faces away and throws its shadow into the trench. Which wall is which
 * follows the key however the body leans. All three deepen on the strain the
 * shipped seam already reads.
 *
 * **How it can lose.** *Three lines are a stripe* at six tenths of a slick.
 * Judge it at 26 px.
 */
export const ECHO_CLEFT: Variant = {
  slot: "creature:echo",
  name: "cleft",
  sentence:
    "the furrow is a groove cut into the body — the shipped dark floor, a bright wall on the side facing the key and a soft shadow along the lip facing away, all three deepening as the parting comes",
  dir: "tools/versus/candidates/creature-echo/cleft",
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
      fields: { seam: cleft },
    }),
  ],
};
