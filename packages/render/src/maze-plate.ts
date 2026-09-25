import { KEY } from "@neon-spore/content";
import { MAZE_TURN, type MazeWheel, mazeCircleMilli, type SimConfig } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import type { MazeBreakup } from "./maze-fall.js";
import { drawMazeFunnels, FUNNEL_DEPTH, mazeFunnelHalfMilli } from "./maze-funnel.js";
import { mazeCanvasAngle, mazeRimHalfGapMilli, mazeRingGone } from "./maze-walls.js";
import { PALETTE } from "./palette.js";

/**
 * THE MAZE's drum as a made thing: a lathed bezel round the rim, bolted; a
 * film of gloss over the corridors; and the socket the heart sits in.
 *
 * **The round's material is slabs and glyphs, never blobs**
 * (`docs/spec/interludes.md`), so the owner's *looks like something real*
 * (`.claude/skills/new-boss` §6.3) is answered here as a machine and not as
 * a body: what the pair looks at for a minute is a drum that was *turned* —
 * a bezel with a lit shoulder and a dark one, bolt heads round it, a sheen
 * across the plate where the key light falls — with the one body in the game
 * that is grown rather than made, the heart (`maze-heart.ts`), held in a
 * socket in the middle of it. The floors and the posts (`maze-relief.ts`)
 * already made the drum a room; this makes the room something built.
 *
 * **Not one line of the geometry moves, and nothing here crosses a gap.** The
 * bezel is cut where the rim is cut, at the rim's own widened width
 * (`mazeRimHalfGapMilli`), because a solid ring outside an open way in would
 * say the way was shut; the bolts skip the cut ends; the gloss and the socket
 * are inside circles the walls are drawn over. A candidate for `maze:walls`
 * (`maze-look.ts`) that wants a different metal argues about this file.
 *
 * **One light for the whole drum**, `KEY` (`content/light.ts`): the bezel's
 * lit shoulder, every bolt's highlight and the gloss all sit on the same
 * side, and the socket's lit lip is on the far side, where the light lands
 * on the inside of a bowl. It is what makes six separate marks read as one
 * object rather than six.
 *
 * Every mark goes with the ring it is on when the drum comes apart
 * (`mazeRingGone`): the bezel and the bolts with the rim, the socket with
 * the middle, the gloss fading with the rim.
 */

type Drum = { cx: number; cy: number; r: number };

/** How far the bezel stands outside the rim, as a share of the drum's radius. */
const BEZEL = 0.05;
/** Bolts round the bezel, before the cut ends are skipped. */
const BOLTS = 16;
/** A bolt head's radius, as a share of the drum's. */
const BOLT = 0.017;
/** How far outside a way in's cut a bolt keeps, as a share of a turn. */
const BOLT_CLEAR = MAZE_TURN / 60;
/** The gloss: where its centre sits along the key, and how far it reaches. */
const GLOSS_AT = 0.42;
const GLOSS_REACH = 0.78;
const GLOSS = 0.11;

const phi = mazeCanvasAngle;

/** Whether sim angle `a` (already turned) lies within a way in's cut, widened by `clear`. */
function inCut(a: number, cuts: readonly number[], half: number, clear: number): boolean {
  for (const cut of cuts) {
    let d = ((a - cut) % MAZE_TURN) + MAZE_TURN;
    d %= MAZE_TURN;
    if (d > MAZE_TURN / 2) d = MAZE_TURN - d;
    if (d < half + clear) return true;
  }
  return false;
}

/**
 * What is under the walls: the gloss over the plate and the socket in the
 * middle. Called between the floors and the lines (`maze-look.ts`), so the
 * sheet's own strokes are never washed by it.
 */
