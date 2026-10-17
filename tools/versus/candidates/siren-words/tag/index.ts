import * as look from "../../../../../packages/render/src/siren-words-look.js";
import { patch, type Variant } from "../../../variant.js";
import { tagWords } from "./paint.js";

export const SIREN_WORDS_TAG: Variant = {
  slot: "siren:words",
  name: "tag",
  sentence:
    "only your own word, on a plate hanging by a short stem from your ringed chip, edged in the ring's purple — the tag and the ring read as one: you, and what you say",
  dir: "tools/versus/candidates/siren-words/tag",
  patches: [
    patch({
      target: look.SIREN_WORDS,
      reached: () => look.SIREN_WORDS,
      where: {
        file: "packages/render/src/siren-words-look.ts",
        symbol: "SIREN_WORDS",
        type: "SirenWordsLook",
      },
      fields: { paint: tagWords },
    }),
  ],
};
