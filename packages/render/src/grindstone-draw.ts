import { LIGHT_HALF } from "@neon-spore/content";
import {
  GRINDSTONE_PADS,
  type GrindstoneState,
  grinding,
  grindstoneLitStep,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { coreHurt } from "./core-hurt.js";
import { strokeGlow } from "./glow.js";
import type { GrindstoneFx } from "./grindstone-fx.js";
import {
  drawGrindstoneAxle,
  drawGrindstoneFaceGlow,
  drawGrindstoneFlash,
  drawGrindstonePads,
} from "./grindstone-marks.js";
import {
  grindstoneArrived,
  grindstoneClear,
  grindstoneDepth,
  grindstoneFree,
  grindstoneLeft,
  grindstoneShut,
  grindstoneSpin,
} from "./grindstone-pose.js";
import {
  grindstoneAxleAt,
  grindstoneBolt,
  grindstoneCut,
  grindstoneFacePath,
  grindstoneJawPath,
  grindstoneJawTurn,
  grindstonePatchPath,
  grindstoneR,
  grindstoneWheelPath,
} from "./grindstone-shape.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/** How far the jaws are flung spinning free, in tiles, and how thin the wheel turns edge-on. */
const FLING = 2.2;
const EDGE_ON = 0.22;

/**
 * **THE GRINDSTONE**: a gritted wheel on an axle over the middle of the
 * field, each flat ground clean by its own seat, a caliper both seats bite
 * shut, and the lit axle shot (§11.50, `bosses-choreographed.md` §33).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role`: a flat and
 * a jaw are one seat's, but the other has to see which is lit to say so, and
 * a fire step's colour says which cannon answers.
 *
 * **Its health is read off the stone** — no bar: each flat cut deeper for
 * every pass, a patch of it ground clean as the grit comes off, the caliper
 * shut round it, and the axle smaller and brighter for every shot.
 *
 * What outlives a frame — a flat's flash as it comes clean, the caliper's
 * flare and thud, an axle hit's flash, the snap free's, the blow — is `fx`
 * (`grindstone-fx.ts`), told the axle's colour here because the event that
 * hits it does not carry one.
 */
export function drawGrindstone(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: GrindstoneState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: GrindstoneFx,
): void {
  const cfg = world.cfg;
  const arrived = grindstoneArrived(s, cfg, beat, beatPhase);
  const free = grindstoneFree(s, cfg, beat, beatPhase);
  const axle = grindstoneAxleAt(l, cfg, arrived, free);
  const alpha = (0.2 + 0.8 * arrived) * (1 - 0.8 * free);
  const step = grindstoneLitStep(s);
  const shut = grindstoneShut(world, s, beat, beatPhase);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(axle.x + fx.hurt.shakeX(time, l.tile), axle.y + fx.thud * l.tile);
  if (step?.ask === "fire") fx.tell(stepColour(step.color).rim);

  // The caliper first, behind the wheel it closes on; spinning free it is flung off both ways.
  const pads = step?.ask === "clamp";
  for (const side of [0, 1] as const) {
    ctx.save();
    const out = side === 0 ? -1 : 1;
    ctx.translate(out * FLING * free * l.tile, -FLING * 0.5 * free * l.tile);
    ctx.globalAlpha = alpha * (1 - free);
    GRINDSTONE_JAW.paint(
      ctx,
      l,
      side,
      shut,
      pads,
      s.padsDown[side],
      beatPhase,
      free,
      fx.flare,
      time,
    );
    ctx.restore();
  }

  // Edge-on as it falls: the flats the pair ground turn away and only the rim is left.
  ctx.scale(1 - (1 - EDGE_ON) * free, 1);
  const cuts: [number, number] = [
    grindstoneCut(l, grindstoneDepth(s, 0)),
    grindstoneCut(l, grindstoneDepth(s, 1)),
  ];
  const wheel = grindstoneWheelPath(l, grindstoneSpin(arrived, free), cuts);
  drawWheel(ctx, l, wheel, time, fx.hurt.value);
  const lit = grinding(s);
  for (const side of [0, 1] as const) {
    drawFlat(ctx, l, wheel, side, cuts[side], grindstoneClear(s, side));
    const face = grindstoneFacePath(l, side, cuts[side]);
    if (lit === side) drawGrindstoneFaceGlow(ctx, face, beatPhase);
    // A pass just ground clean flashes along its face in the bare stone's tan.
    if (fx.clean(side) > 0)
      strokeGlow(ctx, face, PALETTE.grindstoneFlat, STROKE.outline, fx.clean(side));
    ctx.globalAlpha = alpha;
  }

  const firing = step !== null && step.ask === "fire" && s.locked;
  const shot = firing
    ? { color: step.color, left: grindstoneLeft(world, s, beat, beatPhase) }
    : null;
  // A core's hurt, called: the axle is smaller and brighter per shot the same way a kernel is.
  const hurt = coreHurt(s.hits);
  drawGrindstoneAxle(ctx, l, hurt.size, hurt.bright, s.locked, shot, beatPhase);
  drawGrindstoneFlash(ctx, l, fx.flash, fx.free);
  ctx.restore();
}

/** THE SMART's stone, the key light on it, and the blow over it. */
function drawWheel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  wheel: Path2D,
  time: number,
  hurt: number,
): void {
  const r = grindstoneR(l);
  ctx.fillStyle = PALETTE.grindstoneStone;
  ctx.fill(wheel);
  ctx.save();
  ctx.clip(wheel);
  litRound(ctx, 0, -r * 0.15, r * 1.1, LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.5));
  ctx.restore();
  drawHurt(ctx, wheel, hurt);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.grindstoneStoneDark, 0.9);
  ctx.stroke(wheel);
}

