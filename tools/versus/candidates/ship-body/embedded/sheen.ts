import { openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { SheenPass } from "../../../../../packages/render/src/hull-sheen.js";
import { bloom, dither, innerLight } from "../../../../../packages/render/src/sheen.js";

/**
 * EMBEDDED's skin: the top of one body. It keeps the ship's bioluminescence
 * and lit rim and adds the same broad folds the chamber carries, so the flesh
 * above the membrane and the flesh below it are one material at one scale.
 */
export function skinFolds(s: SheenPass): void {
  const { ctx, l, time, body, filled, skinY, skin } = s;
  bloom(ctx, l, time, skinY);
  let folds = "";
  let lit = "";
  for (let i = 0; i < 3; i++) {
    const pts: Point[] = [];
    for (let k = 0; k <= 10; k++) {
      const u = k / 10;
      const x = -l.tile + (l.width + l.tile * 2) * u;
      pts.push({
        x,
        y:
          skinY(x) +
          l.tile * (0.45 + i * 0.4) +
          Math.sin(u * 4.1 + i * 1.3 + time * 0.12) * l.tile * 0.14 +
          (hash01(i * 11 + 3) - 0.5) * l.tile * 0.1,
      });
    }
    folds += openSmoothPath(pts);
    lit += openSmoothPath(pts.map((p) => ({ x: p.x, y: p.y - l.tile * 0.12 })));
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.body[3], 0.45);
  ctx.lineWidth = l.tile * 0.26;
  ctx.stroke(new Path2D(folds));
  ctx.strokeStyle = rgba(skin.body[0], 0.14);
  ctx.lineWidth = Math.max(1, l.tile * 0.035);
  ctx.stroke(new Path2D(lit));
  innerLight(ctx, body);
  dither(ctx, filled);
}
