import {
  type Color,
  type ScuttleState,
  type SimConfig,
  scuttlePartCol,
  scuttleSocketCol,
  type World,
} from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { drawHurt } from "./boss-hurt.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ScuttleFx } from "./scuttle-fx.js";
import { drawScuttleLock } from "./scuttle-lock.js";
import { faded, paintSlab } from "./scuttle-metal.js";
import { scuttlePlatePath, scuttleSlabPath } from "./scuttle-outline.js";
import { paintLiveRim, paintPlate, paintThread } from "./scuttle-plate.js";
import { SEAT_LOOK } from "./scuttle-seat.js";
import {
  PLATE_HALF_H,
  type Point,
  SOCKET_HALF_H,
  scuttleBox,
  scuttleFade,
  scuttleHangDrop,
  scuttleHangPhase,
  scuttleShiver,
  scuttleSocket,
  scuttleThread,
  scuttleWindPhase,
  scuttleWindRise,
} from "./scuttle-shape.js";
import { scuttleStopper } from "./scuttle-stop.js";
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
 * with the lock under it (`view-role-clocks-b.ts`). A bolt stops on what it
 * meets of the frame (`scuttle-stop.ts`), told to `stops`.
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
  stops?: BoltStops,
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
  const shake = fx.hurt.shakeX(time, l.tile);
  ctx.translate(shake, 0);
  drawSlab(ctx, l, cfg, rise, time, fade, fx.hurt.value);
  for (let i = 0; i < s.parts.length; i++) {
    const part = s.parts[i] ?? null;
    const loose = s.loose.includes(i);
    const c = scuttleSocket(l, cfg, i, rise);
    // The shiver dies down in a window; the rise and the hang go on (`scuttleShiver`).
    if (loose && wind > 0) c.x += scuttleShiver(l, cfg, world, s, beat, beatPhase, time);
    const seat = { ctx, l, c, i, fade, time };
    if (loose) SEAT_LOOK.open(seat);
    else if (counted) {
      if (part !== null) SEAT_LOOK.seated(seat);
      else SEAT_LOOK.open(seat);
    }
    if (loose && part !== null) {
      const live = lively && i === s.live;
      // A part the pilot carried hangs over the column he put it in rather
      // than its socket's, and the thread leans across to it. Added to the
      // socket's own x rather than taken from the column, so the wind-up's
      // shiver above still moves it (`scuttlePartCol`).
      const shift = l.tile * (scuttlePartCol(s, cfg, i) - scuttleSocketCol(cfg, i));
      const at = { x: c.x + shift, y: c.y + hang };
      drawThread(ctx, l, c, at, fade);
      if (live) {
        fx.note(at.x, at.y);
        drawLivePart(ctx, l, at, part.color, time, fade);
      } else drawPlate(ctx, l, at, fade, PLATE_HALF_H);
    }
  }
  if (lively) drawScuttleLock(ctx, l, cfg, s, time, fade);
  ctx.restore();
  stops?.aim(scuttleStopper(l, world, s, { shake, rise, hang, wind, fade }, beat, beatPhase, time));
}

/** The slab: a lobed mass of dark rock over the violet of its inside, closing inward on its way out (`scuttle-metal.ts`). */
function drawSlab(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  rise: number,
  time: number,
  fade: number,
  hurt: number,
): void {
  const box = scuttleBox(l, cfg);
  const mid = (box.left + box.right) * 0.5;
  const hw = (box.right - box.left) * 0.5 * fade;
  const path = scuttleSlabPath(l, cfg, rise, fade, time);
  paintSlab(
    ctx,
    path,
    {
      left: mid - hw,
      right: mid + hw,
      top: box.top - rise,
      bottom: box.bottom - rise,
      tile: l.tile,
    },
    fade,
  );
  drawHurt(ctx, path, hurt * fade);
}

/** A part hanging under its socket: a slimmer plate of rock. The seated one is `SEAT_LOOK`'s. */
function drawPlate(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  fade: number,
  half = SOCKET_HALF_H,
): void {
  const p = scuttlePlatePath(l, c, fade, half);
  paintPlate(ctx, p, c, l.tile, half, PALETTE.rock, 0.55, fade);
}

/** The thread a loose part hangs on, from its socket's floor to the plate. */
function drawThread(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: Point,
  to: Point,
  fade: number,
): void {
  const ends = scuttleThread(l, from, to);
  if (ends === null) return;
  const p = new Path2D();
  p.moveTo(ends[0].x, ends[0].y);
  p.lineTo(ends[1].x, ends[1].y);
  paintThread(ctx, p, l.tile, fade);
}

/**
 * The live part: a plate of enamel in the colour a shot has to be, breathing
 * on its thread, its lower edge lit from inside in the colour's rim.
 */
function drawLivePart(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  color: Color,
  time: number,
  fade: number,
): void {
  const breath = Math.sin(time * 6);
  const p = scuttlePlatePath(l, at, fade * (1 + 0.06 * breath), PLATE_HALF_H);
  paintPlate(ctx, p, at, l.tile, PLATE_HALF_H, PALETTE[color], 0.85, fade);
  const rim = color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  paintLiveRim(ctx, p, at.x, at.y, l.tile, faded(rim, fade), 0.6 + 0.3 * breath);
}