export function drawMazeBed(
  ctx: CanvasRenderingContext2D,
  drum: Drum,
  wheel: MazeWheel,
  breakup: MazeBreakup,
): void {
  const { cx, cy, r } = drum;
  const rim = mazeRingGone(drum, wheel, wheel.rings, breakup);
  ctx.save();
  // The film. One soft light on the plate where the key falls, clipped to
  // the rim so it reads as lying on the drum and not behind it.
  if (rim.alpha > 0) {
    const R = r * (1 + rim.spread);
    const gy = cy + r * rim.sag;
    ctx.globalAlpha = rim.alpha;
    ctx.beginPath();
    ctx.arc(cx, gy, R, 0, Math.PI * 2);
    ctx.clip();
    const gx = cx + KEY.x * R * GLOSS_AT;
    const gyy = gy + KEY.y * R * GLOSS_AT;
    const gloss = ctx.createRadialGradient(gx, gyy, 0, gx, gyy, R * GLOSS_REACH);
    gloss.addColorStop(0, rgba(PALETTE.text, GLOSS));
    gloss.addColorStop(0.55, rgba(PALETTE.text, GLOSS * 0.35));
    gloss.addColorStop(1, rgba(PALETTE.text, 0));
    ctx.fillStyle = gloss;
    ctx.fillRect(cx - R, gy - R, R * 2, R * 2);
  }
  ctx.restore();

  // The socket: a bowl the heart sits in. Dark under the near lip, lit on the
  // far wall, both inside circle 0 so the ways into the middle stay open.
  const mid = mazeRingGone(drum, wheel, 0, breakup);
  if (mid.alpha <= 0) return;
  const core = ((r * mazeCircleMilli(wheel, 0)) / 1000) * (1 + mid.spread);
  const my = cy + r * mid.sag;
  const far = Math.atan2(-KEY.y, -KEY.x);
  ctx.save();
  ctx.globalAlpha = mid.alpha;
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(PALETTE.background, 0.45);
  ctx.lineWidth = core * 0.18;
  ctx.beginPath();
  ctx.arc(cx, my, core * 0.9, far + Math.PI - 0.5 * Math.PI, far + Math.PI + 0.5 * Math.PI);
  ctx.stroke();
  ctx.strokeStyle = rgba(PALETTE.text, 0.13);
  ctx.lineWidth = core * 0.14;
  ctx.beginPath();
  ctx.arc(cx, my, core * 0.9, far - 0.55 * Math.PI, far + 0.55 * Math.PI);
  ctx.stroke();
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.16);
  ctx.lineWidth = core * 0.05;
  ctx.beginPath();
  ctx.arc(cx, my, core * 0.955, far - 0.4 * Math.PI, far + 0.4 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

/**
 * What is over the walls: the bezel round the rim, cut where the rim is, and
 * the bolts that hold it. Called after the posts (`maze-look.ts`).
 */
export function drawMazeBezel(
  ctx: CanvasRenderingContext2D,
  drum: Drum,
  wheel: MazeWheel,
  angleMilli: number,
  breakup: MazeBreakup,
  cfg: SimConfig,
): void {
  const { cx, cy, r } = drum;
  const rim = mazeRingGone(drum, wheel, wheel.rings, breakup);
  if (rim.alpha <= 0) return;
  const R = r * (1 + rim.spread);
  const y = cy + r * rim.sag;
  const turn = angleMilli + rim.spinMilli;
  const cuts = wheel.openings[wheel.rings] ?? [];
  const half = mazeRimHalfGapMilli(wheel, R);
  // The cut flares as it goes out: the way in's funnel, whose mouth is the
  // snap window (`maze-funnel.ts`), passes through the bezel on its way.
  const flare = mazeFunnelHalfMilli(cfg, wheel, R, BEZEL / FUNNEL_DEPTH) - half;
  const out = R * (1 + BEZEL);

  ctx.save();
  ctx.globalAlpha = rim.alpha;
  // The band, lit along the key: a shoulder on the light's side, shadow on
  // the other, which is the one thing that makes a ring read as turned metal
  // rather than as a thicker line.
  const band = ctx.createLinearGradient(
    cx + KEY.x * out,
    y + KEY.y * out,
    cx - KEY.x * out,
    y - KEY.y * out,
  );
  band.addColorStop(0, rgba(PALETTE.hullRim, 0.55));
  band.addColorStop(0.45, rgba(PALETTE.hull, 0.32));
  band.addColorStop(1, rgba(PALETTE.grid, 0.95));
  ctx.fillStyle = band;
  // The outer edge, a hairline: where the bezel ends and the field begins.
  // Stroked per sector, so it stops at the cut the way the band does.
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.3);
  ctx.lineWidth = 1;
  const sector = (from: number, to: number, cut: number) => {
    ctx.beginPath();
    ctx.arc(cx, y, out, phi(from + cut), phi(to - cut), true);
    ctx.arc(cx, y, R, phi(to), phi(from), false);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, y, out, phi(from + cut), phi(to - cut), true);
    ctx.stroke();
  };
  if (cuts.length === 0) {
    sector(turn, turn + MAZE_TURN - 1, 0);
  } else {
    for (const [i, cut] of cuts.entries()) {
      const after = cuts[(i + 1) % cuts.length] ?? cut;
      const from = turn + cut + half;
      const to = turn + (after > cut ? after : after + MAZE_TURN) - half;
      if (to - flare > from + flare) sector(from, to, flare);
    }
  }
  drawMazeFunnels(ctx, { cx, cy: y, r: R }, cfg, wheel, turn);
  // The bolts, turning with the drum and skipping the cut ends. Each is a
  // dark head with the key's highlight on its shoulder — two arcs, because
  // sixteen of them are drawn every frame.
  const at = R * (1 + BEZEL / 2);
  const head = r * BOLT;
  for (let i = 0; i < BOLTS; i++) {
    const a = (i * MAZE_TURN) / BOLTS;
    if (inCut(a, cuts, half, BOLT_CLEAR)) continue;
    const p = phi(turn + a);
    const bx = cx + at * Math.cos(p);
    const by = y + at * Math.sin(p);
    ctx.fillStyle = rgba(PALETTE.background, 0.85);
    ctx.beginPath();
    ctx.arc(bx, by, head, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.75);
    ctx.beginPath();
    ctx.arc(bx + KEY.x * head * 0.3, by + KEY.y * head * 0.3, head * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
