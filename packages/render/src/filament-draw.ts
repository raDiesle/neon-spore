import { circleSubpath } from "@neon-spore/content";
import { type FilamentState, filamentTiles, filamentTracing, type World } from "@neon-spore/sim";
import { drawHurt, hurtShake } from "./boss-hurt.js";
import type { FilamentFx } from "./filament-fx.js";
import {
  filamentHeart,
  filamentHeartPath,
  filamentHeartVessel,
  type Heart,
} from "./filament-heart.js";
import {
  filamentArmPhase,
  filamentFade,
  filamentGrabCircle,
  filamentLeadPath,
  filamentPullPhase,
  filamentRunPath,
  filamentStrands,
} from "./filament-shape.js";
import {
  drawFilamentPulled,
  drawFilamentResting,
  filamentStrike,
  struckHeart,
} from "./filament-strike.js";
import { drawFilamentTool } from "./filament-tools.js";
import { drawFilamentClock, drawFilamentOwn, drawFilamentTheirs } from "./filament-turn-draw.js";
import { drawFilamentVein } from "./filament-vein.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { drawInstarWord } from "./instar-word.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { showsFilamentAhead, showsFilamentBehind } from "./view-role-clocks-b.js";

/**
 * **THE FILAMENT**: the inside of an alien — its heart over the top of the
 * field (`filament-heart.ts`), and one of its veins at a time hanging down the
 * field as a line of tiles, lit from its free end as far as player 1's thumb
 * has drawn it, dark past that, with a ring on the head for his thumb and his
 * rasp, and one on the tail for hers and her corona (§11.33).
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the heart and a vessel on it for each vein still to go, the lead from the
 * root, the unlit path, the lit vein, the two tools, the two rings and their
 * words. Its health is the heart: a filament traced end to end slides up out
 * of the field and the heart is a vessel fewer and smaller; after the seventh
 * it fades over `filamentOutBeats`. What outlives a frame — the whip of a
 * snap, the dark of a gap, the jolt of a pull — is `effects.boss.filament`
 * (`filament-fx.ts`).
 *
 * **Each seat sees both thumbs; only the pilot sees the way ahead.** The
 * owner, 25 September 2026: *player 2 should more clearly see what player 1
 * is doing right now*. So the lit run and both rings are on every screen —
 * this screen's bright, green or red, the partner's dim with the waiting
 * clock — and the unlit path is still the pilot's alone, so which way the
 * line turns next is his to say (`view-role-clocks-b.ts`,
 * `filament-turn-draw.ts`). A pull is the pair's win and says so: the line
 * green as it slides out, both tools into the heart, the heart struck and
 * spitting them out onto the next vein's free end, the word over the field
 * and how many are left (`filament-strike.ts`); then the next vein grows
 * down from the heart on the pilot's screen, and `NEXT` on its free end.
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
  const strands = filamentStrands(s, cfg, beat, beatPhase);
  const pull = filamentPullPhase(s, cfg, beat, beatPhase);
  const strike = s.phase === "pull" ? filamentStrike(pull) : 0;
  const hurt = Math.max(fx.hurt.value, strike);
  const heart = struckHeart(filamentHeart(l, cfg, strands, beatPhase), strike);
  ctx.translate(hurtShake(hurt, time, l.tile), -fx.jolt * l.tile);
  drawHeart(ctx, heart, strands, time, fade, hurt);
  ctx.restore();
  if (filamentTiles(s) === null) return;
  const ahead = showsFilamentAhead(l.role);
  const behind = showsFilamentBehind(l.role);
  const own = [ahead, behind] as const;
  ctx.save();
  ctx.translate(fx.whip * l.tile * 0.25, 0);
  if (s.phase === "pull") drawFilamentPulled(ctx, l, s, heart, pull, own, time);
  else if (s.phase === "arm") {
    const arm = filamentArmPhase(s, cfg, beat, beatPhase);
    if (ahead) drawAhead(ctx, l, s, heart, fx.dark, arm);
    drawFilamentResting(ctx, l, s, own, time);
    drawArmed(ctx, l, s, arm, time);
  } else {
    if (ahead) drawAhead(ctx, l, s, heart, fx.dark, 1);
    if (filamentTracing(s)) {
      drawFilamentVein(ctx, l, s, fx.dark, time);
      drawFilamentTool(ctx, l, s, 2, behind, time);
      drawFilamentTool(ctx, l, s, 1, ahead, time);
      if (ahead) drawFilamentOwn(ctx, l, cfg, s, 1, beat, time);
      else drawFilamentTheirs(ctx, l, cfg, s, 1, time);
      if (behind) drawFilamentOwn(ctx, l, cfg, s, 2, beat, time);
      else drawFilamentTheirs(ctx, l, cfg, s, 2, time);
      drawFilamentClock(ctx, l, cfg, s, [1, 2], beat, beatPhase);
    }
  }
  ctx.restore();
}

/** A colour at the fade: the hex itself while the body hangs, so the frame tests can count it (`hive-draw.ts`). */
function faded(hex: string, fade: number, alpha = 1): string {
  return fade >= 1 && alpha >= 1 ? hex : rgba(hex, alpha * fade);
}

/** The heart: dark, rimmed in the sheen's warm end, a vessel on its face for each filament still to be traced. */
function drawHeart(
  ctx: CanvasRenderingContext2D,
  h: Heart,
  strands: number,
  time: number,
  fade: number,
  hurt: number,
): void {
  const p = filamentHeartPath(h, time);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(p);
  ctx.fillStyle = faded(PALETTE.sheenDeep, fade, 0.9);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.sheenWarm, fade), STROKE.inner, 0.6 * fade);
  drawHurt(ctx, p, hurt * fade);
  const n = Math.ceil(strands);
  for (let i = 0; i < n; i++) {
    const last = i === n - 1 ? strands - (n - 1) : 1;
    const vessel = splinePath(filamentHeartVessel(h, i, n, time), false);
    strokeGlow(ctx, vessel, faded(PALETTE.wisp, fade), STROKE.inner, 0.5 * last * fade);
  }
}

/**
 * Player 1's half: the lead from the root into the heart, and the whole vein
 * faint from root to end — grown down from the root over the arm, `grown`
 * of the way, so the new vein is seen appearing.
 */
function drawAhead(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FilamentState,
  heart: Heart,
  dark: number,
  grown: number,
): void {
  const tiles = filamentTiles(s);
  if (tiles === null) return;
  const last = tiles.length - 1;
  const path = filamentRunPath(l, s, Math.round((1 - grown) * last), last);
  ctx.save();
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = STROKE.inner;
  ctx.lineCap = "round";
  ctx.setLineDash([l.tile * 0.12, l.tile * 0.14]);
  ctx.globalAlpha = 0.5 * (1 - 0.6 * dark);
  if (path !== null) ctx.stroke(path);
  const lead = filamentLeadPath(l, s, heart);
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
  // The next filament is a new round, and says so on the end it starts from.
  const side = c.x < l.gridLeft + (l.cols * l.tile) / 2 ? -1 : 1;
  drawInstarWord(ctx, l, s.cursor > 0 ? "NEXT" : "READY", c.x + side * c.r * 1.6, c.y, side, true);
}
