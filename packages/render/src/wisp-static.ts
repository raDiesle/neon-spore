import { slabAt } from "./ghost-glitch.js";

/**
 * THE WISP's interference: the reason a body only one player can see does not
 * look like a body both of them could.
 *
 * **The problem this answers.** A wisp drawn as a solid jellyfish is a solid
 * jellyfish, and player 2 has no way to tell from the picture that the other
 * screen has nothing on it. The split is the whole creature and it was the one
 * thing the body never said. So the bell is not resolved: it comes through in
 * horizontal bands, a couple of which are simply *not there* on any given
 * frame, and the field behind shows through the gaps. What player 2 is looking
 * at plainly reads as a signal one receiver is holding rather than an object
 * in the room — which is exactly what it is.
 *
 * **Transparent, not faint.** The two are different pictures and only one of
 * them works. A body at a flat low opacity is a *dim* body: every part of it
 * is equally there, so an eye reads it as far away or badly lit and goes on
 * treating it as solid. A body with holes in it has parts that are fully
 * present and parts that are fully absent, and nothing else on the field looks
 * like that. It is also what keeps the thing nameable at speed: the bands that
 * do come through come through at full strength, so the colour, the core and
 * the rim are never washed out — only interrupted.
 *
 * **The silhouette survives the interference, and that is not negotiable.**
 * Player 2 has under a dwell to say a letter and a number to somebody who
 * cannot check, so a contour that broke up entirely would cost them the one
 * sentence this creature exists for. One continuous soft rim is drawn under
 * everything here (`drawWispBody`), and what tears is the *inside*.
 *
 * **How it differs from THE GHOST's camouflage, deliberately.** Both are torn
 * bands and they share `slabAt` — the three-frequency deterministic jitter in
 * `ghost-glitch.ts`, one copy, because two would drift. What each does with it
 * is opposite. A ghost's bands *slide*: every one is present, shifted sideways
 * against its neighbours, so the body is whole and dislocated — the picture of
 * something wearing a disguise. A wisp's bands *drop out*: they hold their
 * place and stop existing, so the body is aligned and incomplete — the picture
 * of something being received. A ghost is hiding; a wisp is only half here.
 * Nothing about the two reads the same at a glance, which matters on the day
 * one field carries both.
 *
 * **It is deterministic, from the body's own id and the wall clock.** Nothing
 * here holds state between frames and nothing here rolls a number: two phones
 * draw one wisp the same way, for the reason every wobble in this package
 * does — the pair says a square out loud, and a picture that differed between
 * the seats would make that sentence a lie.
 */

/** How many bands the bell is received in. More than the ghost's seven: a
 * ghost is torn and a wisp is *scanned*, and a finer comb is what separates
 * the two at 26 px without either losing its outline. */
const BANDS = 9;

/** One band of the bell, as fractions of its own half-height and half-width. */
export interface WispBand {
  /** −1 at the top of the bell, 1 at the bottom. */
  top: number;
  height: number;
  /** Sideways slip, as a share of half-width. Small — a wisp's bands are not
   * thrown, they only fail to line up. */
  shift: number;
  /** How much of this band came through, 0 gone to 1 solid. */
  hold: number;
}

/**
 * The bands, top to bottom.
 *
 * `noise` is how badly the signal is holding — 0 while it stands on its tile,
 * up toward 1 at the two ends of a jump. That is the one input here that is
 * not a clock, and it is the argument for having it: the moment the thing
 * moves is the moment it is least resolved, so the gather and the landing tear
 * hardest and the long dwell in between is the part player 2 can actually
 * read. `ghostRage` does the same job for the ghost and for the same reason.
 *
 * Returned as data rather than drawn, so the fill, the rim and the shards
 * thrown clear are all laid out from one list. A second copy of where a band
 * is would show as a shard belonging to no gap.
 */