/**
 * Flat `side`'s face: a band of grit along it, and the clean patch ground into
 * the grit, `clear` of the way open — THE RIME's patch, worn into grit
 * rather than wiped out of frost, and the bare stone under it the sandy tan of a
 * ground face.
 */
function drawFlat(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  wheel: Path2D,
  side: 0 | 1,
  cut: number,
  clear: number,
): void {
  const band = 0.34 * l.tile;
  const x = side === 0 ? -cut : cut - band;
  const grit = new Path2D();
  grit.rect(x, -grindstoneR(l), band, grindstoneR(l) * 2);
  ctx.save();
  ctx.clip(wheel);
  ctx.clip(grit);
  ctx.fillStyle = rgba(PALETTE.grindstoneStoneDark, 0.75);
  ctx.fill(grit);
  if (clear > 0) {
    const patch = grindstonePatchPath(l, side, cut, clear);
    ctx.fillStyle = PALETTE.grindstoneFlat;
    ctx.fill(patch);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.grindstoneStoneDark, 0.8);
    ctx.stroke(patch);
  }
  ctx.restore();
}

/** How a caliper jaw is drawn, as a record so a second answer can stand
 * beside it on VERSUS (`docs/versus.md`). `time` is the wall clock, which the
 * shipped jaw does not read. */
export const GRINDSTONE_JAW: { paint: GrindstoneJawPaint } = { paint: drawJaw };

export type GrindstoneJawPaint = (
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  shut: number,
  lit: boolean,
  down: number,
  beatPhase: number,
  free: number,
  flare: number,
  time: number,
) => void;

/** Jaw `side` of THE HOOD, swung out about the crown bolt as far as it is slack, its pads by its tip, flaring as it bites. */
export function drawJaw(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  shut: number,
  lit: boolean,
  down: number,
  beatPhase: number,
  free: number,
  flare: number,
): void {
  const bolt = grindstoneBolt(l, shut);
  ctx.translate(bolt.x, bolt.y);
  ctx.rotate(grindstoneJawTurn(side, shut) + (side === 0 ? -1 : 1) * free * 0.8);
  ctx.translate(-bolt.x, -bolt.y);
  const jaw = grindstoneJawPath(l, side, shut);
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(jaw);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.75);
  ctx.stroke(jaw);
  if (flare > 0) strokeGlow(ctx, jaw, PALETTE.hullRim, STROKE.inner, flare);
  const alpha = ctx.globalAlpha;
  drawGrindstonePads(ctx, l, side, GRINDSTONE_PADS, lit, down, shut, beatPhase);
  ctx.globalAlpha = alpha;
  const pin = new Path2D();
  pin.arc(bolt.x, bolt.y, 0.09 * l.tile, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.rock;
  ctx.fill(pin);
}
