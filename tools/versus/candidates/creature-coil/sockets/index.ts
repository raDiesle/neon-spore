import * as coilLook from "../../../../../packages/render/src/coil-look.js";
import { bolt } from "../../../../../packages/render/src/coil-look.js";
import { patch, type Variant } from "../../../variant.js";
import { sockets } from "./paint.js";

/**
 * `creature:coil` / `sockets` — the studs are cups in the shell.
 *
 * **What the shipped side is.** Three bright discs sitting on the rim, the
 * same size and brightness whichever way they face: a ring of lights
 * around a circle.
 *
 * **What this argues.** That the marks a charge leaves by should be
 * *places* on the shell rather than dots beside it. Each stud becomes a
 * cup sunk into the rim — a dark floor with a lit wall on the side away
 * from the key, which is the side a ball is dark on and the one thing that
 * says *into* — quiet while the dome is idle, and filling from the bottom
 * up with hot light while a charge is on its way, so the dome is seen to be
 * filled by what is coming. The bolt is the shipped one.
 *
 * **How it can lose.** *A dark cup on a bright rim is a bite out of it.* If
 * at 26 px an idle dome with three sockets reads as a shell with holes in
 * it, the picture says *failing* at the moment it should say nothing.
 */
export const COIL_SOCKETS: Variant = {
  slot: "creature:coil",
  name: "sockets",
  sentence:
    "the studs as cups sunk into the rim — a dark floor with a lit wall on the side away from the key, quiet while the dome is idle, and filling from the bottom up with hot light while a charge is on its way; the shipped bolt",
  dir: "tools/versus/candidates/creature-coil/sockets",
  patches: [
    patch({
      target: coilLook.COIL_LOOK,
      // No accessor: `coil.ts` and `coil-jump.ts` read the export itself. The
      // module namespace is the whole route there is.
      reached: () => coilLook.COIL_LOOK,
      where: {
        file: "packages/render/src/coil-look.ts",
        symbol: "COIL_LOOK",
        type: "CoilLook",
      },
      // The charge is the shipped one: this slot patches both fields because
      // every candidate in it must, and this answer has nothing to say about
      // the crossing.
      fields: { studs: sockets, charge: bolt },
    }),
  ],
};
