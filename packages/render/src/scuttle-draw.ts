import {
  type Color,
  type ScuttleState,
  type SimConfig,
  scuttleNextCol,
  scuttleShootable,
  scuttleWinding,
  type World,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { ScuttleFx } from "./scuttle-fx.js";
import {
  type Point,
  SOCKET_HALF_H,
  scuttleFade,
  scuttleHangDrop,
  scuttleHangPhase,
  scuttlePlatePath,
  scuttleSlabPath,
  scuttleSocket,
  scuttleWindPhase,
  scuttleWindRise,
} from "./scuttle-shape.js";
import { drawTargetLock } from "./target-lock.js";
import { showsScuttleCount, showsScuttleLive } from "./view-role-clocks-b.js";

/**
 * **THE SCUTTLE**: a dark slab of a frame hung over the top of the field
 * above row 0, plated with its parts, the violet of its inside showing
 * through every socket a part has left, the loose parts sliding down out of
 * their sockets on threads over the cadence, and — on one screen — the live
 * one in the colour a shot has to be, over the lock on the column its throw
 * lands in (§11.30).
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the slab, the sockets, the parts hanging under it, the lock last. Its
 * health is its silhouette: a plate a part, an open socket a throw or a
 * strike, and the plating is the count. Winding up, the whole frame draws
 * back and the last socket shivers; down, the sockets close inward and the
 * slab fades over `scuttleOutBeats`. What outlives a frame — the jolt of a
 * throw, the plate that tumbles off on a strike — is `effects.boss.scuttle`
 * (`scuttle-fx.ts`).
 *
 * **The sockets are drawn on the screen that is shown the count.** On the
 * pilot's every socket is on the slab, plated or open, and every hanging
 * part is grey; on the navigator's the slab is blind — no socket on it but
 * the ones a part is leaving now — and the live part hangs in its colour
 * with the lock under it (`view-role-clocks-b.ts`).
 */
export function drawScuttle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: ScuttleState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: ScuttleFx,
): void {
  const cfg = world.cfg;
  const fade = scuttleFade(s, cfg, beat, beatPhase);
  if (fade <= 0) return;
  const wind = scuttleWindPhase(s, cfg, beat, beatPhase);
  const rise = scuttleWindRise(l, wind) + fx.jolt * l.tile;
  const hang = scuttleHangDrop(l, scuttleHangPhase(s, cfg, beat, beatPhase));
  const counted = showsScuttleCount(l.role);
  const lively = showsScuttleLive(l.role);

  ctx.save();
  drawSlab(ctx, l, cfg, rise, time, fade);
  for (let i = 0; i < s.parts.length; i++) {
    const part = s.parts[i] ?? null;
    const loose = s.loose.includes(i);
    const c = scuttleSocket(l, cfg, i, rise);
    if (loose && wind > 0) c.x += Math.sin(time * 40) * l.tile * 0.05 * wind;
    if (loose) drawOpen(ctx, l, c, fade);
    else if (counted) {
      if (part !== null) drawPlate(ctx, l, c, PALETTE.rock, fade);
      else drawOpen(ctx, l, c, fade);
    }
    if (loose && part !== null) {
      const live = lively && i === s.live;
      const at = { x: c.x, y: c.y + hang };
      drawThread(ctx, l, c, at, fade);
      if (live) {
        fx.note(at.x, at.y);
        drawLivePart(ctx, l, at, part.color, time, fade);
      } else drawPlate(ctx, l, at, PALETTE.rock, fade);
    }
  }
  if (lively) drawLock(ctx, l, cfg, s, time, fade);
  ctx.restore();
}

/**
 * A colour at the fade: the hex itself while the frame stands, so the frame
 * tests can count it, and an `rgba` once it is going — `strokeGlow` owns the
 * alpha, so a fade has to be in the colour (`lead-draw.ts`).
 */
function faded(hex: string, fade: number, alpha = 1): string {
  return fade >= 1 && alpha >= 1 ? hex : rgba(hex, alpha * fade);
}

