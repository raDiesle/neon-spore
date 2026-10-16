import * as look from "../../../../../packages/render/src/siren-look.js";
import { patch, type Variant } from "../../../variant.js";
import { lightbarSiren } from "./paint.js";

export const SIREN_LIGHTBAR: Variant = {
  slot: "siren:look",
  name: "lightbar",
  sentence:
    "an emergency light bar — a row of cells: one cyan light scanning end to end for a call, red and white halves strobing against each other for a torch, each flash lighting a band of the screen",
  dir: "tools/versus/candidates/siren-look/lightbar",
  patches: [
    patch({
      target: look.SIREN_LOOK,
      reached: () => look.SIREN_LOOK,
      where: { file: "packages/render/src/siren-look.ts", symbol: "SIREN_LOOK", type: "SirenLook" },
      fields: { paint: lightbarSiren },
    }),
  ],
};
