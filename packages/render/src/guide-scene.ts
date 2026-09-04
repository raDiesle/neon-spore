import {
  type ControlSet,
  controlSet,
  type GuideScene,
  guideScene,
  type SceneStep,
  sceneScript,
  stepAt,
  WAVES,
} from "@neon-spore/content";
import { guideHolds, SceneRun, type SimEvent, type World } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { drawCaption } from "./guide-caption.js";
import { SeatView } from "./guide-seat.js";
import { drawSeatBanner, drawSwitchSeam } from "./guide-switch.js";
import { drawGhostThumb, thumbAnchors } from "./guide-thumb.js";
import { computeLayout, type Layout, type ViewRole } from "./layout.js";
import { READY_BAR_H } from "./ready-circles.js";

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
 * ## It is a real simulation, and this owns only a clock
 *
 * The rules are `SceneRun`'s, in `packages/sim`: a rehearsal is a real world
 * stepped by the real `step`, so the fall, the shot, the hit and the hull bar
 * dropping are the game's own and not a picture of them. What happens here is
 * that wall-clock seconds become a number of ticks, the runner is asked for
 * them, and what comes back is drawn.
 *
 * It is render state that outlives a frame, so it lives where the renderer can
 * clear it, and it clears both seats' `Effects` every time the loop wraps — a
 * rebuilt world starts `beat`, `tick` and `nextId` at 0 again (CLAUDE.md,
 * `test/restart.test.ts`).
 */

/** Ticks the slide from one screen to the other takes. */
const SWITCH_TICKS = 26;
/** Never advance more than this in one frame: a stall is not fast-forwarded. */
const MAX_CATCH_UP = 12;

export class GuideStage {
  private run: SceneRun | null = null;
  private scene: GuideScene | null = null;
  private set: ControlSet | null = null;
  private seen: { world: World; wave: number } | null = null;
  private acc = 0;
  private readonly events: SimEvent[] = [];
  private readonly seats: readonly [SeatView, SeatView] = [new SeatView(), new SeatView()];

  /** Whether there is a rehearsal up — the field behind it is not drawn. */
  get active(): boolean {
    return this.run !== null;
  }

  /**
   * Bring the rehearsal up to this frame, or put it away. Called once per frame
   * by the renderer, before anything is drawn.
   */
  update(world: World, dt: number): void {
    const id = guideHolds(world) ? WAVES[world.wave]?.guide?.scene : undefined;
    if (id === undefined) {
      this.clear();
      return;
    }
    if (!this.run || this.seen?.world !== world || this.seen.wave !== world.wave) {
      this.scene = guideScene(id);
      this.set = controlSet(WAVES[world.wave]?.controls);
      this.run = new SceneRun(sceneScript(id, world.wave, world.cfg));
      this.seen = { world, wave: world.wave };
      this.acc = 0;
      for (const s of this.seats) s.reset();
    }
    this.events.length = 0;
    this.acc += dt * this.run.world.cfg.tickHz;
    const ticks = Math.min(MAX_CATCH_UP, Math.floor(this.acc));
    this.acc -= ticks;
    for (let i = 0; i < ticks; i++) {
      if (!this.run.advance(this.events)) continue;
      // The loop turned over. Everything either seat was holding belongs to the
      // world that has just ended.
      this.events.length = 0;
      for (const s of this.seats) s.reset();
    }
  }

  clear(): void {
    if (!this.run) return;
    this.run = null;
    this.scene = null;
    this.set = null;
    this.seen = null;
    this.acc = 0;
    this.events.length = 0;
    for (const s of this.seats) s.reset();
  }

  /**
   * The whole stage: the seat that is showing, the slide when it has just
   * changed, the step's words beside their subject, and the hand.
   *
   * `box` is the stage the viewer has. The rehearsal is laid out for the *seat*
   * it is showing rather than for the viewer's own role, because that is the
   * point of it — a player on the rig or on either phone is shown player 1's
   * screen when the film is on player 1's screen.
   */
  draw(ctx: CanvasRenderingContext2D, box: Layout, time: number): void {
    const run = this.run;
    const scene = this.scene;
    const set = this.set;
    if (!run || !scene || !set) return;

    const step = stepAt(scene, run.tick);
    const from = previousSeat(scene, step);
    const k = from === null ? 1 : smoothstep(Math.min(1, (run.tick - step.tick) / SWITCH_TICKS));
    // The stage minus the gate's strip: the film is a whole phone screen, and
    // the two circles get their own band under it rather than sitting on the
    // one the film is teaching.
    const l = computeLayout(
      { width: box.width, height: Math.max(1, box.height - READY_BAR_H), dpr: 1 },
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
    drawSeatBanner(ctx, l, step.seat, from === null ? 1 : k);
  }

  private seat(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    seat: 1 | 2,
    dx: number,
    time: number,
    set: ControlSet,
  ): void {
    const run = this.run;
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
      events: this.events,
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
 * The seat the film is sliding away from, or null when this step is not a
 * switch. Read off the step before rather than remembered, so the drawing holds
 * no state a wrap would have to clear.
 */
function previousSeat(scene: GuideScene, step: SceneStep): 1 | 2 | null {
  const i = scene.steps.indexOf(step);
  const before = i > 0 ? scene.steps[i - 1] : undefined;
  if (!before || before.seat === step.seat) return null;
  return before.seat;
}
