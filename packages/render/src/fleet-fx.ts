import { FLEET_SHELL_BEATS, type SimEvent } from "@neon-spore/sim";
import type { Chart } from "./fleet-chart.js";
import { drawFleetHitBurst, drawFleetSplashBurst } from "./fleet-impact.js";
import { drawShell, drawShellShadow, shellPose } from "./fleet-shell.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE FLEET's one transient: a salvo between the muzzle and the square.
 *
 * Everything else about this boss is drawn straight off the world every frame
 * — the marks off `struck`, the sinking off `sunkBeat` — and that is still
 * true of everything else about it. This is the exception, and it is here for
 * the reason `Effects` exists at all: a shell is in the air for
 * `FLEET_SHELL_BEATS`, which is longer than the rest between two salvoes, so
 * two of them can be flying at once and the world remembers only the last one.
 *
 * **The mark waits for the shell.** While a shell is in the air its square
 * carries no cross and no ripple, on either screen, and the hull under it
 * carries no scar: the simulation resolved the salvo the moment the thumb
 * landed, because two devices have to agree about a hit without either of them
 * drawing anything, but the *picture* may not say a square is spent before the
 * pair have seen anything reach it. That is the rule `Arrivals` keeps for a
 * falling rock, kept here for a rising one.
 *
 * A restart clears it (`Effects.reset`), which is what makes a shell fired in
 * an abandoned run unable to land on the new one's chart.
 */

/** How long a burst stands, in seconds. Long enough to watch it go out. */
const BURST_LIFE = 0.75;

interface Shell {
  col: number;
  row: number;
  hit: boolean;
  sank: boolean;
  /** Seconds since it left. Past `flight` it is a burst rather than a shell. */
  age: number;
  /** How long the flight takes, from `FLEET_SHELL_BEATS` at this tempo. */
  flight: number;
  /** Whether the burst at the far end has already thrown its particles. */
  landed: boolean;
}

export class FleetFx {
  private shells: Shell[] = [];

  /**
   * A salvo leaving, and what it is going to find.
   *
   * `fleetSalvo` says a shell left; the `fleetHit`, `fleetSplash` and
   * `fleetSunk` beside it on the same tick say what it will do when it gets
   * there. All of them are read out of the one batch rather than remembered
   * across frames, because the simulation pushes them together and a frame
   * covers whole ticks (`fleet.ts`, `salvo`).
   */
  ingest(events: readonly SimEvent[], beatSeconds: number): void {
    for (const e of events) {
      if (e.type !== "fleetSalvo") continue;
      const hit = events.some((o) => o.type === "fleetHit" && o.col === e.col && o.row === e.row);
      const sank = events.some((o) => o.type === "fleetSunk" && o.col === e.col && o.row === e.row);
      this.shells.push({
        col: e.col,
        row: e.row,
        hit,
        sank,
        age: 0,
        flight: FLEET_SHELL_BEATS * beatSeconds,
        landed: false,
      });
    }
  }

  /**
   * The flight, and the moment it ends.
   *
   * The particles are thrown from here rather than from `burstFor`'s table,
   * which is where they used to be: that table fires on the tick the event
   * arrives, and the event now arrives a second and a quarter before anything
   * reaches the square. The three sizes are the ones it had — they are the
   * whole of what the navigator learns about a square they cannot see.
   */
  update(
    dt: number,
    l: Layout,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    for (const s of this.shells) {
      s.age += dt;
      if (s.landed || s.age < s.flight) continue;
      s.landed = true;
      // A chart square *is* a field tile — same width, same origin
      // (`fleet-chart.ts`) — so the layout puts the particles exactly where the
      // mark is about to be drawn, and this needs no chart to be handed in.
      const x = tileCX(l, s.col);
      const y = tileCY(l, s.row);
      if (s.sank) burst(x, y, 26, PALETTE.ember);
      else if (s.hit) burst(x, y, 14, PALETTE.red);
      else burst(x, y, 6, PALETTE.shield);
    }
    this.shells = this.shells.filter((s) => s.age < s.flight + BURST_LIFE);
  }

  /**
   * Whether a shell is still on its way to this square — asked by the marks
   * and by the scars on a hull before either draws anything there.
   */
  pending(col: number, row: number): boolean {
    return this.shells.some((s) => s.col === col && s.row === row && s.age < s.flight);
  }

  /**
   * Every shell still in the air, with its shadow. Under the sights.
   *
   * The muzzle is read off the world at the moment of drawing rather than
   * remembered from the press, and it can be: THE FLEET's panel is one trigger
   * and four arrows (`control-sets-table.ts`), so there is no control on
   * either seat that moves the cannon while a shot is up. If one is ever added
   * the column belongs on `Shell`, taken at the press — a shell that followed
   * the cannon would swing sideways over the water.
   */
  drawFlight(ctx: CanvasRenderingContext2D, l: Layout, c: Chart, cannonCol: number): void {
    for (const s of this.shells) {
      if (s.age >= s.flight) continue;
      const p = shellPose(
        l,
        c,
        tileCX(l, cannonCol),
        l.hullY - l.tile * 0.25,
        s.col,
        s.row,
        s.age / s.flight,
      );
      drawShellShadow(ctx, c, p);
      drawShell(ctx, c, p);
    }
  }

  /** Every burst that has landed. Over everything else on the chart. */
  drawBursts(ctx: CanvasRenderingContext2D, c: Chart): void {
    for (const s of this.shells) {
      if (s.age < s.flight) continue;
      const t = Math.min(1, (s.age - s.flight) / BURST_LIFE);
      if (s.hit) drawFleetHitBurst(ctx, c, s.col, s.row, t);
      else drawFleetSplashBurst(ctx, c, s.col, s.row, t);
    }
  }

  clear(): void {
    this.shells = [];
  }
}
