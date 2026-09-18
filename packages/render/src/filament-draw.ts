import { circleSubpath } from "@neon-spore/content";
import {
  type FilamentState,
  filamentTiles,
  filamentTracing,
  NO_GRAB,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import type { FilamentFx } from "./filament-fx.js";
import {
  filamentArmPhase,
  filamentBodyPath,
  filamentFade,
  filamentGrabCircle,
  filamentLeadPath,
  filamentPullPhase,
  filamentPullRise,
  filamentRunPath,
  filamentStrandInBody,
  filamentStrands,
} from "./filament-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { drawInstarWord } from "./instar-word.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { showsFilamentAhead, showsFilamentBehind } from "./view-role-clocks-b.js";

/**
 * **THE FILAMENT**: a body over the top of the field made of loose
 * filaments the way a nerve is a bundle, one of them hanging down the field
 * as a line of tiles at a time — lit from its free end as far as the pilot's
 * thumb has drawn it, dark past that — with a ring on the head for his thumb
 * and one on the tail for hers (§11.33).
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the body and the strands still in it, the lead from the root, the unlit
 * path, the lit run, the two rings and their words. Its health is the
 * bundle: a filament traced end to end slides up out of the field and the
 * body is a strand narrower; after the seventh it fades over
 * `filamentOutBeats`. What outlives a frame — the whip of a snap, the dark
 * of a gap, the jolt of a pull — is `effects.boss.filament`
 * (`filament-fx.ts`).
 *
 * **Each seat is shown one distance.** The pilot the path ahead and his own
 * thumb, the navigator the lit run behind and hers; the gap between the two
 * is on neither screen (`view-role-clocks-b.ts`).
 */
export function drawFilament(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: FilamentState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: FilamentFx,
): void {
  const cfg = world.cfg;
  const fade = filamentFade(s, cfg, beat, beatPhase);
  if (fade <= 0) return;
  fx.place(l, s);
  ctx.save();
  ctx.translate(0, -fx.jolt * l.tile);
  drawBody(ctx, l, cfg, filamentStrands(s, cfg, beat, beatPhase), time, fade);
  ctx.restore();
  if (filamentTiles(s) === null) return;
  const ahead = showsFilamentAhead(l.role);
  const behind = showsFilamentBehind(l.role);
  const pull = filamentPullPhase(s, cfg, beat, beatPhase);
  ctx.save();
  ctx.translate(fx.whip * l.tile * 0.25, 0);
  if (s.phase === "pull") drawPulled(ctx, l, s, pull);
  else {
    if (ahead) drawAhead(ctx, l, cfg, s, fx.dark);
    if (s.phase === "arm") drawArmed(ctx, l, s, filamentArmPhase(s, cfg, beat, beatPhase), time);
    else if (filamentTracing(s)) drawTrace(ctx, l, s, ahead, behind, fx.dark, time);
  }
  ctx.restore();
}

/** A colour at the fade: the hex itself while the body hangs, so the frame tests can count it (`hive-draw.ts`). */
function faded(hex: string, fade: number, alpha = 1): string {
  return fade >= 1 && alpha >= 1 ? hex : rgba(hex, alpha * fade);
}

/** The body: a dark bundle rimmed in the sheen, a strand in it a filament still to be drawn. */
function drawBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  strands: number,
  time: number,
  fade: number,
): void {
  const p = filamentBodyPath(l, cfg, strands, time);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(p);
  ctx.fillStyle = faded(PALETTE.sheenDeep, fade, 0.9);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.sheenRim, fade), STROKE.inner, 0.45 * fade);
  const n = Math.ceil(strands);
  for (let i = 0; i < n; i++) {
    const last = i === n - 1 ? strands - (n - 1) : 1;
    const strand = splinePath(filamentStrandInBody(l, cfg, strands, i, time), false);
    strokeGlow(ctx, strand, faded(PALETTE.wisp, fade), STROKE.inner, 0.5 * last * fade);
  }
}

