import { blobPath } from "@neon-spore/content";
import { type MazeState, mazeHeartColor } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { drawMazeBlood } from "./maze-blood.js";
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
 * **It beats twice a thump, and the thumps come faster as it is hurt.** A heart
 * that thumped once would be a lamp fading up and down; the double thump is
 * what makes it a heart. Untouched it is slow — one squeeze every three beats
 * — and every hit it takes speeds it up, so by the last round it is racing.
 * That is the boss's condition told in the one way a body tells it. Everything
 * runs off `world.beat` and the frame's phase and stores nothing, so a restart
 * leaves none of it behind (`Effects.reset()` has nothing of this to clear)
 * and both phones thump together without either of them being told to.
 *
 * **A hit is meant to be unmissable.** The muscle is thrown open, a ring of
 * light leaves it, and blood goes out across the floor of the room and stays
 * there — through the next round and the one after, because the drum is
 * replaced and the heart is not (`maze-blood.ts`).
 *
 * **The colour switches every round**, between the two the field already
 * carries: a slick's red and a bulb's cyan. It is not decoration — it is the
 * colour player 2 has to fire, and the only place the answer is written down
 * is the body itself (`mazeHeartColor`). It is also the one thing on this boss
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
const BLOODS: readonly [{ tint: string; rim: string }, { tint: string; rim: string }] = [
  { tint: PALETTE.red, rim: PALETTE.redRim },
  { tint: PALETTE.cyan, rim: PALETTE.cyanRim },
];

/**
 * Which blood this round runs on. Which colour that *is* is `sim`'s rule, not
 * this file's: it decides whether a shot arriving in the middle counts, and a
 * second copy of it here is how a heart comes to be drawn one colour and to
 * accept the other.
 */
export function mazeHeartBlood(round: number): { tint: string; rim: string } {
  return mazeHeartColor(round) === "red" ? BLOODS[0]! : BLOODS[1]!;
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

/** Thumps a beat at full health, and at none. The owner asked for it to start
 * much slower than it did and to beat more as it is hurt; these are the two
 * ends of that. */
const SLOWEST = 0.34;
const FASTEST = 1.15;

/** Beats a hit's own burst lasts — the flare, the recoil and the throw. */
const WOUND = 1.6;

/**
 * The heart in the middle of the drum. `r` is the room it has — the radius of
 * the drum's middle — and it fills a little over half of that at rest so the
 * swell has somewhere to go.
 *
 * It reads the whole round rather than a colour and a beat: how much of the
 * boss's hull is gone is how fast it beats and how much blood is round it, and
 * a verdict just landed is a hit it has to show.
 */
export function drawMazeHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  m: MazeState,
  beat: number,
  beatPhase: number,
): void {
  const { tint, rim } = mazeHeartBlood(m.round);
  const hurt = Math.max(0, Math.min(1, 1 - m.hullMilli / 100_000));
  // Slow when it is whole, racing when it is not. A rate rather than a
  // schedule, so nothing has to be stored between beats to know where it is.
  const time = (beat + beatPhase) * (SLOWEST + (FASTEST - SLOWEST) * hurt);
  // A hit throws the muscle open on top of whatever it was doing.
  const struck =
    m.phase === "verdict" && m.verdict === 1
      ? Math.max(0, 1 - (beat - m.phaseBeat + beatPhase) / WOUND)
      : 0;
  const squeeze = Math.min(1, thump(time) + struck * 0.9);
  const body = r * REST * (1 + SWELL * squeeze) * (1 + 0.28 * struck);

  drawMazeBlood(ctx, cx, cy, r, m, (round) => mazeHeartBlood(round).tint, beat, beatPhase);

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

  // The wound itself: a ring of the heart's own light leaving it, once, wide
  // and quick. It is the loudest thing this boss ever does, which is what the
  // owner asked for — a hit used to be a dot changing colour.
  if (struck > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = struck * 0.85;
    ctx.strokeStyle = rim;
    ctx.lineWidth = 2 + 6 * struck;
    ctx.beginPath();
    ctx.arc(cx, cy, r * (0.5 + 1.5 * (1 - struck)), 0, Math.PI * 2);
    ctx.stroke();
    halo(ctx, cx, cy, r * (1.2 + 1.4 * struck), rim, struck * 0.5);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
