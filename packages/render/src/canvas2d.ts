import { guardArmed, mawOpen, ticksPerBeat, wispOnField } from "@neon-spore/sim";
import { drawWaveOpening } from "./briefing.js";
import { drawBodies, drawFieldBack, drawOverlays, drawShip } from "./frame-passes.js";
import { computeLayout, computeStage, type Layout, type Stage } from "./layout.js";
import { openingKey } from "./opening-fx.js";
import { RenderState } from "./render-state.js";
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
  /** Everything that is still true from last frame, and the forgetting of it
   * when a wave starts over (`render-state.ts`). */
  private held = new RenderState();

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
  }

  /** The three a host may reach: the atlas to install a baked burst into, the
   * film REPLAY plays again, and whether the wave is still arriving. All of
   * them are state rather than drawing, so all of them are `held`'s. */
  get sprites(): SpriteBursts {
    return this.held.sprites;
  }
  get launching(): boolean {
    return this.held.launching;
  }
  replayGuide(): void {
    this.held.replayGuide();
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

    // Outside the stage is not the game: painted flat and left alone, with
    // everything below in stage coordinates — as is input hit-testing, which
    // subtracts the same offset. A phone whose stage fills the viewport needs
    // none of it; a bare frame and a window wider than the stage both do.
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
    // the new run's first. `restarted` forgets as it answers.
    this.held.restarted(world);

    // The wave's guide is carrying a rehearsal, and the two mini-screens in it
    // are the only thing on the stage worth a frame: the guide covers the
    // field with a scrim anyway, and drawing a field nobody can see behind two
    // that they can is the whole of what a second render per frame would cost.
    // The opening's own clock, whether or not a rehearsal is up: the page
    // number, the wave's name dropping in and the blobs a READY throws are all
    // read off it, and none of them can be read off a world holding still.
    this.held.effects.opening.update(view.dt, openingKey(world, view.role));
    this.held.guide.update(world, view.dt, view.role);
    if (this.held.guide.active) {
      // Nothing under it painted the ground, so this does. The guide's own
      // scrim is translucent, and translucent over nothing is the last frame.
      ctx.fillStyle = "#05040B";
      ctx.fillRect(0, 0, stage.width, stage.height);
      drawWaveOpening(ctx, l, world, {
        role: view.role,
        scene: this.held.guide,
        time: view.time,
        fx: this.held.effects.opening,
        names: view.names,
        pointer: view.pointer,
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
        fx: this.held.effects.opening,
        names: view.names,
        pointer: view.pointer,
      });
      ctx.restore();
      return;
    }

    // The sim owns both windows; drawing them from a second copy of the
    // arithmetic is what made the button go dark a tick early and stay dark
    // through a ward.
    const isArmed = guardArmed(world);
    const isOpen = mawOpen(world);
    this.held.pose.update(isArmed, isOpen, world.cannonCol, world.shieldCol, view.dt);
    const at = this.held.pose.at;
    this.held.effects.ingest(
      view.events,
      l,
      view.time,
      (col, row) => {
        const c = world.creatures.find((x) => x.col === col && x.row === row);
        return c ? c.id : 0;
      },
      world.cfg,
    );
    this.held.effects.update(view.dt, l);
    // The one transient this renderer holds outside `Effects`: it is drawn
    // over the ship rather than under it, so it is fed and drawn here
    // (`render-state.ts` says why it is not next door).
    this.held.frame(view.events, l, view.dt);
    // The lettered grid, eased toward whether anything on the field has to be
    // named by tile. Read straight off the world every frame rather than fed
    // by an event: a wisp arriving, being shot, or a wave being restarted
    // underneath one are three ways in, and the world answers all three.
    this.held.effects.coordGrid.update(view.dt, wispOnField(world));

    // The beat is loud at the moment of the beat and gone before the next one.
    const flash = Math.max(0, 1 - view.beatPhase * (ticksPerBeat(world.cfg) / 26));

    // A bare frame is the bodies and nothing else — see `ViewState.bare`. It
    // returns here rather than skipping four calls one at a time, so what a
    // thumbnail contains is one branch a reader can hold, and the hull, the
    // band and the HUD cannot creep back into it a pass at a time.
    if (view.bare) {
      drawBodies(ctx, l, world, view, this.held.effects, at.cannon);
      ctx.restore();
      return;
    }

    drawFieldBack(ctx, l, world, view, flash, this.held.effects.coordGrid.shown);
    drawBodies(ctx, l, world, view, this.held.effects, at.cannon);

    drawShip(
      ctx,
      l,
      world,
      view,
      this.held.effects,
      this.held.pose.mood(world, this.held.effects),
      at,
    );
    drawOverlays(ctx, l, world, view, {
      armed: isArmed,
      open: isOpen,
      fx: this.held.effects.opening,
    });
    // Over the field and over the ship both, because it is about the second
    // one: a lure shot by mistake, and the hull broken in three places for it
    // (`lure-blast.ts`). Everything else this renderer throws goes down in the
    // field pass and is painted over by the hull.
    this.held.lureBlast.draw(ctx, l);
    // Last, over everything: the wave arriving, once the pair has crossed the
    // gate. There is no opening left to draw it inside by then (`opening-fx.ts`).
    if (this.held.effects.opening.launching) {
      this.held.effects.opening.drawLaunch(ctx, l.width, l.height, l.playHeight * 0.4);
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