/** The pilot's half: the whole filament faint from end to root, and the lead from the root up into the body. */
function drawAhead(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: FilamentState,
  dark: number,
): void {
  const tiles = filamentTiles(s);
  if (tiles === null) return;
  const path = filamentRunPath(l, s, 0, tiles.length - 1);
  ctx.save();
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = STROKE.inner;
  ctx.lineCap = "round";
  ctx.setLineDash([l.tile * 0.12, l.tile * 0.14]);
  ctx.globalAlpha = 0.5 * (1 - 0.6 * dark);
  if (path !== null) ctx.stroke(path);
  const lead = filamentLeadPath(l, cfg, s);
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.3;
  if (lead !== null) ctx.stroke(lead);
  ctx.restore();
}

/** The arm: the free end pulsing up on both screens, a tile lit and nothing else, before the thumbs count. */
function drawArmed(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FilamentState,
  arm: number,
  time: number,
): void {
  const c = filamentGrabCircle(l, s, 1);
  if (c === null) return;
  const pulse = 0.6 + 0.4 * Math.sin(time * 9) * arm;
  const p = new Path2D(circleSubpath(c.x, c.y, c.r * (0.5 + 0.5 * arm)));
  strokeGlow(ctx, p, PALETTE.wispRim, STROKE.outline, pulse);
}

/**
 * The trace: the lit run from the free end, as far as this screen is shown
 * it — to the head for the pilot, to the tile past the tail for the
 * navigator — and the ring of the thumb this screen owns, with its word.
 */
function drawTrace(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FilamentState,
  ahead: boolean,
  behind: boolean,
  dark: number,
  time: number,
): void {
  const litTo = ahead ? s.head : Math.min(s.tail + 1, s.head);
  const lit = filamentRunPath(l, s, 0, litTo);
  if (lit !== null) {
    strokeGlow(ctx, lit, PALETTE.wispRim, STROKE.outline, 1 - 0.7 * dark);
  }
  // A ring is drawn only on the screen whose thumb it wants, so it is always
  // that screen's own — bright, with its verb — unlike THE INSTAR's marks.
  if (ahead) drawRing(ctx, l, s, 1, "DRAW", s.grab[0] !== NO_GRAB, time);
  if (behind) drawRing(ctx, l, s, 2, "FOLLOW", s.grab[1] !== NO_GRAB, time);
}

/** A thumb's ring: red, breathing until the thumb lands, the word for its verb beside it — never a sentence (`docs/decisions.md` #34). */
function drawRing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FilamentState,
  seat: 1 | 2,
  word: string,
  held: boolean,
  time: number,
): void {
  const c = filamentGrabCircle(l, s, seat);
  if (c === null) return;
  const breathe = held ? 1 : 1 + 0.08 * Math.sin(time * 4);
  const p = new Path2D(circleSubpath(c.x, c.y, c.r * breathe));
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(p);
  ctx.fillStyle = PALETTE.red;
  ctx.globalAlpha = held ? 0.55 : 0.22;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, held ? PALETTE.redRim : PALETTE.red, STROKE.inner, held ? 1.2 : 0.9);
  // Beside the ring, on the side away from the field's middle.
  const side = c.x < l.gridLeft + (l.cols * l.tile) / 2 ? -1 : 1;
  drawInstarWord(ctx, l, word, c.x + side * c.r * 1.6, c.y, side, true);
}

/** The pull: the whole filament lit, sliding up into the body and going as it does. */
function drawPulled(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FilamentState,
  pull: number,
): void {
  const tiles = filamentTiles(s);
  if (tiles === null) return;
  const path = filamentRunPath(l, s, 0, tiles.length - 1, filamentPullRise(pull));
  if (path === null) return;
  strokeGlow(ctx, path, rgba(PALETTE.wispRim, 1 - pull), STROKE.outline, 1.2 * (1 - pull));
}
