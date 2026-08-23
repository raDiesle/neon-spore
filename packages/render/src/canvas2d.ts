import { hullPercent, ticksPerBeat } from "@neon-spore/sim";
import { drawBand } from "./band.js";
import { drawBullets } from "./bullets.js";
import { drawCreatures } from "./creatures.js";
import { Effects } from "./effects.js";
import { drawBackground, drawGrid, drawRadar } from "./field.js";
import { drawHud, drawOverlay } from "./hud.js";
import { drawHull } from "./hull.js";
import { computeLayout, type Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { Renderer, ViewState, Viewport } from "./renderer.js";

/**
 * Reads the world, writes pixels, changes nothing. If a value is needed here
 * that the world does not have, the world is missing it — do not compute
 * gameplay state in this file.
 *
 * The one thing this file does own is transient appearance: particles, flashes
 * and the shield's fade between passive and armed. None of it is ever read back.
 */
export class Canvas2DRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D;
  private viewport: Viewport = { width: 0, height: 0, dpr: 1 };
  private layout: Layout | null = null;
  private effects = new Effects();
  /** Eased 0..1 towards the armed state, so the shield swells instead of snapping. */
  private armed = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
  }

  resize(viewport: Viewport): void {
    this.viewport = viewport;
    this.canvas.width = Math.round(viewport.width * viewport.dpr);
    this.canvas.height = Math.round(viewport.height * viewport.dpr);
    this.canvas.style.width = `${viewport.width}px`;
    this.canvas.style.height = `${viewport.height}px`;
    this.ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
    this.layout = null;
  }

  /** The layout is derived, so it is rebuilt whenever the config could change. */
  private layoutFor(view: ViewState): Layout {
    if (!this.layout || this.layout.cols !== view.world.cfg.cols) {
      this.layout = computeLayout(this.viewport, view.world.cfg);
    }
    return this.layout;
  }

  draw(view: ViewState): void {
    const { ctx } = this;
    const { world } = view;
    const l = this.layoutFor(view);

    const windowTicks = Math.round((world.cfg.guardWindowMs / 1000) * world.cfg.tickHz);
    const isArmed = world.tick - world.guardTick < windowTicks;
    this.armed += ((isArmed ? 1 : 0) - this.armed) * Math.min(1, view.dt * 8);

    this.effects.ingest(view.events, l, (col, row) => {
      const c = world.creatures.find((x) => x.col === col && x.row === row);
      return c ? c.id : 0;
    });
    this.effects.update(view.dt, l);

    // The beat is loud at the moment of the beat and gone before the next one.
    const flash = Math.max(0, 1 - view.beatPhase * (ticksPerBeat(world.cfg) / 26));

    ctx.fillStyle = PALETTE.background;
    ctx.fillRect(0, 0, l.width, l.height);
    drawBackground(ctx, l);
    drawRadar(ctx, l, world);
    drawGrid(ctx, l, world.cannonCol, flash);

    drawCreatures(ctx, l, world.creatures, view.beatPhase, view.time, this.effects.blocked);
    drawBullets(ctx, l, world.bullets);
    this.effects.draw(ctx, l);

    drawHull(ctx, l, world, view.time, this.armed, hullPercent(world));
    this.effects.drawBanner(ctx, l);

    drawHud(ctx, l, view);
    drawBand(ctx, l, world, isArmed);
    drawOverlay(ctx, l, view);
  }

  dispose(): void {
    this.layout = null;
  }
}
