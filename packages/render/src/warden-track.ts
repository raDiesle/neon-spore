import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { drawInstarGlyph } from "./instar-glyphs.js";
import type { Circle } from "./layout.js";
import { drawMarkWait, markLightAt } from "./mark-feedback.js";
import { PALETTE, STROKE } from "./palette.js";
import { lightWithin } from "./part-light.js";

/**
 * **THE WARDEN's hatch under GLARE is a swipe, so it is drawn as a track**
 * (`instar-track.ts`'s rule, the owner's of 24 September 2026: *a swipe is a
 * track the length of the swipe, never a ring*).
 *
 * The throw counts either way across (`sim/warden-hand.ts`), so the track is
 * one bar through the eye, `wardenThrowMilli` long on each side, with the
 * chevrons pointing out along both halves. The press is still answered on
 * the eye, in the middle (`warden-grip.ts`). The green fill runs from the eye
 * toward the side the thumb is carrying it (`sim` `wardenSwipeAlong`), and the
 * rim goes green once the lift would throw it — so the end of the bar is the
 * end of the swipe, said before the lift.
 *
 * On the navigator's screen it is the partner's track: dimmer, a dashed bar
 * turning round it and the waiting clock on the eye, the way every mark is
 * shown to the seat it is not asking (`mark-feedback.ts`). She sees the fill
 * too, because the carry is the pilot's hand arriving.
 */

/** The bar's half-width, in eye-ring radii — `instar-track.ts`' own. */
const HALF = 0.42;

/** A horizontal bar with round ends through `c`, `reach` out each side, `grow` wider all round. */
function bar(c: Circle, w: number, reach: number, grow: number): Path2D {
  const h = w + grow;
  const p = new Path2D();
  p.arc(c.x - reach, c.y, h, Math.PI / 2, (Math.PI * 3) / 2);
  p.lineTo(c.x + reach, c.y - h);
  p.arc(c.x + reach, c.y, h, -Math.PI / 2, Math.PI / 2);
  p.closePath();
  return p;
}

/**
 * The hatch's track round the eye `c` (its ring radius `c.r`), `reach` out
 * each side, filled to `along` of the way (−1..1, signed the way it goes).
 */
export function drawWardenTrack(
  ctx: CanvasRenderingContext2D,
  c: Circle,
  reach: number,
  along: number,
  mine: boolean,
  time: number,
): void {
  const w = c.r * HALF;
  const p = bar(c, w, reach, 0);
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(p);
  ctx.fillStyle = PALETTE.red;
  ctx.globalAlpha = mine ? 0.22 : 0.1;
  ctx.fill(p);
  ctx.restore();
  // This seat's: a soft red light breathing inside the channel, nothing past it
  // (`part-light.ts`) — until 2 October 2026 a red bar reaching out round it.
  if (mine) lightWithin(ctx, p, PALETTE.red, markLightAt(time));
  const fill = Math.max(-1, Math.min(1, along));
  if (fill !== 0) {
    ctx.save();
    ctx.clip(p);
    ctx.fillStyle = PALETTE.good;
    ctx.globalAlpha = 0.85;
    const end = c.x + (reach + w) * fill;
    ctx.fillRect(Math.min(c.x, end), c.y - w, Math.abs(end - c.x), w * 2);
    ctx.restore();
  }
  const done = Math.abs(fill) >= 1;
  strokeGlow(ctx, p, done ? PALETTE.good : PALETTE.red, STROKE.inner, mine ? 1.3 : 0.4);
  if (!mine) {
    ctx.save();
    ctx.strokeStyle = rgba(PALETTE.text, 0.8);
    ctx.lineWidth = STROKE.outline;
    ctx.setLineDash([c.r * 0.45, c.r * 0.3]);
    ctx.lineDashOffset = -time * c.r * 1.2;
    ctx.stroke(bar(c, w, reach, c.r * 0.45));
    ctx.restore();
    drawMarkWait(ctx, c.x, c.y, c.r, time);
    return;
  }
  // The chevrons, pointing out along each half: the swipe's glyph turned
  // from down to across, a quarter-turn each way.
  for (const side of [-1, 1] as const) {
    const x = c.x + (side * reach) / 2;
    ctx.save();
    ctx.translate(x, c.y);
    ctx.rotate((-side * Math.PI) / 2);
    ctx.strokeStyle = ctx.fillStyle = PALETTE.text;
    ctx.globalAlpha = 0.9;
    drawInstarGlyph(ctx, "swipeDown", 0, 0, c.r * 1.1, time);
    ctx.restore();
  }
}
