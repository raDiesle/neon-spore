import type { ControlSet, SceneStep } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { anchorPoint } from "./caption-anchor.js";
import { BANNER_H, BANNER_TOP } from "./guide-switch.js";
import { handoverPlateBox } from "./handover-look.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type SeatNames, withNames } from "./seat-name.js";
import { wrapText } from "./wrap-text.js";

/**
 * A step's words, drawn beside the thing they are about.
 *
 * **There is no text block under the picture, and that is the point.** The
 * owner asked for the tutorial to be the real screen at full size with the
 * words *inside* it, in the position where they are explaining — a paragraph
 * below a shrunken picture is two things to look at, and the eye that is
 * reading the paragraph is not watching the thing it describes.
 *
 * So a caption names a subject (`SceneAnchor`) and `caption-anchor.ts` finds
 * it — a body on the field, a control on the band or on a round's own panel,
 * the swelling that control is reached through on the hull, whatever a hand is
 * holding, a mark on the warning strip, the bar that says what the hull has
 * left. Nothing is placed by coordinate, so a caption cannot come off its
 * subject when the layout changes; what is left in this file is the box, which
 * has not changed since the owner asked for it to be louder.
 *
 * **It is loud now, and that was the owner's second answer to watching it.**
 * The first version was thirteen-point type in a box at three-quarters opacity
 * over a field with a blob falling through it, and the instruction was that the
 * text has to be more visible. So: bigger type, a solid ground under it, a
 * two-pixel edge in the subject's own colour, and it wraps rather than being
 * pushed off the side of a narrow screen.
 */

/** Ticks the caption takes to fade in, so a step arrives rather than blinks. */
const FADE_TICKS = 10;
const PAD = 13;
/** One line's height, and the type it is set in. */
const LINE = 21;
const FONT = '700 16px "Courier New",monospace';

export function drawCaption(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  set: ControlSet,
  step: SceneStep,
  tick: number,
  beatPhase: number,
  /** The two people's names, where the room knows them: a caption that says
   * PLAYER 2 says their name instead (`seat-name.ts`). Unset on a device
   * playing alone, and then the caption is the one content wrote. */
  names?: SeatNames,
): void {
  const point = anchorPoint(l, world, set, step.anchor, beatPhase);
  if (!point) return;
  const k = Math.min(1, Math.max(0, (tick - step.tick) / FADE_TICKS));
  if (k <= 0) return;

  // The ring first, under the words: it is the subject being pointed at, and a
  // label over its own highlight would be a label nobody could read.
  if (step.anchor.at !== "hull" && step.anchor.at !== "retries") {
    ctx.globalAlpha = 0.75 * k;
    ctx.strokeStyle = PALETTE.pod;
    ctx.lineWidth = 2;
    ctx.beginPath();
    // An ellipse rather than a circle, because one subject is not round: a
    // round's slab is a wide rectangle, and a circle big enough to contain one
    // is a ring with the button rattling around inside it.
    const grow = 4 - 2 * k;
    ctx.ellipse(point.x, point.y, (point.rx ?? point.r) + grow, point.r + grow, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.font = FONT;
  // Wrapped rather than clamped: a caption wider than the screen used to be
  // shoved sideways until it was no longer beside the thing it was about.
  const lines = wrapText(ctx, withNames(step.text, names), l.width - 24 - PAD * 2);
  const h = lines.length * LINE + 12;
  let w = 0;
  for (const line of lines) w = Math.max(w, ctx.measureText(line).width);
  w += PAD * 2;
  const x = Math.max(8, Math.min(Math.max(8, l.width - w - 8), point.x - w / 2));
  // Above its subject when there is room above, below it when there is not:
  // the one thing a caption may never do is sit off the top of the screen. The
  // floor is the banner rather than the edge, because the banner is the other
  // thing that has to stay readable (`guide-switch.ts`).
  const floor = BANNER_TOP + BANNER_H + 8;
  const above = point.y - point.r - point.clear - h;
  // **And THE HANDOVER's plate is a second floor**, for the same reason and in
  // the other direction. A caption anchored on a strip stands `CLEAR_STRIP`
  // above its ring, which on that wave is exactly the lip of the band the
  // plate sits on — so the page that says PLAYER 2 MOVES THE CANNON covered
  // all of THEIR PANEL — BACK IN 3 but its first two letters. A caption can go
  // under its ring and the plate cannot go anywhere: the countdown is the
  // fault's only answer to *when*, and it is on the band because the band is
  // what is changing hands (`handover-look.ts`).
  const plate = handoverPlateBox(ctx, l, world);
  const covered =
    plate !== null &&
    x < plate.x + plate.w &&
    x + w > plate.x &&
    above < plate.y + plate.h &&
    above + h > plate.y;
  const below = above < floor || covered;
  const y = below ? Math.max(floor, point.y + point.r + point.clear) : above;

  ctx.globalAlpha = k;
  ctx.fillStyle = "rgba(9,7,20,.96)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  // A short leader, so a label pushed sideways to stay on screen still says
  // which thing it belongs to.
  ctx.beginPath();
  ctx.moveTo(Math.max(x + 6, Math.min(x + w - 6, point.x)), below ? y : y + h);
  ctx.lineTo(point.x, below ? point.y + point.r + 2 : point.y - point.r - 2);
  ctx.stroke();

  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = "center";
  ctx.font = FONT;
  lines.forEach((line, i) => {
    ctx.fillText(line, x + w / 2, y + 22 + i * LINE);
  });
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}
