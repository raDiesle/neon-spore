import { type FilamentState, filamentTiles, filamentTracing, type World } from "@neon-spore/sim";
import { hurtShake } from "./boss-hurt.js";
import type { FilamentFx } from "./filament-fx.js";
import { filamentHeart, type Heart } from "./filament-heart.js";
import { drawFilamentHeart } from "./filament-heart-look.js";
import { drawFilamentVerdicts } from "./filament-marks.js";
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
import { drawInstarWord } from "./instar-word.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsFilamentAhead, showsFilamentBehind } from "./view-role-clocks-b.js";

/**
 * **THE FILAMENT**: the inside of an alien — its heart over the top of the
 * field (`filament-heart.ts`), and one of its veins at a time hanging down the
 * field as a line of tiles, lit from its free end as far as player 1's thumb
 * has drawn it, dark past that, with a ring on the head for his thumb and his
 * rasp, and one on the tail for hers and her corona (§11.33).
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the heart and a vessel on its muscle for each vein still to go, the lead from the
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
  drawFilamentHeart(ctx, heart, strands, time, beatPhase, fade, hurt);
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
    drawArmed(ctx, l, s);
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
  drawFilamentVerdicts(ctx, l, s, fx.marks.verdicts);
  ctx.restore();
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

/**
 * The arm: the round's word beside the free end on both screens, before the
 * thumbs count. No ring stands on the end yet — nothing touched there is
 * heard until the trace opens (`marks-window.test.ts`).
 */
function drawArmed(ctx: CanvasRenderingContext2D, l: Layout, s: FilamentState): void {
  const c = filamentGrabCircle(l, s, 1);
  if (c === null) return;
  // The next filament is a new round, and says so on the end it starts from.
  const side = c.x < l.gridLeft + (l.cols * l.tile) / 2 ? -1 : 1;
  drawInstarWord(ctx, l, s.cursor > 0 ? "NEXT" : "READY", c.x + side * c.r * 1.6, c.y, side, true);
}
