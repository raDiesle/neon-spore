import type { SimEvent } from "@neon-spore/sim";
import { hash01 } from "./backdrop.js";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE GORGE leaves behind a frame: the beads leaving at the end, and the
 * bursts its fourteen receipts throw on the way there.
 *
 * Everything else about the sack is drawn off the boss every frame
 * (`gorge-draw.ts`). The payoff is the exception, and it is the loudest frame
 * on the boss's page: the beam stands in the mouth, the sack splits along its
 * whole width, and **every bead it ever swallowed leaves at once**, straight
 * up through the top of the frame and gone. The world keeps the count
 * (`swallowed`) and nothing else — the beads it spat are bodies that were
 * broken on the field, and the ones still in the lobes are about to not be
 * there — so the moment is a transient, kept here and cleared in
 * `Effects.reset()` like everything that outlives its frame
 * (`restart.test.ts`).
 *
 * The colours are dealt, not remembered. The sack does not keep which colour
 * each bead was fired in over a fight of fifty shots, and a receipt that
 * carried fifty colours would be a receipt about nothing. Half go red and half
 * cyan by hash, which is what a sack fed from both hands looks like emptying.
 *
 * The bursts go through `Sparks` like any other event's, and are here rather
 * than in `effects-spark.ts`'s table because that file is at its limit and the
 * fourteen are one family: read once, above the loop, the way THE MIRROR's are.
 * The first of two pierces and the first of two fills are the rupture's and
 * the payoff's first halves — a little of the rock, a little of the mouth's
 * colour — so a shot that landed and left a count owing is never silent.
 * The two thumbs' bursts are small and white — a thumb landing is the
 * handle's colour, not the sack's — and the clench is the sack's rock, a
 * mouth shutting on something.
 */

/** Seconds a bead takes to leave the top of the frame. */
const RISE_LIFE = 1.3;
/** How many beads the payoff is allowed to throw, however many were swallowed. */
const RISE_CAP = 80;

interface Riser {
  x: number;
  y: number;
  vx: number;
  vy: number;
  left: number;
  hex: string;
}

export class GorgeFx {
  private risers: Riser[] = [];
  private seed = 0;

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    const top = tileCY(l, 0) - l.tile * 0.5;
    for (const e of events) {
      switch (e.type) {
        case "gorgeSwallow":
          burst(tileCX(l, e.col), top, 3, e.color === "red" ? PALETTE.red : PALETTE.cyan);
          break;
        case "gorgeEmptied":
          burst(tileCX(l, e.col), top, 4, PALETTE.sparkDim);
          break;
        case "gorgeFull":
          burst(tileCX(l, e.col), top, 8, e.color === "red" ? PALETTE.redRim : PALETTE.cyanRim);
          break;
        case "gorgeRupture":
          burst(tileCX(l, e.col), top, 16, PALETTE.rock);
          break;
        case "gorgeNick":
          burst(tileCX(l, e.col), top, 6, PALETTE.rock);
          break;
        case "gorgeVent":
          burst(tileCX(l, e.col), top, 6, PALETTE.ember);
          break;
        case "gorgeSpit":
          burst(tileCX(l, e.col), top, 4, e.color === "red" ? PALETTE.red : PALETTE.cyan);
          break;
        case "gorgeMouth":
          burst(tileCX(l, e.col), top, 10, PALETTE.emberRim);
          break;
        case "gorgeOut":
          this.release(l, e.col, e.beads, top);
          break;
        case "gorgePinch":
          burst(tileCX(l, e.col), top - l.tile * 0.5, 6, PALETTE.text);
          break;
        case "gorgePry":
          burst(tileCX(l, e.col), top - l.tile * 0.5, 8, PALETTE.text);
          break;
        case "gorgePryFill":
          burst(tileCX(l, e.col), top, 10, e.color === "red" ? PALETTE.redRim : PALETTE.cyanRim);
          break;
        case "gorgeClench":
          burst(tileCX(l, e.col), top, 14, PALETTE.rock);
          break;
        default:
          break;
      }
    }
  }

  /** The payoff: `beads` risers from the sack's width, up and gone. */
  private release(l: Layout, col: number, beads: number, top: number): void {
    const n = Math.min(RISE_CAP, beads);
    for (let i = 0; i < n; i++) {
      const s = this.seed++;
      const spread = (hash01(s * 3 + 1) - 0.5) * 6;
      this.risers.push({
        x: tileCX(l, col) + spread * l.tile,
        y: top + hash01(s * 3 + 2) * l.tile * 0.8,
        vx: (hash01(s * 3 + 3) - 0.5) * l.tile * 0.6,
        vy: -l.tile * (2.5 + hash01(s * 3 + 4) * 2),
        left: RISE_LIFE * (0.7 + hash01(s * 3 + 5) * 0.3),
        hex: hash01(s * 3 + 6) < 0.5 ? PALETTE.red : PALETTE.cyan,
      });
    }
  }

  update(dt: number): void {
    for (const r of this.risers) {
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      r.vy *= 1 + dt * 0.8;
      r.left -= dt;
    }
    this.risers = this.risers.filter((r) => r.left > 0);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    const r = l.tile * 0.09;
    for (const b of this.risers) {
      const a = Math.min(1, b.left / 0.3);
      halo(ctx, b.x, b.y, r * 3, b.hex, 0.6 * a);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = b.hex === PALETTE.red ? PALETTE.redRim : PALETTE.cyanRim;
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  clear(): void {
    this.risers = [];
    this.seed = 0;
  }
}
