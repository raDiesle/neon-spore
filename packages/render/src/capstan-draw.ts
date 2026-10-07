import { LIGHT_HALF } from "@neon-spore/content";
import {
  type CapstanState,
  capstanBand,
  capstanFace,
  capstanLitStep,
  type World,
} from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { drawHurt } from "./boss-hurt.js";
import type { CapstanFx } from "./capstan-fx.js";
import {
  drawCapstanCore,
  drawCapstanFace,
  drawCapstanFlash,
  drawCapstanHorn,
} from "./capstan-marks.js";
import {
  capstanArrived,
  capstanCover,
  capstanGone,
  capstanLeft,
  capstanShake,
  capstanTurn,
  capstanWorn,
} from "./capstan-pose.js";
import {
  capstanAt,
  capstanBodyPath,
  capstanCradlePath,
  capstanFaceAt,
  capstanFaceWidth,
  capstanPivot,
  capstanRoll,
  capstanSize,
  capstanSqueeze,
} from "./capstan-shape.js";
import { capstanStopper } from "./capstan-stop.js";
import { drawCapstanMarkFeedback } from "./capstan-verdicts.js";
import { coreHurt } from "./core-hurt.js";
import { seatIsMine } from "./handle-word.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

// How lit the lean's mark is on a hold, which either way answers: less than a
// band's one way, and still plain to read.
const EITHER = 0.75;

const SIDES = [0, 1] as const;

/**
 * **THE CAPSTAN**: a squat rusted drum over the middle column, laid on its
 * side in a cradle that rocks one end or the other round toward the pair, a
 * grated band on each end face, and a core under a cap in the drum's middle
 * (§11.54, `bosses-choreographed.md` §37).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role`: which
 * seat steers is the step's, and each has to see the cradle go over and the
 * band come round to say *more* or *hold it there*.
 *
 * **Its health is read off the ends and the core** — no bar: each band's
 * marks scrubbed bright one reversal at a time and its rim turning a tooth
 * with each, and the core smaller and brighter for every shot. **The turn is
 * the lean**: the drum yaws with the cradle's roll, so the face the pair has
 * been rubbing goes behind the drum and the other comes round
 * (`capstan-shape.ts`). Everything here is read off `world` each frame but
 * what outlives one — a reversal's scrub, a bright band's ring, a window's
 * thud, the core's flash and the blow the drum takes — which is `fx`
 * (`capstan-fx.ts`), told the core's colour here.
 */
export function drawCapstan(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: CapstanState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: CapstanFx,
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  const arrived = capstanArrived(s, cfg, beat, beatPhase);
  const gone = capstanGone(s, cfg, beat, beatPhase);
  const at = capstanAt(l, cfg, arrived);
  const pivot = capstanPivot(l);
  const turn = capstanTurn(world, s);
  const step = capstanLitStep(s);
  if (step?.ask === "fire") fx.tell(stepColour(step.color).rim);
  const shook = { x: at.x + fx.hurt.shakeX(time, l.tile), y: at.y };
  const shake = capstanShake(l, world, s, beat, beatPhase, time);
  const place = { at: shook, lift: gone * l.tile, thud: fx.thud * l.tile, turn, shake };
  stops?.aim(capstanStopper(l, world, s, place));

  const fade = (0.2 + 0.8 * arrived) * (1 - gone);
  ctx.save();
  ctx.globalAlpha = fade;
  // Spent, the drum lifts off its cradle as it goes.
  ctx.translate(shook.x, shook.y + pivot - gone * l.tile);
  ctx.rotate(capstanRoll(turn));
  ctx.translate(0, -pivot + fx.thud * l.tile);
  drawCradle(ctx, l);
  for (const side of SIDES) {
    const strength = hornStrength(world, s, side);
    const mine = strength === EITHER || seatIsMine(l.role, side === 0 ? 1 : 2);
    drawCapstanHorn(ctx, l, side, strength, mine, beatPhase, time);
  }

  ctx.translate(shake.x, shake.y);
  ctx.rotate(shake.roll);
  const squeeze = capstanSqueeze(turn);
  // The end turned away is behind the drum; the one coming round, and a sliver centred, over it.
  for (const side of SIDES)
    if (away(side, turn)) drawEnd(ctx, l, world, s, side, turn, beatPhase, fx);
  drawBody(ctx, l, squeeze, turn, fx.hurt.value);
  for (const side of SIDES) {
    if (!away(side, turn)) drawEnd(ctx, l, world, s, side, turn, beatPhase, fx);
  }

  const hurt = coreHurt(s.hits);
  const shot =
    step?.ask === "fire" && s.bared
      ? { color: step.color, left: capstanLeft(s, beat, beatPhase) }
      : null;
  drawCapstanCore(
    ctx,
    l,
    capstanCover(world, s, beat, beatPhase),
    hurt.size,
    hurt.bright,
    shot,
    beatPhase,
  );
  drawCapstanFlash(ctx, l, fx.flash, fx.open);
  ctx.restore();
  drawCapstanMarkFeedback(ctx, l, cfg, s, beat, beatPhase, time, fade, fx.verdicts.verdicts);
}

