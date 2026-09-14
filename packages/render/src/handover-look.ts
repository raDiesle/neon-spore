import { handedOver, handoverLeft, handoverWarning, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { tradedHull } from "./handover-hull.js";
import { rgba } from "./hex.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE HANDOVER's announcement: the plate on the lip of the band.**
 *
 * The fault is the one thing in this game that moves a *control* from one screen
 * to the other, and almost all of what says so is already drawn: the band comes
 * up in the other seat's colours with the other seat's buttons in it, the hull
 * above it changes colour too, and the emitter's beam stands on the whole panel
 * rather than on one lobe (`fault-beam-ends.ts`). A pair who have played eight
 * acts on one colour cannot miss that.
 *
 * What none of it can say is **when**, and that is this file. Two beats before
 * the trade a plate counts it down, and while the panels are away it counts them
 * back. Both phones carry the same words, because a warning only one of them
 * could read would make the trade something that happens *to* the other one, and
 * a surprise is the one thing in this game there is nothing to say about
 * (`config-malfunction.ts`, `handoverWarnBeats`).
 *
 * **On the lip of the band** — straddling `bandTop`, half over the field and half
 * over the controls — because the band is the thing changing hands. Over the hull
 * is where the ship speaks about the *field* (`banner.ts`'s DEFLECTED), and under
 * the dials is where a seat is told what it owes (`duty.ts`); neither is about a
 * panel. In the fault's own arc-blue, the colour a torn button bleeds and the
 * beam is carrying, so the plate reads as the malfunction rather than as the
 * ship's own instrument.
 */

/** The plate's type, and its two paddings. A phone is the narrow case: the
 * longest line is the held one, and at this size it is well inside the stage. */
const FONT = '600 13px "Courier New",monospace';
const PAD_X = 10;
const HEIGHT = 20;

/**
 * **The rectangle the plate fills, or null when there is nothing to say.**
 *
 * Exported because a second thing draws in that place and could not know it
 * was there. A rehearsal's caption anchored on the cannon strip stands
 * `CLEAR_STRIP` above its ring, which on this wave is exactly the lip of the
 * band — photographed on 13 September 2026 with `bun run frames . --wave "THE
 * HANDOVER" --opening guide --guide-page 3`, where PLAYER 2 MOVES THE CANNON
 * covered all of THEIR PANEL — BACK IN 3 but its first two letters. Two texts
 * in one place is the defect `guide-plate-room.test.ts` already guards for
 * between the round header and the corner plate, and the answer is the same:
 * whoever arrives second asks where the first one is (`guide-caption.ts`).
 *
 * It takes the context because the plate is as wide as its own words, and the
 * font is this file's. `drawHandoverNotice` fills exactly this rectangle, so
 * there is one answer rather than two that drift.
 */
export function handoverPlateBox(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
): PlateBox | null {
  const text = handoverWords(l, world);
  return text === null ? null : plateBoxAround(ctx, l, text);
}

export interface PlateBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The plate that would be drawn around these words.
 *
 * Taking the text rather than the world so a test can ask about the words it
 * watched a frame draw. A rehearsal's world belongs to the play and nothing
 * outside it has a handle on one (`guide-scene.ts`), so the alternative was a
 * test that re-derived the padding and the height from copies of two constants
 * in this file — which is the thing `purity.test.ts`'s `COPIES` table exists
 * to stop.
 *
 * The font is restored by name rather than through `save`/`restore`: a caller
 * measuring its own type either side of this one should get its own width
 * back.
 */
export function plateBoxAround(ctx: CanvasRenderingContext2D, l: Layout, text: string): PlateBox {
  const font = ctx.font;
  ctx.font = FONT;
  const half = ctx.measureText(text).width / 2 + PAD_X;
  ctx.font = font;
  return { x: l.width / 2 - half, y: l.bandTop - HEIGHT / 2, w: half * 2, h: HEIGHT };
}

/** What the plate says on this screen, or null when there is nothing to say. */
export function handoverWords(l: Layout, world: World): string | null {
  const left = handoverLeft(world);
  if (left > 0) {
    // The rig is both halves on one screen and trades with nobody, so it is told
    // the fault is on and not that the panel it is holding is somebody else's
    // (`handover.ts`: `test` never changes seats).
    return l.role === "test" ? `PANELS TRADED — BACK IN ${left}` : `THEIR PANEL — BACK IN ${left}`;
  }
  const away = handoverWarning(world);
  return away > 0 ? `PANELS TRADE IN ${away}` : null;
}

/**
 * What the announcement is drawn from besides the world: where in the beat
 * the frame is, and the membrane the ship pass drew, so a look that says the
 * trade *on the hull* can stand on the skin rather than on a flat line. Null
 * where no ship pass ran.
 */
export interface HandoverView {
  beatPhase: number;
  surfaceY: SurfaceY | null;
}

/**
 * The plate, over the finished band.
 *
 * It brightens on the beat and fades across it, the cadence the whole warning is
 * counted in: the number on it changes on the same edge, so the flash is the
 * thing that makes a pair read it again rather than once.
 */
export function drawHandoverNotice(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: HandoverView,
): void {
  const text = handoverWords(l, world);
  if (text === null) return;
  // The same rectangle a caption is told to keep off, rather than a second
  // copy of the arithmetic that could drift from it.
  const box = handoverPlateBox(ctx, l, world);
  if (box === null) return;
  const beat = Math.max(0, 1 - view.beatPhase * 2);
  ctx.save();
  ctx.font = FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const half = box.w / 2;
  const x = l.width / 2;
  const y = l.bandTop;
  // A dark plate first, so the band's own lobes and the field's stars both stop
  // at its edge — type laid straight over either is type nobody can read, which
  // is `text-drop.ts`'s rule said about a line that is standing still.
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, 6);
  ctx.fillStyle = rgba("#05040B", 0.88);
  ctx.fill();
  ctx.strokeStyle = rgba(PALETTE.arc, 0.55 + 0.45 * beat);
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
  halo(ctx, x, y, Math.round(half * 1.2), PALETTE.arc, 0.18 + 0.3 * beat);
  // Brighter while the panels are actually away: the warning is a thing to hear
  // once a beat and the trade is a thing to be looking at.
  ctx.fillStyle = handedOver(world) ? PALETTE.arcRim : rgba(PALETTE.arcRim, 0.7 + 0.3 * beat);
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * **The announcement the frame draws, as a record a candidate can patch.**
 *
 * `frame-ship.ts` calls `HANDOVER_LOOK.announce` rather than the function
 * above, so a VERSUS candidate for `handover:notice` can stand its own answer
 * in the same place — the shape-sheet's `HULL · TRADED`, two lobes on the hull
 * exchanging their heights for the length of the window — against the plate,
 * on the same world and the same beat (`tools/versus/candidates/`,
 * `docs/versus.md`). The game itself draws the plate: nothing here is a look
 * change, only the seam a look is compared through.
 */
export const HANDOVER_LOOK: {
  announce: (ctx: CanvasRenderingContext2D, l: Layout, world: World, view: HandoverView) => void;
} = { announce: tradedHull };
