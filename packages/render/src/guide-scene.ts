import { framePhase, type World } from "@neon-spore/sim";
import type { OpeningView } from "./briefing.js";
import { drawHands, filmLayout, seatLayout } from "./guide-film.js";
import { GUIDE_LOOK } from "./guide-look.js";
import { ScenePlay, type Stated } from "./guide-play.js";
import { SeatView } from "./guide-seat.js";
import { drawSlide } from "./guide-slide.js";
import { pageSwitch } from "./guide-switch.js";
import { handedSeat } from "./handover.js";
import type { Layout, ViewRole } from "./layout.js";

/**
 * A guide's rehearsal: the game's own screen, at full size, playing the wave
 * the pair is about to meet.
 *
 * ## One screen at a time, and a switch you can follow
 *
 * The first version drew both devices side by side as two thumbnails above a
 * block of prose. The owner's answer was the shape of this file: the whole
 * screen, so text and graphics are not tiny; **one** device at a time, so it is
 * unmistakable whose it is; and a *slide* to the other seat, so the pair follow
 * the move instead of finding themselves somewhere new.
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
 * produces, and the bar the pages are turned by (`guide-nav.ts`). The band, the
 * bar and the caption are read off `GUIDE_LOOK`, so a VERSUS candidate can
 * stand in for them (`guide-look.ts`).
 *
 * ## It is a real simulation, and this draws only what it is given
 *
 * The rules are `SceneRun`'s, in `packages/sim`: a rehearsal is a real world
 * stepped by the real `step`, so the fall, the shot and the hit are the game's.
 *
 * It is render state that outlives a frame, so it lives where the renderer can
 * clear it, and it clears both seats' `Effects` every time the world underneath
 * is rebuilt — `beat`, `tick` and `nextId` start at 0 again (`restart.test.ts`).
 *
 * **Three jobs, and this is the state.** The clock is `guide-play.ts`, the
 * slide's own picture — the two screens sliding past each other, clipped —
 * is `guide-slide.ts`, and what is left here is `GuideStage` itself: what a
 * page is, whether it has finished, and the one short `draw` that lays the
 * page's own parts — the caption, the hands, the band and the bar — beside
 * whichever slide is playing (`docs/queue.md`, 19 September 2026).
 */

export class GuideStage {
  private readonly seats: readonly [SeatView, SeatView] = [new SeatView(), new SeatView()];
  private readonly play = new ScenePlay();
  /** When the picture was last pressed, on the play's own clock, or null. */
  private nudgedAt: number | null = null;

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
  update(world: World, dt: number, role: ViewRole, stated?: Stated): void {
    if (this.play.update(world, dt, role, stated)) this.resetSeats();
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

  /**
   * Whether the page showing has played out and is standing on its last frame.
   *
   * Nothing on screen needs it — the film simply stops — but a *camera* does:
   * a page holds for good, so a strip asked for from past its end is the same
   * picture however many frames are taken, and the tool taking one has no other
   * way to tell that from a page that happens to be still
   * (`tools/frames/capture.ts`).
   */
  get finished(): boolean {
    return this.play.finished;
  }

  /**
   * The pair pressed the picture rather than the bar. Nothing on the page
   * answers that, so the bar says where the answer is (`guide-nav.ts`,
   * `NUDGE_S`). Kept on the play's clock, so a page that is rebuilt — and
   * starts that clock again — drops it with everything else.
   */
  nudge(): void {
    this.nudgedAt = this.play.shown;
  }

  private resetSeats(): void {
    for (const s of this.seats) s.reset();
    this.nudgedAt = null;
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
    // Where this page is in its move from the seat before it, and how loudly
    // the corner is still saying so (`guide-switch.ts`).
    const { from, k, flash } = pageSwitch(scene, step, run.tick, this.play.repeated);
    // Phone-shaped and centred, whatever the stage is (`guide-film.ts`).
    const cfg = run.world.cfg;
    // **A page is a device, and the panel on it is whichever one that device is
    // holding this tick.** On every wave but one those are the same thing; on a
    // wave carrying THE HANDOVER the panels trade for a window, and a film that
    // went on drawing the page's own half would be the one picture of this
    // fault that does not show it (`handover.ts`). The corner plate keeps
    // saying which phone this is, which is what makes the trade legible. And
    // folded when THE FLIP has turned this screen (`seatLayout`): the words
    // and the hands below stand on the layout the bodies are drawn with.
    const shown = handedSeat(step.seat, run.world);
    const { film, page: sheet, l: laid, top } = filmLayout(box, cfg, shown);
    const l = seatLayout(laid, shown, run.world);

    // Everything down to the corner plate is drawn in the film's rectangle;
    // only the nav bar under it is laid across the whole box.
    ctx.save();
    ctx.translate(film.left, 0);
    ctx.save();
    // **The picture starts under the band** (`top`, `guide-film.ts`), so
    // nothing hung over row 0 is drawn behind the plate.
    ctx.translate(0, top);
    // The outgoing screen slides off to the left and the incoming one follows
    // it in from the right, so the eye is carried across rather than cut,
    // clipped to the film's own rectangle (`guide-slide.ts`).
    drawSlide(
      ctx,
      l,
      this.seats,
      run,
      this.play.events,
      shown,
      from === null ? null : handedSeat(from, run.world),
      k,
      time,
      set,
    );

    const phase = framePhase(run.world);
    GUIDE_LOOK.caption(ctx, l, run.world, set, step, run.tick, phase, names);
    drawHands(ctx, l, run, scene, set, shown, phase);
    ctx.restore();
    // The band and the rim are the page's, not the picture's.
    GUIDE_LOOK.band(ctx, sheet, {
      seat: step.seat,
      names,
      flash,
      age: this.play.shown,
    });
    ctx.restore();
    GUIDE_LOOK.nav(ctx, box, {
      page,
      pages: scene.steps.length + 1,
      played: this.play.plays > 0,
      replay: true,
      age: this.play.shown,
      pointer: view.pointer,
      nudge: this.nudgedAt === null ? undefined : this.play.shown - this.nudgedAt,
    });
  }
}