/** Whether end `side` is turned away behind the drum. */
function away(side: 0 | 1, turn: number): boolean {
  return side === 0 ? turn > 0 : turn < 0;
}

/**
 * How lit horn `side`'s mark is: full on the side a band step asks the lean
 * toward until that face is bared, and faint on both through a hold nobody
 * is steering yet.
 */
function hornStrength(world: World, s: CapstanState, side: 0 | 1): number {
  const ask = capstanLitStep(s)?.ask;
  const face = capstanFace(world, s);
  if (ask === "hold") return face === null ? EITHER : 0;
  if (capstanBand(s) !== side) return 0;
  return face === side ? 0 : 1;
}

/** The cradle and its post, in the drum's frame before the rattle: it is the drum that shakes. */
function drawCradle(ctx: CanvasRenderingContext2D, l: Layout): void {
  const cradle = capstanCradlePath(l);
  ctx.fillStyle = PALETTE.capstanRustDark;
  ctx.fill(cradle);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.capstanRust, 0.9);
  ctx.stroke(cradle);
}

/** GATE's bar, the drum seen from the side: the key light sliding the way it turns. */
function drawBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  squeeze: number,
  turn: number,
  hurt: number,
): void {
  const { rx, ry } = capstanSize(l);
  const body = capstanBodyPath(l, squeeze);
  ctx.fillStyle = PALETTE.capstanRust;
  ctx.fill(body);
  ctx.save();
  ctx.clip(body);
  litRound(ctx, -rx * squeeze * (0.3 + 0.4 * turn), -ry * 0.35, rx * 0.9, LIGHT_HALF.rock);
  // Two staves' seams along the drum, so it reads as a round thing turning.
  ctx.lineWidth = STROKE.inner * 0.7;
  ctx.strokeStyle = rgba(PALETTE.capstanRustDark, 0.55);
  for (const y of [-0.45, 0.45]) {
    const seam = new Path2D();
    seam.moveTo(-rx, y * ry);
    seam.lineTo(rx, y * ry);
    ctx.stroke(seam);
  }
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.capstanRustDark, 0.95);
  ctx.stroke(body);
  drawHurt(ctx, body, hurt);
}

/**
 * End face `side`, as wide as the turn has brought it round, lit while it is
 * the face to rub, flaring with its last reversal and ringing once bright.
 */
function drawEnd(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: CapstanState,
  side: 0 | 1,
  turn: number,
  beatPhase: number,
  fx: CapstanFx,
): void {
  const w = capstanFaceWidth(l, side, turn);
  if (w <= 0.5) return;
  const at = capstanFaceAt(l, side, capstanSqueeze(turn));
  const ask = capstanLitStep(s)?.ask;
  const bared = capstanFace(world, s) === side;
  const lit = bared && (ask === "hold" || capstanBand(s) === side);
  ctx.save();
  ctx.translate(at.x, at.y);
  drawCapstanFace(
    ctx,
    l,
    w,
    capstanWorn(world, s, side),
    world.cfg.capstanWearThreshold,
    lit,
    beatPhase,
    { scrub: fx.scrub(side), ring: fx.ring(side) },
  );
  ctx.restore();
}
