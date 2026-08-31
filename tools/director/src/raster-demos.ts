import {
  BURST_SHEET,
  loadAtlas,
  PALETTE,
  SpriteBursts,
  type SpriteSheet,
} from "@neon-spore/render";
import stripUrl from "../../../assets/raster/burst-strip.webp";

/**
 * The three canvas demos on the RASTER tab — the atlas driven by hand,
 * outside a `World`, the same class the field uses (`sprite-burst.ts`).
 *
 * Every canvas here shares one loaded atlas: the strip is 94 kB and there is
 * no reason to fetch it three times because three sections want to draw it.
 * `sharedAtlas()` is the single fetch, memoised, that all three await.
 */

let atlasPromise: Promise<CanvasImageSource | null> | null = null;

/** The strip, decoded once, shared by every demo canvas on this tab. */
function sharedAtlas(): Promise<CanvasImageSource | null> {
  if (!atlasPromise) atlasPromise = loadAtlas(stripUrl);
  return atlasPromise;
}

/** Backing store sized for the page at the device's pixel ratio — the same
 * three lines every director canvas sets up (`holders-panel.ts`, `stage.ts`). */
function sizeCanvas(canvas: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/** A rAF loop that stops the moment its canvas leaves the document — the same
 * self-cancelling shape `holders-panel.ts` uses, so a rebuilt tab never piles
 * up a second loop under the first. */
function loop(canvas: HTMLCanvasElement, step: (dt: number) => void): void {
  let last: number | null = null;
  const frame = (now: number): void => {
    if (!canvas.isConnected) return;
    const dt = last === null ? 0 : (now - last) / 1000;
    last = now;
    step(Math.min(dt, 0.1));
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

const TILE = 40;
/** The size the field spawns a burst at — `effects.ts`'s `l.tile * 2.4`. */
const BURST_SIZE = TILE * 2.4;

/**
 * The strip played through `SpriteBursts`, respawning on a loop — the third
 * column of "THE BURST, THREE WAYS". `sheet` is passed through so a caller can
 * slow it down for the powerup aura without a second copy of this class.
 */
export function stripDemo(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  sheet: SpriteSheet = BURST_SHEET,
): void {
  const ctx = sizeCanvas(canvas, w, h);
  const bursts = new SpriteBursts();
  const life = (sheet.frames * sheet.frameMs) / 1000;
  let sinceSpawn = life;

  sharedAtlas().then((image) => {
    if (image) bursts.install(image, sheet);
  });

  loop(canvas, (dt) => {
    ctx.clearRect(0, 0, w, h);
    sinceSpawn += dt;
    if (bursts.installed && sinceSpawn >= life) {
      // The full card, because the two `<img>` cards beside it fill theirs:
      // the row is only worth looking at if all three are the same frames at
      // the same size, and a smaller, sharper third column would read as the
      // atlas being better when it is only being drawn smaller.
      bursts.spawn(w / 2, h / 2, Math.min(w, h));
      sinceSpawn = 0;
    }
    bursts.update(dt);
    bursts.draw(ctx);
  });
}

/** Half the field's frame rate — an aura, not an explosion. */
const AURA_SHEET: SpriteSheet = { ...BURST_SHEET, frameMs: BURST_SHEET.frameMs * 2 };

/**
 * "AS A POWERUP": a slow, looping burst behind a small round pod body.
 */
export function powerupDemo(canvas: HTMLCanvasElement, w: number, h: number): void {
  const ctx = sizeCanvas(canvas, w, h);
  const bursts = new SpriteBursts();
  const life = (AURA_SHEET.frames * AURA_SHEET.frameMs) / 1000;
  let sinceSpawn = 0;
  const cx = w / 2;
  const cy = h / 2;
  const podR = Math.min(w, h) * 0.13;

  sharedAtlas().then((image) => {
    if (image) bursts.install(image, AURA_SHEET);
  });

  loop(canvas, (dt) => {
    ctx.clearRect(0, 0, w, h);
    sinceSpawn += dt;
    if (bursts.installed && sinceSpawn >= life) {
      bursts.spawn(cx, cy, Math.min(w, h) * 0.8);
      sinceSpawn = 0;
    }
    bursts.update(dt);
    bursts.draw(ctx);

    ctx.beginPath();
    ctx.fillStyle = PALETTE.podDark;
    ctx.arc(cx, cy, podR * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = PALETTE.pod;
    ctx.arc(cx, cy, podR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = PALETTE.podRim;
    ctx.arc(cx - podR * 0.3, cy - podR * 0.3, podR * 0.35, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** Beats between hits on the "WHEN A SHOT LANDS" body, in seconds. */
const HIT_EVERY = 1.6;

/**
 * "WHEN A SHOT LANDS": a small body that flashes out and bursts on a repeating
 * cadence, standing in for the `destroy` event `effects.ts` hangs this on.
 */
export function hitDemo(canvas: HTMLCanvasElement, w: number, h: number): void {
  const ctx = sizeCanvas(canvas, w, h);
  const bursts = new SpriteBursts();
  const life = (BURST_SHEET.frames * BURST_SHEET.frameMs) / 1000;
  let sinceHit = HIT_EVERY;
  const cx = w / 2;
  const cy = h / 2;
  const bodyR = Math.min(w, h) * 0.16;

  sharedAtlas().then((image) => {
    if (image) bursts.install(image, BURST_SHEET);
  });

  loop(canvas, (dt) => {
    ctx.clearRect(0, 0, w, h);
    sinceHit += dt;
    if (bursts.installed && sinceHit >= HIT_EVERY) {
      bursts.spawn(cx, cy, BURST_SIZE);
      sinceHit = 0;
    }
    const hitAge = sinceHit;
    // Out for exactly as long as the burst covers it, then back — the flash
    // is a stand-in for what a destroyed creature does not do at all: draw.
    const flashed = bursts.installed && hitAge < life;
    if (!flashed) {
      ctx.beginPath();
      ctx.fillStyle = PALETTE.cyan;
      ctx.arc(cx, cy, bodyR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = PALETTE.cyanRim;
      ctx.lineWidth = 2;
      ctx.arc(cx, cy, bodyR, 0, Math.PI * 2);
      ctx.stroke();
    }
    bursts.update(dt);
    bursts.draw(ctx);
  });
}
