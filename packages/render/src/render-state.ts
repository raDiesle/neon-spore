import type { SimEvent, World } from "@neon-spore/sim";
import { Effects } from "./effects.js";
import { FieldPose } from "./field-pose.js";
import { GuideStage } from "./guide-scene.js";
import type { Layout } from "./layout.js";
import { LureBlastFx } from "./lure-blast.js";
import type { SpriteBursts } from "./sprite-burst.js";

/**
 * EVERYTHING A RENDERER HOLDS BETWEEN ONE FRAME AND THE NEXT.
 *
 * Split from `canvas2d.ts` when that file reached the 250-line limit with
 * nothing left to give — a three-line accessor for the launch animation would
 * not fit, and the fix went the long way round rather than shaving a comment
 * to make room (`docs/queue.md` carried the entry).
 *
 * The seam is the one CLAUDE.md already draws. Next door is *a frame*: read
 * the world, put down pixels, keep nothing. This is the exception that rule
 * has to make — particles, an eased pose, the film a guide is playing — and it
 * is exactly the state that a restart has to forget, which is why the
 * forgetting lives here too rather than being remembered at four call sites.
 *
 * Nothing here draws. Nothing here reads a layout. It is the answer to "what
 * is still true from last frame", and `test/restart.test.ts` is what holds it
 * to being clearable.
 */
export class RenderState {
  readonly effects = new Effects();
  /** Where the two lobes are and how the membrane feels — `field-pose.ts`. */
  readonly pose = new FieldPose();
  /**
   * The rehearsal a wave's guide plays above its words, if it carries one.
   * Render state that outlives a frame, so it lives here where a restart can
   * clear it; `guide-scene.ts` owns everything about what it shows.
   */
  readonly guide = new GuideStage();
  /**
   * A lure going up, over the whole stage (`lure-blast.ts`).
   *
   * Held here rather than inside `Effects` for the reason this file exists at
   * all: `effects.ts` is at its 250-line limit with nothing left to give, and
   * the fix goes the long way round rather than shaving a comment to make
   * room. The seam holds either way — every transient `Effects` owns is drawn
   * inside the field pass and painted over by the hull, and this one is drawn
   * last of the frame, on top of the ship it is about.
   */
  readonly lureBlast = new LureBlastFx();
  /** Enough of last frame's world to notice a wave starting over — see `restarted`. */
  private seen: { world: World; wave: number; waveBeat: number } | null = null;

  /**
   * The baked-burst player, for a host that wants to install an atlas into it.
   * Exposed rather than reached for through `effects`, so the one thing a host
   * is allowed to change about a renderer is the one thing it can see.
   */
  get sprites(): SpriteBursts {
    return this.effects.spriteBursts;
  }

  /**
   * Whether the wave is still arriving — the two rings a crossed gate throws
   * over the field (`opening-fx.ts`).
   *
   * It runs on the frame clock and no part of it is in the world, so a
   * headless caller stepping the simulation can neither see it nor wait it
   * out. `tools/frames` paints until this is false rather than guessing at a
   * number of frames.
   */
  get launching(): boolean {
    return this.effects.opening.launching;
  }

  /** What REPLAY on a guide's bar reaches. The film's clock is render state and
   * no part of the world, so it is a call and not a command (`guide-play.ts`). */
  replayGuide(): void {
    this.guide.replay();
  }

  /**
   * Whether the wave on screen has just (re)started, so everything transient
   * here belongs to a run that no longer exists (`Effects.reset` says what
   * goes wrong when it is kept). Three ways in, because the hosts restart
   * differently: the director swaps in a whole new `World`, the game calls
   * `startWave` on the one it has — same object, new index — and a restart of
   * the *same* wave changes neither but always puts `waveBeat` to 0.
   *
   * It clears as it answers. A caller that asked and then forgot to forget is
   * the bug this used to be two calls away from.
   */
  /** One frame's events and one frame's worth of time, for the transient this
   * file holds itself. `Effects` is fed the same events next door — this is
   * the one that is not its to draw. */
  frame(events: readonly SimEvent[], l: Layout, dt: number): void {
    this.lureBlast.ingest(events, l);
    this.lureBlast.update(dt);
  }

  restarted(world: World): boolean {
    const last = this.seen;
    this.seen = { world, wave: world.wave, waveBeat: world.waveBeat };
    const now =
      last !== null &&
      (last.world !== world || last.wave !== world.wave || world.waveBeat < last.waveBeat);
    if (now) this.forget();
    return now;
  }

  /**
   * Everything transient, gone — and the ship back to rest with it. `startWave`
   * puts both lobes in the middle and closes the shield, and the ship should
   * *be* like that on the first frame of the new run rather than sliding there
   * from wherever the last one left it.
   */
  forget(): void {
    this.effects.reset();
    this.pose.reset();
    this.lureBlast.clear();
  }
}
