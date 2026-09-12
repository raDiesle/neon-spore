import { openSmoothPath, type Point } from "@neon-spore/content";
import { hash01 } from "./backdrop.js";
import { seamY } from "./band-seam.js";
import { curve } from "./gland-tube.js";
import { rgba } from "./hex.js";
import type { SlimeDraw } from "./slime-look.js";

/**
 * Threads hanging from the band's roof, swaying, a drop at the end of some
 * of them — the one part of the POLYP candidate the owner took.
 *
 * `panel:band-skin` was decided on 12 September 2026 with the shipped skin
 * kept whole: *keep current in game, but add the tiny polyp hanging down from
 * the skin.* What hung from the skin on POLYP's side was this — filaments
 * off the membrane over each button and a few more across the band, each
 * with a bead at its tip — and it is drawn now over the seven pendants the
 * band already had rather than in their place (`slime-look.ts`). The stalks,
 * the coral cups and the cilia that were the rest of POLYP went with the
 * slot (`tools/versus/DECIDED.md`).
 *
 * One path for every thread, stroked twice, and one fill for every drop.
 */
export function filaments(d: SlimeDraw, perLobe: number): void {
  const { ctx, l, time, skin, lobes } = d;
  // Every thread is one `M…` run in the same string, and the string is one
  // Path2D: nine threads cost one allocation a frame rather than ten.
  const runs: string[] = [];
  const tips: Point[] = [];
  const hang = (x: number, seed: number, down: number) => {
    const top = seamY(l, x, time, lobes);
    const sway = Math.sin(time * 0.8 + seed) * l.tile * 0.12;
    const pts = curve(
      { x, y: top - l.tile * 0.2 },
      { x: x + sway, y: top + down },
      { x: x - sway * 0.4, y: top + down * 0.4 },
      { x: x + sway * 1.2, y: top + down * 0.8 },
      6,
    );
    runs.push(openSmoothPath(pts));
    if (hash01(seed) < 0.5) tips.push(pts[6] as Point);
  };
  for (const [i, c] of lobes.entries()) {
    for (let k = 0; k < perLobe; k++) {
      const u = (k + 0.5) / perLobe - 0.5;
      const x = c.x + u * c.r * 2.2;
      const room = c.y - c.r * 1.5 - seamY(l, x, time, lobes);
      hang(x, i * 7 + k * 3 + 1, Math.max(l.tile * 0.3, room * (0.55 + hash01(i * 3 + k) * 0.4)));
    }
  }
  for (let k = 0; k < 3; k++) {
    const x = l.width * ((k + 0.5) / 3 + (hash01(k * 17 + 5) - 0.5) * 0.15);
    hang(x, 40 + k, l.tile * (0.6 + hash01(k * 9 + 2) * 0.8));
  }
  const path = new Path2D(runs.join(" "));
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.flesh[0], 0.55);
  ctx.lineWidth = Math.max(1, l.tile * 0.05);
  ctx.stroke(path);
  ctx.strokeStyle = rgba(skin.rim, 0.25);
  ctx.lineWidth = Math.max(0.5, l.tile * 0.018);
  ctx.stroke(path);
  ctx.fillStyle = rgba(skin.tint, 0.8);
  ctx.beginPath();
  for (const t of tips) {
    ctx.moveTo(t.x + l.tile * 0.06, t.y);
    ctx.ellipse(t.x, t.y, l.tile * 0.06, l.tile * 0.08, 0, 0, Math.PI * 2);
  }
  ctx.fill();
}
