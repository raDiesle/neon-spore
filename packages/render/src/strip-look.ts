import { openSmoothPath, type Point } from "@neon-spore/content";
import { halo } from "./glow.js";
import { gradientSlot, slotGradient } from "./gradient-slot.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * WHAT A STRIP LOOKS LIKE, AS A RECORD.
 *
 * The channel, its lip, the rail, the stations and the block were `strip()` in
 * `band-channel.ts`, called by name — the one place the rail a column slides
 * along could be drawn, which meant a candidate panel could reshape the ship
 * and the chamber and still be handed the shipped trough. Lifted out on
 * 10 September 2026 with `panel-plan.ts` and `lobe-look.ts`, for the owner's
 * ask that a ship be different *from fresh* and not only in its skin.
 *
 * Nothing about *where* the strip is lives here: `Layout.cannonStrip` and
 * `shieldStrip` say, and `touch.ts` answers the same rectangle. The paint is
 * exactly what `strip()` was.
 */

/** Everything the look is handed for one strip. */
export interface StripDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly l: Layout;
  /** 0 for the cannon's strip, 1 for the shield's — a slot index for caches. */
  readonly which: 0 | 1;
  /** The strip's row and height, from the layout. */
  readonly y: number;
  readonly h: number;
  /** The column the seat is holding. */
  readonly col: number;
  /** The control's own colour — the cannon's violet or the shield's cyan on
   * both seats, because it says *which control* (`docs/spec/controls.md`). */
  readonly hex: string;
  readonly label: string;
  /** Whose panel this is: the trough is cut in the seat's own flesh. */
  readonly skin: SeatSkin;
}

export interface StripLook {
  draw(d: StripDraw): void;
}

/**
 * The three gradients a channel is made of, one slot per strip.
 *
 * A slot holds one gradient (`gradient-slot.ts`), and the two strips sit at
 * different heights in different colours — sharing a slot between them would
 * rebuild both every frame, which is worse than not caching at all. None of
 * the three depends on anything but the layout, so from the second frame on
 * they are all cache hits.
 */
const POOL = [gradientSlot<CanvasGradient>(), gradientSlot<CanvasGradient>()] as const;
/**
 * The channel's own outline, which is not a rounded rectangle.
 *
 * A `roundRect` is still a rectangle to look at, and two of them across the
 * panel were the other half of what the owner called the box. This is a
 * closed contour that undulates along both edges — a trough eaten into the
 * tissue rather than a slot machined out of it. It depends on nothing but the
 * layout, so it is cached in a slot like the gradients beside it; a path
 * rebuilt every frame is exactly what `gradient-slot.ts` exists to stop.
 */
const CHANNEL = [gradientSlot<Path2D>(), gradientSlot<Path2D>()] as const;

function channelPath(l: Layout, y: number, h: number): string {
  const steps = 22;
  const cap = h * 0.5;
  const left = l.gridLeft + cap;
  const right = l.gridLeft + l.gridWidth - cap;
  const span = right - left;
  // The swell is faded out at both ends, so the two edges meet the caps flat
  // and the contour cannot cross itself there.
  const edge = (u: number, sign: 1 | -1): Point => ({
    x: left + span * u,
    y:
      y +
      sign *
        (h / 2) *
        (1 +
          (Math.sin(u * 7.3 + (sign === 1 ? 2.4 : 0)) * 0.15 + Math.sin(u * 3.1 + 1.2) * 0.09) *
            Math.sin(u * Math.PI)),
  });
  const top: Point[] = [];
  const bottom: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    top.push(edge(i / steps, -1));
    bottom.push(edge(1 - i / steps, 1));
  }
  const topD = openSmoothPath(top);
  const bottomD = openSmoothPath(bottom);
  const tail = bottomD.slice(bottomD.indexOf("C"));
  const a = top[0] as Point;
  const b = bottom[0] as Point;
  return `${topD} Q ${right + cap} ${y}, ${b.x} ${b.y} ${tail} Q ${left - cap} ${y}, ${a.x} ${a.y} Z`;
}
const LIP = [gradientSlot<CanvasGradient>(), gradientSlot<CanvasGradient>()] as const;
const BODY = [gradientSlot<CanvasGradient>(), gradientSlot<CanvasGradient>()] as const;

