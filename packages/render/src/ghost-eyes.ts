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
 * Everything here is in the body's own units, inside the transform `drawGhost`
 * has already put the context in, so the halo's sprite key is stable across
 * every ghost at every distance and the cache in `glow.ts` holds one of it.
 */

/** How far the glow reaches past the socket, as a share of the socket's
 * half-width. Wide enough that two eyes wash into one another's light on an
 * angry body, which is when they should. */
const GLOW_REACH = 2.4;

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
  const rw = GHOST.rx * 0.2;
  const rh = GHOST.ry * (0.23 - rage * 0.11);
  // The flicker: a lamp that is not quite steady, on the same wall clock the
  // contour wobbles on. Two frequencies rather than one, so it never settles
  // into a blink the eye can count.
  const flicker = 0.78 + 0.14 * Math.sin(t * 4.7) + 0.08 * Math.sin(t * 11.3);

  ctx.save();
  for (const side of [-1, 1]) {
    const cx = side * ex;

    // The light first and under everything: it is thrown *onto* the body, so
    // the socket that follows cuts a hole out of the middle of it.
    halo(ctx, cx, ey, rw * GLOW_REACH, rim, (0.2 + rage * 0.35) * flicker);

    const socket = new Path2D();
    socket.ellipse(cx, ey, rw, rh, 0, 0, Math.PI * 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = dark;
    ctx.fill(socket);

    // The core. Lit rather than filled — `lighter` over the socket is what
    // makes it look like something burning inside a hole instead of a paler
    // shape painted into one.
    ctx.globalCompositeOperation = "lighter";
    const pw = rw * 0.42;
    const ph = Math.max(rh * 0.3, rw * 0.24);
    const pupil = new Path2D();
    pupil.ellipse(cx, ey, pw, ph, 0, 0, Math.PI * 2);
    ctx.globalAlpha = (0.55 + rage * 0.4) * flicker;
    ctx.fillStyle = rim;
    ctx.fill(pupil);

    const core = new Path2D();
    core.ellipse(cx, ey, pw * 0.42, ph * 0.42, 0, 0, Math.PI * 2);
    ctx.globalAlpha = (0.6 + rage * 0.4) * flicker;
    ctx.fillStyle = hot;
    ctx.fill(core);
    ctx.globalCompositeOperation = "source-over";

    // And the rim last, over both, so the socket keeps a hard edge against
    // the light spilling out of it.
    ctx.lineWidth = Math.max(0.5, GHOST.ry * 0.035);
    ctx.strokeStyle = rim;
    ctx.globalAlpha = 0.9;
    ctx.stroke(socket);
  }
  ctx.restore();
}
