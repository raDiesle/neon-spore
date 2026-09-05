import { blobPath, type IntroFigure } from "@neon-spore/content";
import { smoothstep } from "./ease.js";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import type { FigureBox } from "./intro-parts.js";
import { PALETTE } from "./palette.js";

/**
 * THE LOUD HALF OF THE INTRO: a headline on a lit slab, a price-tag flash, and
 * the one cycle that carries both of them at the reader and back again.
 *
 * All three are the owner's correction, in his own comparison: *the text feels
 * boring — do it the way a game is presented in the screenshots on a store
 * page, highlights in banners like the advertising of price offers in a
 * supermarket, and a full effect that something moves: elements coming toward
 * the screen and going back again.*
 *
 * Even type says *manual* however short the sentences are. What a shop window
 * does instead is put the claim on something that is plainly a sign — angled,
 * filled bright, dark ink on colour — and let the sign do the shouting so the
 * sentence underneath can stay a sentence. The words are still
 * `packages/content/src/intro.ts`; nothing about what a page claims is decided
 * here.
 *
 * Its own file beside `intro-page.ts`, which lays a page out and would be over
 * the 250-line limit with these in it. The seam is real: next door is *where
 * everything on a page goes*, and this is the three pieces that are there to
 * be seen from across a room.
 */

/** How long one trip forward and back takes, in seconds. */
const SURGE_SECONDS = 3.4;

/** The tag's angle. A sign hung straight is a label; hung crooked it is a sign. */
const TILT = -0.15;

/**
 * How far forward a thing is on its own cycle: 0 at the back, 1 at the glass.
 *
 * Eased at both ends rather than a plain sine, because the whole of what the
 * owner asked for is in the shape of the return: a thing that spends a moment
 * settled far away and then *comes at you* reads as depth, and one that slides
 * evenly in and out reads as a zoom nobody asked for.
 *
 * `phase` is turns, not seconds. Handing one element 0 and the next 0.5 is what
 * makes the page look like two planes rather than one picture breathing.
 */
export function surge(age: number, phase = 0): number {
  const t = age / SURGE_SECONDS + phase;
  return smoothstep(0.5 - 0.5 * Math.cos(t * Math.PI * 2));
}

/**
 * Draw something nearer or further than the page it is on.
 *
 * A scale about the element's own centre, which is what a lens does: nothing
 * on this page has a z coordinate and nothing needs one. The callback draws in
 * page coordinates exactly as it would without this — that is the point of
 * doing it to the transform rather than to every radius inside.
 */
export function towards(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  paint: () => void,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);
  paint();
  ctx.restore();
}

/**
 * A page's own colour, and the one thing on the page that is not violet.
 *
 * Six pages, six hues, so that turning one is a visible change of subject
 * rather than the same screen with different words on it. Every one is a
 * colour the game already has, and none of them is one of the four greens the
 * palette reserves (`palette.ts`): a green tag over a menu is the one flash a
 * player would read as *this went right*.
 */
const ACCENT: Record<IntroFigure, { hex: string; rim: string }> = {
  twoScreens: { hex: PALETTE.hull, rim: PALETTE.hullRim },
  voice: { hex: PALETTE.shield, rim: PALETTE.shieldRim },
  columns: { hex: PALETTE.red, rim: PALETTE.redRim },
  panel: { hex: PALETTE.pod, rim: PALETTE.podRim },
  boss: { hex: PALETTE.ember, rim: PALETTE.emberRim },
  run: { hex: PALETTE.wisp, rim: PALETTE.wispRim },
};

export function accentFor(figure: IntroFigure): { hex: string; rim: string } {
  return ACCENT[figure];
}

/**
 * The lit slab a headline stands on.
 *
 * Grown rather than drawn: `blobPath` with a shallow depth gives a lozenge
 * that breathes at its edges, which is the difference between a banner in this
 * game and a banner in a settings dialog — *nothing here is a rectangle if it
 * can help it* (`intro-parts.ts`). The caller draws the words over it, because
 * the words arrive a line at a time on their own clock (`text-drop.ts`) and
 * the slab is standing there the whole time.
 *
 * `depth` is the slab's own place in the cycle, and it is spent entirely on how
 * hard the rim burns. The slab does not move: type that swims is type nobody
 * reads, and the owner has already corrected that once.
 */
