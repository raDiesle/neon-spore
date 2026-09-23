import type { ClaspFrames } from "./clasp-frames.js";
import type { SurfaceY } from "./hull-frame.js";
import { RenderState } from "./render-state.js";
import type { SpriteBursts } from "./sprite-burst.js";

/**
 * **What a host may reach of the renderer's state**, as the class
 * `Canvas2DRenderer` stands on. Cut out of `canvas2d.ts` at its line limit,
 * when the skin the last frame stood on joined the list: every member here
 * hands a host one thing `held` knows and draws nothing, so the drawing file
 * next door is left with the drawing.
 */
export class HeldHost {
  /** Everything that is still true from last frame, and the forgetting of it
   * when a wave starts over (`render-state.ts`). */
  protected readonly held = new RenderState();

  /** What a host may reach: the two atlases a baked look is installed into,
   * the film REPLAY plays again and whether it has played out, and whether the
   * wave is still arriving. State rather than drawing, so every one is
   * `held`'s. */
  get sprites(): SpriteBursts {
    return this.held.sprites;
  }
  get claspShield(): ClaspFrames {
    return this.held.claspShield;
  }
  get launching(): boolean {
    return this.held.launching;
  }
  replayGuide(): void {
    this.held.replayGuide();
  }
  nudgeGuide(): void {
    this.held.nudgeGuide();
  }
  get guideFinished(): boolean {
    return this.held.guideFinished;
  }
  /** The skin the last field frame stood on, for the hit test (`touch-field.ts`). */
  get skinY(): SurfaceY | null {
    return this.held.skinY;
  }
}
