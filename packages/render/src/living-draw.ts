import type { CreatureSilhouette } from "@neon-spore/content";
import { livingMotion, livingPoints, livingSilhouette, poseClock } from "@neon-spore/content";
import {
  type Creature,
  otherColor,
  type SimConfig,
  THROB_TURN_MILLI,
  throbTurnMilli,
  wornKind,
} from "@neon-spore/sim";
import { drawDetails, drawMotionTrail } from "./creature-detail.js";
import { contourClock, livingBodyMul, livingRadius, livingScale } from "./creature-place.js";
import { colorTrio, turnedTrio, type Wash } from "./creature-tint.js";
import { dartFlip, dartLean } from "./dart.js";
import { hazed } from "./depth.js";
import { drawEchoSeam, echoStrain } from "./echo.js";
import { halo } from "./glow.js";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { LIVING_SKIN } from "./living-skin.js";
import { drawLureVent, lureHolePath, lureVented } from "./lure-hole.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";
import { THROB_LOOK } from "./throb-look.js";

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
  /**
   * How much of its footprint this body is drawing at *right now*, beyond the
   * size its kind implies. One for everything but THE BEATBOX, which swells on
   * every beat and swells harder on a tap — the whole of what that creature
   * says (`beatbox.ts`).
   *
   * Deliberately **not** folded into `livingBodyMul` next door, which is the
   * two kinds whose size *is* their silhouette: an echo is small and a rind is
   * large, and both are facts that hold for a whole frame *and* for the ring a
   * thumb is hit-tested against. This one changes several times a beat and is
   * a picture only, so a hit test that followed it would make the same press
   * land or miss depending on where in the beat it arrived.
   */
  swell = 1,
  /**
   * A contour to draw this body with instead of the one its kind implies.
   * Unset for everything but THE BEATBOX, whose rim grows an arm on every beat
   * a thumb counted — so the contour is a fact about *this body right now*
   * rather than about its kind, and `livingSilhouette` cannot answer it
   * (`content/silhouettes-beatbox.ts`). An override rather than a draw path of
   * its own, because everything else about a box is an ordinary blob and a
   * second path would be a second copy of all of it.
   */
  shapeOver?: CreatureSilhouette,
  /**
   * A colour laid over whatever this body's own is (`creature-tint.ts`).
   *
   * Unset for every body but a soundbox, which wears two: `red` for the beats
   * after a run comes apart, and `arc` for as long as a tap would count. Which
   * one, and how far, is `beatboxWash`'s (`beatbox.ts`).
   */
  wash?: Wash,
): void {
  // **Not `c.kind`.** A lure is drawn as the body it wears — the contour, the
  // own-motion, the interior, the size, all of it — and this is the line that
  // makes that true. Every appearance below reads `look`; `c.kind` decides
  // nothing about how this body draws, on either device, right up to the beat
  // it goes. See `wornKind` in sim/creature-rules.ts, and purity.test.ts's own
  // row on it: one site left asking `c.kind` and player 1 has a tell.
  const look = wornKind(c);
  const isBulb = look === "bulb";
  const shape = shapeOver ?? livingSilhouette(look);
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
  // And the wash, carried over the top of whatever the body's own colour is. A
  // mix rather than a replacement: it fades in and out, so what the pair reads
  // is *something is happening to this body* rather than a body that has
  // changed which trigger answers it (`wash`).
  const lit = (h: string, to: string): string =>
    haze(wash === undefined ? h : mixHex(h, to, wash.amount));
  const rim = lit(tint.rim, wash?.rim ?? tint.rim);
  const hex = lit(tint.hex, wash?.hex ?? tint.hex);
  const dark = lit(tint.dark, wash?.dark ?? tint.dark);

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
  const r = livingRadius(l.tile, livingBodyMul(c) * swell);
  const scale = livingScale(shape, r);

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
  // the silhouette's business, not this file's (`livingPoints`, content).
  // Points rather than the `d` string `livingPath` builds out of them — this
  // is the hottest contour in the game after the hull, and nobody here wanted
  // text (`spline.ts`).
  const outline = livingPoints(shape, t, 28);
  // THE LURE's hole, and the one thing drawn here that is *not* the disguise.
  // Two contours in one path filled even-odd is a hole the field shows through
  // (`lure-hole.ts`), and it is cut on the seat that is being told and nowhere
  // else — player 1 gets an ordinary slick or bulb, which is the whole wave.
  const vent = lureVented(l, c);
  const path = splinePath(outline, true);
  if (vent) path.addPath(new Path2D(lureHolePath(shape, t)));
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
    // The material, through a record rather than inline, so a second answer
    // to *what a body is made of* can be drawn beside this one at the size it
    // ships at (`living-skin.ts`, `docs/versus.md`).
    LIVING_SKIN.paint(ctx, path, rule, {
      hex,
      rim,
      dark,
      r,
      scale,
      rx: shape.rx,
      ry: shape.ry,
      rot,
    });
    // Clipped to the body-minus-hole when there is a hole: an interior detail
    // painted across the opening would fill in the one thing the opening says.
    if (vent) {
      ctx.save();
      ctx.clip(path, rule);
    }
    drawDetails(ctx, look, { hex, rim, dark, rx: shape.rx, ry: shape.ry, rot, t });
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
      THROB_LOOK.half({
        ctx,
        body: path,
        rx: shape.rx,
        ry: shape.ry,
        isBulb,
        tint: { rim: haze(far.rim), hex: haze(far.hex), dark: haze(far.dark) },
        seamHue: haze(mixHex(tint.rim, far.rim, 0.5)),
        lw: Math.max(1, r * 0.1) / scale,
        turn: spin,
        rot,
      });
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