export function headline(
  ctx: CanvasRenderingContext2D,
  mid: number,
  top: number,
  w: number,
  h: number,
  accent: { hex: string; rim: string },
  age: number,
  depth: number,
): void {
  const cy = top + h / 2;
  // A fixed radius and a moving alpha, never the other way round: `haloSprite`
  // caches one canvas per colour and rounded radius, and a radius that follows
  // the cycle would bake a new one every frame (`glow.ts`).
  halo(ctx, mid, cy, h * 1.5, accent.hex, 0.18 + 0.3 * depth);
  const slab = new Path2D(blobPath(mid, cy, w / 2, h / 2, 6, 0.035, 0.02, age * 0.7, 3313, 56));
  ctx.fillStyle = mixHex(accent.hex, "#0B0718", 0.86);
  ctx.fill(slab);
  strokeGlow(ctx, slab, accent.hex, Math.max(1.4, h * 0.055), 0.85 + 0.6 * depth);
}

/**
 * The price tag: a starburst with the claim printed across it.
 *
 * The same `blobPath` everything else on the page is made of, given eleven
 * lobes and a deep one — a supermarket flash is a blob with spikes, and this
 * one is wet. It is the only thing in the intro filled with a bright colour
 * rather than outlined in one, which is what makes it the first thing an eye
 * lands on; the ink on it is the accent taken almost to black, the way a sign
 * is printed.
 *
 * The text is sized to fit rather than wrapped: a tag with two lines on it is a
 * notice. `r` is the tag's radius in page coordinates and nothing here scales —
 * a caller that wants this nearer wraps it in `towards`, which keeps the halo's
 * radius (and therefore its cached sprite) fixed.
 */
export function flashTag(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  text: string,
  accent: { hex: string; rim: string },
  age: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(TILT);
  halo(ctx, 0, 0, r * 2, accent.hex, 0.55);
  // Faster than the page's own clock and on a beat of its own: a sign that
  // ticks is a sign somebody is standing behind.
  const beat = 1 + 0.05 * Math.sin(age * 4.6);
  const burst = new Path2D(
    blobPath(0, 0, r * beat, r * 0.82 * beat, 11, 0.19, 0.05, age * 0.9, 4409, 72),
  );
  ctx.fillStyle = accent.hex;
  ctx.fill(burst);
  strokeGlow(ctx, burst, accent.rim, Math.max(1.2, r * 0.07), 1);
  // The film of gloss every body in this game carries, so the sign is plainly
  // made of the same stuff as the creatures behind it (`intro-parts.ts`).
  ctx.globalCompositeOperation = "lighter";
  ctx.beginPath();
  ctx.ellipse(-r * 0.26, -r * 0.34, r * 0.4, r * 0.19, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,.28)";
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  const size = Math.max(7, Math.min(r * 0.44, (r * 2.5) / Math.max(5, text.length)));
  ctx.font = `700 ${size.toFixed(1)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = mixHex(accent.hex, "#0B0718", 0.88);
  ctx.fillText(text, 0, size * 0.36);
  ctx.restore();
  ctx.textAlign = "center";
}

/**
 * How the tag arrives: nothing, then a stamp that overshoots and settles.
 *
 * It lands after the title rather than with it, because a sign that is already
 * there when the page opens is part of the furniture — the whole of what makes
 * one work is that it appears.
 */
export function stamp(age: number): number {
  const p = Math.max(0, Math.min(1, (age - 0.34) / 0.42));
  // Eased in, and swollen past its own size in the middle of the trip: a tag
  // that grows evenly to full size has been placed, and one that overshoots
  // and settles has been *slapped on*. It is back at exactly 1 at the end,
  // because everything after that moment is the tag standing still.
  return smoothstep(p) * (1 + 0.34 * Math.sin(p * Math.PI));
}

/**
 * The tag, put where a sticker goes: the corner of the picture, half out of
 * it, on a plane of its own.
 *
 * Centred over the figure it covered the thing the page was arguing, which is
 * the one place a sign must not be. Its trip is half a turn behind the
 * picture's, so when one is at the glass the other is at the back — that
 * counter-motion is the whole of why the corner reads as having a depth.
 */
export function stickTag(
  ctx: CanvasRenderingContext2D,
  box: FigureBox,
  text: string,
  accent: { hex: string; rim: string },
  age: number,
): void {
  const landed = stamp(age);
  if (landed <= 0.01) return;
  const r = Math.min(box.w * 0.115, box.h * 0.15);
  const x = box.x + box.w * 0.87;
  const y = box.y + r * 0.5;
  towards(ctx, x, y, landed * (0.88 + 0.26 * surge(age, 0.5)), () =>
    flashTag(ctx, x, y, r, text, accent, age),
  );
}
