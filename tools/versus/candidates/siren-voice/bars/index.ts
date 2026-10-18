import * as look from "../../../../../packages/render/src/siren-voice-look.js";
import { patch, type Variant } from "../../../variant.js";
import { barsListen, barsSpeak } from "./paint.js";

export const SIREN_VOICE_BARS: Variant = {
  slot: "siren:voice",
  name: "bars",
  sentence:
    "a voice meter and headphones — five bars jumping out of step on the talker's chip, the way a phone shows you are being recorded, and a headset nodding to the beat on the listener's",
  dir: "tools/versus/candidates/siren-voice/bars",
  patches: [
    patch({
      target: look.SIREN_VOICE,
      reached: () => look.SIREN_VOICE,
      where: {
        file: "packages/render/src/siren-voice-look.ts",
        symbol: "SIREN_VOICE",
        type: "SirenVoiceLook",
      },
      fields: { speak: barsSpeak, listen: barsListen },
    }),
  ],
};
