import { type FlueState, flueLitLevel, flueShownLevel, type World } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { drawFlueCard } from "./flue-card.js";
import type { FlueFx } from "./flue-fx.js";
import {
  drawFlueEmber,
  drawFlueFlash,
  drawFlueLevels,
  drawFlueShots,
  drawFlueSight,
  drawFlueSlotGlow,
} from "./flue-marks.js";
import { flueArrived, flueSpent } from "./flue-pose.js";
import { drawFlueScale } from "./flue-scale.js";
import {
  flueCentre,
  flueEmberAt,
  flueSightAt,
  flueSlotPath,
  flueUnitAt,
  flueUnitPath,
  flueUnits,
  type Point,
} from "./flue-shape.js";
import { drawFlueMarkFeedback } from "./flue-verdicts.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsFlueEmber } from "./view-role-clocks-c.js";

/** How far above its place the flue starts as it slides in, in tiles. */
const ARRIVE = 3;

/**
 * **THE FLUE**: a slotted flue laid across the top of the field, an ember
 * running along its slot end to end and back, and a sight on it over the
 * cannon held still under the middle column (§11.57, the owner's rework of
 * 5 October 2026).
 *
 * **The split is the ember.** The pilot's screen is drawn it and the
 * navigator's is not (`showsFlueEmber`): the navigator has the trigger and
 * has to be told when. Everything else is on both — the sight in the colour
 * the level asks, with the beam's bar through it on a beam level, the shots
 * left under it, and a stud for every level over the flue, lit as each is
 * cleared: the flue's health, read off the body. Under the slot a scale
 * counts the beats the ember has left to the sight (`flue-scale.ts`), and over
 * the flue's left end a card names the weapon and THE SLOW (`flue-card.ts`).
 *
 * **It is drawn flat**: the units are soot with a dark outline and nothing
 * lighting them, and THE SLOW's colour split stands round the whole flue
 * rather than splitting it (`slow-boss-aim-d.ts`) — the owner, 5 October
 * 2026, so the sight's green and red can be seen. What outlives a frame — a
 * hit's flash, a stud's flare, the red of a blow landed and its shake — is
 * `fx` (`flue-fx.ts`); the blow at the hull is `flue-blow.ts`.
 */
export function drawFlue(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: FlueState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: FlueFx,
): void {
  const cfg = world.cfg;
  const centre = flueCentre(l, cfg);
  const fade = 1 - 0.5 * flueSpent(s, cfg, beat, beatPhase);
  ctx.save();
  ctx.globalAlpha = fade;
  const arrive = -(1 - flueArrived(s, cfg, beat, beatPhase)) * ARRIVE * l.tile;
  ctx.translate(fx.hurt.shakeX(time, l.tile), arrive);

  const hurt = fx.hurt.value;
  for (let k = 0; k < flueUnits(cfg); k++) drawUnit(ctx, l, k, flueUnitAt(l, cfg, k), hurt);
  const slot = flueSlotPath(l, cfg);
  ctx.fillStyle = PALETTE.flueSlot;
  ctx.fill(slot);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.flueSootDark, 0.9);
  ctx.stroke(slot);
  const lit = flueLitLevel(s) !== null;
  if (lit) drawFlueSlotGlow(ctx, slot, beatPhase);

  const sight = flueSightAt(l, cfg);
  const level = flueShownLevel(s);
  if (level !== null) {
    drawFlueScale(ctx, l, cfg, level, lit);
    drawFlueSight(ctx, l, sight, level, lit, beatPhase);
    drawFlueShots(ctx, l, sight, s.shots, cfg.flueShots);
    drawFlueCard(ctx, l, centre.y, level, lit);
  }
  drawFlueLevels(ctx, l, centre, s.hits, s.levels.length, fx.flare);
  if (showsFlueEmber(l.role)) {
    const dim = s.phase === "spent" ? 0.45 : 1;
    drawFlueEmber(ctx, l, flueEmberAt(l, cfg, s.emberMilli), dim);
  }
  drawFlueFlash(ctx, l, sight, fx.flash);
  drawFlueMarkFeedback(ctx, l, world, s, beat, beatPhase, time, fx.verdicts);
  ctx.restore();
}

/** Unit `k` at `at`: flat soot with its seams in the dark soot, red with a blow landed. */
function drawUnit(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  k: number,
  at: Point,
  hurt: number,
): void {
  ctx.save();
  ctx.translate(at.x, at.y);
  const unit = flueUnitPath(l, k);
  ctx.fillStyle = PALETTE.flueSoot;
  ctx.fill(unit);
  drawHurt(ctx, unit, hurt);
  ctx.lineWidth = STROKE.outline;
  ctx.lineJoin = "round";
  ctx.strokeStyle = rgba(PALETTE.flueSootDark, 0.95);
  ctx.stroke(unit);
  ctx.restore();
}
