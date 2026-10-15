import { LIGHT_HALF } from "@neon-spore/content";
import {
  type LampreyState,
  lampreyAsks,
  lampreyCrawling,
  lampreyPlugButton,
  lampreyTapsWanted,
  lampreyWorker,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { creatureCenter } from "./creature-place.js";
import { glidePhase } from "./depth.js";
import { smoothstep } from "./ease.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import { FOLD_GAPE, type LampreyChomp } from "./lamprey-chomp.js";
import { drawLampreyFringe, drawLampreyLipGloss, drawLampreyMouth } from "./lamprey-disc.js";
import type { LampreyFx } from "./lamprey-fx.js";
import { drawLampreyGills } from "./lamprey-gills.js";
import { drawLampreyGlanced } from "./lamprey-glance.js";
import { drawLampreyHandles } from "./lamprey-handles.js";
import { drawLampreyJaws } from "./lamprey-jaws.js";
import { drawLampreyToothMark } from "./lamprey-marks.js";
import { lampreyPose } from "./lamprey-pose.js";
import { drawLampreyFlung, drawLampreyGulp, drawLampreySnap } from "./lamprey-receipts.js";
import {
  type LampreyPose,
  lampreyBody,
  lampreyRing,
  lampreySpine,
  MOUTH,
} from "./lamprey-shape.js";
import { drawLampreyFin, drawLampreyHide } from "./lamprey-skin.js";
import { drawLampreyTeeth } from "./lamprey-teeth.js";
import { drawLampreyHalos, drawLampreyVerdicts } from "./lamprey-verdicts.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsLampreyHand } from "./view-role-clocks-c.js";

/** How far below the eel its shadow falls, in tiles. */
const DROP = 0.1;
/** How narrow the sucker is turned edge-on, as a share of its width taken off. */
const TURNED = 0.78;
/** How near the body it hunts must fall, in tiles, before the head starts turning to it, and over how far it opens fully. */
const HUNT_NEAR = 1;
const HUNT_SPAN = 2.2;

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
 * per hit. What the events leave — a flung tooth, a snap, a gulp, the blow,
 * the verdicts — is `fx` (`lamprey-fx.ts`, `lamprey-receipts.ts`); its blow at
 * the hull `lamprey-blow.ts`. The pose drawn is returned, for the bolts
 * (`lamprey-stop.ts`).
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
): LampreyPose {
  const cfg = world.cfg;
  // A tow's lunge throws the eel about where the pose put it (`lamprey-anger.ts`).
  const p = fx.anger.apply(lampreyPose(l, cfg, s, beat, beatPhase), l, cfg, s, time);
  fx.note(p);
  ctx.save();
  // Every glow under the fade is `strokeGlowFaded`, which leaves it standing.
  ctx.globalAlpha = 1 - 0.5 * p.spent;

  // The eel shakes with the blow it took; its handles are the thumbs', and stay.
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  drawHide(ctx, l, p, fx.hurt.value);
  const fold = aimJaws(l, world, s, p, beatPhase, fx.chomp);
  // The head turns as `lamprey-glance.ts` says, hushed while a thumb works it; the body does not.
  drawLampreyGlanced(ctx, p, s, beat + beatPhase, time, (g) =>
    drawHead(g, l, cfg, s, p, fold, time, fx),
  );
  ctx.restore();
  drawLampreyHandles(ctx, l, cfg, s, time);
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  drawLampreyVerdicts(ctx, l, cfg, p, s, time, fx.verdicts);
  ctx.restore();
  drawLampreyFlung(ctx, l, fx.flung);
  fx.crumbs.draw(ctx, l.tile);
  ctx.restore();
  return p;
}