/** The slab: a lobed mass of dark rock over the violet of its inside, rimmed in the hull's violet, closing inward on its way out. */
function drawSlab(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  rise: number,
  time: number,
  fade: number,
): void {
  const p = scuttleSlabPath(l, cfg, rise, fade, time);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(p);
  ctx.fillStyle = faded(PALETTE.hull, fade, 0.35);
  ctx.fill(p);
  ctx.fillStyle = faded(PALETTE.rockDark, fade, 0.85);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.hull, fade), STROKE.inner, 0.5 * fade);
  strokeGlow(ctx, p, faded(PALETTE.rock, fade), STROKE.inner, 0.4 * fade);
}

/** A part in its socket, or hanging under it: a grey plate. */
function drawPlate(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  hex: string,
  fade: number,
): void {
  const p = scuttlePlatePath(l, c, fade);
  ctx.save();
  ctx.fillStyle = faded(hex, fade, 0.55);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(hex, fade), STROKE.inner, 0.45 * fade);
}

/** A socket with nothing in it: the violet inside showing through. */
function drawOpen(ctx: CanvasRenderingContext2D, l: Layout, c: Point, fade: number): void {
  const p = scuttlePlatePath(l, c, fade);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.hull, fade, 0.5);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.hullRim, fade), STROKE.inner, 0.3 * fade);
}

/** The thread a loose part hangs on, from its socket's floor to the plate. */
function drawThread(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: Point,
  to: Point,
  fade: number,
): void {
  if (to.y - from.y <= l.tile * SOCKET_HALF_H) return;
  const p = new Path2D();
  p.moveTo(from.x, from.y + l.tile * SOCKET_HALF_H);
  p.lineTo(to.x, to.y - l.tile * SOCKET_HALF_H);
  strokeGlow(ctx, p, faded(PALETTE.dim, fade), STROKE.inner, 0.5 * fade);
}

/** The live part: the plate in the colour a shot has to be, breathing on its thread. */
function drawLivePart(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  color: Color,
  time: number,
  fade: number,
): void {
  const hex = PALETTE[color];
  const rim = color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  const p = scuttlePlatePath(l, at, fade * (1 + 0.06 * Math.sin(time * 6)));
  ctx.save();
  ctx.fillStyle = faded(hex, fade, 0.85);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(rim, fade), STROKE.outline, (0.8 + 0.2 * Math.sin(time * 6)) * fade);
}

/**
 * **Where the lock on the next throw's column stands**, or null when nothing
 * hangs — the box, not the drawing.
 *
 * Exported because the cue hangs its word off this exact box (`boss-cue.ts`):
 * this screen already wears a frame around the place, and a second frame
 * around the same place is the mistake `target-lock.ts` records the owner
 * ending. So the cue draws no frame here and only says the verb, which means
 * it has to know where the frame it is borrowing actually is.
 */
export function scuttleLockBox(
  l: Layout,
  cfg: SimConfig,
  s: ScuttleState,
): { x: number; y: number; halfW: number; halfH: number } | null {
  const col = scuttleNextCol(s, cfg);
  if (col < 0) return null;
  return {
    x: tileCX(l, col),
    y: l.gridTop - l.tile * 0.12,
    halfW: l.tile * 0.46,
    halfH: l.tile * 0.22,
  };
}

/** The lock on the column the next throw lands in, dimmed while nothing hanging can be shot. */
function drawLock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: ScuttleState,
  time: number,
  fade: number,
): void {
  const box = scuttleLockBox(l, cfg, s);
  if (box === null) return;
  const hot = scuttleShootable(s) && !scuttleWinding(s);
  drawTargetLock(
    ctx,
    box.x,
    box.y,
    box.halfW,
    box.halfH,
    PALETTE.shieldRim,
    time,
    (hot ? 1 : 0.5) * fade,
    scuttleNextCol(s, cfg) + 7,
  );
}
