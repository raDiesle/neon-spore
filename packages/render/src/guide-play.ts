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
 * `SceneStep` and the span between it and the next one (`stepSpan`). It plays
 * once and then holds on its last frame, for as long as the seat reading it
 * wants — the cursor is world state, one per seat (`sim/guide-steps.ts`), and
 * NEXT is what moves it.
 *
 * **A page that has played stops, and REPLAY plays it again.** It used to loop
 * on a timer, which was the first answer to a film nobody could keep up with;
 * the owner watched that and said the loop was ugly, and asked for a button
 * instead. He is right about why: a picture restarting on its own every couple
 * of seconds is movement at the edge of the eye while you are reading the words
 * beside it, and the reader never chooses the moment. So the film ends, the
 * last frame stands, and the third button on the bar (`guide-nav.ts`) is what
 * asks for it again.
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

export class ScenePlay {
  run: SceneRun | null = null;
  scene: GuideScene | null = null;
  set: ControlSet | null = null;
  /** The page being played. `-1` until a world has been looked at. */
  page = -1;
  /** How many times it has run to its end. 0 while it is still on its first
   * turn, which is what NEXT's glow reads. */
  plays = 0;
  /** Seconds this page has been up, repeats included. For anything breathing. */
  shown = 0;
  readonly events: SimEvent[] = [];
  private seen: { world: World; wave: number } | null = null;
  /** Where the page being played begins and ends in the loop. */
  private span = { from: 0, to: 0 };
  /** Whether the page has reached its last tick and is standing on it. */
  private held = false;
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
      this.held = false;
      this.replay();
      return true;
    }
    this.shown += dt;
    this.events.length = 0;
    // Played out, and standing on its last frame until a thumb says otherwise.
    if (this.held) return built;
    this.acc += dt * this.run.world.cfg.tickHz;
    const ticks = Math.min(MAX_CATCH_UP, Math.floor(this.acc));
    this.acc -= ticks;
    for (let i = 0; i < ticks; i++) {
      if (this.run.tick >= this.span.to) {
        // The page has played. The last frame stands — which is the picture the
        // words beside it are about, held still to be read rather than swept
        // away by the film starting over.
        this.held = true;
        this.plays += 1;
        this.acc = 0;
        return built;
      }
      this.run.advance(this.events);
    }
    return built;
  }

  /**
   * This page again, because the pair pressed REPLAY. `plays` is deliberately
   * left where it is: NEXT has already earned its glow and the page has already
   * been seen, and taking either back would be the button undoing the thing it
   * was pressed to repeat.
   *
   * Answers the way `update` does — `true` means the world under this was
   * rebuilt and the drawing's cached state has to go with it.
   */
  replayPage(): boolean {
    if (!this.run) return false;
    this.held = false;
    this.replay();
    return true;
  }

  /** Whether the page has played out and is standing on its last frame. */
  get finished(): boolean {
    return this.held;
  }

  /** This page from its own first tick, with everything before it really run. */
  private replay(): void {
    if (!this.run) return;
    this.events.length = 0;
    this.acc = 0;
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
    this.held = false;
    this.acc = 0;
    this.events.length = 0;
    return true;
  }
}
