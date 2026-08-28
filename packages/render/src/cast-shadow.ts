import { KEY } from "@neon-spore/content";
import { type Creature, isBossBody, type SimConfig } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import { drawnRow } from "./depth.js";
import type { Layout } from "./layout.js";

/**
 * A BODY SHADES THE HULL AND NOTHING ELSE, INCLUDING THE BODY BELOW IT.
 *
 * `contact-shadow.ts` puts a body's shadow on the hull. This puts it on the
 * other bodies — the half that turns a field of sprites into a field of
 * objects, and the half that can cost the pair a callout, so the direction had
 * to be settled before any of the arithmetic below was worth writing.
 *
 * **The light stays where `light.ts` put it.** `KEY` is upper left and is *a
 * constant and never a parameter*; a second angle named here for the field
 * would be exactly what that file forbids. So the shadow runs down and to the
 * right, and down is toward the hull — which is the worry: a body darkening the
 * body below it, the one nearer the hull and the one about to cost something.
 *
 * Two things answer it, and only the second is a choice.
 *
 * **The hue cannot move, by construction.** `LIGHT_HALF.creature` is `"value"`
 * and `key-light.ts` states the consequence: darkening scales every channel by
 * one number, so a red body comes out exactly as red as it went in. This module
 * only darkens — a cast shadow is the absence of light and has no bright half
 * to drop. What is left to measure is *visibility* rather than naming, and
 * `CAST_MAX_ALPHA` is set against it and asserted in `cast-shadow.test.ts`.
 *
 * **The body directly below is the one the shadow misses.** `KEY` is at 45°, so
 * a shadow displaces as far sideways as it does downward, and `THROW_PER_ROW`
 * is 1, which puts the throw for one row of depth at one row of screen pitch.
 * Together they land the shadow on the **diagonal** neighbour rather than on
 * the body in the same column: the column a pair is naming out loud is the
 * column the shadow steps around. Directly below takes a graze of about a sixth
 * of the ceiling. That is the useful accident of a 45° key on a square grid,
 * and it is why the direction is kept rather than a second one invented — nor
 * was the weaker fallback needed, of letting only inert rocks receive.
 *
 * **Cost.** Per pair of nearby bodies per frame, bounded twice: the list is
 * sorted by drawn row and the inner scan stops the moment the depth gap passes
 * `MAX_ROW_GAP`, where the fade has already reached zero. Nothing is allocated
 * per frame — the soft disc is one cached sprite per quantised radius, the
 * `haloSprite` pattern with `litRound`'s quantiser, instead of a
 * `createRadialGradient` per pair. The cache is module-level rather than in
 * `Effects` for the reason `glow.ts`'s and `key-light.ts`'s are: it is keyed on
 * a radius and holds nothing derived from a world, so a restart has nothing
 * here to read as its own.
 */
/**
 * The direction a shadow runs, in screen axes with y down. `KEY` points from
 * the body **toward** the light, so this is its negation and nothing else —
 * there is no angle named in this file.
 */
export const SHADOW_DIR = { x: -KEY.x, y: -KEY.y } as const;

/** How far along `SHADOW_DIR` a shadow is thrown per row of depth, in tiles.
 * One, so the throw for one row equals one row of screen pitch — see the block
 * comment for what that buys. Not a physical height: the one value at which the
 * geometry agrees with the grid the pair talks in. */
const THROW_PER_ROW = 1;

/** How many rows of depth a shadow reaches across. Past this the fade is zero,
 * so it is a cost bound and a look at once rather than a cutoff bolted onto
 * one. Two: a shadow from three rows up is a smudge nobody attributes. */
const MAX_ROW_GAP = 2;

/** How much wider than its caster a shadow spreads by the time it lands — a
 * penumbra, and the reason a shadow reads as cast rather than as the caster's
 * own outline stamped somewhere else. */
const SOFTEN = 0.15;

/** The darkest a cast shadow ever gets, before coverage and fade take their
 * cut — the ceiling, not a typical value, and where the measurement lands:
 * `#FF3B6B` under it holds a WCAG contrast of 3.2 against the background, the
 * graphics threshold for an object this size, while its hue does not move at
 * all. `cast-shadow.test.ts` asserts both against every colour a callout can
 * name, so raising this fails a test rather than a pair. */
export const CAST_MAX_ALPHA = 0.3;

/** `PALETTE.background` (#07060F) as an rgb triple — the `torch-alarm.ts`
 * pattern, so an alpha can be graded onto it, and the one place this file
 * says what a shadow is made of. `shadedColour` composites the same triple. */
const SHADOW_RGB = [7, 6, 15] as const;

/** Where the sprite stops being solid. A plateau, then a soft edge: a shadow
 * with no plateau reads as a blur and one with none reads as a decal. */
const CORE = 0.5;

/** One shadow this frame: a soft disc, clipped to the body it falls on. */
export interface CastShadow {
  /** The body receiving it — the clip, so nothing spills past a silhouette. */
  cx: number;
  cy: number;
  cr: number;
  /** The disc itself, thrown from the caster along `SHADOW_DIR`. */
  sx: number;
  sy: number;
  sr: number;
  alpha: number;
}

