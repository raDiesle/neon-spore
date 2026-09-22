import type { Point } from "@neon-spore/content";
import { isMeteorKind, type Scar, spanOf } from "@neon-spore/sim";
import { breachHue } from "./breach-hue.js";
import { stream } from "./hash.js";
import { mixHex, rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { tileSeed } from "./tile-seed.js";

/**
 * What the thing that broke the hull left on it: a splash, in its own colour,
 * that stays for the rest of the run.
 *
 * The owner asked for it by name on 17 September 2026 — *when an enemy hits
 * the hull (except meteors) have some splash in the colour of the enemy on top
 * of the hull skin, which also remains for the wave game over screen* — which
 * is the first of the three exemptions in `docs/looks.md`, so it goes onto the
 * field rather than to VERSUS.
 *
 * **Meteors are the named exception and they already have their answer.** A
 * rock punches a hole, and the hole is drawn (`craters.ts`); stone does not
 * splash. Everything else that reaches the hull is alive or is a shot, and
 * both carry a colour — which is `breachHue`, the one mapping from a kind and
 * a colour to a hue, already read by the burst at the instant of the hit and
 * by the strike that replays it.
 *
 * **It stays because it is drawn from the scar and not from the body.** A
 * `Scar` remembers the column, the beat, the kind and — since 17 September —
 * the colour, so a splash needs nothing that has gone: it is painted afresh
 * every frame from the hull's own record, which is why it is still there
 * seconds later under the lost screen, and after a retry, and for the rest of
 * the run.
 *
 * **Wide, and not a dot.** The owner has twice asked for damage to be visible
 * on the whole hull rather than only where it landed
 * (`.claude/skills/destruction`), so the wash reaches two tiles either side of
 * the column and thins out rather than ending — what is concentrated at the
 * impact is the drops, not the stain. Everything is clipped to the ship's own
 * filled contour: paint on the membrane, never a mark in the sky.
 *
 * Nothing here reads a clock. A stain is a record and a record does not
 * breathe; the crack through it already carries the one thing about a breach
 * that is still alive (`scars.ts`).
 */

/**
 * How far along the skin the wash reaches, in tiles, for a one-tile body.
 *
 * **Three and not two since 22 September 2026.** The owner, asking for the
 * body to burst on contact, said of this stain in the same sentence: *which
 * makes sense to have the colour spread across the hull — already there — but
 * we can increase the effect to be a bigger splash.* So it is bigger, in the
 * three numbers that are the size of it: how far the wash runs, how deep it
 * soaks and how far the spatter is thrown. Nothing about its shape changed.
 */
const REACH = 3;
/** How far into the hull it soaks at the column it landed on, in tiles. */
const SOAK = 0.8;
/** Samples across the wash. Enough that it follows the membrane's curve. */
const STEPS = 14;
/** Flung drops, and how far one may travel, in tiles. */
const DROPS = 17;
const THROW = 2.4;
/** The stain at its darkest, where it landed, and the drops over it. */
const WASH = 0.44;
/** How far the heart of the splash is mixed toward the dark, and how far a
 * drop's lit edge is mixed toward white. A stain in one flat tone reads as a
 * coloured rectangle however good its outline is: what says *fluid* is that
 * the thick part is darker than the thin part and the top of a drop catches
 * the light (`.claude/skills/svg-look`, on value range). */
const HEART = 0.45;
const LIT = 0.5;
/** Exported for `splashReach`'s reason: it is the alpha a test matches a
 * drop's own colour on. */
export const DROP = 0.6;

/**
 * How far along the skin one scar's wash reaches, either side of its own
 * column — wider for a body that was wider. Exported so a test can ask the
 * drawing what its reach is rather than count it out of a canvas log, which
 * records an `arc` and not a path's points.
 */
export function splashReach(l: Layout, s: Scar): number {
  return (REACH + (spanOf(s) - 1) * 0.5) * l.tile;
}

/** The wash's depth under the skin at `u`, which is -1..1 across its reach. */
function soak(u: number, tile: number): number {
  return tile * SOAK * (1 - u * u) ** 1.4;
}

function wash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  hue: string,
  x: number,
  reach: number,
  rnd: () => number,
  surfaceAt: (x: number) => Point,
): void {
  const top: Point[] = [];
  const under: Point[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const u = -1 + (2 * i) / STEPS;
    const p = surfaceAt(x + u * reach);
    top.push(p);
    // Ragged, not smooth: a stain's own edge is where it stopped running, and
    // a clean curve under it reads as a painted band along the hull.
    under.push({ x: p.x, y: p.y + soak(u, l.tile) * (0.5 + rnd()) });
  }
  const crest = surfaceAt(x).y;
  const grad = ctx.createLinearGradient(0, crest, 0, crest + l.tile * SOAK);
  grad.addColorStop(0, rgba(hue, WASH));
  grad.addColorStop(0.45, rgba(hue, WASH * 0.5));
  grad.addColorStop(1, rgba(hue, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(top[0]!.x, top[0]!.y);
  for (const p of top.slice(1)) ctx.lineTo(p.x, p.y);
  for (let i = under.length - 1; i >= 0; i--) ctx.lineTo(under[i]!.x, under[i]!.y);
  ctx.closePath();
  ctx.fill();
}

/**
 * The spatter, thrown off the impact and stuck to the membrane around it.
 *
 * **Flattened, and not round.** A field of even discs is `sparks.ts` in
 * another colour, which is the one thing `.claude/skills/destruction` says a
 * damage look must not be: a disc has no shape, so it says a burst happened
 * and nothing about what happened. A drop that struck a surface it is now
 * stuck to is wider than it is tall, and a few of them run a little way down
 * the skin under their own weight — which is what says *surface* rather than
 * *air*.
 */
function spatter(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  hue: string,
  x: number,
  rnd: () => number,
  surfaceAt: (x: number) => Point,
): void {
  for (let i = 0; i < DROPS; i++) {
    // Along the skin first and down second: a splash runs across a surface it
    // is stuck to, and drops scattered evenly around the point would read as
    // a burst hanging in front of the ship rather than paint on it.
    const away = (rnd() * 2 - 1) * THROW * l.tile;
    const p = surfaceAt(x + away);
    const u = away / (THROW * l.tile);
    const near = 1 - Math.abs(u);
    const r = l.tile * (0.05 + rnd() * 0.06) * (0.4 + near);
    const y = p.y + r * 0.6 + rnd() * soak(u, l.tile);
    const rx = r * (1.3 + rnd() * 0.9);
    const ry = r * (0.5 + rnd() * 0.3);
    ctx.globalAlpha = 0.35 + near * 0.65;
    ctx.fillStyle = rgba(hue, DROP);
    ctx.beginPath();
    ctx.ellipse(p.x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    // The light on its upper edge, offset toward the key and never centred on
    // it (`skins/light.ts`'s rule, in one ellipse). Small: a highlight that
    // takes half a drop reads as a hole through it, and a hole in this hull
    // already means a rock came through (`craters.ts`).
    ctx.fillStyle = rgba(mixHex(hue, "#ffffff", LIT), 0.5);
    ctx.beginPath();
    ctx.ellipse(p.x - rx * 0.26, y - ry * 0.42, rx * 0.26, ry * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    // A third of them run. The tail is the same paint, narrowing, so a run
    // reads as the drop moving rather than as a second mark beside it.
    if (rnd() > 0.66) {
      const fall = l.tile * (0.12 + rnd() * 0.22);
      ctx.fillStyle = rgba(hue, DROP);
      ctx.beginPath();
      ctx.ellipse(p.x, y + fall * 0.5, r * 0.45, fall * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/** The impact itself: where the paint went on thickest, and the only part of
 * a splash that is about a point rather than about a stretch of skin. */
function core(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  hue: string,
  x: number,
  surfaceAt: (x: number) => Point,
): void {
  const p = surfaceAt(x);
  const r = l.tile * 0.85;
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
  g.addColorStop(0, rgba(mixHex(hue, PALETTE.background, HEART), 0.74));
  g.addColorStop(0.32, rgba(hue, 0.52));
  g.addColorStop(0.62, rgba(hue, 0.24));
  g.addColorStop(1, rgba(hue, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + r * 0.3, r, r * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawHullSplashes(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  scars: readonly Scar[],
  /** The membrane the hull pass drew, so the paint lies on the skin the eye is
   * looking at rather than on a flat line (`hull-frame.ts`). */
  surfaceAt: (x: number) => Point,
  /** The ship's own filled contour. Everything here is clipped to it. */
  filled: Path2D,
): void {
  const splashed = scars.filter((s) => !isMeteorKind(s.kind));
  if (splashed.length === 0) return;
  ctx.save();
  ctx.clip(filled);
  for (const s of splashed) {
    const hue = breachHue(s.kind, s.color ?? null);
    const x = tileCX(l, s.col) + ((spanOf(s) - 1) * l.tile) / 2;
    // The same two numbers every other mark on this tile is seeded from, so
    // the two phones splash the hull identically (`tile-seed.ts`).
    const rnd = stream(tileSeed(s.col, s.beat));
    wash(ctx, l, hue, x, splashReach(l, s), rnd, surfaceAt);
    core(ctx, l, hue, x, surfaceAt);
    spatter(ctx, l, hue, x, rnd, surfaceAt);
  }
  ctx.restore();
}
