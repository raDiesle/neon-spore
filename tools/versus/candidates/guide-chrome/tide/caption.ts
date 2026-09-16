import { anchorPoint } from "../../../../../packages/render/src/caption-anchor.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import type { GuideLook } from "../../../../../packages/render/src/guide-look.js";
import { LABEL_LINE } from "../../../../../packages/render/src/label-box.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { withNames } from "../../../../../packages/render/src/seat-name.js";
import { wrapText } from "../../../../../packages/render/src/wrap-text.js";
import { BAND_FOOT, CAPTION_FONT } from "./paint.js";
import { CORNER, crest } from "./plate.js";

/**
 * The words, the ring and the scrim.
 *
 * **The scrim is SPOTLIGHT's, at half its weight.** The owner liked the idea
 * and said what was wrong with the strength: *maybe try to make the overlay of
 * darker less darker, that the field is easier seen (as the space game area is
 * already dark black)*. SPOTLIGHT took the field to `rgba(3,2,10,.6)` at the
 * edges, which on a field that is already near-black is most of a wave gone.
 * `SCRIM` below is what is left, and the pool around the subject is opened
 * wider to match — dimming less means the edge of the pool has to be further
 * out to still read as an edge.
 *
 * **The ring is CONSOLE's**, unchanged, because it is the thing the owner
 * named first: the dashed amber circle turning slowly on whatever the page is
 * about.
 *
 * **The box is TIDE's own plate** — square with the corners taken off and the
 * crest inside the top, the same body as every button — with a leader drawn
 * from it to the ring rather than a grown tail. A tail is a speech bubble and
 * a speech bubble belongs to a character; this page has no character in it.
 */

/** Ticks the caption takes to arrive. */
const FADE_TICKS = 10;
const PAD_X = 16;
const PAD_Y = 12;
/** Room above the words for the crest, which takes the top of the plate. */
const CREST_ROOM = 8;
const LEAD = 18;
/** How dark the field goes at the edges of the pool, at full fade. */
const SCRIM = 0.32;
/** How far past the subject the pool reaches before the dimming begins. */
const POOL = 34;

export const caption: GuideLook["caption"] = (ctx, l, world, set, step, tick, beatPhase, names) => {
  const point = anchorPoint(l, world, set, step.anchor, beatPhase);
  if (!point) return;
  const k = Math.min(1, Math.max(0, (tick - step.tick) / FADE_TICKS));
  if (k <= 0) return;

  const hole = Math.max(point.r, point.rx ?? 0) + POOL;
  const scrim = ctx.createRadialGradient(point.x, point.y, hole, point.x, point.y, hole + 150);
  scrim.addColorStop(0, "rgba(3,2,10,0)");
  scrim.addColorStop(1, `rgba(3,2,10,${SCRIM * k})`);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, l.width, l.height);

  ctx.font = CAPTION_FONT;
  const lines = wrapText(ctx, withNames(step.text, names), l.width - 24 - PAD_X * 2);
  let tw = 0;
  for (const line of lines) tw = Math.max(tw, ctx.measureText(line).width);
  const w = tw + PAD_X * 2;
  const h = lines.length * LABEL_LINE + PAD_Y * 2 + CREST_ROOM;
  const x = Math.max(8, Math.min(Math.max(8, l.width - w - 8), point.x - w / 2));
  const ring = Math.max(point.r, point.rx ?? 0) + 10;
  const above = point.y - ring - point.clear - LEAD - h;
  const below = above < BAND_FOOT;
  const y = below ? Math.max(BAND_FOOT, point.y + ring + point.clear + LEAD) : above;

  ctx.globalAlpha = k;
  // The viewfinder's ring, turning, and the leader from the plate to it.
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.lineDashOffset = -tick * 0.6;
  ctx.beginPath();
  ctx.arc(point.x, point.y, ring, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  halo(ctx, point.x, point.y, ring * 1.5, PALETTE.pod, 0.2);
  const tipX = Math.max(x + 14, Math.min(x + w - 14, point.x));
  ctx.beginPath();
  ctx.moveTo(tipX, below ? y : y + h);
  ctx.lineTo(point.x, below ? point.y + ring : point.y - ring);
  ctx.stroke();

  // The plate: the same body the buttons are cut from, in the amber the rest
  // of the chrome writes in.
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "rgba(22,17,44,.97)");
  g.addColorStop(1, "rgba(7,5,18,.97)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, CORNER);
  ctx.fill();
  ctx.stroke();
  crest(ctx, { x, y, w, h }, PALETTE.pod, 0.5);
  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = "center";
  lines.forEach((line, i) => {
    ctx.fillText(line, x + w / 2, y + CREST_ROOM + PAD_Y + 16 + i * LABEL_LINE);
  });
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
};
