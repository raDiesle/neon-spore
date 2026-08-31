/**
 * A baked animation, played from an atlas, over the field.
 *
 * The whole file is `drawImage` with arithmetic in front of it, and that is
 * the point: a frame-by-frame effect costs the renderer one blit, whatever
 * the artist drew into it. The twenty-six spikes in `assets/raster` are free
 * here in a way twenty-six gradient-filled triangles a frame would not be.
 *
 * **The atlas is a strip, not an animated file.** An APNG or an animated WebP
 * in an `<img>` is played by the browser against the wall clock, and nothing
 * in this repository is allowed to be paced by a wall clock that the frame
 * loop cannot see — a hit that is halfway through its burst on one phone and
 * finished on the other is exactly the split-screen the game exists to avoid.
 * A strip hands the frame number back to the caller: `age` comes from the same
 * `dt` every other effect is stepped by, and the frame it lands on is
 * arithmetic. `docs/raster.md` has the reasoning at length.
 *
 * Nothing here is read back into a world, the same as every other effect.
 */

export interface SpriteSheet {
  /** How many frames sit side by side in the strip. */
  frames: number;
  /** Side of one square frame in the source image. */
  frameSize: number;
  /** How long one frame holds, in milliseconds. */
  frameMs: number;
}

/**
 * The burst in `assets/raster/`. Kept beside the code that draws it and
 * checked against the generator's own manifest by
 * `tools/raster/test/manifest.test.ts`, so the two cannot drift.
 */
export const BURST_SHEET: SpriteSheet = { frames: 16, frameSize: 96, frameMs: 40 };

interface LiveBurst {
  x: number;
  y: number;
  /** How wide it is drawn on the field, in CSS pixels. */
  size: number;
  /** Seconds since it started. */
  age: number;
}

export class SpriteBursts {
  private image: CanvasImageSource | null = null;
  private sheet: SpriteSheet = BURST_SHEET;
  private live: LiveBurst[] = [];
  /**
   * Off turns the baked burst back into what shipped, without unloading the
   * atlas — a comparison a person makes by tapping, on a field that keeps
   * running underneath. `docs/decisions.md` #24 asks for alternatives that are
   * comparable *at once*, and a toggle over a live world is the closest a
   * single phone-shaped field gets: nothing rebuilds, nothing reloads, and the
   * wave does not go back to its first beat to answer the question.
   */
  private enabled = true;

  /**
   * Hands the renderer a decoded atlas. Until this is called the class draws
   * nothing and spawns nothing, which is what keeps the shipped field
   * unchanged while the asset is still a proposal — see CLAUDE.md's *A look is
   * offered, never replaced*.
   */
  install(image: CanvasImageSource, sheet: SpriteSheet = BURST_SHEET): void {
    this.image = image;
    this.sheet = sheet;
  }

  get installed(): boolean {
    return this.image !== null;
  }

  /** Whether the atlas, once installed, is actually drawn. */
  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) this.clear();
  }

  /** Drop everything in flight. For a restart — see `Effects.reset`. */
  clear(): void {
    this.live.length = 0;
  }

  /** One burst, centred, at the size it should cover. Ignored with no atlas. */
  spawn(x: number, y: number, size: number): void {
    if (!this.image || !this.enabled) return;
    this.live.push({ x, y, size, age: 0 });
  }

  update(dt: number): void {
    const life = (this.sheet.frames * this.sheet.frameMs) / 1000;
    for (const burst of this.live) burst.age += dt;
    this.live = this.live.filter((burst) => burst.age < life);
  }

  /** Which frame an age lands on, or -1 once the strip has run out. */
  frameAt(age: number): number {
    const frame = Math.floor((age * 1000) / this.sheet.frameMs);
    return frame >= 0 && frame < this.sheet.frames ? frame : -1;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const image = this.image;
    if (!image) return;
    const { frameSize } = this.sheet;
    ctx.save();
    // Additive, like every other light in the game: a burst brightens what is
    // behind it rather than punching a hole in it.
    ctx.globalCompositeOperation = "lighter";
    for (const burst of this.live) {
      const frame = this.frameAt(burst.age);
      if (frame < 0) continue;
      const half = burst.size / 2;
      ctx.drawImage(
        image,
        frame * frameSize,
        0,
        frameSize,
        frameSize,
        burst.x - half,
        burst.y - half,
        burst.size,
        burst.size,
      );
    }
    ctx.restore();
  }
}
