import { fillPass } from "../skins/parts.js";
import type { Hit } from "./types.js";

/**
 * One bright frame, then gone. The owner's *Juice* at its plainest.
 *
 * It is the cheapest thing that can be done at the moment of impact and it is
 * the one every other value on the axis is really competing with — the
 * research phrase for it is that the flash has to land on the exact frame of
 * impact, and a flash that is still visible a beat later is not a flash, it is
 * a body that changed colour.
 *
 * So the decay is deliberately much faster than `shock` itself: cubed, which
 * puts it near nothing a third of the way through the aftermath while
 * everything else on the axis is still running.
 */
export const FLASH: Hit<"flash"> = {
  id: "flash",
  label: "FLASH",
  hint: "the body goes white-hot for an instant on impact, and is immediately over",
  phase: "impact",
  spread: 0,
  build(ctx) {
    const lit = fillPass(ctx);
    lit.setAttribute("fill-opacity", "0");
    ctx.onFrame(({ hit }) => {
      const s = hit.shock;
      lit.setAttribute("fill-opacity", (s * s * s * 0.85).toFixed(3));
    });
  },
};
