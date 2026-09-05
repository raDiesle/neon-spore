import { blobPath } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * What is in the middle of THE MAZE: a heart, beating, with veins running out
 * of it to the wall of the room it is in.
 *
 * **It replaces the word on the owner's sheet.** The printed maze has START in
 * the middle; the field does not take printed words, and a plain disc said
 * nothing about why a shot should want to get there. So the thing at the end
 * of the walk is a *body*, which is what the owner asked for — and it makes
 * the round's last beat legible: the shot arrives somewhere that is alive.
 *
 * **It is the same vocabulary as everything else on the field.** A closed
 * contour with lobes and fluid under it, which is what `gyre-core.ts` argues
 * for at length about the middle of a wheel: a hub drawn as a ring on a stick
 * is the one part that reads as scaffolding rather than as an animal. The
 * veins are the warden's veins — bent rather than radial, forked near the tip,
 * because a straight line into the middle of a ring reads as a spoke.
 *
 * **It beats twice a beat, on the beat.** A heart that thumped once would be a
 * lamp fading up and down; the double thump is what makes it a heart. It runs
 * off `world.beat` and the frame's phase and stores nothing, so a restart
 * leaves none of it behind (`Effects.reset()` has nothing of this to clear)
 * and both phones thump together without either of them being told to.
 *
 * **The colour switches every round**, between the two the field already
 * carries: a slick's red and a bulb's cyan. It is the one thing on this boss
 * that says which round the pair is on without a word of text.
 */

/** Lobes on the muscle. Two, so it reads as a chambered thing rather than as a
 * ball — and set on their side, which is the one direction a heart has. */
const LOBES = 2;
const LOBE_DEPTH = 0.17;
const SKIN_WOBBLE = 0.05;
/** Points on the contour. As `gyre-core.ts`: fewer than a body's forty, because
 * it is drawn small and the path is rebuilt every frame with no cache. */
const SKIN_POINTS = 24;

/** Veins out of it, on fixed spokes so the body is the same body on both
 * phones and after a restart. */
const VEINS = 6;

/**
 * How much of the room the muscle fills at rest, and how far a thump swells
 * it. The swell is large on purpose: at a sixth it read as a lamp brightening,
 * and the owner asked for a heart that beats rather than one that glows.
 */
const REST = 0.57;
const SWELL = 0.3;

/**
 * The two colours it alternates between, in round order: a slick's red, then a
 * bulb's cyan. Named against the creatures rather than against the palette
 * keys, because that is what the owner asked for and what a player would say.
 */
const BLOODS: readonly { tint: string; rim: string }[] = [
  { tint: PALETTE.red, rim: PALETTE.redRim },
  { tint: PALETTE.cyan, rim: PALETTE.cyanRim },
];

/** Which blood this round runs on. */
export function mazeHeartBlood(round: number): { tint: string; rim: string } {
  const at = ((round % BLOODS.length) + BLOODS.length) % BLOODS.length;
  return BLOODS[at] ?? { tint: PALETTE.red, rim: PALETTE.redRim };
}

/**
 * The double thump, 0 at rest and 1 at the top of a squeeze.
 *
 * Two squeezes a beat, the second smaller and close behind the first, then a
 * long fall to nothing — lub, dub, wait. The wait is most of the beat and is
 * what stops it reading as a pulsing light: a heart is mostly still.
 */
function thump(phase: number): number {
  const p = phase - Math.floor(phase);
  const hit = (at: number, width: number, height: number) => {
    const d = (p - at) / width;
    return d < 0 || d > 1 ? 0 : height * Math.sin(d * Math.PI) ** 2;
  };
  return Math.min(1, hit(0, 0.17, 1) + hit(0.22, 0.13, 0.55));
}

/**
 * The heart in the middle of the drum. `r` is the room it has — the radius of
 * the drum's middle — and it fills a little over half of that at rest so the
 * swell has somewhere to go.
 */
export function drawMazeHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  round: number,
  beat: number,
  beatPhase: number,
): void {
  const { tint, rim } = mazeHeartBlood(round);
  const time = beat + beatPhase;
  const squeeze = thump(time);
  const body = r * REST * (1 + SWELL * squeeze);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // The veins first, so the muscle sits on top of its own roots. They run out
  // to the wall of the room and stretch as it squeezes, which is what carries
  // the thump past the edge of the body rather than leaving it a shape that
  // merely changes size.
  const veins = new Path2D();
  for (let k = 0; k < VEINS; k++) {
    // Off the vertical, so no vein stands on the axis the shot comes up.
    const a = (k / VEINS) * Math.PI * 2 + 0.42;
    const ox = Math.cos(a);
    const oy = Math.sin(a);
    const reach = (r - body) * (1.04 + 0.16 * squeeze);
    const rootX = cx + ox * body * 0.96;
    const rootY = cy + oy * body * 0.96;
    const tipX = rootX + ox * reach;
    const tipY = rootY + oy * reach;
    veins.moveTo(rootX, rootY);
    veins.quadraticCurveTo(
      rootX + ox * reach * 0.5 - oy * reach * 0.34,
      rootY + oy * reach * 0.5 + ox * reach * 0.34,
      tipX,
      tipY,
    );
    for (const fork of [-0.62, 0.58]) {
      const fx = Math.cos(a + fork);
      const fy = Math.sin(a + fork);
      veins.moveTo(tipX, tipY);
      veins.lineTo(tipX + fx * reach * 0.26, tipY + fy * reach * 0.26);
    }
  }
  strokeGlow(ctx, veins, tint, STROKE.inner * 0.65, 0.2 + 0.55 * squeeze);

  // The aura, which is what makes the middle read as lit from inside rather
  // than as a disc laid on the drum. It swells with the squeeze and with
  // nothing else.
  halo(ctx, cx, cy, body * (1.7 + squeeze * 1.3), tint, 0.1 + 0.3 * squeeze);

  // The muscle. Its lobes lie on their side — one turn, applied to the whole
  // contour, so there is no second copy of the angle anywhere below.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 2);
  const skin = new Path2D(
    blobPath(0, 0, body, body * 0.92, LOBES, LOBE_DEPTH, SKIN_WOBBLE, time, 11, SKIN_POINTS),
  );

  // Fluid filled *into* the skin rather than into a circle behind it: a
  // gradient disc under a contour is a lamp with a lid on, and the same
  // gradient clipped to the contour is the thing having an inside
  // (`gyre-core.ts`).
  const off = body * 0.3;
  const grad = ctx.createRadialGradient(off, -off * 0.7, 0, 0, 0, body);
  grad.addColorStop(0, `${rim}70`);
  grad.addColorStop(0.3, `${tint}E0`);
  grad.addColorStop(0.8, `${tint}80`);
  grad.addColorStop(1, `${tint}20`);
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.78 + 0.22 * squeeze;
  ctx.fill(skin);
  ctx.globalAlpha = 1;
  strokeGlow(ctx, skin, rim, STROKE.inner, 0.5 + 0.4 * squeeze);

  // The chamber inside, which is the half of the thump the eye actually reads:
  // it fills late and empties slowly, so the muscle is never uniformly bright.
  ctx.globalAlpha = 0.22 + 0.68 * thump(time - 0.06);
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(-body * 0.06, 0, body * 0.34, body * 0.24, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
  ctx.restore();
}
