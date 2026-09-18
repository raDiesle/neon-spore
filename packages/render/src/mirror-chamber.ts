import { drawBandGround } from "./band-ground.js";
import { BAND_JOIN } from "./band-join.js";
import { chamberPath, drawSeamFlesh, drawSeamSpill, seamTop, seamY } from "./band-seam.js";
import { MIRROR_SKIN } from "./hull-skin.js";
import type { Circle, Layout } from "./layout.js";
import type { SeatSkin } from "./seat-skin.js";
import { BAND_SLIME } from "./slime-look.js";

/**
 * THE MIRROR'S INSIDES — the chamber under its hull, the way the pair's own
 * ship has one under theirs.
 *
 * The mirror was a hull and nothing else: the ship's contour, flipped, hung
 * across the top of an empty sky with its belly cut off flat at the row above
 * it. What makes the pair's ship read as a thing rather than a line is
 * everything the band draws under the membrane — the tissue the hull is the
 * skin of, the light that falls through into it, the ribs running on down
 * through it and the slime that hangs off it — and none of that reached the
 * copy. The owner's brief for every boss (`.claude/skills/new-boss` §6.3) is
 * that it *looks like something real*, in the one state it has; for this
 * boss that state is *your ship*, and this is the half of your ship it was
 * missing.
 *
 * It is the band's own passes with the controls left out, in the mirror's
 * colours and under the mirror's flip. Nothing here is a new shape: the
 * chamber, its roof, its ribs and its pendants are the ones `band.ts` draws
 * (`band-seam.ts`, `band-ground.ts`, `band-join.ts`, `slime-look.ts`), and
 * the flip sends them where a reflection would put them — the slime hangs
 * *up*, into the chamber above the hull. That is not a mistake to correct: a
 * reflection of a thing that drips is a thing that drips the other way, and
 * "an exact copy of your ship" is the whole claim this boss makes
 * (`mirror.ts`).
 */

/**
 * The mirror's chamber colours: `MIRROR_SKIN`'s hull, and every stop under
 * it matched to player one's by value the way player two's are — so the copy
 * differs from the ship in hue and in nothing else (`seat-skin.ts`). The
 * first ground stop is the hull's last body colour, which is what makes the
 * join have nothing in it to see.
 */
export const MIRROR_SEAT: SeatSkin = {
  hull: MIRROR_SKIN,
  tint: "#FF2E52",
  rim: "#FFD9DE",
  lip: ["rgba(250,120,140,0.3)", "rgba(206,60,90,0.07)", "rgba(98,20,36,0.24)"],
  ground: ["#120106", "#0D0104", "#080103", "#040001"],
  flesh: ["#F85A6E", "#CC4458", "#A83848"],
  dead: ["#3A0E18", "#240810"],
  face: "#4A1420",
};

/** Nothing stands in the mirror's chamber: no button, no strip, no socket. */
const NO_LOBES: readonly Circle[] = [];

/**
 * Draw the chamber, in the layout the mirror's hull was drawn in and after
 * it — the band is drawn over the ship's belly on the pair's screen too, and
 * the visible edge of the ship is the membrane rather than a rectangle's
 * bottom (`seam-line.ts`).
 */
export function drawMirrorChamber(ctx: CanvasRenderingContext2D, l: Layout, time: number): void {
  const skin = MIRROR_SEAT;
  const chamber = chamberPath(l, time, NO_LOBES);
  drawSeamFlesh(ctx, l, skin);
  ctx.save();
  ctx.clip(chamber);
  drawBandGround(ctx, l, seamTop(l), skin);
  drawSeamSpill(ctx, l, skin);
  BAND_JOIN.attach({
    ctx,
    l,
    lobes: NO_LOBES,
    time,
    skin,
    ceilingY: (x) => seamY(l, x, time, NO_LOBES),
  });
  BAND_SLIME.drips({ ctx, l, time, skin, lobes: NO_LOBES });
  ctx.restore();
}
