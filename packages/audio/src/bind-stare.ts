import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind.js";

/**
 * THE STARE's, in a file of their own for `bind-gorge.ts`' reason, and with
 * **no pan on any of them**: the eye is over the middle, and the beam and the
 * laser are heard through the hull's own breach, which is placed.
 *
 * **A beat is the music** (`sounds/boss-stare.ts`): a knock on a shut beat, a
 * blink on an open one, the downbeat of the pattern a touch louder so the bar
 * can be counted, and each level a step higher — a level is also a key.
 * `stareAgain` is silent by design: the blue pass that follows it is heard.
 */
export function stareCue(e: Extract<SimEvent, { type: `stare${string}` }>): Cue | null {
  switch (e.type) {
    case "stareBeat": {
      const pitch = 1 + e.level * 0.06;
      const gain = e.step === 0 ? 1.15 : 1;
      return { id: e.open ? "boss.stareBlink" : "boss.stareBeat", pitch, gain };
    }
    case "stareCaught":
      return { id: "boss.stareCaught" };
    case "stareHit":
      return { id: "boss.stareHit", pitch: 1 + e.level * 0.06 };
    case "stareCharge":
      return { id: "boss.stareCharge", pitch: 1 + e.pass * 0.05 };
    case "stareVent":
      return { id: "boss.stareVent" };
    case "stareBlast":
      return { id: "boss.stareBlast" };
    case "stareAgain":
      return null;
    case "stareOut":
      return { id: "boss.stareOut" };
  }
}
