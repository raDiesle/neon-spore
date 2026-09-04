import {
  type ControlSet,
  controlSet,
  type GuideScene,
  guideScene,
  sceneScript,
  WAVES,
} from "@neon-spore/content";
import { guideHolds, SceneRun, type SimEvent, type World } from "@neon-spore/sim";
import { MiniView } from "./guide-mini.js";
import { drawSceneScreen, miniViewport } from "./guide-screen.js";
import { drawGhostThumb, type SceneScreen, thumbAnchors } from "./guide-thumb.js";
import { computeLayout, type ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { Viewport } from "./renderer.js";

/**
 * A guide's rehearsal, on two screens, looping.
 *
 * ## Why two, when the game's own rule is that neither player sees the other's half
 *
 * That rule is about *play*, and it holds there: on the field each seat is
 * shown only what it holds, which is what makes the pair talk. The tutorial is
 * the one place it cannot hold, because what has to be learned is precisely
 * that the other screen exists and carries the answer. A pair shown one screen
 * learns a control; a pair shown both, once, before the first wave, learns the
 * game. `docs/spec/briefings.md` is where that is argued rather than assumed.
 *
 * So both are drawn, and the asymmetry is kept in the *framing*: yours is
 * bright, theirs is dimmed and labelled as theirs. Legible, and plainly not the
 * screen you are holding.
 *
 * ## What this class is, and what it is not
 *
 * It owns a clock and nothing else about the simulation. The rules are
 * `SceneRun`'s, in `packages/sim` — a rehearsal is a real world stepped by the
 * real `step`, and a painted one would be a second copy of where a creature
 * lands and what a shot does. What happens here is that wall-clock seconds
 * become a number of ticks, the runner is asked for them, and what comes back
 * is drawn twice.
 *
 * It is render state that outlives a frame, so it lives where the renderer can
 * clear it, and it clears both mini-screens' `Effects` every time the loop
 * wraps — a rebuilt world starts `beat`, `tick` and `nextId` at 0 again
 * (CLAUDE.md, `test/restart.test.ts`).
 */

/**
 * The virtual screen each rehearsal is laid out at, before it is scaled into
 * its box. A real phone's height, so that the one part of `Layout` which is not
 * viewport-relative — `radarHeightPx` — keeps a phone's proportions instead of
 * eating a third of a thumbnail. The *width* is however wide that many columns
 * of that tile come to, so the grid fills its box rather than sitting in a
 * margin of its own.
 */
const VIRTUAL_H = 700;
/** Between the two screens, in panel pixels. */
const GAP = 10;
const LABEL_H = 15;
const CAPTION_H = 24;
/** Below this a mini-screen is a smudge, so the guide shows its words alone. */
const MIN_H = 84;
/** Never advance more than this in one frame: a stall is not fast-forwarded. */
const MAX_CATCH_UP = 12;

export class GuideStage {
  private run: SceneRun | null = null;
  private scene: GuideScene | null = null;
  private set: ControlSet | null = null;
  private viewport: Viewport = { width: 0, height: 0, dpr: 1 };
  private seen: { world: World; wave: number } | null = null;
  private acc = 0;
  private readonly events: SimEvent[] = [];
  private readonly minis: readonly [MiniView, MiniView] = [new MiniView(), new MiniView()];

  /** Whether there is a rehearsal up at all — the field behind it is skipped. */
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
      this.viewport = miniViewport(this.run.world, VIRTUAL_H);
      this.seen = { world, wave: world.wave };
      this.acc = 0;
      for (const m of this.minis) m.reset();
    }
    this.events.length = 0;
    this.acc += dt * this.run.world.cfg.tickHz;
    const ticks = Math.min(MAX_CATCH_UP, Math.floor(this.acc));
    this.acc -= ticks;
    for (let i = 0; i < ticks; i++) {
      if (!this.run.advance(this.events)) continue;
      // The loop turned over. Everything either screen was holding belongs to
      // the world that has just ended.
      this.events.length = 0;
      for (const m of this.minis) m.reset();
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
    for (const m of this.minis) m.reset();
  }

  /**
   * How tall the block wants to be inside a panel `inner` wide with `avail`
   * pixels of room above the words. Zero when there is no scene, or no room
   * for one worth looking at.
   */
  height(inner: number, avail: number): number {
    const scale = this.scaleFor(inner, avail);
    return scale === 0 ? 0 : LABEL_H + this.viewport.height * scale + CAPTION_H;
  }

  private scaleFor(inner: number, avail: number): number {
    if (!this.run || this.viewport.width <= 0) return 0;
    const boxW = (inner - GAP) / 2;
    const room = avail - LABEL_H - CAPTION_H;
    const scale = Math.min(boxW / this.viewport.width, room / this.viewport.height);
    return this.viewport.height * scale < MIN_H ? 0 : scale;
  }

  /** The two screens, their frames, the hand across them, and the caption. */
  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    inner: number,
    avail: number,
    role: ViewRole,
    time: number,
  ): void {
    const run = this.run;
    const scene = this.scene;
    const set = this.set;
    if (!run || !scene || !set) return;
    const scale = this.scaleFor(inner, avail);
    if (scale === 0) return;

    const w = this.viewport.width * scale;
    const h = this.viewport.height * scale;
    const top = y + LABEL_H;
    // The pair is centred in the panel rather than left-aligned in it: the two
    // screens are as wide as the room allows, and when the room is taller than
    // it is wide they come out narrower than the words above them.
    const left = x + Math.max(0, (inner - (2 * w + GAP)) / 2);
    const screens: SceneScreen[] = [];

    for (const seat of [1, 2] as const) {
      const layout = computeLayout(this.viewport, run.world.cfg, seat === 1 ? "p1" : "p2");
      const bx = seat === 1 ? left : left + w + GAP;
      screens.push({ seat, layout, x: bx, y: top, scale });
      drawSceneScreen(ctx, this.minis[seat - 1]!, {
        world: run.world,
        layout,
        seat,
        x: bx,
        y: top,
        w,
        h,
        scale,
        role,
        time,
        events: this.events,
        set,
      });
    }

    // Sized off the panel it is pressing rather than off a number of its own:
    // a hand wider than the lobe under it is a hand that hides what it did.
    drawGhostThumb(
      ctx,
      thumbAnchors(scene, set, screens),
      run.tick,
      screens[0]!.layout.lobeR * scale,
    );

    ctx.textAlign = "center";
    ctx.font = '600 10px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(scene.caption, left + w + GAP / 2, top + h + 18);
    ctx.textAlign = "left";
  }
}
