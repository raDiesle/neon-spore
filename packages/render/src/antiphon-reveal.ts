import { ANTIPHON_SHIP, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { antiphonContourPath, antiphonOrganCircle, ORGAN_R } from "./antiphon-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The reveal**: the candidate carried home, standing at the organ's place
 * on every screen for a moment after it is judged (the owner, 5 October
 * 2026: *when its reached, it will reveal if its correct one or not*).
 *
 * The verdict ring says right or wrong (`antiphon-marks.ts`); this says
 * *what* arrived, on the screen that never saw the organ as well as the one
 * that never saw the rail, so both halves of the conversation see the same
 * shape once — the organ's own when it pitted, the decoy's when it did not —
 * swelling a little and fading over `REVEAL_S`. One at a time; the event is
 * the whole of what it needs, and it is cleared with the rest of the boss's
 * transients (`restart.test.ts`).
 */

/** How long the reveal stands, in seconds, and how much it swells as it goes. */
const REVEAL_S = 1.1;
const SWELL = 0.15;

export class AntiphonReveal {
  private shape = 0;
  private good = true;
  private left = 0;
  private x = 0;
  private y = 0;
  private r = 0;

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig): void {
    for (const e of events) {
      if (e.type === "antiphonPit") this.show(e.shape, true, l, cfg);
      else if (e.type === "antiphonHarden") this.show(e.shape, false, l, cfg);
      else if (e.type === "antiphonBurst") this.show(ANTIPHON_SHIP, true, l, cfg);
    }
  }

  private show(shape: number, good: boolean, l: Layout, cfg: SimConfig): void {
    const c = antiphonOrganCircle(l, cfg);
    this.shape = shape;
    this.good = good;
    this.left = REVEAL_S;
    this.x = c.x;
    this.y = c.y;
    this.r = l.tile * ORGAN_R;
  }

  update(dt: number): void {
    this.left = Math.max(0, this.left - dt);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.left <= 0) return;
    const gone = 1 - this.left / REVEAL_S;
    const p = antiphonContourPath(
      this.shape,
      { x: this.x, y: this.y },
      this.r * (1 + SWELL * gone),
      0,
    );
    ctx.save();
    ctx.fillStyle = rgba(PALETTE.organ, 0.85 * (1 - gone));
    ctx.fill(p);
    ctx.strokeStyle = rgba(this.good ? PALETTE.organRim : PALETTE.red, 1 - gone);
    ctx.lineWidth = Math.max(1.5, l.tile * 0.08);
    ctx.lineJoin = "round";
    ctx.stroke(p);
    ctx.restore();
  }

  /** Whether a reveal is standing, for the tests. */
  get showing(): boolean {
    return this.left > 0;
  }

  clear(): void {
    this.shape = 0;
    this.good = true;
    this.left = 0;
    this.x = 0;
    this.y = 0;
    this.r = 0;
  }
}
