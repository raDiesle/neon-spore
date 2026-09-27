import type { NettleState, World } from "@neon-spore/sim";
import { drawInstarMarks } from "./instar-marks.js";
import { instarAt, instarLen } from "./instar-place.js";
import { instarFade, instarThreat } from "./instar-shape.js";
import type { Layout } from "./layout.js";
import { drawNettleBody } from "./nettle-body.js";
import type { NettleFx } from "./nettle-fx.js";
import { nettleBody } from "./nettle-sway.js";

/**
 * **THE NETTLE**: a jellyfish the size of the field (§11.39,
 * `docs/spec/bosses.md`). It drifts in bell-first, stings, tips back to
 * stare down the ship, swells its brood sac, then turns — the crown of the
 * bell gone, the underside bared — to gape its iris, spit its globs and let
 * the oral-arm curtain down, before opening the bell itself to bare and burn
 * the core (`packages/content/src/nettle-script.ts`).
 *
 * A pose is a `Figure` and a morph the eased lerp between two of them, the
 * same engine THE INSTAR's own body runs on (`nettle-figure.ts`,
 * `nettle-poses.ts`); the pulse it carries is its own, a bell's squeeze and
 * release rather than a flier's weave (`nettle-sway.ts`). The turn from
 * crown to underside is the crossfade by `f.side` (`nettle-body.ts`), the
 * same trick as THE INSTAR's front and profile.
 *
 * **What outlives a frame is `NettleFx`'s** (`nettle-fx.ts`): the bell is
 * lifted by its jolt, shivered by its flinch and shaken and reddened by its
 * hurt, and the marks wash with its verdicts. The marks stay where the
 * script planted them — a thumb reaching for one is not shaken with the
 * bell — and the strike and the death are drawn with the other boss
 * transients, under the hull (`effects-boss.ts`).
 */
export function drawNettle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: NettleState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: NettleFx,
): void {
  const cfg = world.cfg;
  const fade = instarFade(s, cfg, beat, beatPhase);
  if (fade <= 0) return;
  const { f, sway } = nettleBody(s, cfg, beat, beatPhase);
  const center = instarAt(l, f.bellX, f.bellY);
  const r = instarLen(l, f.bellR);
  const shake = fx.flinch * l.tile * 0.25 * Math.sin(time * 40) + fx.hurt.shakeX(time, l.tile);
  const x = center.x + shake;
  const y = center.y - fx.jolt * l.tile;
  drawNettleBody(ctx, x, y, r, f, time, fade, fx.hurt.value);
  fx.place(l, s, sway, instarThreat(s, beat, beatPhase), { x, y }, r);
  drawInstarMarks(ctx, l, world, s, sway, beat, beatPhase, time, l.role, fx.verdicts);
}
