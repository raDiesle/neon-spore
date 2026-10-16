import * as look from "../../../../../packages/render/src/pod-look.js";
import { patch, type Variant } from "../../../variant.js";
import { blinkAt, drawSeed, type Moored, seedAt } from "../seed.js";

/**
 * **SMART, blinking like a pickup** — the same tumbling seed, and on the
 * count the whole sphere flashes white-hot and swells for a moment, its halo
 * kicking out with it, the way a bonus in a game says "take me". Once a beat
 * with time to spare, twice a beat as the clock runs down, four times in the
 * last one (`blinkAt`): the blink is the clock, read without the ring.
 */
export const blinkPod: Moored = (ctx, l, x, y, t, beatsLeft) => {
  const s = seedAt(l, x, y, t, beatsLeft);
  const flash = blinkAt(t, beatsLeft);
  s.R *= 1 + 0.12 * flash;
  drawSeed(ctx, s, { flash, spike: "cap", skin: "spots" });
};

export const POD_REAL_BLINK: Variant = {
  slot: "pod:real",
  name: "blink",
  sentence:
    "SMART's tumbling seed, spotted and capped with round mushroom studs, that flashes white and swells on the count like a pickup — once a beat, then twice, then four times in the last",
  dir: "tools/versus/candidates/pod-real/blink",
  patches: [
    patch({
      target: look.POD_LOOK,
      reached: () => look.POD_LOOK,
      where: { file: "packages/render/src/pod-look.ts", symbol: "POD_LOOK", type: "PodLook" },
      fields: { moored: blinkPod },
    }),
  ],
};
