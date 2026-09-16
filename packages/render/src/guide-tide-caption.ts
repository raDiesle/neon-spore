import { anchorPoint } from "./caption-anchor.js";
import { halo } from "./glow.js";
import type { GuideLook } from "./guide-look.js";
import { BAND_FOOT, CAPTION_FONT } from "./guide-tide.js";
import { companionPoint } from "./guide-tide-companion.js";
import { CORNER, crest } from "./guide-tide-plate.js";
import { handoverPlateBox } from "./handover-look.js";
import { rgba } from "./hex.js";
import { LABEL_LINE } from "./label-box.js";
import { PALETTE } from "./palette.js";
import { withNames } from "./seat-name.js";
import { wrapText } from "./wrap-text.js";

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
 *
 * **And the page may have a second subject with nothing written on it**
 * (`companion.ts`), which is the rest of the owner's ask. Two things follow
 * from that and both are here: the silent one is ringed differently — a whole
 * thin circle that breathes, against the caption's turning dashes — so a pair
 * can tell at a glance which of the two the words are about; and the pool has
 * to open over both, because a subject the page is pointing at cannot be in
 * the part of the field the page dimmed.
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

  const mate = companionPoint(l, world, step.anchor, beatPhase);
  const pools = [point, ...(mate ? [mate] : [])].map((p) => ({
    x: p.x,
    y: p.y,
    r: Math.max(p.r, p.rx ?? 0) + POOL,
  }));
  scrimAround(ctx, l, pools, SCRIM * k);

  ctx.font = CAPTION_FONT;
  const lines = wrapText(ctx, withNames(step.text, names), l.width - 24 - PAD_X * 2);
  let tw = 0;
  for (const line of lines) tw = Math.max(tw, ctx.measureText(line).width);
  const w = tw + PAD_X * 2;
  const h = lines.length * LABEL_LINE + PAD_Y * 2 + CREST_ROOM;
  const x = Math.max(8, Math.min(Math.max(8, l.width - w - 8), point.x - w / 2));
  const ring = Math.max(point.r, point.rx ?? 0) + 10;
  const above = point.y - ring - point.clear - LEAD - h;
  // **THE HANDOVER's plate is a second floor**, in the other direction, and it
  // came across with the rest of this file when TIDE was taken. A caption
  // anchored on a strip stands `CLEAR_STRIP` above its ring, which on that
  // wave is exactly the lip of the band the plate sits on — so the page that
  // says PLAYER 2 MOVES THE CANNON covered all of THEIR PANEL — BACK IN 3 but
  // its first two letters (photographed 13 September 2026). A caption can go
  // under its ring and the plate cannot go anywhere: the countdown is the
  // fault's only answer to *when* (`handover-look.ts`).
  const plate = handoverPlateBox(ctx, l, world);
  const covered =
    plate !== null &&
    x < plate.x + plate.w &&
    x + w > plate.x &&
    above < plate.y + plate.h &&
    above + h > plate.y;
  const below = above < BAND_FOOT || covered;
  const y = below ? Math.max(BAND_FOOT, point.y + ring + point.clear + LEAD) : above;

  ctx.globalAlpha = k;
  if (mate) silentRing(ctx, mate, tick);
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

/**
 * The field dimmed everywhere but over the page's subjects.
 *
 * **Cut rather than layered.** The obvious way to open a second pool is a
 * second radial gradient, and two of them overlap: the far corners take both
 * and go to twice the darkness the owner asked for. So the scrim is one flat
 * fill of a rectangle with a circle per subject taken out of it under the
 * even-odd rule — the far field is the same value however many subjects there
 * are — and the soft edge is put back inside each hole afterwards, where there
 * is nothing yet to add to.
 */
function scrimAround(
  ctx: CanvasRenderingContext2D,
  l: { width: number; height: number },
  pools: readonly { x: number; y: number; r: number }[],
  alpha: number,
): void {
  const cut = new Path2D();
  cut.rect(0, 0, l.width, l.height);
  for (const p of pools) {
    cut.moveTo(p.x + p.r, p.y);
    cut.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  }
  ctx.fillStyle = `rgba(3,2,10,${alpha.toFixed(3)})`;
  ctx.fill(cut, "evenodd");
  for (const p of pools) {
    const g = ctx.createRadialGradient(p.x, p.y, p.r * 0.45, p.x, p.y, p.r);
    g.addColorStop(0, "rgba(3,2,10,0)");
    g.addColorStop(1, `rgba(3,2,10,${alpha.toFixed(3)})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * The second subject: a whole circle, breathing, with no leader and no words.
 *
 * It is the caption's ring with the two things taken away that say *read this*
 * — the dashes, which the eye follows round, and the line to the box. What is
 * left still says *and this one*, which is all it is for.
 */
function silentRing(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number; rx?: number },
  tick: number,
): void {
  const r = Math.max(at.r, at.rx ?? 0);
  const breath = 0.5 + 0.5 * Math.sin(tick * 0.09);
  ctx.strokeStyle = rgba(PALETTE.pod, 0.4 + 0.25 * breath);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r + 2 * breath, 0, Math.PI * 2);
  ctx.stroke();
  halo(ctx, at.x, at.y, r * 1.8, PALETTE.pod, 0.1 + 0.07 * breath);
}
