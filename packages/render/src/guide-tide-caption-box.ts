import type { ControlSet, SceneStep } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { type AnchorPoint, anchorPoint } from "./caption-anchor.js";
import { BAND_FOOT, CAPTION_FONT } from "./guide-tide.js";
import { handoverPlateBox } from "./handover-look.js";
import { LABEL_LINE } from "./label-box.js";
import type { Layout } from "./layout.js";
import type { SeatNames } from "./seat-name.js";
import { withNames } from "./seat-name.js";
import { shipTopFoot } from "./ship-top-chrome.js";
import { wrapText } from "./wrap-text.js";

/**
 * Where a page's caption plate goes, and what is written in it.
 *
 * Its own file beside the drawing for the reason `caption-anchor.ts` is:
 * that one says what the subject *is*, this one says where the plate stands
 * relative to it, and next door draws. It is also the half a test can hold —
 * the plate is an opaque fill, so a check on the *words* it covers passes
 * while the picture underneath is gone, and the box is the only honest thing
 * to measure (`packages/render/test/caption-chrome.test.ts`).
 */

const PAD_X = 16;
const PAD_Y = 12;
/** Room above the words for the crest, which takes the top of the plate. */
const CREST_ROOM = 8;
const LEAD = 18;

/** The first line's baseline, under the top of the plate. */
export const TEXT_TOP = CREST_ROOM + PAD_Y + 16;

export interface CaptionBox {
  /** The subject the plate points at, and the ring drawn around it. */
  point: AnchorPoint;
  ring: number;
  /** Whether the plate stands under its subject rather than over it. */
  below: boolean;
  lines: string[];
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Null when the page has no subject on the screen — the same answer the
 * drawing gives, so neither has an opinion the other does not.
 *
 * `ctx` is measured against, not drawn on: the plate is as wide as the
 * longest line the words wrap to.
 */
export function captionBox(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  set: ControlSet,
  step: SceneStep,
  beatPhase: number,
  names?: SeatNames,
): CaptionBox | null {
  const point = anchorPoint(l, world, set, step.anchor, beatPhase);
  if (!point) return null;
  ctx.font = CAPTION_FONT;
  const lines = wrapText(ctx, withNames(step.text, names), l.width - 24 - PAD_X * 2);
  let tw = 0;
  for (const line of lines) tw = Math.max(tw, ctx.measureText(line).width);
  const w = tw + PAD_X * 2;
  const h = lines.length * LABEL_LINE + PAD_Y * 2 + CREST_ROOM;
  const x = Math.max(8, Math.min(Math.max(8, l.width - w - 8), point.x - w / 2));
  const ring = Math.max(point.r, point.rx ?? 0) + 10;
  const above = point.y - ring - point.clear - LEAD - h;
  // **THE HANDOVER's plate is a second floor**, in the other direction. A
  // caption anchored on a strip stands `CLEAR_STRIP` above its ring, which on
  // that wave is exactly the lip of the band the plate sits on — so the page
  // that says PLAYER 2 MOVES THE CANNON covered all of THEIR PANEL — BACK IN
  // 3 but its first two letters (photographed 13 September 2026). A caption
  // can go under its ring and the plate cannot go anywhere: the countdown is
  // the fault's only answer to *when* (`handover-look.ts`).
  const plate = handoverPlateBox(ctx, l, world);
  const covered =
    plate !== null &&
    x < plate.x + plate.w &&
    x + w > plate.x &&
    above < plate.y + plate.h &&
    above + h > plate.y;
  // **And the floor is the ship's own chrome, not the band.** The siren, its
  // duty word and the two alarm rows sit under the plate rather than behind
  // it since 16 September 2026, so a caption stopping at the band's foot
  // stops on top of whichever of them is up — TORCH's call read as `-4 · CALL
  // IT` on its own rehearsal, and the duty word `PULL` was half a word. Asked
  // of the files that draw them, because the row they end on depends on
  // which seat is looking (`ship-top-chrome.ts`).
  const floor = Math.max(BAND_FOOT, shipTopFoot(l, world) ?? 0);
  const below = above < floor || covered;
  const y = below ? Math.max(floor, point.y + ring + point.clear + LEAD) : above;
  return { point, ring, below, lines, x, y, w, h };
}
