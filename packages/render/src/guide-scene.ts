import type { ControlSet, GuideScene, SceneStep } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import type { OpeningView } from "./briefing.js";
import { smoothstep } from "./ease.js";
import { drawCaption } from "./guide-caption.js";
import { drawGuideNav, NAV_H } from "./guide-nav.js";
import { ScenePlay } from "./guide-play.js";
import { SeatView } from "./guide-seat.js";
import { drawGuideCorner, drawSwitchSeam } from "./guide-switch.js";
import { drawGhostThumb, thumbAnchors } from "./guide-thumb.js";
import { computeLayout, type Layout, type ViewRole } from "./layout.js";

/**
 * A guide's rehearsal: the game's own screen, at full size, playing the wave
 * the pair is about to meet.
 *
 * ## One screen at a time, and a switch you can follow
 *
 * The first version drew both devices side by side as two thumbnails above a
 * block of prose. The owner's answer was the shape of this file: give the
 * tutorial the whole screen so the text and the graphics are not tiny, show
 * **one** device at a time so it is unmistakable whose it is, and when the film
 * moves to the other seat, *slide* there so the pair can follow the move
 * instead of finding themselves somewhere new.
 *
 * So a step owns a seat (`SceneStep`), and a change of seat is a horizontal
 * slide with a banner naming the screen that has arrived (`guide-switch.ts`).
 * It is still both screens over the course of the film — which is the one place
 * in the game either player sees the other's half, and `docs/spec/briefings.md`
 * argues why the tutorial is allowed to.
 *
 * ## The pair turns the pages
 *
 * A page is one step of the film. It plays once, stands on its last frame, and
 * plays again only when the seat reading it presses REPLAY — NEXT is what moves
 * on. That clock is `guide-play.ts` next door; what is here is the picture it
 * produces, and the bar the pages are turned by (`guide-nav.ts`).
 *
 * ## It is a real simulation, and this draws only what it is given
 *
 * The rules are `SceneRun`'s, in `packages/sim`: a rehearsal is a real world
 * stepped by the real `step`, so the fall, the shot, the hit and the hull bar
 * dropping are the game's own and not a picture of them.
 *
 * It is render state that outlives a frame, so it lives where the renderer can
 * clear it, and it clears both seats' `Effects` every time the world underneath
 * is rebuilt — which a rebuilt world needs, because `beat`, `tick` and `nextId`
 * all start at 0 again (CLAUDE.md, `test/restart.test.ts`).
 */

/** Ticks the slide from one screen to the other takes. */
const SWITCH_TICKS = 26;

export class GuideStage {
  private readonly seats: readonly [SeatView, SeatView] = [new SeatView(), new SeatView()];
  private readonly play = new ScenePlay();

  /** Whether there is a rehearsal up — the field behind it is not drawn. */
  get active(): boolean {
    return this.play.active;
  }

  /**
   * Bring the rehearsal up to this frame, or put it away. Once per frame.
   *
   * A `true` back from the play means the world underneath was rebuilt — a page
   * replayed, a wave changed, the guide gone — and everything either seat's
   * `Effects` was holding belongs to the world that has ended (CLAUDE.md,
   * `test/restart.test.ts`).
   */
  update(world: World, dt: number, role: ViewRole): void {
    if (this.play.update(world, dt, role)) this.resetSeats();
  }

  clear(): void {
    if (this.play.clear()) this.resetSeats();
  }

  /**
   * Play this page again, because the pair pressed REPLAY. A rebuilt world
   * starts `beat`, `tick` and `nextId` at 0, so both seats' `Effects` go with
   * it — the same clearing a page change already does.
   */
  replay(): void {
    if (this.play.replayPage()) this.resetSeats();
  }

  private resetSeats(): void {
    for (const s of this.seats) s.reset();
  }

