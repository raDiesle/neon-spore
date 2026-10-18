import * as look from "../../../../../packages/render/src/siren-voice-look.js";
import { patch, type Variant } from "../../../variant.js";
import { wavesListen, wavesSpeak } from "./paint.js";

export const SIREN_VOICE_WAVES: Variant = {
  slot: "siren:voice",
  name: "waves",
  sentence:
    "a voice and an ear joined by sound — three arcs lit one after another going out of a dot on the talker's chip, and coming into an ear on the listener's",
  dir: "tools/versus/candidates/siren-voice/waves",
  patches: [
    patch({
      target: look.SIREN_VOICE,
      reached: () => look.SIREN_VOICE,
      where: {
        file: "packages/render/src/siren-voice-look.ts",
        symbol: "SIREN_VOICE",
        type: "SirenVoiceLook",
      },
      fields: { speak: wavesSpeak, listen: wavesListen },
    }),
  ],
};
