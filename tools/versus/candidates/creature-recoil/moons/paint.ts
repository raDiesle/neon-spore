import { KEY } from "../../../../../packages/content/src/light.js";
import { facet, type Pin, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { STROKE } from "../../../../../packages/render/src/palette.js";
import type { CageDraw } from "../../../../../packages/render/src/recoil-look.js";

/**
 * MOONS — no cage: the bounces orbit the body.
 *
 * One moon per bounce the body arrived with, on a ring tilted toward the
 * viewer so its near side passes under the body and its far side skims over
 * the top of it, turning on the clock. Each moon is placed on that ring by
 * `pin` and projected by `facet`, so a near moon is large and lit and a far
 * one is small and dim, and the reveal is the whole picture: a moon comes
 * round from behind the body, swells across the front and shrinks away
 * again, which is the one motion a frame drawn in one plane could never
 * make. The ring itself is drawn as a faint ellipse, so the eye has the
 * orbit before it has the moons. A spent bounce is a **cinder** — the moon
 * gone dark, scorched, still on its orbit but with no light in it — so the
 * count is read as it always was: lit moons left, dark ones spent.
 *
 * Everything is stained the body's colour by the caller, and the body is
 * untouched: the colour inside is the cannon's.
 *
 * **How it can lose.** *A moon over the body is a mark on the body.* The
 * far half of the orbit skims the top of the body, and a far moon drawn there
 * is drawn *over* the body because the cage is; if at 26 px that reads as a
 * spot on the creature rather than a satellite behind it, the tilt needs to
 * lift the orbit clear or the candidate goes.
 */

/** One turn of the orbit, in seconds. */
const TURN_SECONDS = 4;
/** How far the orbit's plane is tilted, as the share of its radius the ring
 * spans vertically — high, so the far side clears the body's top. */
const TILT = 0.82;
/** A moon's radius as a share of the body's, near and far. */
const NEAR = 0.46;
const FAR = 0.26;
/** The orbit's radius as a share of the hoop — outside it, because a bulb's
 * spikes reach past its own radius and a moon on the hoop sits in them. */
const ORBIT = 1.25;
/** What a moon keeps of its colour turned from the key. */
const FLOOR = 0.3;
const SHEEN = "#F4F1EA";
const SHADOW = "#0B1024";

const orbits = new Map<number, Pin[]>();
function moonPins(struts: number): Pin[] {
  const have = orbits.get(struts);
  if (have) return have;
  const pins: Pin[] = [];
  for (let i = 0; i < struts; i++) pins.push(pin((i / struts) * Math.PI * 2, 0, 1));
  orbits.set(struts, pins);
  return pins;
}

export function moons(d: CageDraw): void {
  const { ctx, x, y, inner, hoop, struts, left, metal, dark, burnt, glow, time, phase } = d;
  ctx.save();
  ctx.translate(x, y);

  // The orbit, faint, so the moons are seen to be on something.
  ctx.beginPath();
  const orbit = hoop * ORBIT;
  ctx.ellipse(0, 0, orbit, orbit * TILT, 0, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(metal, 0.3);
  ctx.lineWidth = STROKE.inner * 0.8;
  ctx.stroke();

  const theta = (time / TURN_SECONDS) * Math.PI * 2 + phase;
  // Far moons first, near ones over them, so a crossing reads the right way.
  const order = moonPins(struts)
    .map((p, i) => ({ f: facet(p, theta), i }))
    .sort((a, b) => a.f.sx - b.f.sx);
  for (const { f, i } of order) {
    const spent = i >= left;
    // Depth from the projection: `sx` is cos of the bearing, 1 at the front.
    const depth = (f.sx + 1) / 2;
    const mx = f.x * orbit;
    // The ring's vertical is the tilt: the near side below the body, the far
    // side above it.
    const my = f.sx * orbit * TILT;
    const r = inner * (FAR + (NEAR - FAR) * depth);
    if (spent) {
      ctx.beginPath();
      ctx.arc(mx, my, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(mixHex(SHADOW, burnt, 0.5), 0.5 + 0.4 * depth);
      ctx.fill();
      ctx.strokeStyle = rgba(burnt, 0.7);
      ctx.lineWidth = STROKE.inner * 0.8;
      ctx.stroke();
      continue;
    }
    // A lit ball: the key's side pale, the far side the body's dark.
    const lit = surfaceDim(FLOOR, 0.5 + 0.5 * depth);
    const fill = ctx.createRadialGradient(
      mx + KEY.x * r * 0.4,
      my + KEY.y * r * 0.4,
      r * 0.05,
      mx,
      my,
      r,
    );
    fill.addColorStop(0, mixHex(metal, SHEEN, 0.5 * lit));
    fill.addColorStop(0.7, metal);
    fill.addColorStop(1, dark);
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.globalAlpha = 0.55 + 0.45 * depth;
    ctx.fill();
    ctx.strokeStyle = rgba(metal, (0.3 + 0.4 * glow) * depth);
    ctx.lineWidth = STROKE.inner;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
