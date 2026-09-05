import { livingMotion, livingPath, livingSilhouette, poseClock } from "@neon-spore/content";
import {
  type Creature,
  otherColor,
  type SimConfig,
  THROB_TURN_MILLI,
  throbTurnMilli,
  wornKind,
} from "@neon-spore/sim";
import { drawDetails, drawMotionTrail } from "./creature-detail.js";
import { contourClock, livingBodyMul } from "./creature-place.js";
import { colorTrio, turnedTrio } from "./creature-tint.js";
import { dartFlip, dartLean } from "./dart.js";
import { hazed } from "./depth.js";
import { drawEchoSeam, echoStrain } from "./echo.js";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawLureVent, lureHolePath, lureVented } from "./lure-hole.js";
import { PALETTE } from "./palette.js";
import { drawThrobHalf } from "./throb.js";

/**
 * One lobed body, filled and lit. Split out of `creatures.ts` when THE ECHO
 * took that file past its 250-line limit, along the seam the file already
 * read on: `drawCreatures` next door is *routing* — which of the six draw
 * paths a kind takes, and whether this screen may see it at all — and this is
 * the one path that draws a blob. The two halves change for different reasons,
 * and only this one has anything to say about a contour.
 */
export function drawLiving(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  beats: number,
  beatPhase: number,
  time: number,
  blocked: number,
  cfg: SimConfig,
  near: number,
  turn = 1,
): void {
  // **Not `c.kind`.** A lure is drawn as the body it wears — the contour, the
  // own-motion, the interior, the size, all of it — and this is the line that
  // makes that true. Every appearance below reads `look`; `c.kind` decides
  // nothing about how this body draws, on either device, right up to the beat
  // it goes. See `wornKind` in sim/creature-rules.ts, and purity.test.ts's own
  // row on it: one site left asking `c.kind` and player 1 has a tell.
  const look = wornKind(c);
  const isBulb = look === "bulb";
  const shape = livingSilhouette(look);
  // A body may carry no colour at all — the red/cyan ternary below would
  // otherwise read a null colour as cyan, painting a decoy in one of the two
  // ammunition colours.
  const neutral = c.color === null;
  // Every colour goes through `hazed`: distance is spent on the palette here
  // and nowhere else, so the far rows come out dimmer, cooler and at lower
  // contrast in one operation instead of three.
  const haze = (h: string): string => hazed(cfg, h, near);
  // A body mid-turn is drawn between the two colours rather than in one of
  // them: `turn` is 1 for every body on the field but THE RECOIL on the beat a
  // shot knocked it (`recoilTurn`), and over that beat the red it was crosses
  // to the cyan it has become while it travels. A flip on the frame of the hit
  // said the same thing in one frame, which is a frame nobody watching the
  // shot land is looking at the body for — the pair reads the new colour off a
  // body that has already moved, and the turn is the thing that carries the
  // eye there. `turnedTrio` owns the crossing, because the cage around a
  // recoil is lit in the same colour on the same frame (`recoil.ts`).
  const tint = turnedTrio(neutral ? null : c.color, turn);
  const rim = haze(tint.rim);
  const hex = haze(tint.hex);
  const dark = haze(tint.dark);

  // The contour wobble is still on the wall clock, which the pose no longer
  // is: `blobPath` is sampled in seconds by every shape tool too, and its
  // excursion is a couple of percent of a radius — a fraction of a pixel of
  // disagreement, against the fifth of a lane the pose was worth. Variation
  // without randomness in the simulation lives inside `contourClock`: the id
  // is deterministic on both devices, so two screens shake the same creature
  // the same way.
  const t = contourClock(c.id, time);
  // **The body, not `look`.** How big it draws is a fact about what it *is* —
  // an echo is a slick or a bulb at a fraction of the footprint, a rind is one
  // at a whole footprint per layer it still wears — and `livingBodyMul` is the
  // one copy of that, shared with `creatureRadius`, so the ring a thumb grips
  // and the body it is drawn around are one size.
  const r = l.tile * 0.4 * livingBodyMul(c);
  const scale = (r / Math.max(shape.rx, shape.ry)) * (shape.sizeMul ?? 1);

  // The sway itself is data, in `content/own-motion.ts`, so the shape tools
  // can animate a creature the way the game does instead of re-typing it.
  // Offsets come back in tiles, which is the only form that survives a
  // different screen.
  const pose = livingMotion(look).poseAt(poseClock(c.id, beats));
  const ox = pose.dx * l.tile;
  const oy = pose.dy * l.tile;
  const { sx, sy } = pose;
  // The dart's lean, on top of its own-motion rather than inside it: POISE is
  // a pure function of the beat like every other motion and cannot know which
  // way this body is pointing, and the direction is the whole creature. Zero
  // for everything else, so nothing but a dart is turned by a line of this.
  // The Throb's whole tell, and the one rotation in the game that is a rule
  // rather than a lean: the body turns clockwise the whole way down, and which
  // half is pointing at the cannon is what a shot meets. `throbTurnMilli` is
  // the same expression `throbStruck` resolves against, handed the same
  // continuous beat, so the seam the pair is watching and the seam the bullet
  // finds are one number (`sim/throb.ts`).
  const spin = look === "throb" ? (throbTurnMilli(cfg, beats) / THROB_TURN_MILLI) * Math.PI * 2 : 0;
  const rot = pose.rot + spin + (look === "dart" ? dartLean(c, beatPhase) : 0);
  // And which way round it is drawn. 1 for every other body — a contour with
  // no point on it does not care — and the whole of how a dart's nose leads in
  // both directions (`dartFlip`).
  const flip = look === "dart" ? dartFlip(c) : 1;

  // Not `blobPath`: a throb's rim wears clubs and the walk that draws them is
  // the silhouette's business, not this file's (`livingPath`, content).
  const d = livingPath(shape, t, 28);
  // THE LURE's hole, and the one thing drawn here that is *not* the disguise.
  // Two contours in one path filled even-odd is a hole the field shows through
  // (`lure-hole.ts`), and it is cut on the seat that is being told and nowhere
  // else — player 1 gets an ordinary slick or bulb, which is the whole wave.
  const vent = lureVented(l, c);
  const path = new Path2D(vent ? `${d} ${lureHolePath(shape, t)}` : d);
  const rule: CanvasFillRule = vent ? "evenodd" : "nonzero";

  ctx.save();
  ctx.translate(x + ox, y + oy);
  // THE ECHO pulling itself apart, before the pose turns the body: the halves
  // step along columns and rows, so the stretch has to be along a field
  // direction and not along whichever way this body happens to be leaning.
  // Nothing for any other kind (`echo.ts`).
  echoStrain(ctx, cfg, c, beats);
  ctx.rotate(rot);
  ctx.scale(scale * sx * flip, scale * sy);

  if (blocked > 0) {
    // Wrong colour: no resonance, so the light organ stays shut. Grey outline
    // only — the shot is spent and the creature keeps coming.
    ctx.strokeStyle = haze(PALETTE.sparkDim);
    ctx.lineWidth = 2 / scale;
    ctx.stroke(path);
  } else {
    ctx.fillStyle = dark;
    ctx.fill(path, rule);
    strokeGlow(ctx, path, hex, Math.max(1, r * 0.1) / scale, 1);
    // Clipped to the body-minus-hole when there is a hole: an interior detail
    // painted across the opening would fill in the one thing the opening says.
    if (vent) {
      ctx.save();
      ctx.clip(path, rule);
    }
    drawDetails(ctx, isBulb, shape.rx, shape.ry, rim);
    // And the furrow it will part along, cut across that same axis. In here
    // with the details rather than outside the body, because it is a marking
    // on the contour and takes the contour's own aspect and strain with it.
    drawEchoSeam(ctx, cfg, c, beats, shape.rx, shape.ry, dark);
    if (vent) ctx.restore();
    // Over the interior rather than under it: the far half of a throb covers
    // the body in the other ammunition colour, it does not shine through it
    // (`throb.ts`). The half is drawn for the colour the body was *not*
    // authored in, and `throbTurnMilli` above has already turned it to
    // whichever side the cannon is looking at — so the trigger `throbColorAt`
    // will accept is the colour the pair can see pointing at them.
    if (look === "throb" && c.color !== null) {
      const far = colorTrio(otherColor(c.color));
      drawThrobHalf(
        ctx,
        path,
        shape.rx,
        shape.ry,
        isBulb,
        { rim: haze(far.rim), hex: haze(far.hex), dark: haze(far.dark) },
        haze(mixHex(tint.rim, far.rim, 0.5)),
        Math.max(1, r * 0.1) / scale,
      );
    }
  }
  ctx.restore();

  if (blocked <= 0) {
    // Out of the hole, in screen space: the sparks are thrown by the body and
    // must not take its lean, its strain or its squash with them.
    if (vent) drawLureVent(ctx, x + ox, y + oy, r, time, c.id);
    drawMotionTrail(ctx, l, x, y, r, hex, t);
    halo(ctx, x + ox, y + oy, r * 1.9, hex, 0.16);
  }
}
