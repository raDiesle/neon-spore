import type { MirrorState, SimConfig, SimEvent } from "@neon-spore/sim";
import { drawThrownRing } from "./grip-rings.js";
import type { Layout } from "./layout.js";
import { mirrorLobeCircle } from "./mirror-grip.js";
import { drawMirrorVerdicts, MirrorMarks } from "./mirror-marks.js";
import { PALETTE } from "./palette.js";

/**
 * **The pin landing, and the pin lost** — the one thing about THE MIRROR's
 * grip that outlives a frame, kept in `MirrorFx` (`simon-fx.ts`) and
 * cleared with it. A `mirrorGrip` event is both thumbs arriving (`on`) or
 * one of them leaving, and each throws a ring off both lobes: the mirror's
 * own rim colour outward when the pin lands, the dim one when it is lost —
 * on every screen, because the count starting and stopping is on every
 * screen, and it is the one moment the other seat's thumb is shown at all.
 *
 * It keeps the lobes' verdicts too, the green or red a touch on one is
 * washed in, drawn over the thrown ring (`mirror-marks.ts`).
 */

/** How long a thrown ring runs, in seconds. */
const THROW_LIFE = 0.5;

export class MirrorGripFx {
  /** Seconds left of the last throw, and whether it was the pin landing. */
  private left = 0;
  private landed = false;
  /** Was the last touch on each lobe right (`mirror-marks.ts`). */
  readonly marks = new MirrorMarks();

  ingest(events: readonly SimEvent[]): void {
    this.marks.ingest(events);
    for (const e of events) {
      if (e.type !== "mirrorGrip") continue;
      this.left = THROW_LIFE;
      this.landed = e.on;
    }
  }

  update(dt: number): void {
    this.left = Math.max(0, this.left - dt);
    this.marks.update(dt);
  }

  clear(): void {
    this.left = 0;
    this.landed = false;
    this.marks.clear();
  }

  draw(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    cfg: SimConfig,
    m: MirrorState,
    shieldCol: number,
  ): void {
    this.drawThrow(ctx, l, cfg, m, shieldCol);
    drawMirrorVerdicts(ctx, l, cfg, m, shieldCol, this.marks.verdicts);
  }

  private drawThrow(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    cfg: SimConfig,
    m: MirrorState,
    shieldCol: number,
  ): void {
    if (this.left <= 0) return;
    const k = 1 - this.left / THROW_LIFE;
    const color = this.landed ? MIRROR_RIM : PALETTE.dim;
    for (const id of [0, 1] as const) {
      const c = mirrorLobeCircle(l, cfg, id, id === 0 ? m.cannonCol : shieldCol);
      drawThrownRing(ctx, c.x, c.y, c.r * (1.3 + 1.4 * k), 1 - k, color);
    }
  }
}

/** The mirror's rim, `MIRROR_SKIN.rim` (`hull-skin.ts`) — the colour of the thing pinned. */
const MIRROR_RIM = "#FF2E52";
