import { MAGNET_SHAPE } from "@neon-spore/content";
import type { Color, SimEvent } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { magnetArchPath, magnetPlatePath, magnetPolePath } from "./magnet.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * A magnet coming apart, and the one kill in this game whose picture is about
 * the **direction the shot came from**.
 *
 * Everything else that dies here dies symmetrically: a body swells and empties,
 * a ring opens away from a tile, a burst throws its colour in every direction.
 * That is right for every creature the pair answers by standing under it, and
 * it would be wrong here — the whole cost of this body was getting a bolt to
 * arrive from one *side*, and a burst that says nothing about the side says
 * nothing about what they just did.
 *
 * So the arch breaks at the crown and the two arms go their own ways, the far
 * one thrown hardest because that is the one the shot went through. The plate
 * is cut loose at the staff and falls, tumbling, still lit — armour that never
 * failed and simply has nothing left to hang from, which is the last thing to
 * say about a defence that was got round rather than beaten.
 *
 * It rides on top of the ordinary `destroy` burst on the same tick, the way
 * `veil-tear.ts` and `chute-cut.ts` do. Pure render: the simulation finished
 * with the body before any of this starts.
 */

/** How long the whole thing runs. A chute's length: it is two gestures at
 * once rather than one, and the pair needs their eyes back by the next beat. */
const LIFE = 0.75;
/** How far the halves travel sideways, in body radii, and how far the far one
 * goes past the near one. The difference *is* the bearing. */
const THROW = 3.4;
const FAR = 1.55;
/** How far the plate falls, in body radii, and how far round it turns while it
 * does. Enough of a turn to read as loose, short of a spin. */
const FALL = 4.2;
const TUMBLE = 1.9;

interface Break {
  x: number;
  y: number;
  /** The body's drawn radius when it went. */
  r: number;
  hex: string;
  rim: string;
  /** Which way the bolt was crossing: -1 for a shot that came from the left,
   * so the arm on the right is the far one. */
  dir: 1 | -1;
  /** Seconds left. */
  left: number;
}

export class MagnetBreakFx {
  private breaks: Break[] = [];

  /**
   * Every `magnetBreak` in this frame's events. Its own `ingest` rather than a
   * case in `effects.ts`, the way every transient in `effects-body.ts` has
   * one: the tile arithmetic belongs beside the drawing that uses it.
   *
   * The radius is a plain tile fraction rather than `creatureRadius` — there
   * is no creature left to ask — and it is the same 0.4 of a tile every living
   * body is drawn at.
   */
  ingest(events: readonly SimEvent[], l: Layout): void {
    for (const e of events) {
      if (e.type !== "magnetBreak") continue;
      this.spawn(tileCX(l, e.col), tileCY(l, e.row), l.tile * 0.4, e.color, e.fromLeft);
    }
  }

  spawn(x: number, y: number, r: number, color: Color, fromLeft: boolean): void {
    const red = color === "red";
    this.breaks.push({
      x,
      y,
      r,
      hex: red ? PALETTE.red : PALETTE.cyan,
      rim: red ? PALETTE.redRim : PALETTE.cyanRim,
      dir: fromLeft ? 1 : -1,
      left: LIFE,
    });
  }

  update(dt: number): void {
    for (const b of this.breaks) b.left -= dt;
    this.breaks = this.breaks.filter((b) => b.left > 0);
  }

  clear(): void {
    this.breaks = [];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const b of this.breaks) {
      // `u` runs 0 at the moment it was hit to 1 when there is nothing left.
      const u = Math.min(1, Math.max(0, 1 - b.left / LIFE));
      drawPlateFalling(ctx, b, u);
      drawArm(ctx, b, u, true);
      drawArm(ctx, b, u, false);
    }
  }
}

/**
 * One half of the horseshoe, thrown outward and turning as it goes.
 *
 * Each half is drawn as the whole arch clipped to its own side, which is what
 * keeps the two pieces *the shape the pair was looking at* rather than two new
 * shapes invented for the moment they stopped looking at it. The coloured pole
 * goes with the arm it was on, still lit, so the colour that killed this body
 * is the last thing to leave the screen.
 */
function drawArm(ctx: CanvasRenderingContext2D, b: Break, u: number, left: boolean): void {
  const side = left ? -1 : 1;
  // The far arm is the one the bolt went through, so it takes more of it.
  const far = side === b.dir ? FAR : 1;
  const fade = 1 - u ** 1.7;
  if (fade <= 0) return;
  const travel = b.r * THROW * far * u ** 0.7;
  // It sags as it goes: nothing here is thrown upward, and a piece that flew
  // level would read as a spark rather than as wreckage.
  const sag = b.r * 1.5 * u * u;

  ctx.save();
  ctx.translate(b.x + side * travel, b.y + sag);
  ctx.rotate(side * u * TUMBLE * 0.45);
  // Half the arch, cut down the middle so the two pieces meet where the crown
  // broke and nowhere else.
  ctx.beginPath();
  ctx.rect(left ? -b.r * 2 : 0, -b.r * 2, b.r * 2, b.r * 4);
  ctx.clip();

  const arch = magnetArchPath(b.r);
  ctx.globalAlpha = fade;
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(arch);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.dim;
  ctx.stroke(arch);

  const pole = magnetPolePath(b.r, left);
  ctx.fillStyle = b.hex;
  ctx.fill(pole);
  ctx.strokeStyle = b.rim;
  ctx.stroke(pole);
  ctx.restore();
}

/**
 * The plate, cut loose and falling.
 *
 * It is drawn whole — staff and all — because nothing broke it: the shot went
 * round it. Losing the thing it hung from is the only reason it is moving, and
 * a plate that shattered would say the pair had beaten it, which is the one
 * thing they did not do.
 */
function drawPlateFalling(ctx: CanvasRenderingContext2D, b: Break, u: number): void {
  const fade = 1 - u ** 2;
  if (fade <= 0) return;
  const drop = b.r * FALL * u ** 1.4;
  ctx.save();
  ctx.translate(b.x - b.dir * b.r * 0.5 * u, b.y + drop);
  ctx.rotate(-b.dir * u * TUMBLE);
  const path = magnetPlatePath(b.r, MAGNET_SHAPE);
  ctx.globalAlpha = fade;
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(path);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.rock;
  ctx.stroke(path);
  ctx.restore();
}
