import { chargeMilli, ticksPerBeat, type World } from "@neon-spore/sim";
import { Effects } from "./effects.js";
import { drawBodies, drawFieldBack, drawOverlays, drawShip } from "./frame-passes.js";
import { type Glide, glideTo } from "./glide.js";
import type { HullMood } from "./hull.js";
import { drawInterlude } from "./interlude.js";
import { computeLayout, computeStage, type Layout, type Stage } from "./layout.js";
import type { Renderer, Viewport, ViewState } from "./renderer.js";
import { ShieldBody } from "./shield.js";

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
  /** Enough of last frame's world to notice a wave starting over — see `waveRestarted`. */
  private seen: { world: World; wave: number; waveBeat: number } | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
  }

  /**
   * Whether the wave on screen has just (re)started, so everything transient
   * this renderer is holding belongs to a run that no longer exists —
   * `Effects.reset` says what goes wrong when it is kept.
   *
   * Three ways in, because the hosts restart differently: the director swaps
   * in a whole new `World` (`tools/director/src/stage.ts`'s `rebuild`), the
   * game keeps one world and calls `startWave` on it — same object, new wave
   * index — and a restart of the *same* wave changes neither, but always puts
   * `waveBeat` back to 0.
   */
  private waveRestarted(world: World): boolean {
    const last = this.seen;
    this.seen = { world, wave: world.wave, waveBeat: world.waveBeat };
    if (!last) return false;
    return last.world !== world || last.wave !== world.wave || world.waveBeat < last.waveBeat;
  }

  /**
   * The ship itself, back to rest. `startWave` puts both lobes in the middle
   * and closes the shield, and the ship should *be* like that on the first
   * frame of the new run rather than sliding there from wherever the last one
   * left it — the eased pose is the last render state that outlives a world.
   */
  private resetPose(): void {
    this.armed = 0;
    this.intake = 0;
    this.cannon = { value: Number.NaN, velocity: 0 };
    this.shield.reset();
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
    // The stage depends on the band, and the band on the role: sized per frame, like the layout.
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

    // Before anything eases or ingests: a wave that just (re)started leaves
    // none of last run's state meaning anything, and this frame is already
    // the new run's first.
    if (this.waveRestarted(world)) {
      this.effects.reset();
      this.resetPose();
    }

    // A round that is not the field takes the whole stage and this method ends
    // here. Not a panel over the grid and not a dimmed field behind one — the
    // spec's first condition for an interlude being one at all is that the
    // field is *gone* (`interlude.ts`), and the cheapest way to be sure of
    // that is for none of the code below to run.
    if (world.interlude !== null) {
      drawInterlude(ctx, l, view);
      ctx.restore();
      return;
    }

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

    drawFieldBack(ctx, l, world, view, flash);
    drawBodies(ctx, l, world, view, this.effects);

    const mood: HullMood = {
      armed: this.armed,
      intake: this.intake,
      chew: this.effects.chew,
      charge: this.effects.charge,
      // Straight off the world, and the only one of the five that is: the tick
      // the shot leaves is fixed for both devices, so an ease here would have
      // one cannon working ahead of the other (`shot-charge.ts`).
      lay: chargeMilli(world) / 1000,
    };
    drawShip(ctx, l, world, view, this.effects, mood, at);
    drawOverlays(ctx, l, world, view, isArmed, isOpen);
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
