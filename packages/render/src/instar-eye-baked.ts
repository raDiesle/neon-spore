import type { EyeIris } from "./instar-head-parts.js";
import { PALETTE } from "./palette.js";
import { type SpriteSpec, spritePx, spriteRng, tintedSprite } from "./sprite-bake.js";

/**
 * **THE INSTAR's eye, baked** — the seventh example (`sprite-bake.ts`): the
 * iris of the front eyes, the ones the glare turns on the players.
 *
 * `drawEye` fills the eye gold and lays one ember disc round the slit. Here
 * the iris fills the eye: fibres run out from the slit in two rings of
 * colour, a dark ring bounds it where it meets the white, flecks of ember sit
 * in the gold, the slit's edge burns hot, and a wet crescent of light rides
 * the top. Painted once as a disc and drawn in one `drawImage`, squashed as
 * the lid narrows and clipped to the eye; the pupil, rim and glint stay live
 * over it, so the look still follows the players.
 *
 * Not drawn by the game: offered in VERSUS on `instar:eye`
 * (`tools/versus/candidates/instar-eye/baked`).
 */

const FIBRES = 56;
const FLECKS = 9;
/** The iris's radius, in head radii: it fills the eye, which is 0.17 by 0.075. */
const IRIS = 0.1;

/** The disc's frame: a unit circle onto the `w` × `h` box. */
function frame(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.translate(w / 2, h / 2);
  g.scale(w / 2, h / 2);
  g.lineCap = "round";
}

function fibres(): { a: number; from: number; to: number; w: number }[] {
  const rnd = spriteRng(61);
  return Array.from({ length: FIBRES }, (_, i) => ({
    a: ((i + rnd() * 0.6) / FIBRES) * Math.PI * 2,
    from: 0.22 + rnd() * 0.1,
    to: 0.7 + rnd() * 0.25,
    w: 0.02 + rnd() * 0.025,
  }));
}

function paintBody(g: CanvasRenderingContext2D, w: number, h: number): void {
  frame(g, w, h);
  // The iris: bright near the slit, deeper toward its edge.
  const disc = g.createRadialGradient(0, 0, 0, 0, 0, 1);
  disc.addColorStop(0, "rgba(255,255,255,1)");
  disc.addColorStop(0.55, "rgba(255,255,255,0.85)");
  disc.addColorStop(0.85, "rgba(255,255,255,0.55)");
  disc.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = disc;
  g.fillRect(-1, -1, 2, 2);
  // Fibres out from the slit, each a crease in the colour.
  g.strokeStyle = "rgba(0,0,0,0.4)";
  for (const f of fibres()) {
    g.lineWidth = f.w;
    g.beginPath();
    g.moveTo(Math.cos(f.a) * f.from, Math.sin(f.a) * f.from);
    g.lineTo(Math.cos(f.a + 0.05) * f.to, Math.sin(f.a + 0.05) * f.to);
    g.stroke();
  }
  // The collarette: a ragged ring where the two colours of the iris meet.
  g.strokeStyle = "rgba(0,0,0,0.5)";
  g.lineWidth = 0.035;
  g.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const rr = 0.45 + 0.04 * Math.sin(a * 7) + 0.02 * Math.sin(a * 13);
    g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  g.stroke();
  // The limbal ring: dark where the iris meets the eye.
  const limb = g.createRadialGradient(0, 0, 0.72, 0, 0, 1);
  limb.addColorStop(0, "rgba(0,0,0,0)");
  limb.addColorStop(0.5, "rgba(0,0,0,0.8)");
  limb.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = limb;
  g.fillRect(-1, -1, 2, 2);
}

function paintLight(g: CanvasRenderingContext2D, w: number, h: number): void {
  frame(g, w, h);
  // The slit's edge burns hot, fading out through the inner ring.
  const hot = g.createRadialGradient(0, 0, 0.1, 0, 0, 0.5);
  hot.addColorStop(0, "rgba(255,255,255,0.9)");
  hot.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = hot;
  g.fillRect(-1, -1, 2, 2);
  // A hair of light along every other fibre.
  g.strokeStyle = "rgba(255,255,255,0.35)";
  for (const [i, f] of fibres().entries()) {
    if (i % 2) continue;
    g.lineWidth = f.w * 0.5;
    g.beginPath();
    g.moveTo(Math.cos(f.a - 0.03) * (f.from + 0.05), Math.sin(f.a - 0.03) * (f.from + 0.05));
    g.lineTo(Math.cos(f.a) * f.to * 0.9, Math.sin(f.a) * f.to * 0.9);
    g.stroke();
  }
  // Flecks of ember in the gold.
  const rnd = spriteRng(67);
  for (let i = 0; i < FLECKS; i++) {
    const a = rnd() * Math.PI * 2;
    const d = 0.35 + rnd() * 0.35;
    const s = 0.04 + rnd() * 0.04;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    const fleck = g.createRadialGradient(x, y, 0, x, y, s);
    fleck.addColorStop(0, "rgba(255,255,255,0.8)");
    fleck.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = fleck;
    g.fillRect(x - s, y - s, s * 2, s * 2);
  }
  // The wet crescent across the top, where the key lies on the eye's curve.
  g.strokeStyle = "rgba(255,255,255,0.5)";
  g.lineWidth = 0.08;
  g.beginPath();
  g.arc(0, 0.25, 0.85, Math.PI * 1.2, Math.PI * 1.55);
  g.stroke();
}

export const EYE_SPRITE: SpriteSpec = {
  name: "instar-eye",
  frames: 1,
  aspect: 1,
  body: paintBody,
  light: paintLight,
};

/** The eye's gold as the game fills it, then the baked iris over it, squashed by the lid: one draw. */
export function drawBakedIris(
  ctx: CanvasRenderingContext2D,
  iris: EyeIris,
  paint: (ctx: CanvasRenderingContext2D, iris: EyeIris) => void,
  dpr: number,
): void {
  const { at, r, open, look, fade, eye } = iris;
  const side = IRIS * 2 * r;
  if (side < 2 || fade <= 0) {
    paint(ctx, iris);
    return;
  }
  ctx.save();
  // The eye round the iris: the shipped gold, a shade dimmer, so the iris stands in it.
  ctx.fillStyle = PALETTE.pod;
  ctx.globalAlpha *= fade * 0.85;
  ctx.fill(eye);
  ctx.globalAlpha /= 0.85;
  ctx.clip(eye);
  const s = tintedSprite(EYE_SPRITE, spritePx(side, dpr), PALETTE.pod, PALETTE.ember);
  const tall = side * Math.max(0.2, open);
  ctx.drawImage(s.canvas, 0, 0, s.w, s.h, at.x + look - side / 2, at.y - tall / 2, side, tall);
  ctx.restore();
}
