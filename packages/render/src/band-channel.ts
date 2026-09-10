import type { ControlDef } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";
import { STRIP_LOOK } from "./strip-look.js";

/**
 * A STRIP, AS A CHANNEL CUT IN THE TISSUE.
 *
 * Split out of `band-control.ts` when the panel's new look pushed that file
 * past its 250-line limit, along the seam that was already in it: next door is
 * *one button and what it stands in*, and this is *the groove a column slides
 * along*. They share nothing but the panel they are on.
 *
 * The strip used to be two `fillRect`s — a flat bar with a flat block on it —
 * and together with the band's own rectangle that was what the owner called
 * the box. It is a trough now: a closed contour that undulates along both
 * edges, a dark pool inside it, a lip that catches the light from the seam
 * above, and the seat's own colour laid faintly along the bottom so the thing
 * reads as the rail the lobe runs on.
 *
 * **The trough is the seat’s colour; what runs in it is the control’s.** The
 * tissue the channel is cut into, the lip that catches the light and the
 * stations along the floor are all the ship’s own flesh, so they are violet on
 * one seat and gold on the other. The rail and the block on it stay the
 * cannon’s violet and the shield’s cyan on both screens, because those say
 * *which control* and a pair with two vocabularies for one game is the thing
 * `docs/spec/controls.md` argues against.
 *
 * Nothing about *where* it is has moved: `Layout.cannonStrip`/`shieldStrip`
 * still say, and `touchDown` still answers the same rectangle around them.
 */

export function drawStripFor(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: ControlDef,
): void {
  const cannon = c.id === "cannon";
  const s = cannon ? l.cannonStrip : l.shieldStrip;
  STRIP_LOOK.draw({
    ctx,
    l,
    which: cannon ? 0 : 1,
    y: s.y,
    h: s.height,
    col: cannon ? world.cannonCol : world.shieldCol,
    hex: cannon ? PALETTE.hull : PALETTE.shield,
    label: c.label,
    skin: seatSkin(l.role),
  });
}

/**
 * **What a strip looks like is next door.** `strip-look.ts` holds the channel,
 * its lip, the rail and the block as a record, so a candidate panel can draw a
 * rail as something other than a trough — this file only decides which strip
 * is which and where the world says its column is.
 */
