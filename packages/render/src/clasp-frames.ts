/**
 * THE CLASP's hand-painted shield, held for a host that wants to offer it.
 *
 * `clasp.ts` has always had two ways to draw the bubble — twenty hand-painted
 * frames baked into `assets/raster/green-shield-strip.webp`, and the
 * procedural shell with `clasp-lattice.ts`'s honeycomb — and until this class
 * existed nothing anywhere passed an image, so the second was what every
 * device drew on every commit since the creature landed on 31 August 2026.
 * The frames were paint nobody had ever seen (`docs/queue.md` carried the
 * entry).
 *
 * This is the route, and it is `sprite-burst.ts`'s route for the same asset
 * and the same reason: **a look is offered, never replaced**. The shipped
 * shell is what draws until a host installs an atlas, `apps/game` installs one
 * only behind `?raster=1`, and a phone that cannot fetch it gets exactly the
 * field it would have had. Nothing about the decision is taken in this
 * package.
 *
 * It holds an image and nothing else — no live list, no clock, no per-frame
 * state — so `Effects.reset()` has nothing to clear here and a restart does
 * not unload an atlas somebody is looking at. It lives on `Effects` anyway,
 * beside `spriteBursts`, because that is where a renderer keeps what outlives
 * a frame and because `frame-field.ts` already has the record in its hand.
 */
export class ClaspFrames {
  private atlas: CanvasImageSource | null = null;

  /**
   * Hands the renderer a decoded strip. Until this is called `image` is null
   * and `drawClaspShield` takes the procedural branch, which is the picture
   * the game ships.
   */
  install(image: CanvasImageSource): void {
    this.atlas = image;
  }

  /** What `frame-field.ts` passes down to `drawCreatures`, or null. */
  get image(): CanvasImageSource | null {
    return this.atlas;
  }

  /** Whether a host has installed one — for a caller that wants to say so. */
  get installed(): boolean {
    return this.atlas !== null;
  }
}
