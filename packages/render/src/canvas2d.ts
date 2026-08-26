import { hullPercent, ticksPerBeat } from "@neon-spore/sim";
import { drawBand } from "./band.js";
import { drawBullets } from "./bullets.js";
import { drawCreatures } from "./creatures.js";
import { Effects } from "./effects.js";
import { drawBackground, drawGrid, drawRadar } from "./field.js";
import { type Glide, glideTo } from "./glide.js";
import { drawHud, drawOverlay } from "./hud.js";
import { drawHull, type HullMood, hullSkinY } from "./hull.js";
import { computeLayout, computeStage, type Layout, type Stage } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPods } from "./pods.js";
import { drawQueen } from "./queen.js";
import { queenSpitSide } from "./queen-spawn.js";
import type { Renderer, Viewport, ViewState } from "./renderer.js";
import { ShieldBody } from "./shield.js";
import { drawTorchAlarm } from "./torch-alarm.js";

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
  private effects = new Effects();
  /** Eased 0..1 towards the armed state, so the shield swells instead of snapping. */
  private armed = 0;
  /**
   * The same for the maw. Eased harder than the shield: the lobe has to travel
   * through flat and out the other side, and a snap would read as two shapes
   * rather than one turning inside out.
   */
  private intake = 0;
  /**
   * Where the two lobes are, in fractional columns. The world snaps to a
   * column; these follow it, so the membrane slides instead of jumping. The
   * shield follows with a whole chain of them and crawls.
   */
  private cannon: Glide = { value: Number.NaN, velocity: 0 };
  private shield = new ShieldBody();

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

  /**
   * The layout is derived from the stage, not from the window: on a desktop
   * screen the window is far wider than any phone, and the hull is as wide as
   * the field. Cheap arithmetic, so it is redone every frame rather than
   * cached — a test slider moves `bandPct` and `cols` between two frames.
   */
  private layoutFor(view: ViewState, stage: Stage): Layout {
    return computeLayout(
      { width: stage.width, height: stage.height, dpr: this.viewport.dpr },
      view.world.cfg,
      view.role,
    );
  }

  draw(view: ViewState): void {
    const { ctx } = this;
    const { world } = view;
    // The stage depends on the band, and the band on the role, so it is sized
    // per frame like the layout rather than at resize.
    const stage = computeStage(this.viewport, world.cfg, view.role);
    // A hidden tab reports a zero-sized window, and a field with no width
    // divides by zero on its way into the hull contour. There is nothing to
    // draw into either way, so leave the canvas alone until a size arrives.
    if (stage.width < 1 || stage.height < 1) return;
    const l = this.layoutFor(view, stage);

    // Outside the stage is not the game. It is painted flat and left alone, and
    // everything below draws in stage coordinates — as does input hit-testing,
    // which subtracts the same offset.
    ctx.fillStyle = "#05040B";
    ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(stage.left, stage.top, stage.width, stage.height);
    ctx.clip();
    ctx.translate(stage.left, stage.top);

    const windowTicks = Math.round((world.cfg.guardWindowMs / 1000) * world.cfg.tickHz);
    const isArmed = world.tick - world.guardTick < windowTicks;
    this.armed += ((isArmed ? 1 : 0) - this.armed) * Math.min(1, view.dt * 8);
    const intakeTicks = Math.round((world.cfg.intakeWindowMs / 1000) * world.cfg.tickHz);
    const isOpen = world.tick - world.intakeTick < intakeTicks;
    this.intake += ((isOpen ? 1 : 0) - this.intake) * Math.min(1, view.dt * 11);
    glideTo(this.cannon, world.cannonCol, view.dt);
    this.shield.update(world.shieldCol, view.dt);
    const at = { cannon: this.cannon.value, shield: this.shield.segments };

    this.effects.ingest(
      view.events,
      l,
      view.time,
      (col, row) => {
        const c = world.creatures.find((x) => x.col === col && x.row === row);
        return c ? c.id : 0;
      },
      60 / world.cfg.bpm,
    );
    this.effects.update(view.dt, l);

    // The beat is loud at the moment of the beat and gone before the next one.
    const flash = Math.max(0, 1 - view.beatPhase * (ticksPerBeat(world.cfg) / 26));

    ctx.fillStyle = PALETTE.background;
    ctx.fillRect(0, 0, l.width, l.height);
    drawBackground(ctx, l);
    drawRadar(ctx, l, world, view.time);
    drawGrid(ctx, l, world.cannonCol, flash);

    let queenOrigin: { col: number; row: number } | null = null;
    if (world.boss != null) {
      const boss = world.boss;
      const queen = world.creatures.find((c) => c.id === boss.creatureId);
      if (queen) queenOrigin = { col: queen.col, row: queen.row };
    }
    drawCreatures(
      ctx,
      l,
      world.creatures,
      view.beatPhase,
      view.time,
      this.effects.blocked,
      queenOrigin,
      world.cfg.meteorGrowShare,
    );
    if (world.boss != null) {
      const boss = world.boss;
      const queen = world.creatures.find((c) => c.id === boss.creatureId);
      if (queen && queenOrigin) {
        const spitSide = queenSpitSide(world.creatures, queenOrigin);
        drawQueen(
          ctx,
          l,
          queen,
          boss,
          world.beat,
          view.time,
          view.beatPhase,
          spitSide,
          this.effects.queenShake,
          world.cfg.meteorGrowShare,
        );
      }
    }
    drawPods(ctx, l, world.pods, view.time);
    drawBullets(ctx, l, world.bullets);
    this.effects.draw(ctx);

    const mood: HullMood = {
      armed: this.armed,
      intake: this.intake,
      chew: this.effects.chew,
      charge: this.effects.charge,
    };
    drawHull(
      ctx,
      l,
      world,
      view.time,
      mood,
      hullPercent(world),
      at,
      (x) => !this.effects.rockCoversCrater(x, l.tile),
    );
    // In front of the hull, unlike the rest of Effects.draw() — see
    // Effects.drawRockImpact.
    this.effects.drawRockImpact(ctx, l, view.time, (x) => hullSkinY(l, view.time, mood, at, x));
    this.effects.drawBanner(ctx, l);

    drawHud(ctx, l, view);
    drawTorchAlarm(ctx, l, world, view.time);
    drawBand(ctx, l, world, isArmed, isOpen);
    drawOverlay(ctx, l, view);
    ctx.restore();

    // A seam, so a wide window shows where the phone ends.
    if (stage.width < this.viewport.width) {
      ctx.strokeStyle = "#1C1640";
      ctx.lineWidth = 1;
      ctx.strokeRect(stage.left + 0.5, stage.top + 0.5, stage.width - 1, stage.height - 1);
    }
  }

  dispose(): void {
    // Nothing retained: the layout is derived per frame.
  }
}