export function wispBands(id: number, time: number, noise: number): WispBand[] {
  const out: WispBand[] = [];
  const height = 2 / BANDS;
  // One bright band travelling down the body, wrapping. It is what makes the
  // thing read as *scanned* rather than as flickering: an eye follows a moving
  // edge and infers a receiver, where a field of independent flickers is only
  // ever noise.
  const scan = ((time * 0.42 + id * 0.31) % 1) * 2 - 1;
  for (let band = 0; band < BANDS; band++) {
    const top = -1 + band * height;
    const k = id * 0.91 + band * 2.13;
    // Two frequencies with no common period, so a band never settles into a
    // rhythm and two wisps on one field are never one picture drawn twice.
    const wave = Math.sin(time * 1.9 + k) * 0.55 + Math.sin(time * 3.7 + k * 1.7) * 0.45;
    // Nearest the scan line, everything comes through.
    const lit = Math.max(0, 1 - Math.abs(top + height / 2 - scan) * 2.2);
    const hold = clamp(0.62 + wave * 0.52 + lit * 0.5 - noise * 0.55);
    out.push({ top, height, shift: slabAt(id, band, time, 0) * 0.28, hold });
  }
  return out;
}

/** Whether this band is gone far enough to throw a fragment clear of the body
 * — the piece of the signal that landed beside the receiver rather than in it.
 * Only ever while the thing is moving: a wisp standing on its tile sheds
 * nothing, or the tile it is standing on would be ringed in litter. */
function bandIsLoose(b: WispBand, noise: number): boolean {
  return noise > 0.25 && b.hold < 0.18;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * The bell, received band by band.
 *
 * Each band is a *window* on the contour rather than a shape of its own:
 * clipping the bell to a slice keeps every edge the silhouette's own, so a
 * body coming through in nine pieces still has exactly one outline. A band
 * that did not come through is not drawn at all — that is what makes the gap
 * transparent rather than dim, which is the whole point (see the head of this
 * file).
 *
 * The rim is stroked again inside each band at that band's strength, over the
 * one continuous soft pass `drawWispBody` lays down first. So the outline is
 * brightest exactly where the body is present and falls back to the soft pass
 * where it is not: an outline that is *interrupted* rather than dashed, which
 * is the distinction from THE GHOST's uniformly broken contour.
 */
export function drawBands(
  ctx: CanvasRenderingContext2D,
  bell: Path2D,
  bands: readonly WispBand[],
  rx: number,
  ry: number,
  fill: CanvasGradient,
  rim: string,
  lineWidth: number,
): void {
  for (const b of bands) {
    if (b.hold <= 0.02) continue;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-rx * 1.4, b.top * ry, rx * 2.8, b.height * ry);
    ctx.clip();
    ctx.translate(b.shift * rx, 0);
    ctx.globalAlpha = b.hold;
    ctx.fillStyle = fill;
    ctx.fill(bell);
    ctx.strokeStyle = rim;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = b.hold * 0.9;
    ctx.stroke(bell);
    ctx.restore();
  }
}

/**
 * The pieces of the signal that landed beside the receiver rather than in it:
 * a thin bright bar out to one side of a band that did not come through.
 *
 * Drawn after the body's transform is restored, for `drawShards`' reason in
 * `ghost.ts`: a fragment is a fragment on the screen, not a thing that
 * squashes with the body it fell off. And only while the thing is moving —
 * `bandIsLoose` holds the rule, because a wisp standing still shedding pieces
 * would ring the tile it is standing on in litter, and that tile is the one
 * thing on this field that has to stay clean.
 */
export function drawShards(
  ctx: CanvasRenderingContext2D,
  bands: readonly WispBand[],
  noise: number,
  x: number,
  y: number,
  r: number,
  hex: string,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = hex;
  for (const b of bands) {
    if (!bandIsLoose(b, noise)) continue;
    const side = b.shift >= 0 ? 1 : -1;
    ctx.globalAlpha = 0.2 + noise * 0.3;
    ctx.fillRect(
      x + side * r * (0.9 + Math.abs(b.shift) * 2),
      y + b.top * r,
      r * (0.35 + noise * 0.4) * side,
      Math.max(0.6, b.height * r * 0.5),
    );
  }
  ctx.restore();
}
