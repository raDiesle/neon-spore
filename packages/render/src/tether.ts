import { circleSubpath, openSmoothPath, type Point } from "@neon-spore/content";
import {
  type Creature,
  gripCount,
  gripsCreature,
  type SimConfig,
  type WardenState,
  type World,
  wardenColor,
  wardenCycle,
  wardenPullMilli,
  wardenRescuer,
} from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { wardenRimY } from "./warden.js";

/**
 * The tether: the game's first **open** contour.
 *
 * Everything else drawn here is a closed loop with lobes on it. This is a line
 * with two ends — taut from the rim to its own head, with a slow wave
 * travelling down it — and it is drawn by `openSmoothPath` for exactly that
 * reason.
 *
 * A hand on it bows the line toward the finger, stops the wave into a shiver,
 * and thins and brightens the stretch under tension. Everything on this page
 * is derived from the world every frame: the bow follows the grip, the
 * brightness follows `wardenPullMilli`. Only the whip after the tear outlives
 * a frame, and that lives in `Effects` (`warden-fx.ts`).
 */

/** How far, in tiles, a hand pulls the middle of the line off its column. */
const BOW_TILES = 0.55;

export function drawTether(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  b: WardenState,
  tether: Creature,
  beatPhase: number,
  time: number,
): void {
  const cfg: SimConfig = world.cfg;
  const cycle = wardenCycle(cfg, world.waveBeat);
  const hex = wardenColor(cycle) === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = hex === PALETTE.red ? PALETTE.redRim : PALETTE.cyanRim;

  const x = tileCX(l, tether.col);
  const topY = wardenRimY(l, cfg.wardenRow);
  const headY = Math.max(topY, creatureCenter(l, tether, beatPhase).y);

  const held = gripCount(world, tether.id) > 0;
  const pull = wardenPullMilli(world, b) / 1000;
  // Whose hand it is decides which way the bow goes: toward the strip that
  // player's thumb came off, so the picture says who is holding it.
  const side = gripsCreature(world, 1, tether.id) ? -1 : 1;
  const bow = held ? side * BOW_TILES * l.tile * (0.4 + pull * 0.6) : 0;

  const line = new Path2D(openSmoothPath(points(x, topY, headY, bow, held, time)));
  // Under tension the line goes thin and bright, from the rim down: the bar is
  // the line itself, and there is no second widget anywhere saying how far the
  // pull has got.
  strokeGlow(ctx, line, held ? rim : hex, STROKE.outline * (held ? 0.7 : 1), 0.5 + pull * 1.5);

  drawAnchor(ctx, x, topY, hex, rim, pull);
  drawHead(ctx, x + bow, headY, l, hex, rim, time);
  // Under the head, never at the middle of the line: while the line is short
  // its middle is still inside the ring, and a word written over the boss is a
  // word nobody reads.
  if (!held) drawHint(ctx, l, cycle, x + bow, headY + l.tile * 0.55);
}

/**
 * The line's own shape. Untouched it is straight with a slow wave travelling
 * down it; held, the wave stops into a shiver and the middle comes across to
 * the finger.
 */
function points(
  x: number,
  topY: number,
  headY: number,
  bow: number,
  held: boolean,
  time: number,
): Point[] {
  const pts: Point[] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const wave = held
      ? Math.sin(time * 30 + t * 9) * 1.2
      : Math.sin(t * Math.PI * 3 - time * 3) * 3.5 * t;
    // A half-sine across the length, so both ends stay anchored where they are.
    pts.push({ x: x + wave + bow * Math.sin(t * Math.PI), y: topY + (headY - topY) * t });
  }
  return pts;
}

/** Where it comes out of the rim, brightening as the hold takes. */
function drawAnchor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hex: string,
  rim: string,
  pull: number,
): void {
  const p = new Path2D(circleSubpath(x, y, 3 + pull * 3));
  ctx.save();
  ctx.fillStyle = pull > 0 ? rim : hex;
  ctx.globalAlpha = 0.5 + pull * 0.5;
  ctx.fill(p);
  ctx.restore();
}

/** The head of the line: what a finger is actually aiming at. */
function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  l: Layout,
  hex: string,
  rim: string,
  time: number,
): void {
  const r = l.tile * 0.22 * (1 + 0.08 * Math.sin(time * 4));
  const p = new Path2D(circleSubpath(x, y, r));
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(p);
  ctx.fillStyle = hex;
  ctx.globalAlpha = 0.55;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, rim, STROKE.inner, 1);
}

/**
 * Whose line it is, in words, and only while nobody has hold of it. The pair
 * cannot see each other's thumbs, so the one thing the picture cannot say by
 * itself is which of the two of them is supposed to reach for it — and that is
 * the whole coupling. It goes as soon as a hand lands, because from then on
 * the bow says it.
 */
function drawHint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cycle: number,
  x: number,
  y: number,
): void {
  const rescuer = wardenRescuer(cycle);
  const mine = l.role === "test" || (l.role === "p1" ? rescuer === 1 : rescuer === 2);
  ctx.save();
  ctx.font = `600 ${Math.round(l.tile * 0.3)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = mine ? PALETTE.text : PALETTE.dim;
  ctx.globalAlpha = mine ? 0.9 : 0.45;
  ctx.fillText(mine ? "PULL" : "HELD", x, y);
  ctx.restore();
}
