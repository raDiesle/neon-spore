import { MAGNET_SHAPE } from "@neon-spore/content";
import type { Color, SimEvent } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * A shot turned away by the plate under a magnet, coming back down.
 *
 * **A bolt that simply stopped existing would be the wrong sentence.** Every
 * other shot in this game ends by doing something — a body bursts, a rock takes
 * a crater, a wrong colour flashes and is refused — and a bolt that vanished at
 * a tile with a grey spark over it reads as *the game ate that one*, which is
 * how a pair comes to believe a control is broken. This one has to say
 * something narrower and it is the owner's own word: it was **reflected**. It
 * comes off the plate the way it went in, falls about a tile, and is gone.
 *
 * **Down, and only down.** The plate is flat and the bolt met it climbing, so
 * there is one direction it can leave in and no choice to make about it. A
 * ricochet that fanned to one side would be saying the plate has a slope, which
 * is the one thing about this body that must not be misread — a sloped plate is
 * a plate a shot could be aimed off, and the whole creature is that it cannot.
 *
 * It is drawn in the **shot's** colour rather than the magnet's, which is the
 * rule every impact in this game is drawn by: what is thrown carries the colour
 * of the thing that arrived. Nothing about the body changed.
 *
 * Pure render, like everything in `effects-body.ts`: the simulation spent the
 * bolt on the tick it met the plate and has no idea any of this is drawn.
 */

/** How long it runs. Short — this is a thing that did not work, and it must not
 * still be on screen on the beat the pair is deciding what to do instead. */
const LIFE = 0.34;
/** How far it falls, in tiles. The owner's figure: about one, so it clearly
 * *left* the plate rather than smearing under it. */
const DROP = 1;
/** How long the bolt is drawn, in tiles, and how thick. */
const LEN = 0.34;
const WIDTH = 2.2;

interface Bounce {
  x: number;
  /** The underside of the plate, which is where it came off. */
  y: number;
  hex: string;
  rim: string;
  tile: number;
  /** Seconds left. */
  left: number;
}

export class MagnetBounceFx {
  private live: Bounce[] = [];

  /**
   * Every `magnetPlate` in this frame's events.
   *
   * The plate's own offset is read off `MAGNET_SHAPE` rather than guessed at,
   * so the bolt leaves the edge the body is actually drawn with: a ricochet
   * starting at a tile centre would begin inside the arch it bounced off.
   */
  ingest(events: readonly SimEvent[], l: Layout): void {
    for (const e of events) {
      if (e.type !== "magnetPlate") continue;
      const under = l.tile * 0.4 * (MAGNET_SHAPE.plateDrop + MAGNET_SHAPE.plateThick);
      this.spawn(tileCX(l, e.col), tileCY(l, e.row) + under, l.tile, e.color);
    }
  }

  spawn(x: number, y: number, tile: number, color: Color): void {
    const red = color === "red";
    this.live.push({
      x,
      y,
      tile,
      hex: red ? PALETTE.red : PALETTE.cyan,
      rim: red ? PALETTE.redRim : PALETTE.cyanRim,
      left: LIFE,
    });
  }

  update(dt: number): void {
    for (const b of this.live) b.left -= dt;
    this.live = this.live.filter((b) => b.left > 0);
  }

  clear(): void {
    this.live = [];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const b of this.live) {
      // 0 at the plate, 1 a tile below it with nothing left.
      const u = Math.min(1, Math.max(0, 1 - b.left / LIFE));
      // Away fast and slowing, which is what a thing that was *stopped* and
      // sent back does — not a thing that was thrown.
      const head = b.y + b.tile * DROP * (1 - (1 - u) ** 2);
      const tail = head - b.tile * LEN * (1 - u);
      const fade = 1 - u ** 1.6;
      if (fade <= 0) continue;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = fade;
      ctx.strokeStyle = b.rim;
      ctx.lineCap = "round";
      ctx.lineWidth = WIDTH * (1 - u * 0.5);
      ctx.beginPath();
      ctx.moveTo(b.x, tail);
      ctx.lineTo(b.x, head);
      ctx.stroke();
      ctx.restore();
      halo(ctx, b.x, head, b.tile * 0.3 * fade, b.hex, 0.45 * fade);
    }
  }
}
