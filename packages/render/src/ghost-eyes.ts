import { GHOST } from "@neon-spore/content";
import { halo } from "./glow.js";

/**
 * THE GHOST's eyes, and they are the whole of what makes the shape a face
 * rather than a bell.
 *
 * **A hot pupil in a dark socket**, which is the arrangement the owner sent:
 * a near-black hole cut into the body, a burning core inside it, and a glow
 * that bleeds past the socket onto the body around it. The socket is what
 * makes the light read as *coming out of something* — a bright dot on a
 * bright body is a highlight, and a bright dot in a black hole is an eye.
 *
 * **The rim is solid.** It was dashed once, back when the outline was, and
 * the two were one treatment; the outline is a plain contour now
 * (`ghost.ts`), so a broken line here would be the one dashed thing left on
 * the field and would read as an accident rather than as a choice.
 *
 * **It gets worse as the thing gets angry.** `rage` narrows the socket, so the
 * eye goes from round to a slit, and at the same time the core brightens and
 * the glow reaches further — the only expression in the game, and it runs on
 * the same number the camouflage does (`ghostRage`).
 *
 * **The pupil is most of the socket.** It was two fifths of it, and at the
 * field's size that is a pixel and a half of white in a hole of six: the
 * owner asked on 10 September 2026 for the eyes to be *more visible and
 * clear for the player to see*, which is a fix to something wrong and lands
 * straight on the field. So the socket is a little wider, the pupil fills
 * most of it, the core is a third of the pupil rather than a sixth, and the
 * flicker keeps the lamp above four fifths — an eye that dims to half is an
 * eye a player reads as gone. The dark ring left round the pupil is what
 * still says *socket*, and it is the bit that shrinks with rage.
 *
 * Everything here is in the body's own units, inside the transform `drawGhost`
 * has already put the context in, so the halo's sprite key is stable across
 * every ghost at every distance and the cache in `glow.ts` holds one of it.
 */

/** How far the glow reaches past the socket, as a share of the socket's
 * half-width. Wide enough that two eyes wash into one another's light on an
 * angry body, which is when they should. */
const GLOW_REACH = 2.4;

/** The socket's half-width and half-height as shares of the body's, and how
 * much of the half-height rage takes back to make a slit. */
const SOCKET_W = 0.24;
const SOCKET_H = 0.28;
const SLIT = 0.13;
/** How much of the socket the pupil fills, across and down, and how much of
 * the pupil the hot core fills. */
const PUPIL = 0.68;
const PUPIL_MIN_H = 0.45;
const CORE = 0.5;

export function drawGhostEyes(
  ctx: CanvasRenderingContext2D,
  rim: string,
  hot: string,
  dark: string,
  rage: number,
  t: number,
): void {
  const ex = GHOST.rx * 0.42;
  const ey = -GHOST.ry * 0.16;
  const rw = GHOST.rx * SOCKET_W;
  const rh = GHOST.ry * (SOCKET_H - rage * SLIT);
  // The flicker: a lamp that is not quite steady, on the same wall clock the
  // contour wobbles on. Two frequencies rather than one, so it never settles
  // into a blink the eye can count — and shallow, so the eye is never out.
  const flicker = 0.9 + 0.07 * Math.sin(t * 4.7) + 0.03 * Math.sin(t * 11.3);

  ctx.save();
  for (const side of [-1, 1]) {
    const cx = side * ex;

    // The light first and under everything: it is thrown *onto* the body, so
    // the socket that follows cuts a hole out of the middle of it.
    halo(ctx, cx, ey, rw * GLOW_REACH, rim, (0.28 + rage * 0.3) * flicker);

    const socket = new Path2D();
    socket.ellipse(cx, ey, rw, rh, 0, 0, Math.PI * 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = dark;
    ctx.fill(socket);

    // The core. Lit rather than filled — `lighter` over the socket is what
    // makes it look like something burning inside a hole instead of a paler
    // shape painted into one.
    ctx.globalCompositeOperation = "lighter";
    const pw = rw * PUPIL;
    const ph = Math.max(rh * PUPIL, rw * PUPIL_MIN_H);
    const pupil = new Path2D();
    pupil.ellipse(cx, ey, pw, ph, 0, 0, Math.PI * 2);
    ctx.globalAlpha = (0.8 + rage * 0.2) * flicker;
    ctx.fillStyle = rim;
    ctx.fill(pupil);

    const core = new Path2D();
    core.ellipse(cx, ey, pw * CORE, ph * CORE, 0, 0, Math.PI * 2);
    ctx.globalAlpha = (0.85 + rage * 0.15) * flicker;
    ctx.fillStyle = hot;
    ctx.fill(core);
    ctx.globalCompositeOperation = "source-over";

    // And the rim last, over both, so the socket keeps a hard edge against
    // the light spilling out of it.
    ctx.lineWidth = Math.max(0.5, GHOST.ry * 0.05);
    ctx.strokeStyle = rim;
    ctx.globalAlpha = 0.9;
    ctx.stroke(socket);
  }
  ctx.restore();
}
