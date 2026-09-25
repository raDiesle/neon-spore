import { beatSeconds, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { SHOT_LOOK } from "./bullets.js";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **A wasted shot on HARD, coming back.** The shot that hit nothing loses the
 * wave there (`sim/shot-out.ts`'s `wastes`), and the owner, 25 September 2026:
 * *we can have animation that it reflects and shot is coming in some angle back
 * to the ship and hits it.*
 *
 * So the bolt is carried up from where the simulation left it to the top edge
 * of the stage, glances off it with a spit of light, and comes down at an angle
 * onto the hull well toward the middle, where it bursts. It is
 * the whole of the up leg too — `ShotOutFx` leaves a wasted bolt to this — so
 * the two never draw one shot twice.
 *
 * It flies at the bolt's own speed unless that would land it after the field
 * has stopped holding the fail (`waveFailBeats`): then it is hurried, so the
 * hit is always seen before the lost screen comes up. A picture of the rule,
 * never the rule: the wave was lost on the tick the event was said.
 */

/** How far toward the middle the bolt comes down from the column it left, as
 * a share of the field's width: enough that the fall reads as a slant. */
const ACROSS = 0.4;
/** The part of the fail's hold the whole flight may take, at most. */
const HOLD_SHARE = 0.65;
/** How long the flash on the hull lasts once it has landed, in seconds. */
const HIT_SECONDS = 0.3;
/** How far below the stage's top edge it turns, in tiles: the head stays on. */
const TURN_BELOW = 0.2;

interface Point {
  x: number;
  y: number;
}

interface Ricochet {
  /** Where it left the field, where it turned, where it lands. */
  path: [Point, Point, Point];
  /** Pixels along `path` so far, and a second. */
  s: number;
  speed: number;
  hex: string;
  turned: boolean;
  /** Seconds since it landed, or null while it is still in the air. */
  hit: number | null;
}

type Burst = (x: number, y: number, n: number, hex: string) => void;

function length(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** The point `s` pixels along the two legs. */
function along(path: readonly Point[], s: number): Point {
  let left = Math.max(0, s);
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i] as Point;
    const b = path[i + 1] as Point;
    const leg = length(a, b);
    if (left <= leg || i === path.length - 2) {
      const t = leg === 0 ? 1 : Math.min(1, left / leg);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    left -= leg;
  }
  return path[0] as Point;
}

function total(path: readonly Point[]): number {
  return length(path[0] as Point, path[1] as Point) + length(path[1] as Point, path[2] as Point);
}

export class RicochetFx {
  private flights: Ricochet[] = [];

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, well: boolean): void {
    if (well) return;
    const hold = cfg.waveFailBeats * beatSeconds(cfg);
    const boltSpeed = (cfg.bulletTilesPerBeat * l.tile) / beatSeconds(cfg);
    for (const e of events) {
      if (e.type !== "shotOut" || !e.wasted) continue;
      const col = e.col + e.driftMilli / 1000;
      const toward = col <= (l.cols - 1) / 2 ? 1 : -1;
      const land = Math.max(0, Math.min(l.cols - 1, col + toward * ACROSS * l.cols));
      const x = tileCX(l, col);
      const path: [Point, Point, Point] = [
        { x, y: tileCY(l, e.atMilli / 1000) },
        { x, y: l.tile * TURN_BELOW },
        { x: tileCX(l, land), y: l.hullY },
      ];
      this.flights.push({
        path,
        s: 0,
        speed: Math.max(boltSpeed, total(path) / (hold * HOLD_SHARE)),
        hex: e.color === "red" ? PALETTE.red : PALETTE.cyan,
        turned: false,
        hit: null,
      });
    }
  }

  update(dt: number, burst: Burst): void {
    if (this.flights.length === 0) return;
    for (const f of this.flights) {
      if (f.hit !== null) {
        f.hit += dt;
        continue;
      }
      f.s += f.speed * dt;
      const [from, turn, land] = f.path;
      if (!f.turned && f.s >= length(from, turn)) {
        f.turned = true;
        burst(turn.x, turn.y, 6, PALETTE.text);
      }
      if (f.s >= total(f.path)) {
        f.hit = 0;
        burst(land.x, land.y, 22, f.hex);
      }
    }
    this.flights = this.flights.filter((f) => f.hit === null || f.hit < HIT_SECONDS);
  }

  /**
   * Drawn by the ship pass, over the hull (`frame-ship.ts`): the landing is on
   * the ship's skin, and under it the flash would be painted out. `skinY` is
   * where that skin is at a column's x this frame, which is where it lands.
   */
  draw(ctx: CanvasRenderingContext2D, l: Layout, skinY: (x: number) => number): void {
    const look = SHOT_LOOK;
    for (const f of this.flights) {
      const land = f.path[2];
      if (f.hit !== null) {
        flash(ctx, l, land.x, skinY(land.x), f.hit / HIT_SECONDS, f.hex);
        continue;
      }
      const path = [f.path[0], f.path[1], { x: land.x, y: skinY(land.x) }];
      const head = along(path, f.s);
      // The tail is a tile of the path behind the head, bent round the turn
      // while the head is just past it.
      const tailFrom = f.s - l.tile;
      const turnAt = length(f.path[0], f.path[1]);
      ctx.globalAlpha = look.tailAlpha;
      ctx.strokeStyle = f.hex;
      ctx.lineWidth = look.tailWidth;
      ctx.beginPath();
      const foot = along(path, tailFrom);
      ctx.moveTo(foot.x, foot.y);
      if (tailFrom < turnAt && f.s > turnAt) ctx.lineTo(f.path[1].x, f.path[1].y);
      ctx.lineTo(head.x, head.y);
      ctx.stroke();
      ctx.globalAlpha = 1;

      halo(ctx, head.x, head.y, l.tile * look.haloMul, f.hex, look.haloAlpha);
      ctx.fillStyle = f.hex;
      ctx.beginPath();
      ctx.arc(head.x, head.y, l.tile * look.coreMul, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  clear(): void {
    this.flights = [];
  }
}

/** The bolt going off against the hull: a swelling glow and a ring, `t` 0 to 1. */
function flash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  t: number,
  hex: string,
): void {
  const fade = 1 - t;
  halo(ctx, x, y, l.tile * (0.8 + t * 1.2), hex, fade);
  halo(ctx, x, y, l.tile * 0.35, PALETTE.text, fade * fade);
  ctx.globalAlpha = fade;
  ctx.strokeStyle = hex;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, l.tile * (0.3 + t * 1.2), 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
