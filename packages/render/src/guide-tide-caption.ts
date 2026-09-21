import { halo } from "./glow.js";
import type { GuideLook } from "./guide-look.js";
import { type CaptionBox, captionBox, TEXT_TOP } from "./guide-tide-caption-box.js";
import { companionPoint } from "./guide-tide-companion.js";
import { CORNER, crest } from "./guide-tide-plate.js";
import { rgba } from "./hex.js";
import { LABEL_LINE } from "./label-box.js";
import { PALETTE } from "./palette.js";

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
 * **The ring is CONSOLE's**, because it is the thing the owner named first:
 * the dashed amber ring turning slowly on whatever the page is about. It was
 * a *circle* until 21 September 2026, which is the one thing about it that has
 * changed: `AnchorPoint` carries two half-axes and every reader of it took the
 * larger, so a page about a bar drew a circle as tall as the bar is wide. THE
 * GORGE's sack is seven columns across and half a tile deep, and its ring
 * reached most of the way down the field. The two radii were already there;
 * this draws the ellipse they describe, and a subject that is as tall as it is
 * wide is the same circle it always was.
 *
 * **The box is TIDE's own plate** — square with the corners taken off and the
 * crest inside the top, the same body as every button — with a leader drawn
 * from it to the ring rather than a grown tail. A tail is a speech bubble and
 * a speech bubble belongs to a character; this page has no character in it.
 *
 * **And the page may have a second subject with nothing written on it**
 * (`guide-tide-companion.ts`), which is the rest of the owner's ask. Two things follow
 * from that and both are here: the silent one is ringed differently — one
 * unbroken thin line that breathes, against the caption's turning dashes — so a pair
 * can tell at a glance which of the two the words are about; and the pool has
 * to open over both, because a subject the page is pointing at cannot be in
 * the part of the field the page dimmed.
 */

/** Ticks the caption takes to arrive. */
const FADE_TICKS = 10;
/** How dark the field goes at the edges of the pool, at full fade. */
const SCRIM = 0.32;
/** How far past the subject the pool reaches before the dimming begins. */
const POOL = 34;

export const caption: GuideLook["caption"] = (ctx, l, world, set, step, tick, beatPhase, names) => {
  const box = captionBox(ctx, l, world, set, step, beatPhase, names);
  if (!box) return;
  const k = Math.min(1, Math.max(0, (tick - step.tick) / FADE_TICKS));
  if (k <= 0) return;
  const { point, ringX, ringY, below, x, y, w, h } = box;

  const mate = companionPoint(l, world, step.anchor, beatPhase);
  // The pool is the subject's own shape opened out, for the ring's reason: a
  // circle round a bar dims a column of field the page is not about, and the
  // scrim is the half of the effect the eye reads first.
  const pools = [point, ...(mate ? [mate] : [])].map((p) => ({
    x: p.x,
    y: p.y,
    rx: (p.rx ?? p.r) + POOL,
    ry: p.r + POOL,
  }));
  scrimAround(ctx, l, pools, SCRIM * k);

  ctx.globalAlpha = k;
  if (mate) silentRing(ctx, mate, tick);
  // The viewfinder's ring, turning, and the leader from the plate to it.
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.lineDashOffset = -tick * 0.6;
  ctx.beginPath();
  ctx.ellipse(point.x, point.y, ringX, ringY, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  // The halo is a round glow behind a ring that need not be round, so it is
  // sized off the mean of the two axes — the ring's own radius when the two
  // agree, and light behind a bar rather than a second circle when they do not.
  halo(ctx, point.x, point.y, (ringX + ringY) * 0.75, PALETTE.pod, 0.2);
  const tipX = Math.max(x + 14, Math.min(x + w - 14, point.x));
  ctx.beginPath();
  ctx.moveTo(tipX, below ? y : y + h);
  ctx.lineTo(point.x, below ? point.y + ringY : point.y - ringY);
  ctx.stroke();

  // The plate: the same body the buttons are cut from, in the amber the rest
  // of the chrome writes in.
  drawPlate(ctx, box);
  ctx.globalAlpha = 1;
};

/** The plate itself, and the words in it. */
function drawPlate(ctx: CanvasRenderingContext2D, { x, y, w, h, lines }: CaptionBox): void {
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
    ctx.fillText(line, x + w / 2, y + TEXT_TOP + i * LABEL_LINE);
  });
  ctx.textAlign = "left";
}

/**
 * The field dimmed everywhere but over the page's subjects.
 *
 * **Cut rather than layered.** The obvious way to open a second pool is a
 * second radial gradient, and two of them overlap: the far corners take both
 * and go to twice the darkness the owner asked for. So the scrim is one flat
 * fill of a rectangle with one hole per subject taken out of it under the
 * even-odd rule — the far field is the same value however many subjects there
 * are — and the soft edge is put back inside each hole afterwards, where there
 * is nothing yet to add to.
 */
function scrimAround(
  ctx: CanvasRenderingContext2D,
  l: { width: number; height: number },
  pools: readonly { x: number; y: number; rx: number; ry: number }[],
  alpha: number,
): void {
  const cut = new Path2D();
  cut.rect(0, 0, l.width, l.height);
  for (const p of pools) {
    cut.moveTo(p.x + p.rx, p.y);
    cut.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
  }
  ctx.fillStyle = `rgba(3,2,10,${alpha.toFixed(3)})`;
  ctx.fill(cut, "evenodd");
  // Canvas has no elliptical gradient, so the soft edge is drawn round in a
  // frame stretched to the hole it belongs in — the one place in this file
  // that touches the transform, and it is put back before anything else runs.
  for (const p of pools) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.rx / p.ry, 1);
    const g = ctx.createRadialGradient(0, 0, p.ry * 0.45, 0, 0, p.ry);
    g.addColorStop(0, "rgba(3,2,10,0)");
    g.addColorStop(1, `rgba(3,2,10,${alpha.toFixed(3)})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, p.ry, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * The second subject: one unbroken line, breathing, no leader and no words.
 *
 * It is the caption's ring with the two things taken away that say *read this*
 * — the dashes, which the eye follows round, and the line to the box. What is
 * left still says *and this one*, which is all it is for. It is a body's two
 * half-axes for the same reason the caption's is: `companionPoint` has handed
 * both out since it was written, saying in its own comment that a ring cutting
 * through the two ends of a body says the wrong thing louder than the words.
 */
function silentRing(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number; rx?: number },
  tick: number,
): void {
  const breath = 0.5 + 0.5 * Math.sin(tick * 0.09);
  const rx = (at.rx ?? at.r) + 2 * breath;
  const ry = at.r + 2 * breath;
  ctx.strokeStyle = rgba(PALETTE.pod, 0.4 + 0.25 * breath);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  halo(ctx, at.x, at.y, (rx + ry) * 0.9, PALETTE.pod, 0.1 + 0.07 * breath);
}
