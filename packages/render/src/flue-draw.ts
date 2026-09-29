import { LIGHT_HALF } from "@neon-spore/content";
import {
  type FlueState,
  flueLitStep,
  flueSteady,
  flueTapper,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { coreHurt } from "./core-hurt.js";
import type { FlueFx } from "./flue-fx.js";
import {
  drawFlueFlash,
  drawFlueLapse,
  drawFlueSlotGlow,
  drawFlueTapRing,
  drawFlueTapStuds,
  drawFlueTick,
  drawFlueVents,
  FLUE_ENDS,
} from "./flue-marks.js";
import {
  flueArrived,
  flueDamperOpen,
  flueEmberDrawn,
  flueLeft,
  flueSmear,
  flueSpent,
} from "./flue-pose.js";
import {
  FLUE_DAMPER,
  FLUE_UNITS,
  flueCentre,
  flueCoreR,
  flueDamperAt,
  flueEmberAt,
  flueEmberR,
  flueSlotPath,
  flueUnitAt,
  flueUnitPath,
  flueUnitR,
  type Point,
} from "./flue-shape.js";
import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";
import { showsFlueHand } from "./view-role-clocks-c.js";

/** How far above its place the flue starts as it slides in, in tiles. */
const ARRIVE = 3;

/**
 * **THE FLUE**: a slotted exhaust flue laid across the middle of the field,
 * an ember drifting along its slot on its own that stops dead only while one
 * seat sends nothing and is tapped three times by the other while it stays
 * stopped; then a core bared under a damper that climbs back shut unless
 * both hands keep off it, and shot (§11.57, `bosses-choreographed.md` §40).
 *
 * **Both screens are drawn the same body.** The flue, the ember and the
 * damper are on both, because the still seat has to watch the ember stop to
 * know its stillness is counting; only the tap ring differs, full for the
 * seat that taps and faint for the other (`showsFlueHand`).
 *
 * **Its health is read off the body** — no bar: three studs light over the
 * damper as a vent's taps land, an end unit's notch lights for each vent
 * spent, the damper drops clear once both are, and the core is smaller and
 * brighter for every shot. **The tell is the ember's smear**, gone the
 * instant it steadies (`flue-pose.ts`). Everything here is read off `world`
 * each frame but what outlives one — a tap's tick, a lapse's flash, a notch's flare, the
 * damper's thud, the core's flash, the red of a blow landed and its shake —
 * which is `fx` (`flue-fx.ts`); the blow at the hull is `flue-blow.ts`.
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
  ctx.save();
  ctx.globalAlpha = 1 - 0.5 * flueSpent(s, cfg, beat, beatPhase);
  const arrive = -(1 - flueArrived(s, cfg, beat, beatPhase)) * ARRIVE * l.tile;
  ctx.translate(fx.hurt.shakeX(time, l.tile), arrive);

  const open = flueDamperOpen(s, cfg, beat, beatPhase);
  const hurt = fx.hurt.value;
  for (let k = 0; k < FLUE_UNITS; k++) {
    if (k !== FLUE_DAMPER) drawUnit(ctx, l, k, flueUnitAt(l, cfg, k), hurt);
  }
  drawCore(ctx, l, cfg, s, beat, beatPhase, open, fx);
  const damper = flueDamperAt(l, cfg, open);
  drawUnit(ctx, l, FLUE_DAMPER, { x: damper.x, y: damper.y + fx.thud * l.tile }, hurt);

  const slot = flueSlotPath(l, cfg);
  ctx.fillStyle = PALETTE.flueSlot;
  ctx.fill(slot);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.flueSootDark, 0.9);
  ctx.stroke(slot);
  const step = flueLitStep(s);
  if (step?.ask === "vent") drawFlueSlotGlow(ctx, slot, beatPhase);

  drawEmber(ctx, l, world, s, beatPhase);
  drawFlueLapse(ctx, l, flueEmberAt(l, cfg, flueEmberDrawn(world, s, beatPhase)), fx.lapse);
  if (flueSteady(world, s)) {
    const tapper = flueTapper(s);
    const full = tapper !== null && showsFlueHand(l.role, tapper);
    const at = flueEmberAt(l, cfg, s.emberMilli);
    drawFlueTapRing(ctx, l, at, flueLeft(s, beat, beatPhase), full, beatPhase);
    drawFlueTick(ctx, l, at, fx.tick);
  }
  if (step?.ask === "vent") drawFlueTapStuds(ctx, l, centre, s.taps);
  const ends = [flueUnitAt(l, cfg, FLUE_ENDS[0]), flueUnitAt(l, cfg, FLUE_ENDS[1])] as const;
  drawFlueVents(ctx, l, ends, s.vents, (i) => fx.flare(i));
  ctx.restore();
}

/** Unit `k` at `at`: soot, lit from the key, its seams in the dark soot, red with a blow landed. */
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
  ctx.save();
  ctx.clip(unit);
  const r = flueUnitR(l);
  litRound(ctx, -0.15 * r, -0.25 * r, r, LIGHT_HALF.creature);
  ctx.restore();
  drawHurt(ctx, unit, hurt);
  ctx.lineWidth = STROKE.outline;
  ctx.lineJoin = "round";
  ctx.strokeStyle = rgba(PALETTE.flueSootDark, 0.95);
  ctx.stroke(unit);
  ctx.restore();
}

