import { facet, type Pin, pin, surfaceDim } from "@neon-spore/content";
import type { Interior } from "./body-interior.js";
import { mixHex } from "./hex.js";

/**
 * THE BULB's interior — the body is full, and it is a spore case.
 *
 * It was `creature:bulb` / `spores` on the ALTERNATIVES page, offered against
 * one dot, and the owner took it into the game on 9 September 2026. Four other
 * answers stood beside it — a nucleus, six chambers hung on the wall, a vent
 * and a filament — and every one of them is on the SHAPES tab's FILLING axis
 * now, which is where a way of filling a body is browsed rather than voted on.
 * This is the one that argued about **volume**, which is the thing a flat fill
 * cannot say at all, and it is the one he wanted on the field.
 *
 * The creature is called a bulb and the game is called Neon Spore, and the body
 * has never once looked like it was carrying anything. This fills it: eleven
 * small spheres packed through the whole volume rather than laid on a shell, so
 * the near ones are large and bright and the far ones are small and dim, and
 * the packing turns.
 *
 * **Depth comes from the radius, not from a squash.** Each spore is pinned at
 * its own *reach* as well as its own longitude and latitude — the packing is
 * three deep — and a spore's drawn size is that reach times its facet's own
 * foreshortening. That is what stops it reading as a flat scatter of dots.
 *
 * **The roll is rotated out** so the light does not turn with the body
 * (`.claude/skills/depth`).
 *
 * **What to watch for, because the candidate's own card named it.** Eleven of
 * anything on a body drawn at twenty-six pixels is a stipple. If a bulb stops
 * reading as a bulb and starts reading as a smudge, nothing else about this
 * matters.
 */

const SPORES = 11;
const SPORE = 0.2;
const DIM = 0.24;
/** How far out the packing reaches, as a share of the body's smaller radius,
 * and how fast it turns on the contour clock. Exported with the pins so a
 * strike that sets the spores loose (`slick:hit`'s neighbour, `bulb:hit`)
 * starts each one from where the pair last saw it, rather than from a second
 * copy of this packing. */
export const SPORE_REACH = 0.62;
export const SPORE_SPIN = 0.42;

/** Longitude, latitude and how far out — three shells rather than one. */
export const SPORE_PINS: readonly { readonly pin: Pin; readonly depth: number }[] = [];
for (let i = 0; i < SPORES; i++) {
  const depth = 0.45 + ((i * 7) % 3) * 0.27;
  (SPORE_PINS as { pin: Pin; depth: number }[]).push({
    pin: pin(i * 2.39, ((i / (SPORES - 1)) * 2 - 1) * 0.8, depth),
    depth,
  });
}

/**
 * How many brightness steps the spores are batched into.
 *
 * As a candidate this drew each of its eleven spheres with its own
 * `save`/`translate`/`scale`/`fillStyle`/`fill`/`restore`, which is fine in a
 * tool showing one body and is not fine on a wave — `frame-budget.test.ts`
 * caught it the moment it left the tool. Two changes make it cheap and neither
 * moves a pixel: an **ellipse** instead of a squashed circle, which is what
 * `scale(sx, 1)` was for and costs no transform at all, and one **fill per
 * brightness step** instead of one per sphere, which is `eye-iris.ts`'s
 * argument about six spokes. Four steps is where the banding stops being
 * visible on a body twenty-six pixels wide.
 */
const LEVELS = 4;

/** One sphere's ellipse, held rather than drawn so every sphere at one
 * brightness can go into one subpath. */
type Blob = readonly [x: number, y: number, rx: number, ry: number];

/** The spheres at each step, reused every frame rather than allocated. */
const atStep: Blob[][] = Array.from({ length: LEVELS }, () => []);

export function spores(ctx: CanvasRenderingContext2D, p: Interior): void {
  const theta = p.t * SPORE_SPIN;
  const reach = Math.min(p.rx, p.ry) * SPORE_REACH;

  for (const blobs of atStep) blobs.length = 0;
  for (const q of SPORE_PINS) {
    const f = facet(q.pin, theta);
    if (!f.near) continue;
    // Deeper in the packing is smaller and dimmer, which is the whole of why
    // this is a volume and not a scatter.
    const lit = surfaceDim(DIM, f.lit) * q.depth;
    const k = Math.min(LEVELS - 1, Math.max(0, Math.round(lit * (LEVELS - 1))));
    const r = Math.max(0.5, reach * SPORE * q.depth * Math.max(0.3, f.sy));
    // The foreshortening is the ellipse's own x-radius. `scale(sx, 1)` round a
    // circle drew exactly this and cost a save, a transform and a restore.
    atStep[k]?.push([f.x * reach, f.y * reach, r * Math.max(0.12, f.sx), r]);
  }

  ctx.save();
  ctx.rotate(-p.rot);
  for (let k = 0; k < LEVELS; k++) {
    const blobs = atStep[k];
    if (!blobs || blobs.length === 0) continue;
    ctx.fillStyle = mixHex(p.hex, p.rim, k / (LEVELS - 1));
    ctx.beginPath();
    for (const [x, y, rx, ry] of blobs) {
      ctx.moveTo(x + rx, y);
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ctx.restore();
}
