import { smoothstep } from "./ease.js";
import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { Aim } from "./slow-intake-aim.js";

/**
 * **The field runs inward, all the way round the body, and stops at its skin.**
 *
 * The owner's two corrections to the `indraw` candidate this came out of
 * (`tools/versus/DECIDED.md`), 22 September 2026: *much more
 * visible*, *around the full boss*, and *it must not be above the boss shape —
 * stop before body of boss*. So this is the same idea rebuilt on the body's own
 * radius instead of on a handle's: fourteen streams on a ring that surrounds
 * the whole figure, each one running in and **ending a tenth of a body clear of
 * the contour**, where the light piles up into a rim that says *this is the
 * thing time is being spent on*.
 *
 * **Nothing is ever drawn over the body, and that is enforced rather than
 * arranged.** The clip is the play area with the body punched out of it — not a
 * disc round the head but the whole run of it, head *and* the chain of plates
 * it hangs from, as one tapered capsule along the body's own axis. So no stream
 * can reach the boss however the numbers are tuned and however far the figure
 * has morphed. Ending the beads early would only be a promise; the hole is a
 * guarantee, and it is the half of the owner's correction a disc would miss.
 *
 * What the hole does not cover is the arms, which reach out sideways past it.
 * They are thin, the light is added rather than laid over, and the streams stop
 * a tenth of a body clear of the skin anyway — but a mark on a hand is the one
 * place this look and a thumb share a pixel.
 *
 * **Nothing dark is laid anywhere in it.** The candidate carried a veil of the
 * ground's own colour under each stream so the rim of the screen went quiet
 * without a vignette. With the body cut out of the pass, that veil darkened
 * everything *except* the boss, and the cut-out showed as a lighter patch the
 * shape of the keep-out with a hard outline — the one thing the brief refuses,
 * arrived at from the other side. The light here only ever adds.
 *
 * **No line is drawn anywhere in it.** A stream is a run of eighteen
 * overlapping borderless radial gradients on a bent path — sampled, never
 * stroked. Eighteen and not nine: at nine the beads stand apart near the tail
 * and the stream reads as a dotted line, which is the one shape the brief
 * refuses. They have to overlap for the run to be a run.
 *
 * **How it can lose.** A stream is very close to a streak, and fourteen of them
 * around one body is close to a starburst. It is also the heaviest thing this
 * pass draws, and the streams cross the field's outer columns, which is exactly
 * where a creature falling past the boss is drawn.
 */

/** Streams on the ring. Fourteen, so the body is surrounded rather than
 * approached from a few sides — the owner asked for the full boss. */
const STREAMS = 14;

/** Bokeh strung along each stream. They have to overlap: see the header. */
const BEADS = 18;

/** Trips a stream makes across the window, so light keeps arriving rather than
 * all of it landing at once and the field going still for the second beat. */
const TRIPS = 1.5;

/** Where a stream starts and where it stops, in body radii from the centre.
 * `NEAR` is the whole of *stop before the body*: the beads end a tenth of a
 * body clear of the contour and the clip holds them there. */
const FAR = 4.6;
const NEAR = 1.0;

/** How far a stream bends off the straight run in, as a share of its length,
 * and how much of that bend a stream can differ by. */
const BEND = 0.16;
const BEND_VARY = 0.4;

/** A bead at its brightest, and its radius at the stream's head and at its
 * tail, in body radii. It thins as it nears: the same light in a narrower run. */
const BEAD_LIT = 0.34;
const BEAD_HEAD = 0.5;
const BEAD_TAIL = 0.17;

/** How wide the keep-out stands at the head and at the far end of the axis, in
 * body radii. The head's own figure is a little under one, and the chain's top
 * plate a little under a half, so both are covered with room to spare — the
 * owner asked for the light to stop before the body *and more of it*. */
const KEEP_HEAD = 1.02;
const KEEP_FAR = 0.7;

/** How far out of the keep-out a bead takes to come up to full strength, in
 * body radii. Without it the clip does the stopping and the flank of the
 * capsule shows as a straight edge sliced across the light — a hard line, which
 * is the one thing the brief rules out. With it the light is already at nothing
 * where the cut runs, and the clip goes back to being the guarantee it is
 * supposed to be rather than something an eye can see. */
const FEATHER = 0.55;

/**
 * The play area with the whole body cut out of it: a capsule from the far end
 * of the axis down to the head, round-capped there.
 *
 * **One subpath and no overlap**, which is the whole reason it is a capsule
 * rather than a string of discs. Canvas fills by non-zero winding, so two
 * overlapping holes wound the same way cancel back to solid and the body would
 * be painted over exactly where the cut-outs met. Traversed against the
 * rectangle so the body's interior winds to nought and falls out of the clip.
 */
/** How far a point stands clear of the keep-out around the body, in pixels —
 * negative inside it. The capsule again, measured rather than cut. */
function clearOf(at: Aim, x: number, y: number): number {
  const dx = at.x - at.ax;
  const dy = at.y - at.ay;
  const run = dx * dx + dy * dy;
  // How far down the axis the nearest point stands, held to the two ends so a
  // bead past the head measures to the head and not to the line's extension.
  const along =
    run <= 0 ? 1 : Math.max(0, Math.min(1, ((x - at.ax) * dx + (y - at.ay) * dy) / run));
  const near = Math.hypot(x - (at.ax + dx * along), y - (at.ay + dy * along));
  return near - at.r * (KEEP_FAR + (KEEP_HEAD - KEEP_FAR) * along);
}

function clipRoundBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Aim,
  top: number,
  floor: number,
): void {
  ctx.beginPath();
  ctx.rect(0, top, l.width, floor - top);
  const dx = at.x - at.ax;
  const dy = at.y - at.ay;
  const run = Math.hypot(dx, dy);
  const head = at.r * KEEP_HEAD;
  if (run <= at.r * 0.05) {
    // Nothing hangs off this body: the capsule is its own head, and one arc
    // wound the other way is the hole.
    ctx.arc(at.x, at.y, head, 0, Math.PI * 2, true);
    ctx.clip();
    return;
  }
  const far = at.r * KEEP_FAR;
  // Across the axis, so the two flanks of the capsule can be walked.
  const px = -dy / run;
  const py = dx / run;
  const ang = Math.atan2(py, px);
  ctx.moveTo(at.ax + px * far, at.ay + py * far);
  ctx.lineTo(at.x + px * head, at.y + py * head);
  ctx.arc(at.x, at.y, head, ang, ang - Math.PI, true);
  ctx.lineTo(at.ax - px * far, at.ay - py * far);
  ctx.closePath();
  ctx.clip();
}

/** Draws the intake. `up` is the ramp, `t` how far through the window. */
export function drawStreams(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Aim,
  up: number,
  t: number,
): void {
  // **From the top of the screen**, not the field's: the owner, 24 September
  // 2026, *it is cut by some invisible horizontal top bar, it should go full
  // game screen*. The field's top edge is nothing a player can see, so light
  // stopping on it read as a cut. To the hull and no further: below it is the ship's own tissue, drawn over
  // this pass, and a stream has nothing to say about a hand (`slow-look.ts`).
  const floor = l.hullY;
  const top = 0;
  if (floor <= top || at.r <= 0) return;

  ctx.save();
  clipRoundBody(ctx, l, at, top, floor);

  // **No glow is laid round the body, and the first draft's was the lesson.**
  // A radial gradient brightest at the skin is cut by the clip, and the clip's
  // flanks are straight: the first shot of it had two hard diagonals running up
  // the field where the light stopped against the chain. Anything this pass
  // draws has to be at nothing *before* the cut, which a gradient centred on
  // the body cannot be. So the beads carry all of it, and they fade with their
  // own distance from the keep-out.
  ctx.globalCompositeOperation = "source-over";

  for (let s = 0; s < STREAMS; s++) {
    // Each stream's ray, its head start and its own lean, looked up rather
    // than rolled: `sinHash` is render's one repeatable 0..1, and a stream
    // that moved somewhere else every frame would flicker rather than flow.
    const angle = (s / STREAMS) * Math.PI * 2 + sinHash(s) * 0.25;
    const flow = (t * TRIPS + sinHash(s, 1)) % 1;
    const lean = BEND * (1 + (sinHash(s, 2) * 2 - 1) * BEND_VARY) * (sinHash(s, 3) < 0.5 ? -1 : 1);
    // Up out of nothing and back into it across the stream's own run, so no
    // stream ever appears or vanishes where an eye can catch it doing either.
    const alive = Math.sin(Math.PI * flow) ** 0.8 * up;
    if (alive <= 0) continue;
    // Where the far end of this stream stands, and the point it bends through.
    const head = at.r * (FAR - (FAR - NEAR) * flow * flow);
    const stop = at.r * NEAR;
    const hx = at.x + Math.cos(angle) * head;
    const hy = at.y + Math.sin(angle) * head;
    const ex = at.x + Math.cos(angle) * stop;
    const ey = at.y + Math.sin(angle) * stop;
    const mx = (ex + hx) / 2 - (hy - ey) * lean;
    const my = (ey + hy) / 2 + (hx - ex) * lean;
    for (let b = 0; b < BEADS; b++) {
      // 0 at the head out in the field, 1 at the tail against the body.
      const along = b / (BEADS - 1);
      const u = 1 - along;
      const w = u * u;
      const v = 2 * u * (1 - u);
      const k = (1 - u) * (1 - u);
      const x = hx * w + mx * v + ex * k;
      const y = hy * w + my * v + ey * k;
      const rad = at.r * (BEAD_HEAD + (BEAD_TAIL - BEAD_HEAD) * along);
      // Brightest in the middle of the run: a head that lit at full strength
      // would be a dot appearing at the screen's edge every trip.
      // Up out of nothing as it leaves the body, so the cut never shows.
      const clear = smoothstep(clearOf(at, x, y) / (at.r * FEATHER));
      const lit = BEAD_LIT * alive * clear * Math.sin(Math.PI * along) ** 0.7;
      if (lit <= 0) continue;
      const bead = ctx.createRadialGradient(x, y, 0, x, y, rad);
      bead.addColorStop(0, rgba(PALETTE.hullRim, lit));
      bead.addColorStop(0.4, rgba(PALETTE.hull, lit * 0.5));
      bead.addColorStop(1, rgba(PALETTE.hull, 0));
      ctx.fillStyle = bead;
      // Added rather than laid over: a stream crossing a mark has to leave the
      // mark readable, which is the first line of the brief.
      ctx.globalCompositeOperation = "lighter";
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      ctx.globalCompositeOperation = "source-over";
    }
  }
  ctx.restore();
}
