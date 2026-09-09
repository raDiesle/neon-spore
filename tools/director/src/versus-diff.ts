import { computeLayout, computeStage, type ViewRole } from "@neon-spore/render";
import type { SimConfig } from "@neon-spore/sim";

/**
 * How two pictures of the same frame are compared — the pixel arithmetic
 * behind `versus-seat.ts`, and the one row of the phone that arithmetic
 * changes rule at.
 *
 * Split out of that file when it reached CLAUDE.md's line ceiling, and the
 * seam is the honest one: nothing here draws anything or knows what a pose or
 * a candidate is, so all of it is testable against two byte buffers with no
 * browser in the room (`test/versus-seat.test.ts`), while what is left next
 * door is about *producing* the two pictures. The argument for why the field
 * and the band are hashed differently lives with the functions that do it.
 */

/** The phone the probe draws into, and the frame `bandTopPx` answers in. */
const PROBE_PHONE = { width: 380, height: 820 } as const;

/** One sample's signature: an exact value hash of the field rows, and a
 * touched-footprint hash of the band rows — the two different tests, joined
 * so a caller comparing whole sequences needs only one string per sample. */
export function signature(
  da: Uint8ClampedArray,
  db: Uint8ClampedArray,
  width: number,
  height: number,
  bandTop: number,
): string {
  const field = absDiffHash(da, db, width, 0, bandTop);
  const band = touchFootprintHash(da, db, width, bandTop, height, BAND_TOUCH_THRESHOLD);
  return `${field}:${band}`;
}

/**
 * How far a channel has to move, on a 0-255 scale, before a band pixel counts
 * as "touched" by the patch. `cannon:shot`'s `streak` blends at a constant
 * `tailAlpha: 0.8` — nowhere near this threshold's neighbourhood — so this
 * exists for the few pixels right at a translucent shape's own edge, where an
 * anti-aliased fringe can round to a ±1 or ±2 difference on one background and
 * not on the other. Real drawn content — a stroke, a fill, a lobe — moves a
 * channel by tens of levels at least, so this stays far below anything a
 * genuine panel redraw would produce.
 */
const BAND_TOUCH_THRESHOLD = 10;

/**
 * Where the play area ends and the control band begins, in the probe
 * canvas's own device pixels — computed the same two calls the renderer
 * itself makes (`computeStage` then `computeLayout`) rather than re-derived,
 * per `purity.test.ts`'s table of things that must be called and not copied.
 * `computeStage`'s `top` is always `0`, so the stage's own vertical offset
 * never enters this, and `bandSoloPct` (not `bandPct`) governs both `p1` and
 * `p2` alike — a solo seat's band, whichever half it is — so this returns the
 * same row for both, which is exactly why the two seats' stages are
 * pixel-identical in extent and only their content differs.
 */
export function bandTopPx(cfg: SimConfig, role: ViewRole): number {
  const viewport = { ...PROBE_PHONE, dpr: 1 };
  const stage = computeStage(viewport, cfg, role);
  const layout = computeLayout({ width: stage.width, height: stage.height, dpr: 1 }, cfg, role);
  return Math.round(stage.top + layout.bandTop);
}

/** FNV-1a over the absolute per-channel difference of two same-sized pixel
 * buffers, restricted to rows `[y0, y1)` — the pixel signature of exactly how
 * much changed between them in that band of rows, not of either picture on
 * its own. */
export function absDiffHash(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  width: number,
  y0: number,
  y1: number,
): string {
  const rowBytes = width * 4;
  let h = 0x811c9dc5;
  for (let y = Math.max(0, y0); y < y1; y++) {
    const base = y * rowBytes;
    for (let i = base; i < base + rowBytes; i++) {
      h ^= Math.abs((a[i] ?? 0) - (b[i] ?? 0));
      h = Math.imul(h, 0x01000193);
    }
  }
  return (h >>> 0).toString(16);
}

