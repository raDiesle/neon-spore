import { LIGHT_HALF } from "@neon-spore/content";
import {
  LAMPREY_TEETH,
  type LampreyState,
  lampreyBiting,
  lampreyFiring,
  lampreyPinner,
  lampreyStep,
  lampreyTapper,
  lampreyToothIn,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlowFaded } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { LampreyFx } from "./lamprey-fx.js";
import { drawLampreyJawMark, drawLampreyToothMark } from "./lamprey-marks.js";
import { lampreyDepth, lampreyPose, lampreyToothLeft } from "./lamprey-pose.js";
import { drawLampreyFlung, drawLampreyGulp, drawLampreySnap } from "./lamprey-receipts.js";
import {
  type LampreyPose,
  lampreyBody,
  lampreyGulletReach,
  lampreyRing,
  lampreySocket,
  lampreySpine,
  lampreyTooth,
  lampreyToothAt,
  type Point,
} from "./lamprey-shape.js";
import { drawLampreyHalos, drawLampreyVerdicts } from "./lamprey-verdicts.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";
import { showsLampreyHand } from "./view-role-clocks-c.js";

/** The mouth's black inside the lip, in radii. */
const MOUTH_IN = 0.8;
/** How long the lit tooth's flick of light round the rim takes, in beats. */
const FLICK = 0.2;

/**
 * **THE LAMPREY**: a dark olive eel trailing up the field from a round
 * sucker mouth, bitten flat onto the hull and crawling along it, a ring of
 * seven bone teeth with one lit; then reared over the hull, its gullet lit
 * in a cannon's colour (§11.59, `bosses-choreographed.md` §41).
 *
 * **Both screens are drawn the one eel** — the jaw the pinner follows is
 * the tooth the tapper has to find, on one moving mouth — and only the asks
 * differ by seat (`showsLampreyHand`): the jaw's band full on the pinner's,
 * the lit tooth's ring on the tapper's, each faint on the other's.
 *
 * **Its health is read off the ring**, no bar: a tooth knocked out leaves a
 * socket, so the gaps can be counted by eye, and the gullet shrinks a step
 * per hit. The scar under the mouth is the hull's own red, as deep as the
 * bite. Everything is read off `world` each frame; what the events leave —
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

  if (lampreyBiting(s)) drawScar(ctx, l, p.x, lampreyDepth(s, cfg));
  const pinner = lampreyPinner(s);
  if (pinner !== null) {
    const full = showsLampreyHand(l.role, pinner);
    drawLampreyJawMark(ctx, l, p.x, cfg.lampreyGripCols, full, beatPhase);
  }
  // The eel shakes with the blow it took; the scar and the band are the hull's, and stay.
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  drawBody(ctx, l, p, fx.hurt.value);
  drawLampreyHalos(ctx, l, p, s, time);
  drawMouth(ctx, p, s);
  drawLampreyGulp(ctx, p, fx.gulp);
  drawTeeth(ctx, p, s);
  drawLampreySnap(ctx, p, fx.snap);
  drawFlick(ctx, p, s, beat, beatPhase);
  const tapper = lampreyTapper(s);
  const step = lampreyStep(s);
  if (tapper !== null && step !== null) {
    const left = lampreyToothLeft(s, beat, beatPhase, step.toothBeats);
    const full = showsLampreyHand(l.role, tapper);
    drawLampreyToothMark(ctx, p, s.litTooth, left, full, beatPhase);
  }
  drawLampreyVerdicts(ctx, l, p, s, time, fx.verdicts);
  ctx.restore();
  drawLampreyFlung(ctx, l, fx.flung);
  ctx.restore();
}

/** The bite's scar on the hull under the mouth: the hull's own red, as deep as the bite. */
function drawScar(ctx: CanvasRenderingContext2D, l: Layout, x: number, depth: number): void {
  if (depth <= 0) return;
  const scar = new Path2D();
  scar.ellipse(x, l.hullY, 1.1 * l.tile, 0.38 * l.tile, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.red, 0.25 + 0.6 * depth);
  ctx.fill(scar);
  strokeGlowFaded(ctx, scar, PALETTE.red, STROKE.inner, depth, 1);
}

/** The body and the mouth's lip: its shadow under it, lit from the key, a dark line down the spine, and the blow's red. */
function drawBody(ctx: CanvasRenderingContext2D, l: Layout, p: LampreyPose, hurt: number): void {
  const spine = lampreySpine(l, p);
  const body = lampreyBody(l, spine);
  const lip = lampreyRing(p, 1);
  const drop = l.tile * 0.1;
  ctx.save();
  ctx.translate(0, drop);
  ctx.fillStyle = PALETTE.lampreyHideDark;
  ctx.fill(body);
  ctx.fill(lip);
  ctx.restore();
  ctx.fillStyle = PALETTE.lampreyHide;
  ctx.fill(body);
  ctx.fill(lip);

  const mid = spine[Math.floor(spine.length / 3)] ?? p;
  const reach = Math.hypot(mid.x - p.x, mid.y - p.y) + p.r;
  ctx.save();
  ctx.clip(body);
  litRound(ctx, mid.x, mid.y, reach + 2, LIGHT_HALF.rock);
  ctx.restore();
  ctx.save();
  ctx.clip(lip);
  ctx.translate(p.x, p.y);
  ctx.scale(1, p.tilt);
  litRound(ctx, 0, 0, p.r + 2, LIGHT_HALF.rock);
  ctx.restore();

  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.95);
  ctx.stroke(body);
  ctx.stroke(lip);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.6);
  ctx.stroke(line(spine.slice(2, -3)));
  drawHurt(ctx, body, hurt);
  drawHurt(ctx, lip, hurt);
}

/** A polyline through `points`. */
function line(points: readonly Point[]): Path2D {
  const path = new Path2D();
  points.forEach((at, i) => {
    if (i === 0) path.moveTo(at.x, at.y);
    else path.lineTo(at.x, at.y);
  });
  return path;
}

/**
 * The mouth's black inside the lip, and the gullet opening out of it once the
 * eel is off the hull: dull meat, lit in the shot's colour while reared,
 * smaller a step for each hit.
 */
function drawMouth(ctx: CanvasRenderingContext2D, p: LampreyPose, s: LampreyState): void {
  ctx.fillStyle = PALETTE.lampreyMouth;
  ctx.fill(lampreyRing(p, MOUTH_IN));
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

/** The lit tooth's jump: a quick flick of light round the rim from the tooth just cracked. */
function drawFlick(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  s: LampreyState,
  beat: number,
  beatPhase: number,
): void {
  const from = s.pulled[s.pulled.length - 1];
  const into = beat - s.toothBeat + beatPhase;
  if (!lampreyBiting(s) || from === undefined || into >= FLICK) return;
  const places = (((s.litTooth - from) % LAMPREY_TEETH) + LAMPREY_TEETH) % LAMPREY_TEETH;
  const at = lampreyToothAt(p, from + (places * Math.max(0, into)) / FLICK);
  const dot = new Path2D();
  dot.arc(at.x, at.y, p.r * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.lampreyTooth;
  ctx.fill(dot);
  strokeGlowFaded(ctx, dot, PALETTE.lampreyTooth, STROKE.inner, 1.2, 1);
}
