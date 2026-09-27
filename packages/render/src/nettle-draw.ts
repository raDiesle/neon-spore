import type { NettleState, World } from "@neon-spore/sim";
import { drawInstarMarks } from "./instar-marks.js";
import { instarAt, instarLen } from "./instar-place.js";
import { instarFade } from "./instar-shape.js";
import type { Layout } from "./layout.js";
import { drawNettleBody } from "./nettle-body.js";
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
 * **Unlike THE INSTAR, nothing here outlives a frame.** THE NETTLE's marks
 * stand at the script's own places on the field, never on a part of the
 * body, so there is no jolt, no flinch, no strike to settle over the frames
 * after — the strikes of an undone part, and the death, are lane three's
 * own later work, not this one's. `drawInstarMarks` is handed a no-op
 * `verdicts` in place of an `InstarFx`'s.
 */
export function drawNettle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: NettleState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const cfg = world.cfg;
  const fade = instarFade(s, cfg, beat, beatPhase);
  if (fade <= 0) return;
  const { f, sway } = nettleBody(s, cfg, beat, beatPhase);
  const center = instarAt(l, f.bellX, f.bellY);
  const r = instarLen(l, f.bellR);
  drawNettleBody(ctx, center.x, center.y, r, f, time, fade);
  drawInstarMarks(ctx, l, world, s, sway, beat, beatPhase, time, l.role, { at: () => null });
}
