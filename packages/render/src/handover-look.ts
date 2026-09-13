import { handedOver, handoverLeft, handoverWarning, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
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
  beatPhase: number,
): void {
  const text = handoverWords(l, world);
  if (text === null) return;
  const beat = Math.max(0, 1 - beatPhase * 2);
  ctx.save();
  ctx.font = FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const half = ctx.measureText(text).width / 2 + PAD_X;
  const x = l.width / 2;
  const y = l.bandTop;
  // A dark plate first, so the band's own lobes and the field's stars both stop
  // at its edge — type laid straight over either is type nobody can read, which
  // is `text-drop.ts`'s rule said about a line that is standing still.
  ctx.beginPath();
  ctx.roundRect(x - half, y - HEIGHT / 2, half * 2, HEIGHT, 6);
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
