import { hullPercent } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";
import type { Renderer, ViewState, Viewport } from "./renderer.js";

/**
 * Reads the world, writes pixels, changes nothing. If a value is needed here
 * that the world does not have, the world is missing it — do not compute
 * gameplay state in this file.
 */
export class Canvas2DRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D;
  private viewport: Viewport = { width: 0, height: 0, dpr: 1 };
  private tile = 0;
  private left = 0;
  private top = 0;

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
  }

  draw(view: ViewState): void {
    const { ctx } = this;
    const { world, beatPhase } = view;
    const { width, height } = this.viewport;

    this.tile = width / world.cfg.cols;
    this.left = 0;
    this.top = Math.max(0, height * 0.6 - world.cfg.rows * this.tile);

    ctx.fillStyle = PALETTE.background;
    ctx.fillRect(0, 0, width, height);

    this.drawGrid(world.cfg.cols, world.cfg.rows, beatPhase);
    this.drawHull(world.cfg.cols, world.cfg.rows, world.scars.map((s) => s.col), hullPercent(world));

    for (const c of world.creatures) {
      const row = c.fromRow + (c.row - c.fromRow) * beatPhase;
      const color = c.color === "red" ? PALETTE.red : c.color === "cyan" ? PALETTE.cyan : PALETTE.rock;
      this.drawBlob(this.cx(c.col), this.cy(row), this.tile * 0.34, color);
    }

    for (const b of world.bullets) {
      const y = this.cy(b.row / 1000);
      const color = b.color === "red" ? PALETTE.red : PALETTE.cyan;
      halo(this.ctx, this.cx(b.col), y, this.tile * 0.22, color, 0.9);
    }

    this.drawCannon(world.cannonCol, world.cfg.rows);
    this.drawShield(world.shieldCol, world.cfg.rows, beatPhase);
  }

  dispose(): void {
    /* nothing retained yet */
  }

  private cx(col: number): number {
    return this.left + col * this.tile + this.tile / 2;
  }

  private cy(row: number): number {
    return this.top + row * this.tile + this.tile / 2;
  }

  private drawGrid(cols: number, rows: number, beatPhase: number): void {
    const { ctx } = this;
    const pulse = Math.max(0, 1 - beatPhase * 3);
    const path = new Path2D();
    for (let c = 0; c <= cols; c++) {
      path.moveTo(this.left + c * this.tile, this.top);
      path.lineTo(this.left + c * this.tile, this.top + rows * this.tile);
    }
    for (let r = 0; r <= rows; r++) {
      path.moveTo(this.left, this.top + r * this.tile);
      path.lineTo(this.left + cols * this.tile, this.top + r * this.tile);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = pulse > 0.05 ? PALETTE.gridBeat : PALETTE.grid;
    ctx.globalAlpha = 0.35 + 0.35 * pulse;
    ctx.stroke(path);
    ctx.globalAlpha = 1;
  }

  private drawHull(cols: number, rows: number, scars: number[], integrity: number): void {
    const y = this.top + rows * this.tile;
    const broken = new Set(scars);
    const path = new Path2D();
    for (let c = 0; c < cols; c++) {
      const depth = broken.has(c) ? this.tile * 0.35 : 0;
      path.moveTo(this.left + c * this.tile, y + depth);
      path.lineTo(this.left + (c + 1) * this.tile, y + depth);
    }
    strokeGlow(this.ctx, path, PALETTE.hull, STROKE.outline + 1, integrity / 100);
  }

  private drawCannon(col: number, rows: number): void {
    const x = this.cx(col);
    const y = this.top + rows * this.tile;
    const path = new Path2D();
    path.moveTo(x - this.tile * 0.22, y);
    path.quadraticCurveTo(x, y - this.tile * 0.75, x + this.tile * 0.22, y);
    strokeGlow(this.ctx, path, PALETTE.hullRim, STROKE.outline, 1);
  }

  private drawShield(col: number, rows: number, beatPhase: number): void {
    const x = this.cx(col);
    const y = this.top + rows * this.tile - this.tile * 0.15;
    const path = new Path2D();
    path.moveTo(x - this.tile * 0.42, y);
    path.quadraticCurveTo(x, y - this.tile * 0.34, x + this.tile * 0.42, y);
    strokeGlow(this.ctx, path, PALETTE.shieldRim, STROKE.outline, 0.5 + 0.5 * (1 - beatPhase));
  }

  /** Placeholder silhouette. Replace with the contour maths from the style guide. */
  private drawBlob(x: number, y: number, r: number, color: string): void {
    const path = new Path2D();
    path.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2);
    strokeGlow(this.ctx, path, color, STROKE.outline, 1);
  }
}
