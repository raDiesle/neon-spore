import type { SimEvent } from "@neon-spore/sim";
import { type Chart, chartX, chartY } from "./fleet-chart.js";
import { drawThrownRing } from "./grip-rings.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The five moments of THE FLEET's wound** — the water coming in, the thumb
 * that keeps it coming, a square raked, the sea healing over, and the hull
 * going under — kept in `BossTransients.fleetGrip` (`effects-boss.ts`) and
 * cleared with it.
 *
 * Everything the wound *is* is drawn straight off the world every frame:
 * `fleet-grip-draw.ts` reads `phase`, `holeCol`, `rakeCol` and
 * `wreckPullMilli` and asks nothing of this file. What is here is only what
 * outlives its frame, which is the same thing in every case — a ring thrown
 * off a square, running outward when something opened and falling inward when
 * something closed. Read above the loop, the way THE WARDEN's three are
 * (`warden-grip-fx.ts`), rather than as five rows in a spark table.
 *
 * **Every ring stands on both screens**, because every one of the five is a
 * moment one seat causes and the other cannot see: the pilot's shell holes a
 * hull the navigator is the only one looking at, her thumb on the plume is
 * off his screen entirely, and the plug that takes the marks back is the
 * window closing on the pair of them. The ring is the sentence neither of
 * them has time to say.
 *
 * The particles go out on the frame the event arrives, unlike the salvo's,
 * which wait for the shell to finish its flight (`fleet-fx.ts`): none of these
 * five is in the air on its way to anything.
 */

/** How long a thrown ring runs, in seconds. */
const LIFE = 0.5;

/** A rake is once a beat at tempo, so its ring is gone before the next one. */
const RAKE_LIFE = 0.3;

export type FleetRingKind = "flood" | "breach" | "unbreach" | "rake" | "plug" | "wreck";

interface Ring {
  kind: FleetRingKind;
  col: number;
  row: number;
  /** Seconds left of it. */
  left: number;
}

/** How long each kind's ring runs. */
function lifeOf(kind: FleetRingKind): number {
  return kind === "rake" ? RAKE_LIFE : LIFE;
}

/**
 * How wide a kind's ring stands at `k` of the way through its run, in pixels.
 *
 * Exported because it is the whole of what tells the five apart on a screen
 * with no words on it: three of them run outward from the wound and two fall
 * inward onto it, and `test/fleet-grip-fx.test.ts` asks that here rather than
 * by measuring a `Path2D`, which logs no coordinates (`canvas-stub.ts`).
 */
export function fleetRingRadius(tile: number, kind: FleetRingKind, k: number): number {
  const look = RINGS[kind];
  return tile * (look.from + look.by * k);
}

export class FleetGripFx {
  private rings: Ring[] = [];

  /**
   * The five events, each a ring and four of them a burst as well.
   *
   * `fleetBreach` is two moments in one event, so it is two kinds here: a
   * thumb landing opens the hole and a thumb lifted starts closing it, and
   * a ring that ran the same way for both would say neither.
   */
  ingest(
    events: readonly SimEvent[],
    l: Layout,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    for (const e of events) {
      switch (e.type) {
        case "fleetFlood":
          this.throwRing("flood", e.col, e.row);
          burst(tileCX(l, e.col), tileCY(l, e.row), 12, PALETTE.shieldRim);
          break;
        case "fleetBreach":
          this.throwRing(e.on ? "breach" : "unbreach", e.col, e.row);
          break;
        case "fleetRake":
          this.throwRing("rake", e.col, e.row);
          burst(tileCX(l, e.col), tileCY(l, e.row), 5, PALETTE.red);
          break;
        case "fleetPlug":
          this.throwRing("plug", e.col, e.row);
          burst(tileCX(l, e.col), tileCY(l, e.row), 10, PALETTE.shield);
          break;
        case "fleetWreck":
          this.throwRing("wreck", e.col, e.row);
          burst(tileCX(l, e.col), tileCY(l, e.row), 20, PALETTE.ember);
          break;
        default:
          break;
      }
    }
  }

  private throwRing(kind: FleetRingKind, col: number, row: number): void {
    this.rings.push({ kind, col, row, left: lifeOf(kind) });
  }

  update(dt: number): void {
    for (const r of this.rings) r.left -= dt;
    this.rings = this.rings.filter((r) => r.left > 0);
  }

  clear(): void {
    this.rings = [];
  }

  /**
   * Every ring still running, on the chart the wound is drawn on.
   *
   * The chart is handed in rather than built here: the caller has it already,
   * and it is the lifted one when something stands over the top of the screen
   * (`boss-draw.ts`, `chartOf`).
   */
  draw(ctx: CanvasRenderingContext2D, c: Chart): void {
    if (c.tile <= 0) return;
    for (const r of this.rings) {
      const k = 1 - r.left / lifeOf(r.kind);
      const x = chartX(c, r.col);
      const y = chartY(c, r.row);
      drawThrownRing(ctx, x, y, fleetRingRadius(c.tile, r.kind, k), 1 - k, RINGS[r.kind].color);
    }
  }
}

/**
 * What each kind's ring looks like: where it starts, how far it travels, and
 * in what colour. A negative `by` falls inward, which is how the two closings
 * — the thumb lifted and the plug — are told from the three openings without
 * a word on the screen.
 */
const RINGS: Record<FleetRingKind, { from: number; by: number; color: string }> = {
  // The water finding its way in: wide, and in the sea's own colour.
  flood: { from: 0.3, by: 1.1, color: PALETTE.shield },
  // Her thumb landing on the plume: small, tight and white, the way every
  // thumb on this game's pictures is (`grip-rings.ts`).
  breach: { from: 0.25, by: 0.5, color: PALETTE.text },
  // Her thumb off it: the same ring running the other way, and dimmed.
  unbreach: { from: 0.75, by: -0.5, color: PALETTE.dim },
  // A square struck by his rake: as tight as the mark it leaves, in its colour.
  rake: { from: 0.2, by: 0.45, color: PALETTE.red },
  // The sea healing over a hull that was not finished in time: the whole
  // wound falling shut, and everything on the hull goes with it.
  plug: { from: 1.4, by: -1.1, color: PALETTE.shield },
  // The hull lying on the water, raked end to end: the widest of the five.
  wreck: { from: 0.4, by: 1.6, color: PALETTE.ember },
};
