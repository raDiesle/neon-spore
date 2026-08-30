import type { Color, SimEvent } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * A lure going, and the one moment of this creature both screens show
 * identically.
 *
 * **It has to read as *gone on purpose*.** Not killed — player 1 must not come
 * away thinking they somehow got it, which is the reading a burst would give
 * them. Not rejected — that is the grey flash of a shot that failed, and
 * nothing failed here. Not dropped. It withdrew.
 *
 * The whole grammar of the field is *outward*: a destroy throws twelve
 * particles of the body's own colour, a plate throws fourteen, a breach throws
 * sixteen off the rim it tore. So this is drawn as the opposite, and nothing
 * else in the game is: the body folds to a point, a single ring closes on it
 * from outside the contour rather than opening away from it, and there are no
 * particles at all. An inward gesture cannot be confused with a burst even at
 * a glance, and a glance is what it gets — it happens two rows above the hull,
 * where both players are already looking.
 *
 * It ends on a small white point, which is the one thing here that is not the
 * body's colour: the same white the alarm is drawn in on player 2's screen, so
 * that for player 2 the marking and its resolution rhyme, and for player 1 the
 * colour they were told to leave alone is the last thing that is left.
 *
 * Drawn in the disguise's colour, because that is the only colour either
 * player has ever seen it in. Nothing is revealed at the last instant that was
 * hidden a moment before it: the vindication is that the body *went*, not that
 * it finally admitted to something.
 */

/** Long enough to be seen as a movement rather than a pop, short enough not to
 * outlive the beat it happened on — a beat is 0.625 s at 96 bpm. */
const LIFE = 0.45;

interface Fold {
  x: number;
  y: number;
  /** The body's drawn radius when it went. */
  r: number;
  hex: string;
  /** Seconds left. */
  left: number;
}

export class LureVanishFx {
  private folds: Fold[] = [];

  /** A lure left the field here. `color` is the disguise's. */
  spawn(x: number, y: number, r: number, color: Color): void {
    this.folds.push({ x, y, r, hex: color === "red" ? PALETTE.red : PALETTE.cyan, left: LIFE });
  }

  /**
   * Every `lureVanished` in this frame's events. Its own `ingest` rather than
   * a case in `effects.ts`, the way `MirrorFx` and `WardenFx` have theirs: the
   * tile arithmetic belongs beside the drawing that uses it, and `effects.ts`
   * has no room for a case that only forwards.
   *
   * The radius is a plain tile fraction rather than `creatureRadius` — there
   * is no creature left to ask, it having been the thing that went — and it is
   * the same 0.4 of a tile every living body is drawn at.
   */
  ingest(events: readonly SimEvent[], l: Layout): void {
    for (const e of events) {
      if (e.type !== "lureVanished") continue;
      this.spawn(tileCX(l, e.col), tileCY(l, e.row), l.tile * 0.4, e.color);
    }
  }

  update(dt: number): void {
    for (const f of this.folds) f.left -= dt;
    this.folds = this.folds.filter((f) => f.left > 0);
  }

  clear(): void {
    this.folds = [];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const f of this.folds) {
      // `u` runs 0 at the moment it went to 1 when there is nothing left.
      const u = Math.min(1, Math.max(0, 1 - f.left / LIFE));
      this.drawFold(ctx, f, u);
    }
  }

  private drawFold(ctx: CanvasRenderingContext2D, f: Fold, u: number): void {
    ctx.save();

    // The body itself, folding to a point. It keeps most of its brightness
    // almost to the end and then goes — a body fading evenly reads as a thing
    // being taken away from the picture, and this one is leaving under its
    // own steam.
    const body = f.r * (1 - u) ** 0.7;
    if (body > 0.4) {
      ctx.globalAlpha = 0.75 * (1 - u ** 3);
      ctx.fillStyle = f.hex;
      ctx.beginPath();
      ctx.arc(f.x, f.y, body, 0, Math.PI * 2);
      ctx.fill();
    }

    // One ring, closing on the body from outside its own contour. It starts
    // where a lure's alarm ring stands on player 2's screen, so on that device
    // the marking is seen to collapse along with what it was marking.
    const ring = f.r * 1.55 * (1 - u) ** 0.5;
    if (ring > 0.4) {
      ctx.globalAlpha = 0.85 * (1 - u ** 2);
      ctx.strokeStyle = f.hex;
      ctx.lineWidth = Math.max(1, f.r * 0.1);
      ctx.beginPath();
      ctx.arc(f.x, f.y, ring, 0, Math.PI * 2);
      ctx.stroke();
    }

    // The point it ends on, in the last third only.
    if (u > 0.62) {
      const k = (u - 0.62) / 0.38;
      ctx.globalAlpha = Math.max(0, 1 - k) * 0.9;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(f.x, f.y, Math.max(0.6, f.r * 0.18 * (1 - k)), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
