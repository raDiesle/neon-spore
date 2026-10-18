import * as look from "../../../../../packages/render/src/siren-voice-look.js";
import { patch, type Variant } from "../../../variant.js";
import { mouthListen, mouthSpeak } from "./paint.js";

export const SIREN_VOICE_MOUTH: Variant = {
  slot: "siren:voice",
  name: "mouth",
  sentence:
    "lips and an ear on one clock — a mouth opening and shutting on syllables on the talker's chip, and the ear leaning in with a wave rising each time it opens on the listener's",
  dir: "tools/versus/candidates/siren-voice/mouth",
  patches: [
    patch({
      target: look.SIREN_VOICE,
      reached: () => look.SIREN_VOICE,
      where: {
        file: "packages/render/src/siren-voice-look.ts",
        symbol: "SIREN_VOICE",
        type: "SirenVoiceLook",
      },
      fields: { speak: mouthSpeak, listen: mouthListen },
    }),
  ],
};
