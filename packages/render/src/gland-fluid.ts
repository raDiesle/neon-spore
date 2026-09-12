import { blobPoints, type Point } from "@neon-spore/content";
import { hash01 } from "./backdrop.js";
import { halo, strokeGlow } from "./glow.js";
import { gradientSlot, slotGradient } from "./gradient-slot.js";
import { rgba } from "./hex.js";
import { tileCX } from "./layout.js";
import type { SeatSkin } from "./seat-skin.js";
import { splinePath } from "./spline.js";
import type { StripDraw } from "./strip-look.js";

/**
 * THE FLUID UNDER THE CONTROLS — the two things the owner picked out of PLASM
 * and EMBEDDED on 11 September 2026 to keep.
 *
 * `bubbles` is PLASM's chamber with the part he named — *the big bottom
 * bubbles, not the top ones* — and nothing else: large lenses of fluid low in
 * the panel, biggest at the floor, each with the one specular point a wet
 * sphere carries, and none above the rails. Painted once into the ground,
 * which is cached (`band-ground.ts`), so the count is free.
 *
 * `spine` is EMBEDDED's rail — a lit cord through the body with a node per
 * column and a swollen node on the column held — carried here so the cards
 * built after it can use it once that card is gone. The node is drawn as a
 * bead of the same fluid: wet, lit from up-left, no plate.
 */

export interface Bubbles {
  /** How many, before the panel's size caps it. */
  readonly count: number;
  /** The share of the panel's height above which there are none. */
  readonly from: number;
}

export function bubbles(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  skin: SeatSkin,
  o: Bubbles,
): void {
  const base = g.createLinearGradient(0, 0, 0, h);
  skin.ground.forEach((c, i) => {
    base.addColorStop(i / 3, c);
  });
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  const count = Math.round(Math.min(o.count, (w * h) / 14000));
  for (let i = 0; i < count; i++) {
    const x = hash01(i * 7 + 11) * w;
    const deep = hash01(i * 13 + 29) ** 0.6;
    const y = h * (o.from + (1.02 - o.from) * deep);
    const r = (0.06 + hash01(i * 19 + 3) * 0.07 + deep * 0.08) * w;
    const lens = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    lens.addColorStop(0, rgba(skin.flesh[0], 0.03));
    lens.addColorStop(0.7, rgba(skin.flesh[1], 0.07));
    lens.addColorStop(0.92, rgba(skin.flesh[0], 0.26));
    lens.addColorStop(1, rgba(skin.flesh[0], 0.34));
    g.fillStyle = lens;
    const shape = splinePath(blobPoints(x, y, r, r * 0.94, 4, 0.08, 0.05, 0, i * 3 + 1, 24), true);
    g.fill(shape);
    g.strokeStyle = rgba(skin.rim, 0.14);
    g.lineWidth = Math.max(0.6, w / 600);
    g.stroke(shape);
    // The one point of light a wet sphere carries, up and to the left.
    const spot = g.createRadialGradient(
      x - r * 0.42,
      y - r * 0.45,
      0,
      x - r * 0.42,
      y - r * 0.45,
      r * 0.3,
    );
    spot.addColorStop(0, rgba(skin.rim, 0.45));
    spot.addColorStop(1, rgba(skin.rim, 0));
    g.fillStyle = spot;
    g.fill(shape);
  }
  const floor = skin.ground[3];
  const v = g.createLinearGradient(0, h * 0.6, 0, h);
  v.addColorStop(0, rgba(floor, 0));
  v.addColorStop(1, rgba(floor, 0.6));
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);
}

/**
 * The cord's contour and the height of it at every x, held per strip: it
 * depends on the layout and nothing else, and a path rebuilt every frame is
 * what `gradient-slot.ts` exists to stop (`docs/queue.md`, 11 September 2026
 * — twenty `new Path2D` on the frame that should have been all cache hits).
 */
interface Cord {
  readonly path: Path2D;
  readonly ys: readonly number[];
}
const CORD = [gradientSlot<Cord>(), gradientSlot<Cord>()] as const;
/** The stations, one path for every column but the one held, so they are one
 * `fill` rather than one per column. Keyed on the column too. */
const STATIONS = [gradientSlot<Path2D>(), gradientSlot<Path2D>()] as const;
const NODE = [gradientSlot<Path2D>(), gradientSlot<Path2D>()] as const;
const GLOSS = [gradientSlot<CanvasGradient>(), gradientSlot<CanvasGradient>()] as const;

/** The rail as a lit cord through the flesh, a node per column and a swollen
 * wet node on the column held. Nothing is written over it: the strip used to
 * carry its control's name (`PLAYER 1 · CANNON`), and the owner had it taken
 * off on 12 September 2026 — the cord's colour says which control it is, and
 * a band names nothing of the game's construction. */
export function spine(d: StripDraw): void {
  const { ctx, l, which, y, h, col, hex, skin } = d;
  const span = l.gridWidth + l.tile * 0.8;
  const left = l.gridLeft - l.tile * 0.4;
  const key = `${left}|${span}|${y}|${h}`;
  const cord = slotGradient(ctx, CORD[which], key, () => {
    const pts: Point[] = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      pts.push({
        x: left + span * u,
        y: y + Math.sin(u * 5.3 + 1.1) * h * 0.14 + Math.sin(u * 12.7) * h * 0.05,
      });
    }
    return { path: splinePath(pts, false), ys: pts.map((p) => p.y) };
  });
  const yAt = (x: number): number => cord.ys[Math.round(((x - left) / span) * 24)] ?? y;
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.ground[3], 0.55);
  ctx.lineWidth = h * 0.5;
  ctx.stroke(cord.path);
  strokeGlow(ctx, cord.path, hex, h * 0.14, 0.22);
  ctx.strokeStyle = rgba(hex, 0.4);
  ctx.lineWidth = Math.max(1, h * 0.06);
  ctx.stroke(cord.path);
  const held = `${key}|${col}|${l.cols}`;
  const stations = slotGradient(ctx, STATIONS[which], held, () => {
    const path = new Path2D();
    const r = Math.max(1.5, h * 0.09);
    for (let c = 0; c < l.cols; c++) {
      if (c === col) continue;
      const x = tileCX(l, c);
      path.moveTo(x + r, yAt(x));
      path.arc(x, yAt(x), r, 0, Math.PI * 2);
    }
    return path;
  });
  ctx.fillStyle = rgba(hex, 0.45);
  ctx.fill(stations);
  const kx = tileCX(l, col);
  const ky = yAt(kx);
  const node = slotGradient(ctx, NODE[which], held, () =>
    splinePath(blobPoints(kx, ky, h * 0.5, h * 0.44, 3, 0.05, 0.02, 0, 3, 32), true),
  );
  halo(ctx, kx, ky, h * 1.1, hex, 0.5);
  ctx.fillStyle = hex;
  ctx.fill(node);
  ctx.fillStyle = slotGradient(ctx, GLOSS[which], held, () => {
    const g = ctx.createRadialGradient(kx - h * 0.15, ky - h * 0.2, 0, kx, ky, h * 0.5);
    g.addColorStop(0, "rgba(255,255,255,0.6)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    return g;
  });
  ctx.fill(node);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 0.9;
  ctx.stroke(node);
}
