import { type ControlSet, controlBroken, setControls } from "@neon-spore/content";
import { faultsNow, type World } from "@neon-spore/sim";
import { drawStripFor } from "./band-channel.js";
import { drawLobe } from "./band-control.js";
import { bandLobes } from "./band-lobes.js";
import { drawChokeStrip } from "./choke-strip.js";
import type { Layout } from "./layout.js";
import { seatSkin } from "./seat-skin.js";

/**
 * One seat's half of the panel, in the order the set lists it.
 *
 * `armed` and `open` are handed down rather than read here for the reason they
 * always were: they are windows the host is counting, not world state.
 */
export function drawBandHalf(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  set: ControlSet,
  player: 1 | 2,
  armed: boolean,
  open: boolean,
  time: number,
  lead = 0,
): void {
  for (const c of setControls(set, player)) {
    if (c.form !== "strip") continue;
    drawStripFor(ctx, l, world, c);
    // Over the cannon strip while THE CHOKE's fault has the cannon: the rail
    // dead and the body on the node (`choke-strip.ts`).
    if (controlBroken(c.id, faultsNow(world)) && c.id === "cannon")
      drawChokeStrip(ctx, l, world, time, seatSkin(l.role));
  }
  // The lobes come from `bandLobes` rather than from named fields of the
  // layout, and `touchDown` asks it the same question with the same set — so
  // there is one answer to "where is this button", not two that have to agree.
  for (const lobe of bandLobes(l, set, player)) {
    drawLobe(ctx, l, lobe.circle, lobe.control, world, armed, open, time, lead);
  }
}
