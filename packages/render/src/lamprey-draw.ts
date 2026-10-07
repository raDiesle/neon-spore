import { LIGHT_HALF } from "@neon-spore/content";
import {
  LAMPREY_TEETH,
  type LampreyState,
  lampreyAsks,
  lampreyBiting,
  lampreyFiring,
  lampreyStep,
  lampreyTapsWanted,
  lampreyToothIn,
  lampreyWorker,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlowFaded } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import {
  drawLampreyFringe,
  drawLampreyGums,
  drawLampreyLipGloss,
  drawLampreyThroat,
} from "./lamprey-disc.js";
import type { LampreyFx } from "./lamprey-fx.js";
import { drawLampreyGills } from "./lamprey-gills.js";
import { drawLampreyHandles } from "./lamprey-handles.js";
import { drawLampreyToothMark } from "./lamprey-marks.js";
import { lampreyPose } from "./lamprey-pose.js";
import { drawLampreyFlung, drawLampreyGulp, drawLampreySnap } from "./lamprey-receipts.js";
import {
  type LampreyPose,
  lampreyBody,
  lampreyGulletReach,
  lampreyRing,
  lampreySocket,
  lampreySpine,
  lampreyTooth,
} from "./lamprey-shape.js";
import { drawLampreyFin, drawLampreyHide } from "./lamprey-skin.js";
import { drawLampreyHalos, drawLampreyVerdicts } from "./lamprey-verdicts.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";
import { showsLampreyHand } from "./view-role-clocks-c.js";

/** The mouth's black inside the lip, in radii. */
const MOUTH_IN = 0.8;

/**
 * **THE LAMPREY**: a dark olive eel with a round sucker mouth, leaping from
 * tile to tile across the field and biting into each, its tail laid away
 * from where it leaps next, a ring of nine bone teeth with one lit; or
 * reared on a tile, its gullet lit in a cannon's colour (§11.59,
 * `bosses-choreographed.md` §41).
 *
 * **Both screens are drawn the one eel**, the tail's knob and the head's
 * included (`lamprey-handles.ts`), and only the asks differ by seat
 * (`showsLampreyHand`): the lit tooth's ring full on the worker's screen and
 * faint on the holder's.
 *
 * **Its health is read off the ring**, no bar: a tooth knocked out leaves a
 * socket, so the gaps can be counted by eye, and the gullet shrinks a step
 * per hit. Everything is read off `world` each frame; what the events leave —
 * a flung tooth, a snap, a gulp, the blow it takes, the marks' verdicts — is
 * `fx` (`lamprey-fx.ts`, drawn by `lamprey-receipts.ts`), and its own blow at
 * the hull is `lamprey-blow.ts`.
 */
export function drawLamprey(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: LampreyState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: LampreyFx,
): void {
  const cfg = world.cfg;
  const p = lampreyPose(l, cfg, s, beat, beatPhase);
  fx.note(p);
  ctx.save();
  // Every glow under the fade is `strokeGlowFaded`, which leaves it standing.
  ctx.globalAlpha = 1 - 0.5 * p.spent;

  // The eel shakes with the blow it took; its handles are the thumbs', and stay.
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  drawBody(ctx, l, p, s.phase === "bite", fx.hurt.value);
  drawLampreyHalos(ctx, l, cfg, p, s, time);
  drawMouth(ctx, p, s);
  drawLampreyGulp(ctx, p, fx.gulp);
  drawTeeth(ctx, p, s);
  drawLampreySnap(ctx, p, fx.snap);
  const worker = lampreyWorker(s);
  if (worker !== null && lampreyAsks(s) === "teeth") {
    const full = showsLampreyHand(l.role, worker);
    const along = s.toothTaps / lampreyTapsWanted(s);
    drawLampreyToothMark(ctx, p, s.litTooth, full, along, time);
  }
  ctx.restore();
  drawLampreyHandles(ctx, l, cfg, s, time);
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  drawLampreyVerdicts(ctx, l, cfg, p, s, time, fx.verdicts);
  ctx.restore();
  drawLampreyFlung(ctx, l, fx.flung);
  fx.crumbs.draw(ctx, l.tile);
  ctx.restore();
}

