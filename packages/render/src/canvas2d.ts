import { guardArmed, mawOpen, mineOnField, ticksPerBeat, wispOnField } from "@neon-spore/sim";
import { bandControlSet } from "./band.js";
import { drawCandleField } from "./candle-dark.js";
import { HeldHost } from "./canvas2d-held.js";
import { drawStageSeam, paintOutside } from "./canvas2d-stage.js";
import { drawTakeover } from "./canvas2d-takeover.js";
import {
  drawBodies,
  drawFieldBack,
  drawFieldBossCue,
  drawFieldSlow,
  drawOnShip,
  drawOverlays,
  drawShip,
  wellShown,
} from "./frame-passes.js";
import { handedView } from "./handover.js";
import { frame, skinSampler, surfaceSampler } from "./hull-frame.js";
import { computeStage, frameLayout } from "./layout.js";
import type { Renderer, Viewport, ViewState } from "./renderer.js";
import { seenView } from "./unseen.js";

/**
 * Reads the world, writes pixels, changes nothing. If a value is needed here
 * that the world does not have, the world is missing it — do not compute
 * gameplay state in this file.
 *
 * The one thing this file does own is transient appearance: particles, flashes
 * and the shield's fade between passive and armed. None of it is ever read back.
 */
export class Canvas2DRenderer extends HeldHost implements Renderer {
  private ctx: CanvasRenderingContext2D;
  private viewport: Viewport = { width: 0, height: 0, dpr: 1 };

