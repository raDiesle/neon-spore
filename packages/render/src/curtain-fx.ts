import { CURTAIN_COLS, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { hash01 } from "./backdrop.js";
import { BossHurt } from "./boss-hurt.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * What THE CURTAIN leaves behind a frame: the sheet falling once it is torn
 * off the rail, and the bursts its ten receipts throw on the way there.
 *
 * Everything else about the boss is drawn off the world every frame
 * (`curtain-draw.ts`). The tear is the exception: the fabric's body is gone
 * from the world the tick it tears (`sim/curtain-step.ts`), and a sheet that
 * vanished would be a sheet nobody saw come down. So it is kept here for
 * four beats — the width it had, where it was — falling and thinning, and
 * cleared in `Effects.reset()` like everything that outlives its frame
 * (`restart.test.ts`).
 *
 * The bursts go through `Sparks` like any other event's, and are read here,
 * above the loop, because `effects-spark.ts`'s table is at its limit and the
 * ten are one family — THE GORGE's arrangement (`gorge-fx.ts`).
 *
 * **A core hit is a sequence landed** — the fabric shoved or gathered off
 * it and a shot in its colour through the gap — and so is the last, so both
 * deal the boss the blow every boss takes (`boss-hurt.ts`). Its drawer is
 * handed no fx, so the caller shakes it and hands it the blow's `value`
 * (`boss-draw-clocks.ts`). A lobe off or a shove deals nothing.
 */

/** Beats the torn sheet takes to fall out of the picture. */
const FALL_BEATS = 4;
/** How far it falls, in tiles, by the end. */
const FALL_TILES = 5;

interface Sheet {
  x0: number;
  width: number;
  y: number;
  life: number;
  left: number;
}

export class CurtainFx {
  private sheets: Sheet[] = [];
  /** The blow a core hit deals the boss. */
  readonly hurt = new BossHurt();

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    /** Seconds a beat lasts, for the fall's clock. */
    spb: number,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    const cy = tileCY(l, cfg.curtainRow);
    const hem = cy + l.tile * 0.45;
    for (const e of events) {
      switch (e.type) {
        case "curtainUnroll":
          for (let i = 0; i < e.width; i++) burst(tileCX(l, e.col + i), hem, 2, PALETTE.dim);
          break;
        case "curtainShadow":
          burst(tileCX(l, e.col), cy, 4, e.color === "red" ? PALETTE.red : PALETTE.cyan);
          break;
        case "curtainSoft":
          burst(tileCX(l, e.col), hem, 3, PALETTE.hullRim);
          break;
        case "curtainShove":
          // The edge that led: the fabric's leading hem, sparking on the rail.
          burst(tileCX(l, e.dir > 0 ? e.col + CURTAIN_COLS - 1 : e.col), cy, 3, PALETTE.dim);
          break;
        case "curtainReroll":
          burst(tileCX(l, e.dir > 0 ? e.col + CURTAIN_COLS - 1 : e.col), cy, 2, PALETTE.sparkDim);
          break;
        case "curtainLobeOff":
          burst(tileCX(l, e.col), hem, 8, PALETTE.hull);
          break;
        case "curtainCoreHit":
          this.hurt.hit();
          burst(tileCX(l, e.col), cy, 10, PALETTE.hullRim);
          break;
        case "curtainFire":
          burst(tileCX(l, e.col), cy + l.tile * 0.3, 5, PALETTE.ember);
          break;
        case "curtainTear":
          burst(tileCX(l, e.col), cy - l.tile * 0.5, 14, PALETTE.dim);
          this.tear(l, e.col, cy, spb);
          break;
        case "curtainOut":
          this.hurt.hit();
          burst(tileCX(l, e.col), cy, 20, PALETTE.hullRim);
          break;
        default:
          break;
      }
    }
  }

  /** The sheet comes down: as wide as it was, centred where the core was. */
  private tear(l: Layout, col: number, cy: number, spb: number): void {
    const life = FALL_BEATS * spb;
    this.sheets.push({
      x0: tileCX(l, col) - (CURTAIN_COLS / 2) * l.tile,
      width: CURTAIN_COLS * l.tile,
      y: cy,
      life,
      left: life,
    });
  }

  update(dt: number): void {
    for (const s of this.sheets) s.left -= dt;
    this.sheets = this.sheets.filter((s) => s.left > 0);
    this.hurt.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    const t = l.tile;
    for (const s of this.sheets) {
      const gone = 1 - s.left / s.life;
      const y = s.y + gone * gone * t * FALL_TILES;
      const a = 0.3 * (1 - gone);
      const path = new Path2D();
      path.moveTo(s.x0, y - t * 0.5);
      path.lineTo(s.x0 + s.width, y - t * 0.5);
      // Crumpling as it goes: the hem folds by hash, deeper the further down.
      for (let i = CURTAIN_COLS; i >= 0; i--) {
        const x = s.x0 + i * t;
        path.lineTo(x, y + t * 0.4 + (hash01(i * 7 + 3) - 0.5) * t * gone);
      }
      path.closePath();
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = PALETTE.hull;
      ctx.fill(path);
      ctx.globalAlpha = a * 2;
      ctx.strokeStyle = PALETTE.hullRim;
      ctx.lineWidth = STROKE.inner;
      ctx.stroke(path);
      ctx.restore();
    }
  }

  clear(): void {
    this.sheets = [];
    this.hurt.clear();
  }
}