/**
 * A strip, as a **channel cut in the tissue** rather than a bar laid on a
 * plate. Two straight rectangles were the other half of the panel's sharp
 * edges: a trough with rounded ends, a dark pool inside it and a lit lip along
 * the top reads as something the column slides *through*.
 *
 * The lobe on it is the same closed contour every button is, so the thing the
 * player is moving looks like the thing they are moving it with.
 */
export function trough(d: StripDraw): void {
  const { ctx, l, which, y, h, col, hex, label, skin } = d;
  ctx.fillStyle = hex;
  ctx.globalAlpha = 0.85;
  ctx.fillText(label, l.width / 2, y - h / 2 - 5);
  ctx.globalAlpha = 1;

  const top = y - h / 2;
  const round = h / 2;
  const key = `${top}|${h}|${l.gridLeft}|${l.gridWidth}|${skin.dead[0]}`;
  const channel = slotGradient(ctx, CHANNEL[which], key, () => new Path2D(channelPath(l, y, h)));
  ctx.fillStyle = slotGradient(ctx, POOL[which], key, () => {
    const g = ctx.createLinearGradient(0, top, 0, top + h);
    g.addColorStop(0, rgba(skin.ground[3], 0.94));
    g.addColorStop(0.5, rgba(skin.ground[2], 0.9));
    g.addColorStop(1, rgba(skin.dead[0], 0.82));
    return g;
  });
  ctx.fill(channel);
  // The lip: bright where the light from the seam falls on it, dark below.
  // Across, not down: the stroke has to be gone at both ends or the channel
  // closes into a pill, and a pill with an outline is the box the panel was.
  ctx.strokeStyle = slotGradient(
    ctx,
    LIP[which],
    `${l.gridLeft}|${l.gridWidth}|${skin.flesh[0]}`,
    () => {
      const g = ctx.createLinearGradient(l.gridLeft, 0, l.gridLeft + l.gridWidth, 0);
      g.addColorStop(0, rgba(skin.flesh[1], 0));
      g.addColorStop(0.16, rgba(skin.flesh[0], 0.26));
      g.addColorStop(0.84, rgba(skin.flesh[0], 0.26));
      g.addColorStop(1, rgba(skin.flesh[1], 0));
      return g;
    },
  );
  ctx.lineWidth = 0.9;
  ctx.stroke(channel);

  // The rail the lobe runs on, in the seat's own colour and barely there: it
  // is what the channel is *for*, and the ticks are stations along it.
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = hex;
  ctx.fillRect(l.gridLeft + round, y - 0.5, l.gridWidth - round * 2, 1);
  ctx.globalAlpha = 1;

  ctx.fillStyle = rgba(skin.flesh[1], 0.26);
  for (let c = 0; c < l.cols; c++) {
    const x = tileCX(l, c);
    if (c === col) continue;
    // A bar two pixels wide, so `fillRect` and not a rounded path: a corner
    // radius nobody can see is a path allocation every column every frame.
    ctx.fillRect(x - 1, y - h * 0.2, 2, h * 0.4);
  }

  block(ctx, l, which, y, h, col, hex, skin);
}

/** The column the seat is holding: a lobe in the channel, lit and wet. */
function block(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  which: 0 | 1,
  y: number,
  h: number,
  col: number,
  hex: string,
  skin: SeatSkin,
): void {
  const x = tileCX(l, col);
  const w = l.tile * 0.86;
  const bh = h - 3;
  const top = y - bh / 2;
  halo(ctx, x, y, h * 1.15, hex, 0.5);
  ctx.beginPath();
  ctx.roundRect(x - w / 2, top, w, bh, Math.min(w, bh) * 0.42);
  ctx.fillStyle = slotGradient(ctx, BODY[which], `${top}|${bh}|${hex}|${skin.ground[2]}`, () => {
    const g = ctx.createLinearGradient(0, top, 0, top + bh);
    g.addColorStop(0, "rgba(255,255,255,.62)");
    g.addColorStop(0.34, hex);
    g.addColorStop(1, rgba(skin.ground[2], 0.5));
    return g;
  });
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.4)";
  ctx.lineWidth = 0.9;
  ctx.stroke();
}

/** The shipped look: a trough cut in the tissue, a lit lip, a faint rail, a
 * station per column and a wet block on the column held. */
export const STRIP_LOOK: StripLook = { draw: trough };
