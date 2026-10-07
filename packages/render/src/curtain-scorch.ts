import { blobPoints } from "@neon-spore/content";
import { CURTAIN_COLS, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { type CurtainGive, giveReach } from "./curtain-give.js";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **Where a bolt struck THE CURTAIN's cloth** — the design's mark in the
 * fabric (`docs/spec/bosses-choreographed.md` §6), which was a `bounce` and
 * nothing else. A bolt into cloth that is not a soft lobe is spent on it
 * (`sim/curtain-shot.ts`); here it leaves a scorched pucker where it hit,
 * hot at the rim the beat it lands and healing over `HEAL_BEATS`.
 *
 * **It never opens.** A burn is darker than the cloth, not clearer: §11.24
 * argues against a hole the core could be seen through, and a mark the pilot
 * could read a covered core by would be the navigator's half of the fight.
 *
 * **It rides the cloth.** The event says the column, and the sheet is shoved
 * a column at a time, so the mark is bound to the sheet the first frame it is
 * drawn — which column of the seven it is on — and goes where that column
 * goes, rising with the hem's lift and dipping with a hand's sag. It keeps
 * the beads' rule rather than the folds' (`curtain-sway.ts`): it stays over
 * the column the bolt came up, through the draught and a hand's carry, so it
 * marks where the shot went rather than drifting off it.
 *
 * Kept here because it outlives the frame; cleared in `Effects.reset()` with
 * the rest of `CurtainFx` (`restart.test.ts`).
 */

/** Beats a scorch takes to heal away. */
const HEAL_BEATS = 4;
/** How far down the cloth a bolt from below meets it, rail 0 to hem 1. */
const DOWN = 0.72;
/** The scorch's radius, fresh, in tiles. */
const SCORCH_R = 0.24;
/** How many marks the cloth holds at once; the oldest heals first. */
const MOST = 6;

interface Scorch {
  col: number;
  /** Which of the sheet's seven columns, once it has been drawn on one. */
  at: number | null;
  seed: number;
  life: number;
  left: number;
}

/** Where the sheet hangs this frame, as `drawCurtainSheet` laid it. */
export interface ClothAt {
  /** The sheet's column on the rail. */
  col: number;
  x0: number;
  railY: number;
  hemY: number;
  /** The hem's trail behind the rail through a shove, in pixels; the beads keep it. */
  lag: number;
  give: CurtainGive;
}

/** A mark where it is drawn: its centre, how fresh (1 as it lands, 0 healed) and its own wobble. */
export interface Placed {
  x: number;
  y: number;
  fresh: number;
  seed: number;
}

export class CurtainScorch {
  private marks: Scorch[] = [];
  private seed = 0;

  ingest(events: readonly SimEvent[], cfg: SimConfig, spb: number): void {
    for (const e of events) {
      if (e.type !== "bounce" || e.row !== cfg.curtainRow) continue;
      const life = HEAL_BEATS * spb;
      this.seed = (this.seed + 1) % 997;
      this.marks.push({ col: e.col, at: null, seed: this.seed, life, left: life });
    }
    if (this.marks.length > MOST) this.marks = this.marks.slice(-MOST);
  }

  update(dt: number): void {
    for (const m of this.marks) m.left -= dt;
    this.marks = this.marks.filter((m) => m.left > 0);
  }

  /**
   * The marks on the cloth, laid where the sheet hangs this frame: each bound
   * to its column of the sheet the first time it is asked, and one struck off
   * the sheet's edge left out.
   */
  placed(tile: number, cloth: ClothAt): Placed[] {
    const out: Placed[] = [];
    for (const m of this.marks) {
      if (m.at === null) m.at = m.col - cloth.col;
      if (m.at < 0 || m.at >= CURTAIN_COLS) continue;
      const base = cloth.x0 + (m.at + 0.5) * tile;
      const reach = giveReach(cloth.give, base + cloth.lag);
      out.push({
        x: base + cloth.lag,
        y: cloth.railY + DOWN * (cloth.hemY - cloth.railY + cloth.give.sag * reach),
        fresh: m.left / m.life,
        seed: m.seed,
      });
    }
    return out;
  }

  draw(ctx: CanvasRenderingContext2D, tile: number, cloth: ClothAt): void {
    for (const p of this.placed(tile, cloth)) drawScorch(ctx, p.x, p.y, tile, p.fresh, p.seed);
  }

  clear(): void {
    this.marks = [];
  }
}

/** One mark: the cloth puckered towards it, the char, and the rim still hot. */
function drawScorch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  fresh: number,
  seed: number,
): void {
  const r = tile * SCORCH_R * (0.55 + 0.45 * fresh);
  // The pucker: the cloth drawn in to the burn, a crease a spoke.
  const creases = new Path2D();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + seed;
    creases.moveTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9);
    creases.lineTo(x + Math.cos(a + 0.2) * r * 2.1, y + Math.sin(a + 0.2) * r * 2.1);
  }
  const char = splinePath(blobPoints(x, y, r, r * 0.8, 5, 0.16, 0.08, seed, seed, 20), true);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.strokeStyle = PALETTE.sheenDeep;
  ctx.globalAlpha = 0.6 * fresh;
  ctx.stroke(creases);
  ctx.globalAlpha = 0.85 * fresh;
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(char);
  // Hot at the rim the beat it lands, cooling well before the char heals.
  const hot = Math.max(0, (fresh - 0.6) / 0.4);
  if (hot > 0) {
    ctx.globalAlpha = hot;
    ctx.lineWidth = Math.max(1, tile * 0.05);
    ctx.strokeStyle = PALETTE.ember;
    ctx.stroke(char);
  }
  ctx.restore();
  if (hot > 0) halo(ctx, x, y, r * 2, PALETTE.ember, 0.35 * hot);
}
