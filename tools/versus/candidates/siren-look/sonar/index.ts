import * as look from "../../../../../packages/render/src/siren-look.js";
import { patch, type Variant } from "../../../variant.js";
import { sonarSiren } from "./paint.js";

export const SIREN_SONAR: Variant = {
  slot: "siren:look",
  name: "sonar",
  sentence:
    "a sonar ping — no lamp, rings leaving a bright core across the top of the screen: one slow cyan ring for a call, three fast thick ember rings for a torch",
  dir: "tools/versus/candidates/siren-look/sonar",
  patches: [
    patch({
      target: look.SIREN_LOOK,
      reached: () => look.SIREN_LOOK,
      where: { file: "packages/render/src/siren-look.ts", symbol: "SIREN_LOOK", type: "SirenLook" },
      fields: { paint: sonarSiren },
    }),
  ],
};
