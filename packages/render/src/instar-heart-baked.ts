import type { HeartBeat } from "./instar-heart.js";
import { PALETTE } from "./palette.js";
import { type SpriteSpec, spritePow2, tintedSprite } from "./sprite-bake.js";

/**
 * **THE INSTAR's heart, baked** — the tenth example (`sprite-bake.ts`): the
 * heart lit in the bare body's split after the moult (`instar-heart.ts`).
 *
 * The shipped heart is a radial glow and a flat heart shape. Here it is an
 * organ: two lobes swollen and shaded round, a crease down the middle, veins
 * branching over it from the top, a wet highlight on the upper lobe, a rim of
 * light round its edge and the glow behind it. It swells with the thump by the
 * size it is drawn at, as the shipped one does, so the beat costs nothing.
 *
 * Not drawn by the game: offered in VERSUS on `instar:heart`
 * (`tools/versus/candidates/instar-heart/baked`).
 */

/** The painting's reach, in the heart's `r`: the shipped glow's radius. */
const REACH = 2.2;
/** The heart's half-height in the painting's unit, as the shipped `r * 0.55`. */
const H = 0.55 / REACH;

/** The unit disc onto the `w` × `h` box: the glow's edge at radius 1. */
function frame(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.translate(w / 2, h / 2);
  g.scale(w / 2, h / 2);
  g.lineCap = "round";
}

/** The shipped heart's outline, scaled by `k` about its middle. */
function heart(g: CanvasRenderingContext2D, k = 1): void {
  const h = H * k;
  g.beginPath();
  g.moveTo(0, h);
  g.bezierCurveTo(-h * 1.4, 0, -h * 0.6, -h * 1.1, 0, -h * 0.35);
  g.bezierCurveTo(h * 0.6, -h * 1.1, h * 1.4, 0, 0, h);
}

function glow(g: CanvasRenderingContext2D, stops: [number, number][]): void {
  const d = g.createRadialGradient(0, 0, 0, 0, 0, 1);
  for (const [at, a] of stops) d.addColorStop(at, `rgba(255,255,255,${a})`);
  g.fillStyle = d;
  g.fillRect(-1, -1, 2, 2);
}

function paintBody(g: CanvasRenderingContext2D, w: number, h: number): void {
  frame(g, w, h);
  glow(g, [
    [0, 0.9],
    [0.25, 0.7],
    [0.6, 0.25],
    [1, 0],
  ]);
  // The organ, shaded round: bright up in the lobes, darker toward the point.
  const shade = g.createLinearGradient(0, -H, 0, H);
  shade.addColorStop(0, "rgba(255,255,255,1)");
  shade.addColorStop(1, "rgba(150,150,150,1)");
  g.fillStyle = shade;
  heart(g);
  g.fill();
  // The crease between the lobes and the veins branching down from the top.
  g.strokeStyle = "rgba(0,0,0,0.45)";
  g.lineWidth = H * 0.08;
  g.beginPath();
  g.moveTo(0, -H * 0.35);
  g.quadraticCurveTo(-H * 0.08, H * 0.3, 0, H * 0.85);
  g.stroke();
  g.lineWidth = H * 0.05;
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(s * H * 0.25, -H * 0.55);
    g.quadraticCurveTo(s * H * 0.55, -H * 0.1, s * H * 0.35, H * 0.35);
    g.moveTo(s * H * 0.45, -H * 0.2);
    g.lineTo(s * H * 0.75, -H * 0.05);
    g.stroke();
  }
}

function paintLight(g: CanvasRenderingContext2D, w: number, h: number): void {
  frame(g, w, h);
  glow(g, [
    [0, 0.8],
    [0.3, 0.2],
    [0.5, 0],
  ]);
  // A rim of light round the organ's edge.
  g.strokeStyle = "rgba(255,255,255,0.55)";
  g.lineWidth = H * 0.1;
  heart(g, 0.97);
  g.stroke();
  // The wet highlight on the upper left lobe.
  const x = -H * 0.45;
  const y = -H * 0.55;
  const wet = g.createRadialGradient(x, y, 0, x, y, H * 0.3);
  wet.addColorStop(0, "rgba(255,255,255,0.95)");
  wet.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = wet;
  g.fillRect(x - H * 0.3, y - H * 0.3, H * 0.6, H * 0.6);
}

export const HEART_SPRITE: SpriteSpec = {
  name: "instar-heart",
  frames: 1,
  aspect: 1,
  body: paintBody,
  light: paintLight,
};

/** The heart from the baked organ, swollen by the thump and faded by its strength: one draw. */
export function drawBakedHeart(
  ctx: CanvasRenderingContext2D,
  beat: HeartBeat,
  paint: (ctx: CanvasRenderingContext2D, beat: HeartBeat) => void,
  dpr: number,
): void {
  const { at, r, a } = beat;
  const side = r * REACH * 2;
  if (side < 4) {
    paint(ctx, beat);
    return;
  }
  const s = tintedSprite(HEART_SPRITE, spritePow2(side, dpr), PALETTE.red, PALETTE.redRim);
  const a0 = ctx.globalAlpha;
  ctx.globalAlpha = a0 * a;
  ctx.drawImage(s.canvas, 0, 0, s.w, s.h, at.x - side / 2, at.y - side / 2, side, side);
  ctx.globalAlpha = a0;
}
