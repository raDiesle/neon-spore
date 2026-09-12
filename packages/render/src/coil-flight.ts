import { type Creature, type SimEvent, spanOf } from "@neon-spore/sim";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { drawTorchTail, rockRadius } from "./torch.js";

/**
 * The rock out of THE COIL's dome, thrown from the dome's tile to the ship.
 *
 * The simulation writes the throw the way it writes every move — `fromCol`/
 * `fromRow` the dome's tile, `col`/`row` the far wall's hull — and the picture
 * glides between the two over the beat (`sim/coil.ts`, `popCoil`). A dome the
 * plate is *carried under* opens mid-beat, though, at whatever phase the plate
 * arrived on, and a glide read off the beat's phase would put the rock partway
 * down its line on the very frame the dome burst: the later in the beat, the
 * further. THE RECOIL's throw had the same defect and the same answer
 * (`recoil-leap.ts`): the flight is measured from the frame it is first drawn
 * on, so it leaves from the dome and covers the whole line in whatever is left
 * of the beat. A late one is fast, and a torch is fast.
 *
 * Two more things belong to the flight and not to the body. The tail: a torch
 * drags an ember streak from the top of the field (`drawTorch`), and this one
 * came from a dome, so its streak runs from the dome's tile — `place` hands
 * that origin back for the body draw. And the afterglow: for a moment after it
 * hits, the line it flew stays lit behind the crater, so a rock that crossed
 * the field in a tenth of a beat still reads as having come from *there*. The
 * impact's own vertical tail is turned off for it (`effects-breach.ts`).
 *
 * Kept in `Effects` and cleared on restart: the frame a throw was first drawn
 * on is the one thing about it that cannot be re-read off the world.
 */

/** How long the line stays lit behind a rock that has hit, in seconds. */
const AFTERGLOW = 0.4;
/** How far from its landing, in beats either way, a flight still answers for
 * a breach in its column (`landed`). */
const LANDING_SLACK = 0.15;

interface Flight {
  id: number;
  /** The dome's tile centre. */
  x0: number;
  y0: number;
  /** Where it hits, read on the first frame drawn — `undefined` before. */
  x1?: number;
  y1?: number;
  col1?: number;
  r: number;
  /** Seconds since the dome went. */
  age: number;
  /** Seconds the throw takes, from the phase of the first frame drawn to the
   * beat line; `NaN` until then. */
  life: number;
  beatSeconds: number;
}

export interface Flown {
  x: number;
  y: number;
  /** The row it is drawn at, fractional, for depth. */
  row: number;
  /** The dome's tile, for the tail. */
  from: { x: number; y: number };
}

export class CoilFlightFx {
  private flights: Flight[] = [];

  ingest(events: readonly SimEvent[], l: Layout, beatSeconds: number): void {
    for (const e of events) {
      if (e.type !== "coilBreak") continue;
      this.flights.push({
        id: e.id,
        x0: tileCX(l, e.col),
        y0: tileCY(l, e.row),
        r: l.tile * 0.4,
        age: 0,
        life: Number.NaN,
        beatSeconds,
      });
    }
  }

  update(dt: number): void {
    for (const f of this.flights) f.age += dt;
    this.flights = this.flights.filter((f) => {
      // One never drawn — its rock was gone before a frame saw it — is let go
      // once no flight could still be under way.
      const life = Number.isNaN(f.life) ? f.beatSeconds : f.life;
      return f.age < life + AFTERGLOW;
    });
  }

  clear(): void {
    this.flights = [];
  }

  /**
   * Where a torch that came out of a dome is drawn this frame, or nothing for
   * a torch that did not, which is drawn where the simulation's glide puts it.
   * `beats` is the pose clock (`world.beat + beatPhase`).
   */
  place(c: Creature, l: Layout, beats: number, skinY?: SurfaceY): Flown | undefined {
    const f = this.flights.find((k) => k.id === c.id);
    if (!f) return undefined;
    if (Number.isNaN(f.life)) {
      // First frame: the phase the throw is seen to start on, and the landing
      // — the rock's own resting depth in the skin (`rock-landing.ts`).
      const tau = f.age / f.beatSeconds;
      const phase0 = (((beats - tau) % 1) + 1) % 1;
      f.life = Math.max(0.001, (1 - phase0) * f.beatSeconds);
      f.r = rockRadius(l, spanOf(c));
      f.col1 = c.col;
      f.x1 = tileCX(l, c.col);
      const rest = skinY ? skinY(f.x1) - f.r * 0.5 : Number.POSITIVE_INFINITY;
      f.y1 = Math.min(tileCY(l, c.row), rest);
    }
    const u = Math.min(1, f.age / f.life);
    const x1 = f.x1 ?? f.x0;
    const y1 = f.y1 ?? f.y0;
    return {
      x: f.x0 + (x1 - f.x0) * u,
      y: f.y0 + (y1 - f.y0) * u,
      row: c.fromRow + (c.row - c.fromRow) * u,
      from: { x: f.x0, y: f.y0 },
    };
  }

  /** Whether a breach in `col` on this frame is a rock this flight threw
   * there — the impact then draws no tail of its own. */
  landed(col: number): boolean {
    return this.flights.some(
      (f) =>
        f.col1 === col &&
        !Number.isNaN(f.life) &&
        Math.abs(f.age - f.life) <= LANDING_SLACK * f.beatSeconds,
    );
  }

  /** The line still lit behind every rock that has hit, fading. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    for (const f of this.flights) {
      if (Number.isNaN(f.life) || f.age < f.life || f.x1 === undefined || f.y1 === undefined)
        continue;
      const alpha = 1 - (f.age - f.life) / AFTERGLOW;
      if (alpha > 0) drawTorchTail(ctx, l, f.x1, f.y1, f.r, alpha, { x: f.x0, y: f.y0 });
    }
  }
}
