import type { World } from "@neon-spore/sim";

export interface Viewport {
  width: number;
  height: number;
  dpr: number;
}

export interface ViewState {
  world: World;
  /** 0..1 within the current beat. The only interpolation the sim allows. */
  beatPhase: number;
  /** Which of the two screens this is. Pilot warmer, navigator cooler. */
  player: 1 | 2;
}

/**
 * The whole contract between the game and its pixels. Swapping Canvas 2D for
 * PixiJS later means writing a second class here — see docs/architecture.md,
 * "When PixiJS becomes due".
 */
export interface Renderer {
  resize(viewport: Viewport): void;
  draw(view: ViewState): void;
  dispose(): void;
}
