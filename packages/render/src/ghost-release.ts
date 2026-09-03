import { GHOST, ghostPath } from "@neon-spore/content";
import type { Color, SimEvent } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * A ghost let go of, and the one moment both screens carry this creature.
 *
 * **It is the pilot's only sight of the thing.** Player 1 has spent the whole
 * descent looking at a band across a row and firing where they were told, so
 * the beat this body dies on is the beat they finally see what it was — and
 * that is worth half a second of the frame. Everything about the picture
 * follows from that: it is drawn at full size, in its own colour, with the
 * torn bands still on it, and it is on screen long enough to be *recognised*
 * rather than merely noticed.
 *
 * **It goes up.** The owner asked for a balloon let go of, and the grammar of
 * this field makes that unmistakable on its own: everything in this game falls
 * — every body, every rock, every pod once it is loose — and nothing has ever
 * travelled upward. So a shape climbing out of the top of the frame cannot be
 * read as anything but *escaping*, which is the one thing this creature has
 * been doing all along. It flutters as it goes, wide at first and tighter as
 * the air runs out, and the bands tear wider apart until there is nothing left
 * holding it together.
 *
 * Deliberately unlike the two neighbours it could be confused with:
 *
 * - *A destroy burst* throws twelve particles away from a tile and is over in
 *   a fifth of a second. That still happens, on the same tick, because the
 *   kill is a kill — this rides on top of it, the way `veil-tear.ts` does.
 * - *A lure folding* (`lure-vanish.ts`) is the same length and the exact
 *   opposite gesture: inward, to a point, staying where it was. Nothing that
 *   travels a third of the field can be mistaken for it.
 */

/**
 * How long the escape runs. Longer than every other transient in this package
 * — a lure folds in 0.45 s and a cloud tears in less — and it is the one place
 * that is right, because this is the *first* time one of the two players is
 * being shown this body and half a beat is not long enough to learn a shape.
 */
const LIFE = 0.85;

/** How far up it climbs, in units of its own drawn radius. Far enough to be
 * off the top of most of the field, so it reads as gone rather than as fading
 * out in place. */
const RISE = 16;

interface Escape {
  x: number;
  y: number;
  /** The body's drawn radius when it went. */
  r: number;
  hex: string;
  rim: string;
  /** Spreads the flutter, so two ghosts shot on one beat are not one picture
   * drawn twice. Deterministic, from the tile it left. */
  seed: number;
  /** Seconds left. */
  left: number;
}

export class GhostReleaseFx {
  private escapes: Escape[] = [];

  /**
   * Every `ghostRelease` in this frame's events. Its own `ingest` rather than
   * a case in `effects.ts`, the way `LureVanishFx` and `VeilTearFx` have
   * theirs: the tile arithmetic belongs beside the drawing that uses it.
   *
   * The radius is a plain tile fraction rather than `ghostRadius` — there is
   * no creature left to ask, it having been the thing that went — and it is
   * the same 0.4 of a tile every living body is drawn at.
   */
  ingest(events: readonly SimEvent[], l: Layout): void {
    for (const e of events) {
      if (e.type !== "ghostRelease") continue;
      this.spawn(tileCX(l, e.col), tileCY(l, e.row), l.tile * 0.4, e.color, e.col * 1.7 + e.row);
    }
  }

  spawn(x: number, y: number, r: number, color: Color, seed: number): void {
    const red = color === "red";
    this.escapes.push({
      x,
      y,
      r,
      hex: red ? PALETTE.red : PALETTE.cyan,
      rim: red ? PALETTE.redRim : PALETTE.cyanRim,
      seed,
      left: LIFE,
    });
  }

  update(dt: number): void {
    for (const e of this.escapes) e.left -= dt;
    this.escapes = this.escapes.filter((e) => e.left > 0);
  }

  clear(): void {
    this.escapes = [];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const e of this.escapes) {
      // `u` runs 0 at the moment it was hit to 1 when there is nothing left.
      const u = Math.min(1, Math.max(0, 1 - e.left / LIFE));
      this.drawEscape(ctx, e, u);
    }
  }

  private drawEscape(ctx: CanvasRenderingContext2D, e: Escape, u: number): void {
    // Fast off the mark and slowing as it climbs, which is what a thing with
    // its own pressure behind it does — a body merely rising would read as
    // being lifted rather than as letting go.
    const climb = e.r * RISE * u ** 0.65;
    // The flutter: wide while there is still air in it, tight at the end.
    const swing = Math.sin(u * 17 + e.seed) * e.r * 1.1 * (1 - u) ** 0.8;
    const x = e.x + swing;
    const y = e.y - climb;
    // Deflating: it loses its width faster than its height, so it stretches
    // as it empties instead of simply getting smaller.
    const scale = (e.r / Math.max(GHOST.rx, GHOST.ry)) * (1 - u * 0.55);
    const squash = 1 - u * 0.35;

    ctx.save();
    ctx.translate(x, y);
    // It leans into the swerve, which is the whole difference between a shape
    // wandering up the screen and one being pushed by what is leaving it.
    ctx.rotate(swing * 0.012);
    ctx.scale(scale * squash, scale * (1 + u * 0.25));
    ctx.globalCompositeOperation = "lighter";

    const d = ghostPath(
      0,
      0,
      GHOST.rx,
      GHOST.ry,
      GHOST.tails,
      GHOST.skirt,
      GHOST.wobble + u * 0.1,
      e.seed + u * 9,
      GHOST.seed,
    );
    const body = new Path2D(d);
    ctx.globalAlpha = 0.5 * (1 - u ** 2);
    ctx.fillStyle = e.hex;
    ctx.fill(body);
    ctx.globalAlpha = 0.9 * (1 - u ** 3);
    ctx.strokeStyle = e.rim;
    ctx.lineWidth = Math.max(0.5, GHOST.ry * 0.04);
    // The whole outline it wore on the field, coming apart on the way up: it
    // leaves solid and the gaps open as it climbs, until the line is more
    // absence than line. The body's own contour is unbroken now (`ghost.ts`),
    // so this is the only dashed line in the game and it is an event rather
    // than a finish — the camouflage failing, not the body fading.
    ctx.setLineDash([GHOST.ry * 0.14, GHOST.ry * u * 0.5]);
    ctx.stroke(body);
    ctx.restore();
  }
}
