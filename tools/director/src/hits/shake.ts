import { streamFor } from "../skins/seed.js";
import type { Hit } from "./types.js";

/**
 * The figure jitters on impact and settles.
 *
 * Screen shake, applied to one body rather than to the screen — which is the
 * only version available here, and arguably the better one for this game: the
 * field is two players reading columns, and a whole screen that jumps is a
 * screen nobody can read a column off.
 *
 * **Seeded from the name**, so THE WEIGHT jitters THE WEIGHT's way on every
 * reload. That matters more here than anywhere else on the page, because the
 * alternative is `Math.random` and a shake is exactly the effect somebody
 * reaches for it with — rule (b), and the reason a card looks the same in the
 * screenshot a decision gets made over.
 */
const THROW = 0.055;
const RATE = 34;

export const SHAKE: Hit<"shake"> = {
  id: "shake",
  label: "SHAKE",
  hint: "the whole figure jitters on impact and settles — seeded, so it shakes the same way twice",
  phase: "impact",
  spread: THROW,
  build(ctx) {
    const rand = streamFor(ctx.name);
    // Two fixed phases rather than a fresh number per frame: a jitter driven
    // by noise looks like noise, and one driven by two detuned oscillators
    // reads as a thing ringing. It also allocates nothing.
    const px = rand() * Math.PI * 2;
    const py = rand() * Math.PI * 2;
    const reach = Math.max(ctx.extent.w, ctx.extent.h) * THROW;
    ctx.transform(({ t, hit }) => {
      if (hit.shock <= 0) return "";
      const a = hit.shock * hit.shock * reach;
      const dx = Math.sin(t * RATE + px) * a;
      const dy = Math.cos(t * RATE * 1.31 + py) * a;
      return `translate(${dx.toFixed(3)} ${dy.toFixed(3)})`;
    });
  },
};
