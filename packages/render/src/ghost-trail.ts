import { GHOST, ghostPath } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { contourClock, creatureCenter } from "./creature-place.js";
import { depthScale, drawnRow, hazed, nearness } from "./depth.js";
import { ghostPalette, ghostRadius, showsGhostBody } from "./ghost.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";

/**
 * Where THE GHOST has just been: the body stamped again at the places it
 * stood a moment ago, fading out behind it.
 *
 * **It is the one body that goes sideways.** Everything else in this game
 * falls, so where it was is straight up from where it is and the eye supplies
 * that for free. A crossing ghost slides two whole columns along its row every
 * beat (`stepGhostAcross`, and `fromCol` is what makes that a glide rather
 * than a jump), and a body arriving from the side with nothing behind it is a
 * body the navigator has to re-find before they can say a number. The trail is
 * what it came in on: a smear back the way it came, and which way it is going
 * is a thing you see rather than one you work out.
 *
 * **One rule, two pictures.** The samples are taken on the wall clock rather
 * than on the beat, so nothing here has a case in it: a falling ghost lays
 * them down a few pixels apart and they stack over its head, and a crossing
 * one lays the same samples down across a third of the row.
 *
 * **It never reaches player 1.** `showsGhostBody` is asked here exactly as it
 * is asked at the body and at the band, and for the same reason: an echo is a
 * body drawn faintly, and a faint body names a column. The one screen that
 * gets it while the ghost is still hiding is player 2's.
 *
 * **The samples live in `Effects`**, which is where anything in this package
 * that outlives a frame has to live — a wave restarting with a trail still
 * held against a creature id the new run is about to reuse is the bug
 * `restart.test.ts` exists for.
 */

/** How long one echo lasts, in seconds. About two thirds of a beat at 96 bpm,
 * so the far end of the smear is roughly a column back on a crossing body:
 * long enough to be a direction, short enough that the oldest echo is never
 * far enough away to be mistaken for a second creature. */
const LIFE = 0.42;

/** Seconds between samples. Eight or so over a life, which is close enough
 * together to read as one smear rather than as a row of copies. */
const GAP = 0.05;

/** The most a body keeps. A ceiling rather than a figure — `LIFE / GAP` is
 * the real count, and this is what stops a frame drop from banking a hundred. */
const MAX = 12;

interface Echo {
  x: number;
  y: number;
  /** The perspective scale it was standing at, so an echo does not grow with
   * the body that has since moved down the field. */
  k: number;
  /** The contour clock at the moment it was taken: the echo is the shape the
   * body actually had, not the shape it has now drawn somewhere else. */
  t: number;
  near: number;
  age: number;
}

/** Every ghost's recent places, keyed by creature id. */
export class GhostTrail {
  private byId = new Map<number, Echo[]>();

  /** Where a body is this frame. Appends only when the last sample has aged
   * past `GAP`, so the trail is a rhythm rather than a frame rate. */
  note(id: number, e: Omit<Echo, "age">): void {
    const list = this.byId.get(id);
    if (!list) {
      this.byId.set(id, [{ ...e, age: 0 }]);
      return;
    }
    const last = list[list.length - 1];
    if (last && last.age < GAP) return;
    list.push({ ...e, age: 0 });
    if (list.length > MAX) list.shift();
  }

  update(dt: number): void {
    for (const [id, list] of this.byId) {
      for (const e of list) e.age += dt;
      const kept = list.filter((e) => e.age < LIFE);
      if (kept.length) this.byId.set(id, kept);
      else this.byId.delete(id);
    }
  }

  /** Oldest first, which is also back to front. */
  echoes(id: number): readonly Echo[] {
    return this.byId.get(id) ?? [];
  }

  clear(): void {
    this.byId.clear();
  }
}

/**
 * The pass. Before every body rather than inside `drawCreatures`, because an
 * echo belongs behind every creature on the field and not only behind its own
 * — a stamp drawn over the slick in the next column would read as a body in
 * front of it.
 */
export function drawGhostTrails(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  trail: GhostTrail,
  beatPhase: number,
  time: number,
): void {
  const cfg = world.cfg;
  for (const c of world.creatures) {
    if (c.kind !== "ghost") continue;
    if (!showsGhostBody(l, cfg, c)) continue;
    const { x, y } = creatureCenter(l, c, beatPhase);
    const row = drawnRow(c, beatPhase);
    trail.note(c.id, {
      x,
      y,
      k: depthScale(cfg, l, row),
      t: contourClock(c.id, time),
      near: nearness(l, row),
    });

    const { hex, rim } = ghostPalette(c.color);
    const scale = ghostRadius(l) / Math.max(GHOST.rx, GHOST.ry);
    const echoes = trail.echoes(c.id);
    // The newest sample is where the body is standing right now, and drawing
    // it would be the body traced a second time in a paler colour. Everything
    // older than it is the trail.
    for (let i = 0; i < echoes.length - 1; i++) {
      const e = echoes[i];
      if (!e) continue;
      // Curved rather than linear, so the trail is bright right behind the
      // body and gone soon after — the second stamp back has to be plainly
      // older than the first, not one shade down from it.
      const fade = (1 - e.age / LIFE) ** 1.6;
      drawEcho(ctx, e, scale, hazed(cfg, hex, e.near), hazed(cfg, rim, e.near), fade);
    }
  }
}

function drawEcho(
  ctx: CanvasRenderingContext2D,
  e: Echo,
  scale: number,
  hex: string,
  rim: string,
  fade: number,
): void {
  const body = new Path2D(
    ghostPath(0, 0, GHOST.rx, GHOST.ry, GHOST.tails, GHOST.skirt, GHOST.wobble, e.t, GHOST.seed),
  );
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.scale(scale * e.k, scale * e.k);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.3 * fade;
  ctx.fillStyle = hex;
  ctx.fill(body);
  ctx.globalAlpha = 0.55 * fade;
  ctx.lineWidth = GHOST.ry * 0.035;
  ctx.strokeStyle = rim;
  ctx.stroke(body);
  ctx.restore();
  // The wash it sits in, outside the transform: an echo without one is a flat
  // cut-out, and the body it came off is a thing made of light.
  halo(ctx, e.x, e.y, GHOST.ry * scale * e.k * 1.3, hex, 0.16 * fade);
}
