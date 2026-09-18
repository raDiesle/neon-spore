import type { SimEvent } from "@neon-spore/sim";
import { drawThrownRing } from "./grip-rings.js";
import type { Circle } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The thumb landing, the hatch thrown, the hatch slamming** — what THE
 * WARDEN's second and third hands do that outlives a frame, kept in
 * `WardenFx` (`warden-fx.ts`) beside the rope's snap-back and reset with it.
 * Each throws a ring off the eye: a small white one when the navigator's
 * thumb lands, a wide white one when the pilot's swipe throws the hatch, and
 * a dark one falling *inward* when it slams — on every screen, because each
 * is the one moment the other seat's hand is shown at all, and the slam is
 * the window closing on both of them.
 */

/** How long a thrown ring runs, in seconds. */
const LIFE = 0.5;

type Kind = "wardenHold" | "wardenThrow" | "wardenSlam";

interface Ring {
  kind: Kind;
  left: number;
}

export class WardenGripFx {
  private rings: Ring[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "wardenHold" || e.type === "wardenThrow" || e.type === "wardenSlam") {
        this.rings.push({ kind: e.type, left: LIFE });
      }
    }
  }

  update(dt: number): void {
    for (const r of this.rings) r.left -= dt;
    this.rings = this.rings.filter((r) => r.left > 0);
  }

  clear(): void {
    this.rings = [];
  }

  /** `eye` is where the eye stands this frame, which the caller knows: the pupil walks. */
  draw(ctx: CanvasRenderingContext2D, eye: Circle): void {
    for (const r of this.rings) {
      const k = 1 - r.left / LIFE;
      if (r.kind === "wardenHold") {
        drawThrownRing(ctx, eye.x, eye.y, eye.r * (0.5 + 0.6 * k), 1 - k, PALETTE.text);
      } else if (r.kind === "wardenThrow") {
        drawThrownRing(ctx, eye.x, eye.y, eye.r * (0.7 + 1.6 * k), 1 - k, PALETTE.text);
      } else {
        drawThrownRing(ctx, eye.x, eye.y, eye.r * (1.6 - 1.2 * k), 1 - k, PALETTE.rockDark);
      }
    }
  }
}
