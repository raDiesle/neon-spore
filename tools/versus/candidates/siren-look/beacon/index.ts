import * as look from "../../../../../packages/render/src/siren-look.js";
import { patch, type Variant } from "../../../variant.js";
import { beaconSiren } from "./paint.js";

export const SIREN_BEACON: Variant = {
  slot: "siren:look",
  name: "beacon",
  sentence:
    "a rotating roof beacon — a glass dome with a mirror turning inside, one slow cool beam for a call, two fast red beams and a white flash for a torch",
  dir: "tools/versus/candidates/siren-look/beacon",
  patches: [
    patch({
      target: look.SIREN_LOOK,
      reached: () => look.SIREN_LOOK,
      where: { file: "packages/render/src/siren-look.ts", symbol: "SIREN_LOOK", type: "SirenLook" },
      fields: { paint: beaconSiren },
    }),
  ],
};
