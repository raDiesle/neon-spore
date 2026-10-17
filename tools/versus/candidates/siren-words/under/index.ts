import * as look from "../../../../../packages/render/src/siren-words-look.js";
import { patch, type Variant } from "../../../variant.js";
import { underWords } from "./paint.js";

export const SIREN_WORDS_UNDER: Variant = {
  slot: "siren:words",
  name: "under",
  sentence:
    "both seats' words, each on a dark plate under its own name chip, edged violet for P1 and amber for P2 — yours bright, your partner's quieter",
  dir: "tools/versus/candidates/siren-words/under",
  patches: [
    patch({
      target: look.SIREN_WORDS,
      reached: () => look.SIREN_WORDS,
      where: {
        file: "packages/render/src/siren-words-look.ts",
        symbol: "SIREN_WORDS",
        type: "SirenWordsLook",
      },
      fields: { paint: underWords },
    }),
  ],
};
