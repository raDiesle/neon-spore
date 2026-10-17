import { bendAbout, during } from "./blister-bend.js";
import type { BlisterDying } from "./blister-death.js";
import { smoothstep } from "./ease.js";

/**
 * SLIDE: pressed flat, then pulled off. The press squashes the body down to a
 * disc on its pore; the pull slides the disc out along the channel the pull
 * was drawn in, whole and rigid, to the end of it — where it tips over the
 * edge and drops away.
 */
export function drawSlide(d: BlisterDying): void {
  const { ctx, x, y, poreY, way } = d;
  const flat = smoothstep(during(d.at, 0, 0.22));
  const slide = smoothstep(during(d.at, 0.22, 0.7));
  const drop = during(d.at, 0.65, 1);
  const reach = d.tile * 1.6;
  const dx = way.dx * reach * slide;
  const dy = way.dy * reach * slide + d.r * 3 * drop * drop;
  const tip = (way.dx !== 0 ? way.dx : 1) * 1.4 * smoothstep(drop * 1.5);
  ctx.save();
  ctx.globalAlpha *= 1 - during(d.at, 0.8, 1);
  d.body(1, bendAbout(x, poreY, { sx: 1 + 0.35 * flat, sy: 1 - 0.7 * flat, dx, dy, turn: tip }));
  ctx.restore();
  // The channel stays where it was drawn; the press flattens with the body.
  d.control(
    1 - during(d.at, 0.6, 0.9),
    slide > 0 ? undefined : bendAbout(x, y, { sy: 1 - 0.6 * flat }),
  );
}