/** A body flat enough to take part. A boss is not a blob on a tile and a
 * tether is a line from the rim, so neither casts nor receives — the same two
 * `contact-shadow.ts` refuses, for the same reason. Rocks are in: inert,
 * colourless, and the one body whose volume already reads. */
function participates(c: Creature): boolean {
  return !isBossBody(c.kind) && c.kind !== "tether";
}

interface Body {
  row: number;
  x: number;
  y: number;
  r: number;
}

/** Every shadow one body throws onto another this frame. Sorted far-to-near
 * first, so the inner scan can stop at the depth bound instead of looking at
 * every pair — and so the caster is always the farther of the two. */
export function castShadows(
  cfg: SimConfig,
  l: Layout,
  creatures: readonly Creature[],
  beatPhase: number,
): CastShadow[] {
  const bodies: Body[] = [];
  for (const c of creatures) {
    if (!participates(c)) continue;
    const { x, y } = creatureCenter(l, c, beatPhase);
    bodies.push({ row: drawnRow(c, beatPhase), x, y, r: creatureRadius(l, c, beatPhase, cfg) });
  }
  bodies.sort((a, b) => a.row - b.row);

  const out: CastShadow[] = [];
  for (let j = 1; j < bodies.length; j++) {
    const b = bodies[j] as Body;
    for (let i = j - 1; i >= 0; i--) {
      const a = bodies[i] as Body;
      const gap = b.row - a.row;
      // Sorted, so every remaining `i` is at least this far away: stop.
      if (gap > MAX_ROW_GAP) break;
      if (gap <= 0) continue;
      const s = shadowOf(a, b, gap, l);
      if (s) out.push(s);
    }
  }
  return out;
}

/** What `a` throws onto `b`, or null if it misses. */
function shadowOf(a: Body, b: Body, gap: number, l: Layout): CastShadow | null {
  const throwPx = gap * l.tile * THROW_PER_ROW;
  const sx = a.x + SHADOW_DIR.x * throwPx;
  const sy = a.y + SHADOW_DIR.y * throwPx;
  const sr = a.r * (1 + SOFTEN * gap);
  // How much of `b` the disc is over: 1 when the two are concentric, 0 at
  // tangency. Linear in the separation, which is what keeps a shadow sliding
  // on and off a body as it glides rather than switching.
  const d = Math.hypot(sx - b.x, sy - b.y);
  const cover = (sr + b.r - d) / (2 * Math.min(sr, b.r));
  if (cover <= 0) return null;
  // Zero at the depth bound, so the cutoff is where the shadow already was.
  const fade = (MAX_ROW_GAP - gap + 1) / MAX_ROW_GAP;
  const alpha = CAST_MAX_ALPHA * Math.min(1, cover) * Math.min(1, fade);
  if (alpha <= 0) return null;
  return { cx: b.x, cy: b.y, cr: b.r, sx, sy, sr, alpha };
}

/** A `#rrggbb` as it reads under a cast shadow of that alpha — the numeric twin
 * of what the canvas does, the way `litColour` is the twin of `litRound`, so a
 * test can assert something about a colour and have it be true of the pixels.
 * It composites the same `SHADOW_RGB` the sprite is filled with. */
export function shadedColour(hex: string, alpha: number): string {
  let out = "#";
  for (let i = 0; i < 3; i++) {
    const base = Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
    const v = base * (1 - alpha) + (SHADOW_RGB[i] as number) * alpha;
    out += Math.round(v < 0 ? 0 : v > 255 ? 255 : v)
      .toString(16)
      .padStart(2, "0");
  }
  return out;
}

const sprites = new Map<number, HTMLCanvasElement>();

/** Radius in steps of four, `litRound`'s quantiser and for its reason: a
 * radius that moves every frame caches a canvas every frame. */
function quantise(r: number): number {
  return Math.max(4, Math.round(r / 4) * 4);
}

/** The soft disc, pre-rendered and cached by quantised radius. */
function sprite(q: number): HTMLCanvasElement {
  const cached = sprites.get(q);
  if (cached) return cached;
  const size = q * 2;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(q, q, 0, q, q, q);
    const [r, gr, b] = SHADOW_RGB;
    grad.addColorStop(0, `rgba(${r},${gr},${b},1)`);
    grad.addColorStop(CORE, `rgba(${r},${gr},${b},0.85)`);
    grad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  sprites.set(q, c);
  return c;
}

function drawOne(ctx: CanvasRenderingContext2D, s: CastShadow): void {
  const q = quantise(s.sr);
  ctx.save();
  ctx.beginPath();
  ctx.arc(s.cx, s.cy, s.cr, 0, Math.PI * 2);
  // Clipped to the receiver, so a shadow ends where the body it lies on does
  // and never paints the field between two of them.
  ctx.clip();
  ctx.globalAlpha = s.alpha;
  ctx.drawImage(sprite(q), s.sx - q, s.sy - q);
  ctx.restore();
  // `restore` is a no-op in the strict stub and cheap insurance in a browser:
  // `glow.ts` puts the alpha back by hand for the same reason.
  ctx.globalAlpha = 1;
}

/** Every cast shadow this frame. Called straight after the creatures are
 * drawn — it darkens them, so it cannot run before them. */
export function drawCastShadows(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  creatures: readonly Creature[],
  beatPhase: number,
): void {
  for (const s of castShadows(cfg, l, creatures, beatPhase)) drawOne(ctx, s);
}
