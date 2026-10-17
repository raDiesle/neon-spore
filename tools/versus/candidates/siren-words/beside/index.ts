import * as look from "../../../../../packages/render/src/siren-words-look.js";
import { patch, type Variant } from "../../../variant.js";
import { besideWords } from "./paint.js";

export const SIREN_WORDS_BESIDE: Variant = {
  slot: "siren:words",
  name: "beside",
  sentence:
    "both seats' words on the bar's own row, P1's left of P1's chip and P2's right of P2's, edged in the seat's hull colour — no row under the siren at all",
  dir: "tools/versus/candidates/siren-words/beside",
  patches: [
    patch({
      target: look.SIREN_WORDS,
      reached: () => look.SIREN_WORDS,
      where: {
        file: "packages/render/src/siren-words-look.ts",
        symbol: "SIREN_WORDS",
        type: "SirenWordsLook",
      },
      fields: { paint: besideWords },
    }),
  ],
};