/**
 * The least of a phone a candidate has to move to be worth a vote, as a share
 * of the frame.
 *
 * Measured rather than chosen. Every candidate open on 9 September 2026, run
 * through the page in a real browser at 380 x 820:
 *
 * ```
 * ship:hull-shape / ridge    4.3%
 * ship:light / barrel        1.8%
 * crawler:skin / pearl       1.7%
 * creature:skin / veil       0.5%
 * creature:gyre / yolk       0.4%
 * creature:meteor / forge    0.2%
 * creature:throb / globe     0.2%
 * creature:wisp / ring       0.1%
 * creature:choir / orbs      0.071%   <- the quietest one plainly worth a vote
 * ---------------------------------
 * ship:hull-body / carapace  0.013%   <- the ramp that had to be cut
 * ```
 *
 * The last row is the case this whole measure exists for: four new stops on a
 * membrane thirty pixels tall, which every guard in the repository passed and
 * which two screenshots of the pair could not tell apart. It was rebuilt for
 * an afternoon to be measured and thrown away again. The floor sits in the
 * gap, about twice the ramp and half the orbs — a creature is a small thing on
 * a phone, so the numbers a real candidate makes are small too, and a floor
 * set by intuition would have swallowed most of this list.
 *
 * Anything under it is *reported*, never refused. The page says so in plain
 * words and the owner still decides, because a candidate can be quiet on
 * purpose and this number cannot tell the difference.
 */
export const SEEN_FLOOR = 0.0003;

/**
 * How much of the frame a patch actually moves: the share of pixels, 0..1,
 * that changed by more than `threshold` on any channel.
 *
 * The same pass `touchFootprintHash` makes, counted instead of hashed. The
 * hash answers *did this differ from the other seat*, which every guard in the
 * repository already asks; this answers *is there anything here to look at*,
 * which none of them did. `ship:hull-body` / `carapace` is the case that found
 * it — four new stops on a membrane about thirty pixels tall on a 380 x 820
 * phone, so two screenshots of the pair were indistinguishable at a glance
 * while `distinct.test.ts`, `variants.test.ts` and the page's own settled
 * banner all passed it. A vote is the expensive step, and this is the cheap
 * disqualifier `docs/art-review.md` puts before one.
 */
export function touchedShare(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  width: number,
  y0: number,
  y1: number,
  threshold = BAND_TOUCH_THRESHOLD,
): number {
  const rowBytes = width * 4;
  const rows = Math.max(0, y1 - Math.max(0, y0));
  if (rows === 0 || width === 0) return 0;
  let touched = 0;
  for (let y = Math.max(0, y0); y < y1; y++) {
    const base = y * rowBytes;
    for (let x = 0; x < width; x++) {
      const p = base + x * 4;
      for (let c = 0; c < 4; c++) {
        if (Math.abs((a[p + c] ?? 0) - (b[p + c] ?? 0)) > threshold) {
          touched++;
          break;
        }
      }
    }
  }
  return touched / (rows * width);
}

/** FNV-1a over a one-bit-per-pixel footprint of *which* pixels changed by
 * more than `threshold` on any channel, restricted to rows `[y0, y1)` —
 * where the patch touched something, not how far it moved a value. This is
 * what makes the band comparison blind to a translucent layer's dependence on
 * the background underneath it while staying alert to content that only one
 * seat ever draws at all. */
export function touchFootprintHash(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  width: number,
  y0: number,
  y1: number,
  threshold: number,
): string {
  const rowBytes = width * 4;
  let h = 0x811c9dc5;
  for (let y = Math.max(0, y0); y < y1; y++) {
    const base = y * rowBytes;
    for (let x = 0; x < width; x++) {
      const p = base + x * 4;
      let touched = 0;
      for (let c = 0; c < 4; c++) {
        if (Math.abs((a[p + c] ?? 0) - (b[p + c] ?? 0)) > threshold) {
          touched = 1;
          break;
        }
      }
      h ^= touched;
      h = Math.imul(h, 0x01000193);
    }
  }
  return (h >>> 0).toString(16);
}