/** The head: the jaws while it hunts, else the sucker, its mouth, teeth and marks. Answers with its outline. */
function drawHead(
  g: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: LampreyState,
  p: LampreyPose,
  fold: number,
  time: number,
  fx: LampreyFx,
): Path2D[] {
  if (fold >= 1) {
    drawLampreyJaws(g, p, fold, fx.chomp.face, fx.chomp.morsel, fx.hurt.value);
  } else if (lampreyPlugButton(s) === null) {
    // (In a plug the mouth is inside the ship, on the button: `lamprey-plug-look.ts`.)
    g.save();
    // Turning to the side: the sucker narrowed across the way it is about to face.
    if (fold > 0) squash(g, p, fx.chomp.face, 1 - TURNED * fold);
    drawSucker(g, p, s.phase === "bite", fx.hurt.value);
    drawLampreyHalos(g, l, cfg, p, s, time);
    drawLampreyMouth(g, p, s);
    drawLampreyGulp(g, p, fx.gulp);
    drawLampreyTeeth(g, p, s);
    drawLampreySnap(g, p, fx.snap);
    const worker = lampreyWorker(s);
    if (worker !== null && lampreyAsks(s) === "teeth") {
      const full = showsLampreyHand(l.role, worker);
      const taps = { done: s.toothTaps, times: lampreyTapsWanted(s) };
      drawLampreyToothMark(g, p, s.litTooth, full, taps, time);
    }
    g.restore();
  }
  return [lampreyRing(p, 1)];
}

/** The body: the fin round the tail under it, its shadow, lit from the key, the skin's detail (`lamprey-skin.ts`), and the blow's red. */
function drawHide(ctx: CanvasRenderingContext2D, l: Layout, p: LampreyPose, hurt: number): void {
  const spine = lampreySpine(l, p);
  const body = lampreyBody(l, spine);
  drawLampreyFin(ctx, l, spine, p.wave);
  ctx.save();
  ctx.translate(0, l.tile * DROP);
  ctx.fillStyle = PALETTE.lampreyHideDark;
  ctx.fill(body);
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
  drawHurt(ctx, body, hurt);
}

/** The sucker's lip face-on: its shadow, the fringe round it (`lamprey-disc.ts`), lit, glossed, and the blow's red. */
function drawSucker(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  sucking: boolean,
  hurt: number,
): void {
  const lip = lampreyRing(p, 1);
  const drop = (p.r / MOUTH) * DROP;
  ctx.save();
  ctx.translate(0, drop);
  ctx.fillStyle = PALETTE.lampreyHideDark;
  ctx.fill(lip);
  ctx.restore();
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
  drawHurt(ctx, lip, hurt);
}

/** The sucker narrowed to `k` of its width along `face`, about the mouth's middle. */
function squash(ctx: CanvasRenderingContext2D, p: LampreyPose, face: number, k: number): void {
  ctx.translate(p.x, p.y);
  ctx.rotate(face);
  ctx.scale(k, 1);
  ctx.rotate(-face);
  ctx.translate(-p.x, -p.y);
}

/**
 * Where the head should face and how far it should fold, handed to the chomp
 * (`lamprey-chomp.ts`), and the fold it shows this frame: while it crawls,
 * turned toward the body it hunts as that falls near and its jaws opening for
 * it; otherwise the sucker, facing on along the body.
 */
function aimJaws(
  l: Layout,
  world: World,
  s: LampreyState,
  p: LampreyPose,
  beatPhase: number,
  chomp: LampreyChomp,
): number {
  const ahead = Math.atan2(Math.cos(p.lean) * p.tilt, -Math.sin(p.lean));
  if (!lampreyCrawling(s)) {
    chomp.aim(0, ahead);
    return 0;
  }
  const prey = world.creatures.find((c) => c.id === s.prey);
  if (prey === undefined) {
    chomp.aim(0, ahead);
    return chomp.fold;
  }
  const at = creatureCenter(l, world, prey, glidePhase(world.cfg, world.beat, prey, beatPhase));
  const near = 1 - (Math.hypot(at.x - p.x, at.y - p.y) / l.tile - HUNT_NEAR) / HUNT_SPAN;
  chomp.aim(
    FOLD_GAPE * smoothstep(Math.max(0, Math.min(1, near))),
    Math.atan2(at.y - p.y, at.x - p.x),
  );
  return chomp.fold;
}
