import type { Color, SimEvent } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The whole screen going white, then the ammunition colour, then nothing: what
 * a lance leaving looks like from inside the ship.
 *
 * The owner asked for it in one sentence — *when its loading is completed, it
 * fires a bigger shot in the colour of cannon, flashing the whole game screen
 * in that colour because its so crazy bright and light* — and it is the one
 * effect in the game that covers the field rather than standing somewhere on
 * it. That is deliberate and it is the point: three beats of holding, and then
 * something happens to the room.
 *
 * **It outlives a frame**, so it is owned by `RenderState` and cleared with
 * everything else when a wave starts over — the rule `LayEcho` already follows
 * and for the same reason: the world stops speaking on the tick the shot goes,
 * and everything after that has no clock but the renderer's. `RenderState` and
 * not `Effects`, for `LureBlastFx`'s reason one field up — every transient
 * `Effects` owns is drawn under the hull, and this one is drawn over the whole
 * frame, band included.
 *
 * **It is fed by the `fire` event and not by `lanceFull`.** The two arrive on
 * the same tick, but only one of them carries the colour, and a flash that had
 * to guess which lobe was held would guess wrong on the wave where both are
 * (`sim/bullets.ts`'s `releaseLance`).
 */

/** Seconds the wash takes to fall away — a little over half a beat. */
const FALL = 0.42;
/** The share of that spent white before the colour takes over. */
const WHITE = 0.12;
/**
 * How much of the screen the wash is worth at its brightest.
 *
 * It is drawn `lighter`, so this is light *added* to a field that is already
 * lit: at 0.6 the whole frame goes to paper white and stays there for most of
 * a second, which is not a flash, it is a blackout in the wrong direction. At
 * 0.28 the field goes the ammunition's colour, the hull and the bodies stay
 * legible through it, and it is gone inside half a beat.
 */
const PEAK = 0.28;

export class LanceFlash {
  private left = 0;
  private color: Color = "red";

  /** The shot has gone. Any flash still running is replaced, not queued. */
  start(color: Color): void {
    this.color = color;
    this.left = FALL;
  }

  /** One frame's events. Off `fire` and not off `lanceFull`: the two arrive on
   * the same tick and only one of them carries a colour, so a flash fed by the
   * other would have to guess which lobe was held (`sim/bullets.ts`). */
  ingest(events: readonly SimEvent[]): void {
    for (const e of events) if (e.type === "fire" && e.lance) this.start(e.color);
  }

  step(dt: number): void {
    this.left = Math.max(0, this.left - dt);
  }

  clear(): void {
    this.left = 0;
  }

  /**
   * Over everything on the stage. `lighter`, because it is light arriving and
   * not paint: whatever is under it brightens towards the colour rather than
   * being hidden by it, which is the difference between a flash and a curtain.
   */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.left <= 0) return;
    const t = this.left / FALL;
    // Squared, so the fall is fast where an eye is still dazzled and slow
    // where it is recovering — the shape a real overexposure has.
    const amount = PEAK * t * t;
    const hex = this.color === "red" ? PALETTE.red : PALETTE.cyan;
    // The first sixth is white: nothing that bright has a hue yet.
    const white = Math.max(0, (t - (1 - WHITE)) / WHITE);

    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = rgba(hex, amount);
    ctx.fillRect(0, 0, l.width, l.height);
    if (white > 0) {
      ctx.fillStyle = rgba("#FFFFFF", 0.4 * white);
      ctx.fillRect(0, 0, l.width, l.height);
    }
    ctx.globalCompositeOperation = prev;
  }
}
