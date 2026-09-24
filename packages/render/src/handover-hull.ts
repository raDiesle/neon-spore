import { bumpAdd } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { handedOver, handoverLeft, handoverWarning } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { strokeGlow } from "./glow.js";
import { drawHandoverNotice, type HandoverView } from "./handover-look.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { STROKE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";

/**
 * HULL — the shape-sheet's `HULL · TRADED`, standing on the real ship.
 *
 * Two lobes rise out of the hull's skin a column and a half either side of
 * the field's middle, and what one has the other lacks: their heights are `a`
 * and `1 − a` of one lift, with `a` going round once every four beats, so the
 * two are forever handing the same height across to each other and there is
 * one instant each turn when they are equal and neither owns it
 * (`tools/shape-sheet/src/drafts/ship.ts`). They stand for the length of the
 * window and no longer — up over the warning, down over the last beat of the
 * hold — and they are painted from the seat's own `HullSkin`, so on the
 * navigator's phone they are amber the way the rest of that ship is.
 *
 * The plate is drawn first, exactly as shipped: this replaced nothing, it went
 * *under* what was already there. The slot asked whether the ship saying it
 * too makes the trade something the pair sees coming or one signal too many
 * over a band that has already changed colour under them, and the owner
 * answered it on 13 September 2026 — an exchange is a thing the ship can do
 * rather than a thing a plate can only say (`tools/versus/DECIDED.md`).
 */

/** How high the taller lobe stands, in tiles, and how far each is from the middle. */
const LIFT = 0.8;
const APART = 1.5;
/** One turn of the exchange, in beats — a hold of eight is two turns. */
const PERIOD = 4;
/** The plateau and the shoulder of a lobe, in tiles — the cannon lobe's
 * proportions rather than the draft's wider flat top, which on the real hull
 * read as a plate set down on it. */
const PLATEAU = 0.15;
const SHOULDER = 0.55;
/** How far under the skin a lobe's body reaches, so the hull's own rim is
 * covered where the lobe stands and met where its shoulder runs out. */
const UNDER = STROKE.outline * 1.5;
/** How deep the skin's gradient runs, in tiles: the hull's own is from its
 * crown to the band's floor, and a lobe half a tile high sits in the bright
 * fifth of that. */
const DEPTH = 3;

/** How much of the lobes is up this frame: 0 outside the window, rising over
 * the warning and falling over the hold's last beat. */
function raised(world: World, beatPhase: number): number {
  const warn = handoverWarning(world);
  if (warn > 0) {
    const beats = Math.max(1, world.cfg.handoverWarnBeats);
    return smoothstep((beats - (warn - beatPhase)) / beats);
  }
  if (!handedOver(world)) return 0;
  return smoothstep(Math.min(1, handoverLeft(world) - beatPhase));
}

/** One lobe, `height` tiles high, standing on the skin at `cx`. */
function lobe(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  surfaceY: SurfaceY,
  cx: number,
  height: number,
): void {
  const tile = l.tile;
  if (height * tile < 0.5) return;
  const reach = (PLATEAU + SHOULDER) * tile;
  const x0 = cx - reach;
  const x1 = cx + reach;
  const step = Math.max(1, tile / 8);
  const top = new Path2D();
  const body = new Path2D();
  for (let x = x0; x <= x1 + 1e-6; x += step) {
    const y = surfaceY(x) - bumpAdd((x - cx) / tile, height, PLATEAU, SHOULDER) * tile;
    if (x === x0) {
      top.moveTo(x, y);
      body.moveTo(x, y);
    } else {
      top.lineTo(x, y);
      body.lineTo(x, y);
    }
  }
  for (let x = x1; x >= x0; x -= step) body.lineTo(x, surfaceY(x) + UNDER);
  body.closePath();
  const skin = seatSkin(l.role).hull;
  const crown = surfaceY(cx) - height * tile;
  const g = ctx.createLinearGradient(0, crown, 0, crown + DEPTH * tile);
  g.addColorStop(0, skin.body[0]);
  g.addColorStop(0.14, skin.body[1]);
  g.addColorStop(0.5, skin.body[2]);
  g.addColorStop(1, skin.body[3]);
  ctx.fillStyle = g;
  ctx.fill(body);
  ctx.lineCap = "round";
  strokeGlow(ctx, top, skin.rim, STROKE.outline + 0.6, skin.rimGlow ?? 1);
}

/** The plate as shipped, and the hull saying the same thing under it. */
export function tradedHull(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: HandoverView,
): void {
  drawHandoverNotice(ctx, l, world, view);
  if (!view.surfaceY) return;
  const env = raised(world, view.beatPhase);
  if (env <= 0) return;
  const turn = ((world.beat + view.beatPhase) / PERIOD) * Math.PI * 2;
  const a = (1 + Math.sin(turn + 1.2)) / 2;
  const mid = tileCX(l, (l.cols - 1) / 2);
  ctx.save();
  lobe(ctx, l, view.surfaceY, mid - APART * l.tile, LIFT * a * env);
  lobe(ctx, l, view.surfaceY, mid + APART * l.tile, LIFT * (1 - a) * env);
  ctx.restore();
}