  /**
   * `readback` is for a caller that will read the pixels back with
   * `getImageData` more than once — a probe, never the game. A canvas read
   * back twice without saying so is moved off the GPU, and one read back
   * forty-six times in a page's first seconds demoted every phone-sized
   * canvas the page made afterwards with it: software rasterisation, a pixel
   * readback per sprite, three frames a second — that is what timed out
   * VERSUS's seat probe (`tools/director/src/versus-seat.ts`). Declared, the
   * demotion stays with the canvas that earned it, and the shot takes seconds.
   */
  constructor(
    private canvas: HTMLCanvasElement,
    opts: { readback?: boolean } = {},
  ) {
    super();
    const ctx = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: opts.readback === true,
    });
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

  draw(seen: ViewState): void {
    // THE HANDOVER: the seat this device is playing (`handover.ts`) — and then
    // the bodies neither seat may draw, taken out once for every pass below
    // (`unseen.ts`). Both return the frame they were handed when there is
    // nothing to change, which is every wave but one.
    const view = seenView(handedView(seen));
    const { ctx } = this;
    const { world } = view;
    // The stage depends on the band, and the band on the role: sized per frame, like the layout.
    const stage = computeStage(this.viewport, world.cfg, view.role);
    // A hidden tab reports a zero-sized window, and a field with no width
    // divides by zero in the hull contour: leave the canvas alone until a size arrives.
    if (stage.width < 1 || stage.height < 1) return;
    const l = frameLayout(view, stage, this.viewport.dpr);

    // Outside the stage is not the game, and everything below is in stage
    // coordinates — as is input hit-testing, which subtracts the same offset
    // (`canvas2d-stage.ts`).
    paintOutside(ctx, this.viewport, stage, view.bare);
    ctx.save();
    ctx.beginPath();
    ctx.rect(stage.left, stage.top, stage.width, stage.height);
    ctx.clip();
    // **THE CHOIR's earthquake**, applied inside the clip and above every pass,
    // because the owner asked for the full screen: field, ship, band, HUD and
    // sirens travel together, and the clip keeps the shake off the letterbox.
    // The magnitude is last frame's — ingest and update both run below — which
    // is one frame of lag on a quake lasting a second (`choir-quake.ts`).
    const quake = this.held.effects.quake.offset(view.time);
    ctx.translate(stage.left + quake.x, stage.top + quake.y);

    // Before anything eases or ingests: a wave that just (re)started leaves
    // none of last run's state meaning anything, and this frame is already
    // the new run's first. `restarted` forgets as it answers.
    this.held.restarted(world);

    // The two frames that are not the field — the guide's rehearsal and a boss
    // round — each take the whole stage and end the frame here
    // (`canvas2d-takeover.ts`). The clocks they run go forward either way.
    if (drawTakeover(ctx, l, view, this.held, stage)) {
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
      wellShown(l, world),
    );
    this.held.effects.update(view.dt, l);
    // The one transient this renderer holds outside `Effects`: it is drawn
    // over the ship rather than under it (`render-state.ts` says why).
    this.held.frame(view.events, l, view.dt);
    // The lettered grid, eased toward whether anything on the field has to be
    // named by tile. Read off the world every frame rather than fed by an
    // event: a wisp arriving, shot, or a wave restarted under one are three
    // ways in, and the world answers all three.
    this.held.effects.coordGrid.update(view.dt, wispOnField(world) || mineOnField(world));

    // The beat is loud at the moment of the beat and gone before the next one.
    const flash = Math.max(0, 1 - view.beatPhase * (ticksPerBeat(world.cfg) / 26));

    // **One membrane for the whole frame, and it is built before the field.**
    // The ship's surface used to be the hull pass's private business, computed
    // inside `drawShip` and thrown away; THE CRAWLER walks on it now — the
    // cannon and the shield are swellings of that membrane and a worm goes over
    // them, which is what makes sliding a lobe under one push it up
    // (`crawler-place.ts`). So the frame is made here and handed to both
    // passes: one `frame()` call, and the ground a body stands on cannot be a
    // different membrane from the one drawn under it a pass later.
    const mood = this.held.pose.mood(world, this.held.effects);
    const hull = frame(l, view.time, mood, at);
    const surfaceY = surfaceSampler(hull);
    const skinY = skinSampler(hull);
    this.held.skinY = skinY;

    // A bare frame is the bodies and nothing else (`ViewState.bare`), and it
    // returns here rather than skipping four calls one at a time, so what a
    // thumbnail contains is one branch a reader can hold. A worm in one still
    // rides the ship it stands on: there is no hull drawn under it, but the
    // *body* is the same body, and a thumbnail that flattened it would be a
    // picture of a creature this game has not got.
    if (view.bare) {
      drawBodies(ctx, l, world, view, this.held.effects, at.cannon, surfaceY, skinY);
      ctx.restore();
      return;
    }

    drawFieldBack(ctx, l, world, view, flash, this.held.effects.coordGrid.shown);
    drawBodies(ctx, l, world, view, this.held.effects, at.cannon, surfaceY, skinY);
    // The pieces a bolt knocked out of a wall, under the hull (`fence-shards.ts`).
    this.held.fenceShards.draw(ctx, l);
    // THE CANDLE: the field goes black here, over every body on it and under
    // the ship, whose own glow is a light the dark leaves (`candle-dark.ts`).
    drawCandleField(ctx, l, view, this.held.effects);
    // And, on the same station, THE SLOW's window: over every body on the
    // field and under the ship, because the band is how the pair answers the
    // hurry and must not be dimmed by a picture of it. It draws nothing until
    // a VERSUS candidate patches `SLOW_LOOK.paint` (`slow-look.ts`).
    drawFieldSlow(ctx, l, world, view);

    drawShip(ctx, l, world, view, this.held.effects, mood, at, hull);
    // The one word the boss wants, over the finished ship and THE CANDLE's
    // own dark alike — both paint over anything drawn earlier
    // (`frame-field.ts`'s `drawFieldBossCue`).
    drawFieldBossCue(ctx, l, world, view, skinY);
    // Over the finished ship, what is stuck to it (`frame-on-ship.ts`).
    drawOnShip(ctx, l, world, view, this.held, hull, at, surfaceY);
    drawOverlays(ctx, l, world, view, {
      armed: isArmed,
      open: isOpen,
      fx: this.held.effects.opening,
      surfaceY,
    });
    // Over the ship too, because it is about the ship: a lure shot by mistake (`lure-blast.ts`).
    this.held.lureBlast.draw(ctx, l);
    // And THE STARE's catch, on the button the caught seat pressed
    // (`stare-fx.ts`). The panel is `bandControlSet`'s answer rather than a
    // second reading of `world.wave`, so the circle it lights is one of the
    // circles the band actually drew.
    this.held.effects.boss.stare.drawCaught(
      ctx,
      l,
      view.role,
      bandControlSet(view.controls, world.wave),
    );
    this.held.lanceFlash.draw(ctx, l);
    // Last, over everything: the wave arriving, once the pair has crossed the
    // gate — there is no opening left to draw it inside (`opening-fx.ts`).
    if (this.held.effects.opening.launching) {
      this.held.effects.opening.drawLaunch(ctx, l.width, l.height, l.playHeight * 0.4);
    }
    ctx.restore();

    drawStageSeam(ctx, this.viewport, stage);
  }

  dispose(): void {
    // Nothing retained: the layout is derived per frame.
  }
}
