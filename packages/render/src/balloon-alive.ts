import {
  balloonNodes,
  balloonThreadPath,
  balloonVeinPath,
  circleSubpath,
} from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import { hazed } from "./depth.js";
import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **What makes THE BALLOON alien**: the film that travels over its skin, and
 * the three parts stuck to and hanging off it.
 *
 * The owner asked for this body to be cooler, more alien and a nicer colour,
 * and the fork he took on the colour was the oil slick rather than a hue of
 * its own — for the reason the creature was built grey in the first place. A
 * body carrying an ammunition colour is a body somebody loads a trigger for,
 * and nothing can be fired at this one (`sim/balloon.ts`). A band of colour
 * that never settles has nothing in it to load, so the skin can be beautiful
 * without becoming an instruction.
 *
 * **It is the ship's own trick, on a narrower sweep.** `sheen.ts` runs a
 * five-colour film round the hull, cyan and hull violet included, because the
 * hull is the players' own body along the bottom edge and may hold every
 * colour in the game. This is a body up the field, so the loop drops both
 * ammunition colours and runs three: `sheenCold` through `sheenMid` to
 * `sheenWarm` and back (`palette.ts` argues the three).
 *
 * `balloon-parts.ts` in `content` is where the veins, the bead ring and the
 * threads are *shaped* — this file only paints them, which is the same seam
 * `balloon-shape.ts` and `balloon.ts` already sit either side of.
 */

/** The film, as a loop: it wraps, so the drift never reaches an end. Three
 * colours where the hull's is five, and `sheen.ts`'s `film` is the function
 * this is a second reading of — kept apart rather than shared because the two
 * rings are a decision about what a surface is allowed to say, not a helper. */
const FILM = [PALETTE.sheenCold, PALETTE.sheenMid, PALETTE.sheenWarm] as const;

/** The film colour at a position along the loop. `at` wraps, in turns. */
export function balloonFilm(at: number): string {
  const p = (((at % 1) + 1) % 1) * FILM.length;
  const i = Math.floor(p) % FILM.length;
  return mixHex(FILM[i] as string, FILM[(i + 1) % FILM.length] as string, p - Math.floor(p));
}

/** How fast the band travels round a balloon, in turns a second. Slow, for
 * `iridescence`'s reason word for word: the beat is the only thing on this
 * screen allowed to be fast. */
const DRIFT = 0.055;
/** How much of the film reaches the fill. The rest is `sheenDeep`, so the
 * silhouette still holds against the background — a fill that reaches the
 * ground opens a hole in an outline, and half an outline is a different word
 * (`docs/alive.md`). */
const SOAK = 0.74;

/**
 * The skin's fill: the film laid across the body diagonally, over the near-black
 * violet it sits on.
 *
 * Diagonal rather than across, so the band still travels visibly on a body
 * being stretched to twice its width by two hands — a horizontal gradient on a
 * horizontally stretched shape is the one direction the stretch hides.
 */
export function balloonSkinFill(
  ctx: CanvasRenderingContext2D,
  cfg: SimConfig,
  rx: number,
  ry: number,
  time: number,
  seed: number,
  near: number,
): CanvasGradient {
  const g = ctx.createLinearGradient(-rx, -ry, rx, ry);
  const drift = time * DRIFT + seed * 0.37;
  const deep = hazed(cfg, PALETTE.sheenDeep, near);
  // A whole turn of the loop across the body, so every one of the three is on
  // the skin at once — a shorter sweep put one hue on the whole of a body this
  // small, which is a colour rather than a slick.
  const stops = 8;
  for (let i = 0; i <= stops; i++) {
    const u = i / stops;
    g.addColorStop(u, mixHex(deep, hazed(cfg, balloonFilm(u + drift), near), SOAK));
  }
  return g;
}

/** The rim, off the same film and one step ahead of it, brightening towards
 * white with whichever side is further on. It is the one part of this body
 * that answers a hand, so it may not be a fixed colour. */
export function balloonRim(cfg: SimConfig, time: number, seed: number, near: number, lit: number) {
  const hue = balloonFilm(time * DRIFT + seed * 0.37 + 0.5);
  return hazed(cfg, mixHex(hue, PALETTE.sheenRim, 0.3 + lit * 0.55), near);
}

/**
 * The three parts, drawn in the body's own coordinates — the caller has
 * already translated to the balloon's centre.
 *
 * Every one of them is **one** path with a subpath per line, and that is a
 * frame-cost decision: `strokeGlow` draws whatever it is handed four times
 * over, and a wave puts six of these up at once. The beads are the exception —
 * each brightens on its own count, and a single path could only carry one
 * alpha — so they are filled one at a time and glowed together.
 */
export function drawBalloonParts(
  ctx: CanvasRenderingContext2D,
  cfg: SimConfig,
  rxLeft: number,
  rxRight: number,
  ry: number,
  time: number,
  seed: number,
  near: number,
  lit: number,
): void {
  const hue = hazed(cfg, balloonFilm(time * DRIFT + seed * 0.37 + 0.5), near);
  const bright = hazed(cfg, mixHex(hue, PALETTE.sheenRim, 0.45), near);

  // Under the skin, and drawn before the beads so a bead never sits behind a
  // vein it is orbiting outside of.
  const veins = new Path2D(balloonVeinPath(rxLeft, rxRight, ry, time, seed));
  strokeGlow(ctx, veins, hue, STROKE.inner, 0.4 + lit * 0.6);

  const threads = new Path2D(balloonThreadPath(ry, time, seed));
  strokeGlow(ctx, threads, hue, STROKE.inner, 0.35 + lit * 0.4);

  let ring = "";
  for (const n of balloonNodes(rxLeft, rxRight, ry, time, seed)) {
    ring += `${circleSubpath(n.x, n.y, n.r)} `;
    const bead = new Path2D(circleSubpath(n.x, n.y, n.r));
    ctx.globalAlpha = 0.35 + 0.55 * n.lit;
    ctx.fillStyle = bright;
    ctx.fill(bead);
  }
  ctx.globalAlpha = 1;
  strokeGlow(ctx, new Path2D(ring.trim()), bright, STROKE.inner, 0.6 + lit * 0.8);
}
