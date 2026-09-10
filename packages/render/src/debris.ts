import { type BreakLook, fallFrom, fractureFrom } from "./break-look.js";
import type { Shard } from "./shatter.js";
import { shatter } from "./shatter.js";
import type { Fall } from "./shatter-fall.js";
import { shardAt } from "./shatter-fall.js";

/**
 * The pieces a broken body left, still in the air.
 *
 * One of `Effects`' transients, and among the plainest: it is fed by one event,
 * writes nothing back, and forgets everything on a restart. What makes it worth
 * its own file rather than a second list inside `Sparks` is that a piece is not
 * a particle — it carries an outline cut from the body it was part of, and the
 * cut happens once, at the moment of the break, off a contour the drawing code
 * hands in (`shatter.ts`).
 *
 * **It draws what a look asks it to, and the look arrives with the body.**
 * `BREAK_LOOK.wedges` shipped at 0 and `break` returned immediately until
 * `creature:break` was taken; the look is handed in per break now rather than
 * read off one record here, because which pieces a body comes apart into is
 * a fact about *that kind* (`body-hit.ts`), and a VERSUS candidate on the
 * slick's hit must not retune a dart's. That is the arrangement
 * `docs/versus.md` calls a seam.
 *
 * Everything is in **screen pixels** by the time it is stored. The cut is done
 * in the body's own units and scaled once on the way in, so a frame costs a
 * `shardAt` and a fill per piece and no unit conversion at all.
 */

/** One body's worth of pieces, with the clock they all share. */
interface Break {
  /** The look the cut was made with — its `paint` draws every piece. */
  readonly look: BreakLook;
  readonly pieces: readonly Shard[];
  readonly fall: Fall;
  /** Where the body stood, in pixels. */
  readonly x: number;
  readonly y: number;
  readonly hex: string;
  readonly dark: string;
  /** Seconds since the break. */
  age: number;
}

/** What `break` is told: a body, where it was, and what it was made of. */
export interface BreakAt {
  /** How this body comes apart: `hitFor(kind).pieces`, and never read off a
   * record here (`body-hit.ts`). */
  readonly look: BreakLook;
  /** The body's own contour, centred on the origin — `livingPoints`' output. */
  readonly outline: readonly { readonly x: number; readonly y: number }[];
  /** Contour units to pixels. `drawLiving` already computes one; hand that in
   * rather than deriving a second, or the pieces are a different size from the
   * body they came out of. */
  readonly scale: number;
  /** Where the body stood, in pixels. */
  readonly x: number;
  readonly y: number;
  /** One tile in pixels — every speed and pull in `BreakLook` is in tiles. */
  readonly tile: number;
  /** Where the pieces come to rest, in pixels. The hull's own line, for a body
   * killed over the ship; left out where there is nothing under it. */
  readonly floor?: number;
  readonly hex: string;
  readonly dark: string;
  /** The seed. The same body broken on the same beat breaks the same way on
   * both phones, which is `sparks.ts`'s rule and not a nicety. */
  readonly seed: number;
}

export class Debris {
  private list: Break[] = [];

  /** Cut a body up, if the look asks for pieces at all. */
  break(b: BreakAt): void {
    const look = b.look;
    if (look.wedges < 3) return;
    const cut = shatter(b.outline, fractureFrom(look, b.tile / b.scale, b.seed));
    if (cut.length === 0) return;
    // Into pixels once, here. Every coordinate a piece carries is scaled, and
    // so is every speed — a velocity left in contour units would put the same
    // break at a different size on a phone with a different tile.
    const pieces = cut.map((s) => ({
      points: s.points.map((p) => ({ x: p.x * b.scale, y: p.y * b.scale })),
      x: s.x * b.scale,
      y: s.y * b.scale,
      vx: s.vx * b.scale,
      vy: s.vy * b.scale,
      spin: s.spin,
      depth: s.depth,
    }));
    const floor = b.floor === undefined ? undefined : b.floor - b.y;
    this.list.push({
      look,
      pieces,
      fall: fallFrom(look, b.tile, floor),
      x: b.x,
      y: b.y,
      hex: b.hex,
      dark: b.dark,
      age: 0,
    });
  }

  update(dt: number): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const b = this.list[i] as Break;
      b.age += dt;
      if (b.age >= b.fall.life) this.list.splice(i, 1);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const b of this.list) {
      ctx.save();
      ctx.translate(b.x, b.y);
      for (const s of b.pieces) {
        b.look.paint(ctx, {
          shard: s,
          pose: shardAt(s, b.age, b.fall),
          hex: b.hex,
          dark: b.dark,
          // The outline is already in pixels; the paint scales what it is
          // given, so it is told the identity.
          scale: 1,
        });
      }
      ctx.restore();
    }
  }

  clear(): void {
    this.list.length = 0;
  }
}
