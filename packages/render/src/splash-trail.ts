import { blobPath } from "@neon-spore/content";

/**
 * SLIME OFF THE END OF A MOUSE.
 *
 * The owner sent a page whose whole background is a WebGL fluid simulation —
 * drag across it and a cloud of ink smears out under the pointer, swirls and
 * dissipates — and asked whether the game could borrow it for a player at a
 * desk. It could not borrow the *implementation*: that is five hundred lines
 * of GLSL on a second canvas, outside every budget this renderer is measured
 * against and outside the visual language of a game whose every body is a
 * closed contour with lobes. So this borrows the *effect* instead, drawn the
 * way this game draws everything else — the pointer leaves a string of blobs
 * out of `blobPath`, they swell, sag and thin out, and where they overlap they
 * add up into one mass rather than reading as beads on a string.
 *
 * **Additive, and that is the whole trick.** Each blob is two flat fills under
 * `lighter` — a wide faint skirt and a small bright core — and nothing else.
 * No gradient is built per blob and no halo sprite is cached, because the hue
 * moves continuously and a cache keyed on it would grow a canvas a frame.
 * Twenty overlapping skirts are what makes the middle of a stroke bright,
 * which is what a fluid does and what a single translucent fill never does.
 *
 * **Nothing here can be seen on a phone.** The host only ever builds one of
 * these for a real mouse (`apps/game/src/trail.ts`), so the cost on the device
 * the game is actually played on is zero — not small, zero.
 */

/**
 * The colour a stroke starts on turns by this much from the last one. The
 * golden angle, so eight strokes in a row are eight different hues rather than
 * a slow crawl through one — and it needs no randomness to be varied, which
 * matters because a frame test cannot diff a picture that is a different
 * colour every run.
 */
const STROKE_TURN = 137.508;
/**
 * Degrees of hue per pixel dragged. A long sweep walks the rainbow; a flick
 * stays one colour, which is what makes a stroke read as one thing.
 */
const HUE_PER_PX = 0.55;
/**
 * Pixels of travel between blobs. Below this a slow drag lays them on top of
 * each other and the additive fills blow out to white.
 */
const STEP_PX = 11;
/** Seconds of stillness that end a stroke. */
const STROKE_GAP_S = 0.32;
/**
 * The ceiling. A fast circular drag on a wide monitor can ask for hundreds;
 * past this the oldest go, because the newest are the ones under the eye.
 */
const MAX_BLOBS = 120;
/** How much wider a blob is at the end of its life than at the start. */
const SWELL = 2.6;

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Radius at birth, in CSS pixels. */
  r: number;
  age: number;
  life: number;
  hue: number;
  seed: number;
  lobes: number;
}

export class SplashTrail {
  private blobs: Blob[] = [];
  private hue = 200;
  private since = STROKE_GAP_S;
  private last: { x: number; y: number } | undefined;
  /**
   * Distance left over from the previous segment, so a slow drag emits on the
   * same spacing as a fast one instead of once per event.
   */
  private carry = 0;
  private t = 0;
  private next = 0;

  /** Nothing left to draw, so the host can stop asking for frames. */
  get idle(): boolean {
    return this.blobs.length === 0;
  }

  /**
   * End the stroke without touching what is already out.
   *
   * The mouse leaving the window is not the ink disappearing — what is on the
   * glass goes on running down it and thinning, the same as if the hand had
   * simply stopped. What must not survive is the *last position*: without
   * this, a pointer that left at the top right and came back at the bottom
   * left would lay a stroke straight across the screen between the two.
   */
  lift(): void {
    this.last = undefined;
    this.carry = 0;
    this.since = STROKE_GAP_S;
  }

  /** Forget everything. The page is one document and this outlives a run. */
  reset(): void {
    this.blobs = [];
    this.last = undefined;
    this.carry = 0;
    this.since = STROKE_GAP_S;
  }

  /** Where the mouse is now. Called from a pointer event, not from a frame. */
  push(x: number, y: number): void {
    if (this.since >= STROKE_GAP_S) {
      this.hue = (this.hue + STROKE_TURN) % 360;
      this.last = { x, y };
      this.carry = 0;
    }
    this.since = 0;
    const from = this.last ?? { x, y };
    const dx = x - from.x;
    const dy = y - from.y;
    const span = Math.hypot(dx, dy);
    this.last = { x, y };
    if (span < 0.001) return;
    // Walk the segment rather than dropping one blob per event: a mouse
    // reports every few pixels when it crawls and every eighty when it is
    // thrown, and a trail with a gap in it is not a trail.
    const speed = Math.min(1, span / 40);
    for (let d = STEP_PX - this.carry; d <= span; d += STEP_PX) {
      const k = d / span;
      this.hue = (this.hue + HUE_PER_PX * STEP_PX) % 360;
      this.spawn(from.x + dx * k, from.y + dy * k, dx / span, dy / span, speed);
    }
    this.carry = (this.carry + span) % STEP_PX;
  }

