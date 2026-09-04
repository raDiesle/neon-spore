import { guardArmed, mawOpen, ticksPerBeat, type World, wispOnField } from "@neon-spore/sim";
import { drawWaveOpening } from "./briefing.js";
import { Effects } from "./effects.js";
import { FieldPose } from "./field-pose.js";
import { drawBodies, drawFieldBack, drawOverlays, drawShip } from "./frame-passes.js";
import { GuideStage } from "./guide-scene.js";
import { computeLayout, computeStage, type Layout, type Stage } from "./layout.js";
import { openingKey } from "./opening-fx.js";
import type { Renderer, Viewport, ViewState } from "./renderer.js";
import { ROUND_DRAWS } from "./round-draw.js";
import type { SpriteBursts } from "./sprite-burst.js";

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
  /** Where the two lobes are and how the membrane feels — `field-pose.ts`. */
  private pose = new FieldPose();
  /**
   * The rehearsal a wave's guide plays above its words, if it carries one.
   * Render state that outlives a frame, so it lives here where a restart can
   * clear it; `guide-scene.ts` owns everything about what it shows.
   */
  private guide = new GuideStage();
  /** Enough of last frame's world to notice a wave starting over — see `waveRestarted`. */
  private seen: { world: World; wave: number; waveBeat: number } | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
  }

  /**
   * The baked-burst player, for a host that wants to install an atlas into it.
   * Exposed rather than reached for through `effects`, so the one thing a host
   * is allowed to change about this renderer is the one thing it can see.
   */
  get sprites(): SpriteBursts {
    return this.effects.spriteBursts;
  }

  /** What REPLAY on a guide's bar reaches. The film's clock is render state and
   * no part of the world, so it is a call and not a command (`guide-play.ts`). */
  replayGuide(): void {
    this.guide.replay();
  }

  /**
   * Whether the wave on screen has just (re)started, so everything transient
   * this renderer holds belongs to a run that no longer exists (`Effects.reset`
   * says what goes wrong when it is kept). Three ways in, because the hosts
   * restart differently: the director swaps in a whole new `World`, the game
   * calls `startWave` on the one it has — same object, new index — and a
   * restart of the *same* wave changes neither but always puts `waveBeat` to 0.
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
    this.pose.reset();
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
    // which subtracts the same offset. A phone whose stage fills the viewport
    // needs none of this: drawBackground's opaque radial gradient (or, on the
    // gauge round, gauge-round.ts's own full-stage fill) covers the same rect
    // a moment later. A bare frame skips that gradient, and a desktop window
    // wider or taller than the stage has a letterbox nothing else paints —
    // both still need the flat fill underneath.
    if (view.bare || stage.width < this.viewport.width || stage.height < this.viewport.height) {
      ctx.fillStyle = view.bare ? "#000000" : "#05040B";
      ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);
    }
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

    // The wave's guide is carrying a rehearsal, and the two mini-screens in it
    // are the only thing on the stage worth a frame: the guide covers the
    // field with a scrim anyway, and drawing a field nobody can see behind two
    // that they can is the whole of what a second render per frame would cost.
    // The opening's own clock, whether or not a rehearsal is up: the page
    // number, the wave's name dropping in and the blobs a READY throws are all
    // read off it, and none of them can be read off a world holding still.
    this.effects.opening.update(view.dt, openingKey(world, view.role));
    this.guide.update(world, view.dt, view.role);
    if (this.guide.active) {
      // Nothing under it painted the ground, so this does. The guide's own
      // scrim is translucent, and translucent over nothing is the last frame.
      ctx.fillStyle = "#05040B";
      ctx.fillRect(0, 0, stage.width, stage.height);
      drawWaveOpening(ctx, l, world, {
        role: view.role,
        scene: this.guide,
        time: view.time,
        fx: this.effects.opening,
        names: view.names,
      });
      ctx.restore();
      return;
    }

    // A round takes the whole stage and this method ends here: the round's
    // first condition is that the field is *gone* (`gauge-round.ts`), and the
    // cheapest way to be sure of that is for none of the code below to run.
    // `ROUND_DRAWS` is the list and says why it is a list. Each draws the
    // wave's opening itself, last — without it the pair get a picture standing
    // still with nothing saying why.
    const round = ROUND_DRAWS[world.boss?.kind ?? ""];
    if (round !== undefined) {
      round(ctx, l, view);
      drawWaveOpening(ctx, l, world, {
        role: view.role,
        time: view.time,
        fx: this.effects.opening,
        names: view.names,
      });
      ctx.restore();
      return;
    }

    // The sim owns both windows; drawing them from a second copy of the
    // arithmetic is what made the button go dark a tick early and stay dark
    // through a ward.
    const isArmed = guardArmed(world);
    const isOpen = mawOpen(world);
    this.pose.update(isArmed, isOpen, world.cannonCol, world.shieldCol, view.dt);
    const at = this.pose.at;
    this.effects.ingest(
      view.events,
      l,
      view.time,
      (col, row) => {
        const c = world.creatures.find((x) => x.col === col && x.row === row);
        return c ? c.id : 0;
      },
      world.cfg,
    );
    this.effects.update(view.dt, l);
    // The lettered grid, eased toward whether anything on the field has to be
    // named by tile. Read straight off the world every frame rather than fed
    // by an event: a wisp arriving, being shot, or a wave being restarted
    // underneath one are three ways in, and the world answers all three.
    this.effects.coordGrid.update(view.dt, wispOnField(world));

    // The beat is loud at the moment of the beat and gone before the next one.
    const flash = Math.max(0, 1 - view.beatPhase * (ticksPerBeat(world.cfg) / 26));

    // A bare frame is the bodies and nothing else — see `ViewState.bare`. It
    // returns here rather than skipping four calls one at a time, so what a
    // thumbnail contains is one branch a reader can hold, and the hull, the
    // band and the HUD cannot creep back into it a pass at a time.
    if (view.bare) {
      drawBodies(ctx, l, world, view, this.effects);
      ctx.restore();
      return;
    }

    drawFieldBack(ctx, l, world, view, flash, this.effects.coordGrid.shown);
    drawBodies(ctx, l, world, view, this.effects);

    drawShip(ctx, l, world, view, this.effects, this.pose.mood(world, this.effects), at);
    drawOverlays(ctx, l, world, view, {
      armed: isArmed,
      open: isOpen,
      fx: this.effects.opening,
    });
    // Last, over everything: the wave arriving, once the pair has crossed the
    // gate. There is no opening left to draw it inside by then (`opening-fx.ts`).
    if (this.effects.opening.launching) {
      this.effects.opening.drawLaunch(ctx, l.width, l.height, l.playHeight * 0.4);
    }
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