/**
 * The ember in its slot: a small steady glow in the rim's warm white, with a
 * smear trailing behind it the way it goes while it drifts, and none once it
 * is steady. Spent, it is still and dimmed.
 */
function drawEmber(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: FlueState,
  beatPhase: number,
): void {
  const cfg = world.cfg;
  const milli = flueEmberDrawn(world, s, beatPhase);
  const at = flueEmberAt(l, cfg, milli);
  const r = flueEmberR(l);
  const smear = flueSmear(world, s);
  if (smear > 0) {
    const tail = flueEmberAt(l, cfg, milli - s.emberDir * smear);
    const g = ctx.createLinearGradient(tail.x, tail.y, at.x, at.y);
    g.addColorStop(0, rgba(PALETTE.hullRim, 0));
    g.addColorStop(1, rgba(PALETTE.hullRim, 0.6));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(tail.x, tail.y);
    ctx.lineTo(at.x, at.y - r * 0.8);
    ctx.lineTo(at.x, at.y + r * 0.8);
    ctx.closePath();
    ctx.fill();
  }
  const dim = s.phase === "spent" ? 0.45 : 1;
  const ember = new Path2D();
  ember.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.hullRim, dim);
  ctx.fill(ember);
  strokeGlowFaded(ctx, ember, PALETTE.hullRim, STROKE.inner, dim, 0.9);
}

/**
 * The core in the damper's place in the row: dull while no shot is owed and lit in the
 * step's colour while one is, smaller and brighter for every hit, with a
 * ring closing as the fire step's beats run out, and a hit's flash over it.
 * Drawn only while the damper is some way open — shut, it is not there to see.
 */
function drawCore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: FlueState,
  beat: number,
  beatPhase: number,
  open: number,
  fx: FlueFx,
): void {
  if (open <= 0) return;
  const at = flueUnitAt(l, cfg, FLUE_DAMPER);
  drawCoreFace(ctx, l, s, beat, beatPhase, at, fx);
  drawFlueFlash(ctx, l, at, fx.flash);
}

function drawCoreFace(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FlueState,
  beat: number,
  beatPhase: number,
  at: Point,
  fx: FlueFx,
): void {
  const hurt = coreHurt(s.hits);
  const r = flueCoreR(l) * hurt.size;
  const face = new Path2D();
  face.arc(at.x, at.y, r, 0, Math.PI * 2);
  const step = flueLitStep(s);
  if (step?.ask !== "fire" || !s.bared) {
    ctx.fillStyle = PALETTE.flueCore;
    ctx.fill(face);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.flueSootDark, 0.9);
    ctx.stroke(face);
    return;
  }
  const { body, rim } = stepColour(step.color);
  fx.tell(rim);
  ctx.fillStyle = rgba(body, hurt.bright * (0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2)));
  ctx.fill(face);
  strokeGlowFaded(ctx, face, rim, STROKE.inner, 0.8 + hurt.bright);
  const ring = new Path2D();
  const left = flueLeft(s, beat, beatPhase);
  ring.arc(at.x, at.y, r * 1.6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  strokeGlowFaded(ctx, ring, body, STROKE.outline, 1);
}
