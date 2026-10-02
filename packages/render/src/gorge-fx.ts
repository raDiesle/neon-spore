import type { SimEvent } from "@neon-spore/sim";
import { hash01 } from "./backdrop.js";
import { BossHurt } from "./boss-hurt.js";
import { halo } from "./glow.js";
import { GripVerdicts } from "./grip-verdict.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE GORGE leaves behind a frame: the beads leaving at the end, and the
 * bursts its nine receipts throw on the way there.
 *
 * Everything else about the sack is drawn off the boss every frame
 * (`gorge-draw.ts`). The payoff is the exception, and it is the loudest frame
 * on the boss's page: the last level sated, the sack goes out, and **every
 * bead it holds leaves at once**, straight up through the top of the frame and
 * gone. The world keeps the count and nothing else, so the moment is a
 * transient, kept here and cleared in `Effects.reset()` like everything that
 * outlives its frame (`restart.test.ts`). Half go red and half cyan by hash,
 * which is what a sack fed from both hands looks like emptying.
 *
 * The bursts go through `Sparks` like any other event's, and are here rather
 * than in `effects-spark.ts`'s table because the nine are one family: read
 * once, above the loop, the way THE MIRROR's are. Each bursts on the bubble's
 * own row (`row` on every event), so a ring's bottom bubble bursts where it
 * hangs. A tap is small and white — a thumb landing is the handle's colour,
 * not the sack's — and is the tap ring's verdict, keyed by column
 * (`gorge-marks.ts`); a refused shot is the red one.
 *
 * **A bubble sated is a sequence landed**, and so is the level, so both deal
 * the sack the blow every boss takes (`boss-hurt.ts`); a shot that fills it a
 * step is a jab.
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
  /** The blow an intake ruptured deals the sack. */
  readonly hurt = new BossHurt();
  /** Was the last thumb on each ring right, keyed by column (`gorge-marks.ts`). */
  readonly verdicts = new GripVerdicts();

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    for (const e of events) {
      if (!("row" in e)) continue;
      const x = tileCX(l, e.col);
      const y = tileCY(l, e.row);
      switch (e.type) {
        case "gorgeSwallow":
          burst(x, y, 3, e.color === "red" ? PALETTE.red : PALETTE.cyan);
          this.hurt.jab();
          break;
        case "gorgeEmptied":
          burst(x, y, 4, PALETTE.sparkDim);
          break;
        case "gorgeFull":
          burst(x, y, 10, e.color === "red" ? PALETTE.redRim : PALETTE.cyanRim);
          this.hurt.hit();
          break;
        case "gorgeSpit":
          burst(x, y, 4, e.color === "red" ? PALETTE.red : PALETTE.cyan);
          this.verdicts.mark(e.col, false);
          break;
        case "gorgeTap":
          burst(x, y, 6, PALETTE.text);
          this.verdicts.mark(e.col, true);
          break;
        case "gorgeTurn":
          burst(x, y, 4, PALETTE.sparkDim);
          break;
        case "gorgeCleared":
          burst(x, y, 16, PALETTE.rock);
          this.hurt.hit();
          break;
        case "gorgeOut":
          this.release(l, e.col, e.beads, y);
          this.hurt.hit();
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
    this.hurt.update(dt);
    this.verdicts.update(dt);
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
    this.hurt.clear();
    this.verdicts.clear();
  }
}