  /**
   * The whole stage: the seat that is showing, the slide when it has just
   * changed, the page's words beside their subject, the hand, and the bar the
   * pages are turned by.
   *
   * `box` is the stage the viewer has. The rehearsal is laid out for the *seat*
   * it is showing rather than for the viewer's own role, because that is the
   * point of it — a player on the rig or on either phone is shown player 1's
   * screen when the film is on player 1's screen. `role` is still needed, for
   * the one line that is about the viewer rather than about the film: whether
   * the screen on show is the phone in their own hand.
   */
  draw(ctx: CanvasRenderingContext2D, box: Layout, view: OpeningView): void {
    const { names } = view;
    const time = view.time ?? 0;
    const { run, scene, set, page } = this.play;
    if (!run || !scene || !set) return;

    // The page, not the tick: a page is what is being watched, and it holds its
    // own words through the pause on the end of it.
    const step = scene.steps[Math.max(0, Math.min(scene.steps.length - 1, page))]!;
    const from = previousSeat(scene, step);
    const k = from === null ? 1 : smoothstep(Math.min(1, (run.tick - step.tick) / SWITCH_TICKS));
    // The stage minus the nav bar: the film is a whole phone screen, and BACK,
    // the page number and NEXT get their own band under it rather than sitting
    // on the one the film is teaching.
    const l = computeLayout(
      { width: box.width, height: Math.max(1, box.height - NAV_H), dpr: 1 },
      run.world.cfg,
      seatRole(step.seat),
    );

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, l.width, l.height);
    ctx.clip();
    // The outgoing screen slides off to the left and the incoming one follows
    // it in from the right, so the eye is carried across rather than cut.
    if (from !== null && k < 1) this.seat(ctx, l, from, -l.width * k, time, set);
    this.seat(ctx, l, step.seat, from === null ? 0 : l.width * (1 - k), time, set);
    if (from !== null && k < 1) drawSwitchSeam(ctx, l, l.width * (1 - k));
    ctx.restore();

    const cfg = run.world.cfg;
    const phase = (run.world.tick % ((cfg.tickHz * 60) / cfg.bpm)) / ((cfg.tickHz * 60) / cfg.bpm);
    drawCaption(ctx, l, run.world, set, step, run.tick, phase);
    drawGhostThumb(ctx, thumbAnchors(scene, set, l), run.tick, l.lobeR, step.seat);
    drawGuideCorner(ctx, l, { seat: step.seat, names });
    drawGuideNav(ctx, box, {
      page,
      pages: scene.steps.length + 1,
      played: this.play.plays > 0,
      replay: true,
      age: this.play.shown,
      pointer: view.pointer,
    });
  }

  private seat(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    seat: 1 | 2,
    dx: number,
    time: number,
    set: ControlSet,
  ): void {
    const run = this.play.run;
    if (!run) return;
    const cfg = run.world.cfg;
    const tpb = (cfg.tickHz * 60) / cfg.bpm;
    ctx.save();
    ctx.translate(dx, 0);
    this.seats[seat - 1]!.draw(ctx, l, {
      world: run.world,
      beatPhase: (run.world.tick % tpb) / tpb,
      role: seatRole(seat),
      time,
      // A frame's own seconds, so a lobe eases at the speed it eases at on a
      // phone rather than at the speed the rehearsal's ticks happen to arrive.
      dt: 1 / 60,
      events: this.play.events,
      running: true,
      controls: set,
    });
    ctx.restore();
  }
}

function seatRole(seat: 1 | 2): ViewRole {
  return seat === 1 ? "p1" : "p2";
}

/**
 * The seat the film is sliding away from, or null when this page is not a
 * switch. Read off the page before rather than remembered, so the drawing holds
 * no state a rebuild would have to clear.
 */
function previousSeat(scene: GuideScene, step: SceneStep): 1 | 2 | null {
  const i = scene.steps.indexOf(step);
  const before = i > 0 ? scene.steps[i - 1] : undefined;
  if (!before || before.seat === step.seat) return null;
  return before.seat;
}
