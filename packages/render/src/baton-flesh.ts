import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE BATON's arm is made of**: a tendon hung from above the field,
 * a knuckle of flesh at every joint with a wet cup in it, and a drop of the
 * colour that takes it sitting in the cup (`baton-drop.ts`).
 *
 * Split off the three files that decide *what* the arm says — which sockets
 * are lit, how far the thread has thinned, which bead is the twin — so they
 * stay about the fight and this one about the material. Before it, every
 * joint was a filled blob with a glowing line drawn round it, which is the
 * one picture the brief rules out by name (`new-boss-more` §6.3).
 *
 * **The line round a socket was carrying the count**, so nothing it said is
 * dropped, only moved inside: a socket the bead has still to pass is live
 * flesh in the hull's violet, with the violet pooled in its cup and a glow
 * round it, breathing on the beat; a socket it has left is the same knuckle
 * gone grey, its cup empty. The silhouette is still the health bar.
 *
 * **Every line width here is off the tile, never off a joint's radius**: a
 * husk shrivels on the thread and a swelling socket grows, and a width that
 * followed them would be a new width on every frame — the thread's test
 * counts widths to find the hair (`baton-frame.test.ts`).
 */

/**
 * The lit shoulder idling on its own, in radii and radians a second. A
 * socket's ring wobbles on `time * 0.5` and up (`baton-socket-draw.ts`), and a
 * gradient pinned a fixed share of the radius toward the light is a still life
 * over it (`docs/style-guide.md`'s "Depth on a body that already ships").
 * Phased by the socket's seed so the arm does not wobble in step; the drop's
 * own is in `baton-drop.ts`.
 */
const KNUCKLE_LIT_WOBBLE = 0.06;
const KNUCKLE_LIT_WOBBLE_RATE = 0.37;

/**
 * The violet pooled in a lit cup, sloshing on its own clock: how far across
 * the cup it runs, in radii, how fast in radians a second, and how much it
 * thins at either end of the run. The socket's only other motion was its beat
 * breath, which every socket on the arm takes at once; this is its own, and
 * phased by the socket's seed, so the arm's live cups do not slosh together
 * — the secondary motion THE SPLICE's cilia and drool already carry.
 */
const POOL_SLOSH = 0.1;
const POOL_SLOSH_RATE = 1.3;
const POOL_DIM = 0.12;

/** The knuckle round one socket: `lit` while the bead has yet to pass it. */
export interface Knuckle {
  x: number;
  y: number;
  r: number;
  tile: number;
  lit: boolean;
  /** The beat's breath, 0..1, on a lit one. */
  breath: number;
  /** How far a dark one has swollen towards letting go, 0..1. */
  swell: number;
  /** Wall-clock seconds and the socket's own seed, for the light's idle. */
  time: number;
  seed: number;
}

export function paintKnuckle(ctx: CanvasRenderingContext2D, joint: Path2D, k: Knuckle): void {
  const { x, y, r } = k;
  // A lit knuckle is live flesh, the hull's violet with the light through it;
  // a spent one is the same knuckle gone grey. That difference is the count.
  if (k.lit) halo(ctx, x, y, r * 2.2, PALETTE.hull, 0.3 + 0.25 * k.breath);
  ctx.save();
  const drift = KNUCKLE_LIT_WOBBLE * Math.sin(k.time * KNUCKLE_LIT_WOBBLE_RATE + k.seed * 1.7);
  const flesh = ctx.createRadialGradient(
    x - r * (0.35 + drift),
    y - r * (0.4 + drift * 0.8),
    r * 0.05,
    x,
    y,
    r * 1.15,
  );
  flesh.addColorStop(0, k.lit ? PALETTE.sheenRim : PALETTE.rock);
  flesh.addColorStop(0.5, k.lit ? PALETTE.hull : PALETTE.rockDark);
  flesh.addColorStop(1, PALETTE.sheenDeep);
  ctx.fillStyle = flesh;
  ctx.fill(joint);
  ctx.clip(joint);
  // The cup, sunk in the knuckle: darkest at its bottom.
  const cy = y + r * 0.06;
  const pit = ctx.createRadialGradient(x, cy, 0, x, cy, r * 0.6);
  pit.addColorStop(0, rgba(PALETTE.background, 0.95));
  pit.addColorStop(0.75, rgba(PALETTE.background, 0.75));
  pit.addColorStop(1, rgba(PALETTE.background, 0));
  ctx.fillStyle = pit;
  ctx.beginPath();
  ctx.ellipse(x, cy, r * 0.6, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (k.lit) {
    // The violet the bead has still to pass, pooled in the cup — and a
    // liquid, so it sloshes on a clock of its own as well as swelling on the
    // beat. Sideways, since a cup holds its level and spills across.
    const slosh = Math.sin(k.time * POOL_SLOSH_RATE + k.seed * 2.3);
    const px = x + r * POOL_SLOSH * slosh;
    const py = cy + r * 0.12;
    const pool = ctx.createRadialGradient(px, py, 0, px, py, r * 0.5);
    pool.addColorStop(0, rgba(PALETTE.hull, 0.55 + 0.4 * k.breath - POOL_DIM * slosh * slosh));
    pool.addColorStop(1, rgba(PALETTE.hull, 0));
    ctx.fillStyle = pool;
    ctx.fill();
  }
  // The cup's far wall catching the light: bright on a lit one, the cold
  // light's on one the bead has left.
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, k.tile * 0.035);
  ctx.strokeStyle = k.lit ? PALETTE.sheenRim : PALETTE.sheenCold;
  ctx.globalAlpha = k.lit ? 0.6 + 0.4 * k.breath : 0.4;
  ctx.beginPath();
  ctx.ellipse(x, cy, r * 0.5, r * 0.4, 0, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.globalAlpha = 1;
  if (k.swell > 0) {
    // The shell coming away: a seam opening across the crown.
    ctx.strokeStyle = PALETTE.background;
    ctx.globalAlpha = k.swell;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.82, r * 0.7, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
  ctx.restore();
  // Stretched skin shines: the film widens and brightens as it swells.
  paintFilm(ctx, x, y, r, 0.26 + 0.4 * k.swell);
}

/**
 * The arm's spine, stroked as a tendon: a dark sheath, the body, and a lit
 * core along it. `sheath` is how much of the sheath and core to keep — the
 * thread's hair is the body alone, one width, so it reads as a thing nearly
 * gone rather than a thinner tube.
 */
export function strokeTendon(
  ctx: CanvasRenderingContext2D,
  spine: Path2D,
  width: number,
  sheath: number,
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (sheath > 0) {
    ctx.globalAlpha = sheath;
    ctx.strokeStyle = PALETTE.sheenDeep;
    ctx.lineWidth = width * 1.45;
    ctx.stroke(spine);
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.lineWidth = width;
  ctx.stroke(spine);
  if (sheath > 0) {
    ctx.globalAlpha = 0.55 * sheath;
    ctx.strokeStyle = PALETTE.rock;
    ctx.lineWidth = width * 0.3;
    ctx.stroke(spine);
  }
  ctx.restore();
}

/** The wet film on a shoulder: a soft bloom and a hard point. */
export function paintFilm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  a: number,
): void {
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, a);
  ctx.beginPath();
  ctx.ellipse(x - r * 0.3, y - r * 0.44, r * 0.3, r * 0.11, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.85);
  ctx.beginPath();
  ctx.arc(x - r * 0.4, y - r * 0.48, Math.max(0.8, r * 0.07), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
