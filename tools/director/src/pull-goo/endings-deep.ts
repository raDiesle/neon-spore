import { PALETTE, smoothstep } from "@neon-spore/render";
import { drop } from "./body.js";
import { cheer, type Ending, gone, greenAt, halo, intoPlace, paintDrop, wave } from "./ending.js";
import { GREEN } from "./moment.js";
import { clamp01, hash, mix } from "./noise.js";
import type { Scene } from "./scene.js";

/**
 * Two GOO endings that take the drop out of the field rather than across it:
 * WELL, a hole that opens in the floor with depth to it and the drop
 * dropping into it — the owner's *maybe 3d* — and FIZZ, the drop boiling
 * away into green bubbles that rise and pop.
 */

/** Where the bottom of the well lies from its mouth, as a share of its radius: down and right,
 * away from the light, so the lit wall is the far one. */
const DEPTH = { x: 0.18, y: 0.26 };

/** A hole in the field `R` wide: dark, its wall going down in rings, its lip lit. */
function hole(s: Scene, R: number, glow: number): void {
  if (R <= 0.5) return;
  const { ctx } = s;
  const { x, y } = s.place;
  ctx.save();
  ctx.fillStyle = "#03040A";
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.clip();
  // The wall: rings going down, each smaller and further off, fading into the dark.
  for (let i = 1; i <= 6; i++) {
    const d = i / 6;
    const rr = R * (1 - 0.13 * i);
    ctx.strokeStyle = PALETTE.good;
    ctx.globalAlpha = (0.45 + 0.4 * glow) * (1 - d) ** 1.5;
    ctx.lineWidth = Math.max(0.4, R * 0.05 * (1 - d));
    ctx.beginPath();
    ctx.arc(x + DEPTH.x * R * d * 2, y + DEPTH.y * R * d * 2, rr, 0, Math.PI * 2);
    ctx.stroke();
  }
  // The far wall takes the light from the top left; the near one is in shadow.
  const g = ctx.createLinearGradient(x - R, y - R, x + R, y + R);
  g.addColorStop(0, "rgba(0,0,0,0.75)");
  g.addColorStop(0.55, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.fillRect(x - R, y - R, R * 2, R * 2);
  ctx.restore();
  ctx.save();
  ctx.lineWidth = R * 0.1;
  ctx.strokeStyle = mix(PALETTE.good, "#FFFFFF", 0.35);
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(x, y, R, -Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
  ctx.strokeStyle = mix(PALETTE.good, "#000000", 0.4);
  ctx.beginPath();
  ctx.arc(x, y, R, Math.PI * 0.8, Math.PI * 1.8);
  ctx.stroke();
  ctx.restore();
}

export const WELL: Ending = {
  name: "well",
  sentence:
    "counted, the drop flashes green and a round hole opens in the floor under it, its wall going down in lit rings; the drop drops in, shrinking and darkening as it goes deep, a green glow comes back up, and the hole closes over it",
  play(s, e) {
    const u = gone(e);
    const open = smoothstep(clamp01((e - 0.1) / 0.22));
    const shut = smoothstep(clamp01((u - 0.78) / 0.22));
    const R = s.r * 1.4 * open * (1 - shut);
    const fall = smoothstep(clamp01((u - 0.05) / 0.6));
    hole(s, R, Math.sin(Math.PI * fall));
    if (e < GREEN) return cheer(s, e);
    halo(s, s.place, s.r * 2.4, 0.55 * Math.sin(Math.PI * clamp01(u / 0.85)));
    if (shut > 0) wave(s, s.place, shut, 0.7);
    if (fall >= 1 || R <= 0.5) return;
    const { ctx } = s;
    const near = 1 / (1 + 4 * fall);
    const at = {
      x: s.place.x + DEPTH.x * R * 2 * fall,
      y: s.place.y + DEPTH.y * R * 2 * fall,
    };
    ctx.save();
    // Below the lip the floor hides it: only what is over the mouth shows.
    if (fall > 0.02) {
      ctx.beginPath();
      ctx.arc(s.place.x, s.place.y, R, 0, Math.PI * 2);
      ctx.clip();
    }
    paintDrop(s, drop(at, s.r * near, { squash: 1 - 0.15 * fall }), 0.9, 1 - fall * 0.7);
    // Deep is dark: a veil over it as it goes down.
    ctx.globalAlpha = 0.7 * fall;
    ctx.fillStyle = "#03040A";
    ctx.beginPath();
    ctx.arc(at.x, at.y, s.r * near * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};

/** How many bubbles a drop boils away into. */
const BUBBLES = 16;
/** Seconds FIZZ takes from the count to nothing left. */
const FIZZ_SPAN = 0.75;

/**
 * FIZZ, the owner's pick of the five (10 October 2026), made quieter: *remove
 * the outer green border animation when successful, because i want it more
 * subtle* — no ring rolls out of it — and *to switch to disappear with fizz
 * should be instant when on right position* — no green moment held first: it
 * turns green as it starts to boil, the moment it is counted.
 */
export const FIZZ: Ending = {
  name: "fizz",
  sentence:
    "counted, the drop turns green and at once boils away where it was: it shrinks as sixteen green bubbles rise off it and pop, and nothing is left",
  play(s, e) {
    const u = clamp01(e / FIZZ_SPAN);
    const left = (1 - u) ** 1.3;
    halo(s, s.place, s.r * 1.8, 0.25 * left);
    if (left > 0.04)
      paintDrop(
        s,
        drop(intoPlace(s, e), s.r * left, { shake: 0.25 * u }),
        greenAt(e),
        0.4 + 0.6 * left,
      );
    const { ctx } = s;
    ctx.save();
    ctx.strokeStyle = mix(PALETTE.good, "#FFFFFF", 0.35);
    ctx.fillStyle = PALETTE.good;
    for (let i = 0; i < BUBBLES; i++) {
      const born = hash(i * 2.7) ** 1.5 * 0.55;
      const life = 0.3 + 0.15 * hash(i * 5.1);
      const k = (u - born) / life;
      if (k <= 0 || k >= 1) continue;
      const a = hash(i * 3.9) * Math.PI * 2;
      const d = s.r * left * 0.9;
      const x = s.place.x + Math.cos(a) * d + Math.sin(k * 6 + i) * s.r * 0.15;
      const y = s.place.y + Math.sin(a) * d * 0.6 - k * s.r * 2.4;
      const size = s.r * (0.1 + 0.16 * hash(i * 6.6)) * (0.6 + 0.6 * k);
      ctx.lineWidth = Math.max(0.4, size * 0.25);
      if (k < 0.82) {
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.95;
        ctx.stroke();
      } else {
        // The pop: a small ring, a little wider, and gone.
        const p = (k - 0.82) / 0.18;
        ctx.globalAlpha = 0.8 * (1 - p) ** 2;
        ctx.beginPath();
        ctx.arc(x, y, size * (1 + 0.5 * p), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },
};