  update(dt: number): void {
    this.t += dt;
    this.since += dt;
    const drag = Math.max(0, 1 - dt * 3.2);
    const kept: Blob[] = [];
    for (const b of this.blobs) {
      b.age += dt;
      if (b.age >= b.life) continue;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vx *= drag;
      // Slime, not smoke: what is left of a stroke slides down the glass.
      b.vy = b.vy * drag + 34 * dt;
      kept.push(b);
    }
    this.blobs = kept;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.blobs.length === 0) return;
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "lighter";
    for (const b of this.blobs) {
      const k = b.age / b.life;
      // Up fast, down slow: a splash is at its widest almost at once and then
      // spends the rest of its life thinning, which is what makes it read as
      // liquid rather than as a dot being turned down.
      const fade = k < 0.18 ? k / 0.18 : 1 - (k - 0.18) / 0.82;
      const r = b.r * (1 + (SWELL - 1) * k);
      const skirt = new Path2D(
        blobPath(b.x, b.y, r, r * 0.92, b.lobes, 0.16, 0.1, this.t + b.seed, b.seed, 22),
      );
      ctx.fillStyle = neonHue(b.hue, 0.9, 0.5);
      ctx.globalAlpha = 0.13 * fade;
      ctx.fill(skirt);
      const core = new Path2D(
        blobPath(
          b.x,
          b.y,
          r * 0.44,
          r * 0.4,
          b.lobes,
          0.2,
          0.12,
          this.t * 1.3 + b.seed,
          b.seed,
          18,
        ),
      );
      ctx.fillStyle = neonHue(b.hue, 0.5, 1);
      ctx.globalAlpha = 0.24 * fade * fade;
      ctx.fill(core);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = prev;
  }

  private spawn(x: number, y: number, ux: number, uy: number, speed: number): void {
    const n = this.next++;
    // Everything that would be random elsewhere is a turn of this counter, for
    // the reason `STROKE_TURN` gives: a frame test has to be able to diff.
    const along = ((n * 41) % 17) / 17 - 0.5;
    const across = ((n * 23) % 13) / 13 - 0.5;
    // **Sideways as well as along, and a size that is nobody's average.**
    // Without these two the blobs land in a line at one radius and the stroke
    // comes out an even ribbon — a highlighter, not ink. The perpendicular
    // throw and the size spread are what give the edge of a stroke lumps, and
    // lumps are the whole difference between a fluid and a felt tip.
    const size = 0.55 + ((n * 29) % 19) / 19;
    this.blobs.push({
      x: x + ux * along * 7 - uy * across * 15,
      y: y + uy * along * 7 + ux * across * 15,
      // The ink keeps going the way the hand threw it, and sags while it does.
      vx: ux * speed * 46 - uy * across * 40,
      vy: uy * speed * 46 + ux * across * 40 + 8,
      r: (8 + speed * 13) * size,
      age: 0,
      life: 0.8 + ((n * 7) % 11) / 16,
      hue: this.hue,
      seed: n % 16,
      lobes: 3 + (n % 3),
    });
    if (this.blobs.length > MAX_BLOBS) this.blobs.splice(0, this.blobs.length - MAX_BLOBS);
  }
}

/**
 * A hue as `#rrggbb`.
 *
 * `#rrggbb` and not `hsl(...)`: `packages/render/test/canvas-stub.ts` refuses
 * anything else, and it refuses it because a colour notation this renderer had
 * not agreed on is exactly the class of mistake that stub exists to catch.
 */
export function neonHue(deg: number, sat: number, val: number): string {
  const h = (((deg % 360) + 360) % 360) / 60;
  const c = val * sat;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = val - c;
  const wheel: readonly (readonly [number, number, number])[] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const rgb = wheel[Math.floor(h) % 6] as readonly [number, number, number];
  const byte = (v: number): string =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${byte(rgb[0])}${byte(rgb[1])}${byte(rgb[2])}`;
}
