import type { World } from "@neon-spore/sim";

/**
 * The handle headless checks drive the stage through.
 *
 * A hidden tab suspends `requestAnimationFrame`, so a test that wants a
 * picture has to be able to ask for one rather than wait for a frame that
 * will not come. It lives beside `stage.ts` rather than in it because that
 * file is at its line limit and this is the one part of it nothing on screen
 * uses — see `raster-play.ts` and the preview checks for who calls it.
 */
export interface StageHandle {
  /** The world as it is now, not as it was when the handle was made. */
  world(): World;
  /** Step the simulation without a frame. */
  advance(ticks: number): void;
  /** Draw one frame at a nominal 60Hz. */
  paint(): void;
}

export function exposeStageHandle(handle: StageHandle): void {
  (window as unknown as { neonSporeDirector: unknown }).neonSporeDirector = {
    get world() {
      return handle.world();
    },
    advance: (ticks: number) => handle.advance(ticks),
    paint: () => handle.paint(),
  };
}
