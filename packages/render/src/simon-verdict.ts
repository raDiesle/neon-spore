import type { MirrorStep, MirrorVerdictReason } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";
import { drawStepGlyph } from "./simon-glyph.js";

/**
 * What a settled round looks like.
 *
 * The sequence itself is the payload: the glyphs the pair was just shown come
 * back and fly into whichever ship earned them — down onto the hull when the
 * answer was wrong, up into THE MIRROR when it was right. That replaced a
 * whole-frame flip, which was loud but read as the picture glitching rather
 * than as anything happening to anybody.
 *
 * The field's two edges wash green or red at the same time, so the verdict is
 * legible from the corner of an eye that is busy watching a lobe.
 */

/**
 * The two lines a settled round puts on screen: what happened, then what
 * happens next. A pair that pressed the wrong button, a pair that ran out of
 * time and a pair that went for the pod made three different mistakes, and
 * being told which is the difference between learning the fight and resenting
 * it.
 */
const VERDICT_WORDS: Record<MirrorVerdictReason | "won", readonly [string, string]> = {
  won: ["ECHOED", "IT BREAKS"],
  step: ["WRONG", "TRY AGAIN"],
  silence: ["TOO SLOW", "TRY AGAIN"],
  bait: ["FOOLED", "THE POD WAS BAIT"],
};

/** How long one glyph takes to cross from the row to the hull it is aimed at. */
const FLIGHT_TIME = 0.5;
/** Delay between one glyph setting off and the next. */
const STAGGER = 0.08;
/** How long the flash where a glyph landed lasts. */
const LAND_FLASH = 0.4;
/** How long the whole thing runs: the last glyph's flight, plus its flash. */
const LIFE = 1.6;

/** Where one glyph starts from, and how big it is. */
export interface Flight {
  step: MirrorStep;
  x: number;
  r: number;
}

function ease(t: number): number {
  // Slow off the mark and fast into the hull: it is being thrown, not floated.
  return smoothstep(t) * 0.35 + t * t * 0.65;
}

export class VerdictFx {
  private flights: Flight[] = [];
  private right = false;
  private reason: MirrorVerdictReason = "step";
  private fromY = 0;
  private toY = 0;
  private elapsed = 0;
  private left = 0;

  /** 0..1, how hard the edges are washing. Nothing to draw at 0. */
  get wash(): number {
    if (this.left <= 0) return 0;
    // Up hard on the first frames, then a long ebb.
    const done = 1 - this.left / LIFE;
    return done < 0.12 ? done / 0.12 : Math.max(0, 1 - (done - 0.12) / 0.88) ** 1.4;
  }

  /** The colour this verdict reads in, for anything that has to match it. */
  get hex(): string {
    return this.right ? PALETTE.good : PALETTE.red;
  }

  /**
   * Send the sequence at a ship. `fromY` is the row it was drawn on, `toY` the
   * skin it is aimed at — the caller owns both, because only it knows where
   * the mirror is standing.
   */
  start(
    flights: readonly Flight[],
    right: boolean,
    reason: MirrorVerdictReason,
    fromY: number,
    toY: number,
  ): void {
    this.flights = flights.map((f) => ({ ...f }));
    this.right = right;
    this.reason = reason;
    this.fromY = fromY;
    this.toY = toY;
    this.elapsed = 0;
    this.left = LIFE;
  }

  update(dt: number): void {
    if (this.left <= 0) return;
    this.left = Math.max(0, this.left - dt);
    this.elapsed += dt;
  }

  clear(): void {
    this.flights = [];
    this.right = false;
    this.reason = "step";
    this.fromY = 0;
    this.toY = 0;
    this.elapsed = 0;
    this.left = 0;
  }

  /** The green or red down both edges of the field. */
  drawEdges(ctx: CanvasRenderingContext2D, l: Layout): void {
    const a = this.wash;
    if (a <= 0) return;
    const w = Math.max(10, l.gridWidth * 0.13);
    const right = l.gridLeft + l.gridWidth;
    ctx.save();
    ctx.globalAlpha = Math.min(1, a * 0.85);
    const edges: { from: number; to: number }[] = [
      { from: l.gridLeft, to: l.gridLeft + w },
      { from: right, to: right - w },
    ];
    for (const edge of edges) {
      const g = ctx.createLinearGradient(edge.from, 0, edge.to, 0);
      g.addColorStop(0, this.hex);
      g.addColorStop(1, "#00000000");
      ctx.fillStyle = g;
      ctx.fillRect(Math.min(edge.from, edge.to), 0, w, l.playHeight);
    }
    ctx.restore();
  }

  /**
   * The glyphs on their way in, and the mark each one leaves when it lands.
   *
   * It takes a `Layout` for the seat alone — a glyph is drawn in the flesh of
   * the panel it belongs to, and this was the one caller with no `Layout` to
   * read that off. `drawEdges` and `drawWord` beside it already had one.
   */
  drawFlights(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.left <= 0) return;
    const skin = seatSkin(l.role);
    for (const [i, f] of this.flights.entries()) {
      const t = this.elapsed - i * STAGGER;
      if (t <= 0) continue;
      const p = Math.min(1, t / FLIGHT_TIME);
      const y = this.fromY + (this.toY - this.fromY) * ease(p);

      if (p < 1) {
        // Still travelling: it grows a little as it gathers speed.
        drawStepGlyph(ctx, f.x, y, f.r * (1 + p * 0.25), f.step, 1, skin);
        continue;
      }
      // Landed. A flash in the verdict's own colour, fading where it hit.
      const after = (t - FLIGHT_TIME) / LAND_FLASH;
      if (after >= 1) continue;
      const a = 1 - after;
      ctx.save();
      ctx.globalAlpha = a;
      halo(ctx, f.x, this.toY, f.r * (1.6 + after * 2.4), this.hex, 0.8);
      ctx.restore();
      drawStepGlyph(ctx, f.x, this.toY, f.r * (1.25 - after * 0.5), f.step, a, skin);
    }
  }

  /** The word itself, over the middle of the field. */
  drawWord(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.left <= 0) return;
    const a = Math.min(1, this.left / 0.4);
    // What went wrong, and what happens next, in as few words as each takes.
    // "WRONG" on its own left the pair waiting to find out whether they had
    // lost the fight or the round — and it is always only the round.
    const [text, under] = VERDICT_WORDS[this.right ? "won" : this.reason] ?? VERDICT_WORDS.step;
    const y = l.playHeight * 0.58;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    ctx.font = '700 34px "Courier New",monospace';
    // A dark plate behind it, so the word never has to compete with whatever
    // the field happens to be doing underneath it.
    const half = ctx.measureText(text).width / 2 + 14;
    ctx.fillStyle = "rgba(7,4,15,.78)";
    ctx.fillRect(l.width / 2 - half, y - 30, half * 2, 62);
    ctx.fillStyle = this.right ? PALETTE.goodRim : PALETTE.redRim;
    ctx.fillText(text, l.width / 2, y);
    ctx.font = '700 14px "Courier New",monospace';
    ctx.fillStyle = this.hex;
    ctx.fillText(under, l.width / 2, y + 22);
    ctx.restore();
    ctx.textAlign = "left";
  }
}
