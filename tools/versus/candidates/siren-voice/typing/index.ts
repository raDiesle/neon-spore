import * as look from "../../../../../packages/render/src/siren-voice-look.js";
import { patch, type Variant } from "../../../variant.js";
import { typingListen, typingSpeak } from "./paint.js";

export const SIREN_VOICE_TYPING: Variant = {
  slot: "siren:voice",
  name: "typing",
  sentence:
    "the messenger's three dots — hopping in turn inside the speech bubble on the talker's chip, and drifting one after another into the ear on the listener's",
  dir: "tools/versus/candidates/siren-voice/typing",
  patches: [
    patch({
      target: look.SIREN_VOICE,
      reached: () => look.SIREN_VOICE,
      where: {
        file: "packages/render/src/siren-voice-look.ts",
        symbol: "SIREN_VOICE",
        type: "SirenVoiceLook",
      },
      fields: { speak: typingSpeak, listen: typingListen },
    }),
  ],
};
