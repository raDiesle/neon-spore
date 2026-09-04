import {
  type ControlSet,
  controlSet,
  type GuideScene,
  guideScene,
  sceneScript,
  stepSpan,
  WAVES,
} from "@neon-spore/content";
import {
  guideHolds,
  guidePage,
  onReadyPage,
  SceneRun,
  type SimEvent,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "./layout.js";

/**
 * The clock a rehearsal runs on, and the page it is running.
 *
 * **The pair turns the pages, and this owns only the clock.** A page is one
 * `SceneStep` and the span between it and the next one (`stepSpan`). It plays,
 * it pauses for a moment, and it plays again, for as long as the seat reading
 * it wants — the cursor is world state, one per seat (`sim/guide-steps.ts`),
 * and NEXT is what moves it. The owner asked for exactly that, in one sentence,
 * after watching a film that ran once at a tempo nobody could keep up with:
 * *until clicked, with a quick pause, it repeats the animation and explanation
 * in the current step*.
 *
 * Replaying a page means rebuilding the rehearsal's world and running the ticks
 * before it silently — `SceneRun.restart` — which is why there is no rewind
 * anywhere in this: what a page opens on is what the ticks before it really
 * left, and not a pose built to look like one.
 *
 * Its own file beside `guide-scene.ts`, split along the seam that file always
 * had: this decides *what tick it is*, next door decides what that tick looks
 * like. The one thing the two share is said in a return value rather than in a
 * callback — a rebuilt world starts `beat`, `tick` and `nextId` at 0 again, so
 * the drawing's cached state has to go with it (CLAUDE.md,
 * `test/restart.test.ts`), and **`true` means the world under this was
 * rebuilt**. A callback held on a field would be a function nobody can compare,
 * which is exactly what `restart.test.ts` compares two renderers by.
 */

/** Never advance more than this in one frame: a stall is not fast-forwarded. */
const MAX_CATCH_UP = 12;
/** The quick pause on the end of a page before it plays again, in seconds. */
const REPEAT_PAUSE = 0.7;

export class ScenePlay {
  run: SceneRun | null = null;
  scene: GuideScene | null = null;
  set: ControlSet | null = null;
  /** The page being played. `-1` until a world has been looked at. */
  page = -1;
  /** How many times it has played through. 0 while it is still on its first
   * turn, which is what NEXT's glow and the seat's announcement both read. */
  plays = 0;
  /** Seconds this page has been up, repeats included. For anything breathing. */
  shown = 0;
  readonly events: SimEvent[] = [];
  private seen: { world: World; wave: number } | null = null;
  /** Where the page being played begins and ends in the loop. */
  private span = { from: 0, to: 0 };
  /** Seconds left of the pause between one turn of a page and the next. */
  private pause = 0;
  private acc = 0;

  /** Whether there is a rehearsal up — the field behind it is not drawn. */
  get active(): boolean {
    return this.run !== null;
  }

  /**
   * Bring the rehearsal up to this frame, or put it away. Called once per frame
   * by the stage, before anything is drawn.
   */
  update(world: World, dt: number, role: ViewRole): boolean {
    const seat: 1 | 2 = role === "p2" ? 2 : 1;
    // The gate is not a page of film: it is the wave's own name over the field,
    // and `ready-page.ts` draws it. Nothing is rehearsed behind it.
    const id =
      guideHolds(world) && !onReadyPage(world, seat) ? WAVES[world.wave]?.guide?.scene : undefined;
    if (id === undefined) return this.clear();
    let built = false;
    if (!this.run || this.seen?.world !== world || this.seen.wave !== world.wave) {
      this.scene = guideScene(id);
      this.set = controlSet(WAVES[world.wave]?.controls);
      this.run = new SceneRun(sceneScript(id, world.wave, world.cfg));
      this.seen = { world, wave: world.wave };
      this.page = -1;
      this.acc = 0;
      built = true;
    }
    const scene = this.scene;
    if (!scene) return built;
    const page = guidePage(world, seat);
    if (page !== this.page) {
      this.page = page;
      this.span = stepSpan(scene, page);
      this.plays = 0;
      this.shown = 0;
      this.replay();
      return true;
    }
    this.shown += dt;
    this.events.length = 0;
    if (this.pause > 0) {
      this.pause -= dt;
      // The break is over: the page plays again, from its own first tick, with
      // everything before it run silently. **Only this page** — the pair asked
      // for the current step to repeat, not for the film to start over from
      // step one every time they reach the end of step four.
      if (this.pause <= 0) {
        this.plays += 1;
        this.replay();
        return true;
      }
      return built;
    }
    this.acc += dt * this.run.world.cfg.tickHz;
    const ticks = Math.min(MAX_CATCH_UP, Math.floor(this.acc));
    this.acc -= ticks;
    for (let i = 0; i < ticks; i++) {
      if (this.run.tick >= this.span.to) {
        // The page has played. A moment of the last frame standing still, and
        // then it plays again — the pause is what keeps a repeat from reading
        // as a stutter, and it is where the eye goes back to the words.
        this.pause = REPEAT_PAUSE;
        this.acc = 0;
        return built;
      }
      this.run.advance(this.events);
    }
    return built;
  }

  /** This page from its own first tick, with everything before it really run. */
  private replay(): void {
    if (!this.run) return;
    this.events.length = 0;
    this.acc = 0;
    this.pause = 0;
    this.run.restart(this.span.from);
  }

  /** Answers the way `update` does: `true` when there was a world to put away. */
  clear(): boolean {
    if (!this.run) return false;
    this.run = null;
    this.scene = null;
    this.set = null;
    this.seen = null;
    this.page = -1;
    this.plays = 0;
    this.shown = 0;
    this.pause = 0;
    this.acc = 0;
    this.events.length = 0;
    return true;
  }
}