/**
 * The body and the mouth's lip: the fin round the tail under it, its shadow,
 * lit from the key, the skin's detail (`lamprey-skin.ts`), the fringe round
 * the lip (`lamprey-disc.ts`), and the blow's red.
 */
function drawBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  p: LampreyPose,
  sucking: boolean,
  hurt: number,
): void {
  const spine = lampreySpine(l, p);
  const body = lampreyBody(l, spine);
  const lip = lampreyRing(p, 1);
  const drop = l.tile * 0.1;
  drawLampreyFin(ctx, l, spine, p.wave);
  ctx.save();
  ctx.translate(0, drop);
  ctx.fillStyle = PALETTE.lampreyHideDark;
  ctx.fill(body);
  ctx.fill(lip);
  ctx.restore();
  ctx.fillStyle = PALETTE.lampreyHide;
  ctx.fill(body);

  const mid = spine[Math.floor(spine.length / 3)] ?? p;
  const reach = Math.hypot(mid.x - p.x, mid.y - p.y) + p.r;
  ctx.save();
  ctx.clip(body);
  litRound(ctx, mid.x, mid.y, reach + 2, LIGHT_HALF.rock);
  ctx.restore();
  drawLampreyHide(ctx, l, spine, body);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.95);
  ctx.stroke(body);
  drawLampreyGills(ctx, l, spine, p.wave);

  drawLampreyFringe(ctx, p, p.wave, sucking, drop);
  ctx.fillStyle = PALETTE.lampreyHide;
  ctx.fill(lip);
  ctx.save();
  ctx.clip(lip);
  ctx.translate(p.x, p.y);
  ctx.scale(1, p.tilt);
  litRound(ctx, 0, 0, p.r + 2, LIGHT_HALF.rock);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.95);
  ctx.stroke(lip);
  drawLampreyLipGloss(ctx, p);
  drawHurt(ctx, body, hurt);
  drawHurt(ctx, lip, hurt);
}

/**
 * The mouth's black inside the lip, and the gullet opening out of it once the
 * eel is off the hull: dull meat, lit in the shot's colour while reared,
 * smaller a step for each hit.
 */
function drawMouth(ctx: CanvasRenderingContext2D, p: LampreyPose, s: LampreyState): void {
  ctx.fillStyle = PALETTE.lampreyMouth;
  ctx.fill(lampreyRing(p, MOUTH_IN));
  drawLampreyThroat(ctx, p, p.wave);
  if (s.phase !== "rearing" && s.phase !== "recoil" && s.phase !== "spent") return;
  const gullet = lampreyRing(p, lampreyGulletReach(s.hits));
  const step = lampreyStep(s);
  if (lampreyFiring(s) && step !== null) {
    const lit = stepColour(step.color).rim;
    ctx.fillStyle = lit;
    ctx.fill(gullet);
    strokeGlowFaded(ctx, gullet, lit, STROKE.outline, 1, 1);
    return;
  }
  ctx.fillStyle = PALETTE.lampreyGullet;
  ctx.fill(gullet);
}

/** The ring of teeth: bone, the lit one bright and glowing, a socket where one is out. */
function drawTeeth(ctx: CanvasRenderingContext2D, p: LampreyPose, s: LampreyState): void {
  const dull = mixHex(PALETTE.lampreyTooth, PALETTE.lampreyHide, 0.35);
  const lit = lampreyBiting(s) ? s.litTooth : -1;
  drawLampreyGums(ctx, p, (t) => lampreyToothIn(s, t));
  ctx.lineWidth = STROKE.inner;
  for (let t = 0; t < LAMPREY_TEETH; t++) {
    if (!lampreyToothIn(s, t)) {
      const socket = lampreySocket(p, t);
      ctx.fillStyle = PALETTE.lampreyMouth;
      ctx.fill(socket);
      ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.9);
      ctx.stroke(socket);
      continue;
    }
    const tooth = lampreyTooth(p, t);
    ctx.fillStyle = t === lit ? PALETTE.lampreyTooth : dull;
    ctx.fill(tooth);
    if (t === lit) strokeGlowFaded(ctx, tooth, PALETTE.lampreyTooth, STROKE.inner, 1, 1);
    else {
      ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.8);
      ctx.stroke(tooth);
    }
  }
}
