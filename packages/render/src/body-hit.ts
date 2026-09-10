import { BREAK_LOOK, type BreakLook } from "./break-look.js";

/**
 * What happens to a living body **when a shot lands on it**, as a record per
 * kind rather than as one answer shared by every body in the game.
 *
 * `body-interior.ts` is the seam this is cut one level along from, and for the
 * same reason. The owner asked on 9 September 2026 for the slick and the bulb
 * to have very good graphics *and hit visuals*, because they are on more waves
 * than anything else; the interiors landed the same day and the hit could
 * not, because there was nothing per-body to patch. A shot landing on a slick
 * threw the same sparks and cut the same pieces as a shot landing on a dart:
 * `sparks.ts` and `BREAK_LOOK` are read by every kill alike.
 *
 * **Three records, and the third is the point.** `SLICK_HIT`, `BULB_HIT` and
 * `BODY_HIT` hold the identical shipped answer, and they are separate objects
 * so that a candidate on the slick's hit does not silently change a dart's,
 * an echo's, a rind's or a lure's. `hitFor` is the route the effects take,
 * and it is what a candidate's `reached` must name.
 *
 * **Two halves, because a hit is two things.** The *pieces* are what the body
 * comes apart into and how the squares over them are scaled — `BreakLook`,
 * decided once for every body by `creature:break` and shared until a kind
 * says otherwise. The *strike* is what the body does on the beat it is struck
 * and what it leaves behind: drawn where the body stood for `life` seconds
 * after it is gone, in the body's own colour, which is also the colour of the
 * shot that landed — a body only dies to its own ammunition, so the rule that
 * an impact is drawn in the colour of the thing that hit and the rule that
 * it is drawn in the body's are one rule here. It ships **empty**: `life` is
 * 0 and `strike` is never called, so the field is untouched to the pixel
 * until a candidate patches a record.
 *
 * The strike is a transient (`body-strike.ts`) and not a frame of the body,
 * because the body is gone from the world on the frame the event arrives —
 * the shot resolves on the beat the body is drawn touching it, and after that
 * there is nothing left to redraw it around. So a strike is handed the outline
 * the body had, in pixels, and where it stood, and draws from that alone.
 */

/** Everything a strike is drawn from, in the field's own pixels, centred on
 * where the body stood. */
export interface Strike {
  /** The body's three colours — the shot's colours, by the rule above. */
  readonly hex: string;
  readonly rim: string;
  readonly dark: string;
  /** The contour the body wore on the frame it was struck, in pixels, centred
   * on the origin. The strike may fill it, cut it, or throw it. */
  readonly outline: readonly { readonly x: number; readonly y: number }[];
  /** Its half-extents, in pixels. */
  readonly rx: number;
  readonly ry: number;
  /** One tile in pixels, so anything thrown is sized to the field. */
  readonly tile: number;
  /** How far below the origin the ship's drawn skin is at this column, in
   * pixels — where what the strike leaves behind may come to rest. */
  readonly floor: number;
  /** Seconds since the shot landed, and how long the strike is drawn for. */
  readonly age: number;
  readonly life: number;
  /** The contour clock the body was wobbling on, so a strike that keeps
   * something of the body moving keeps it on the same clock. */
  readonly t: number;
  /** The same seed on both phones — a column and a row are the only numbers
   * they agree about (`effects-break.ts`). */
  readonly seed: number;
}

export interface HitLook {
  /** What the body comes apart into. `BREAK_LOOK` for every kind today. */
  readonly pieces: BreakLook;
  /** How long the strike is on screen, in seconds. Zero ships: nothing is
   * drawn and `strike` is never called. */
  readonly life: number;
  /** What the body does on the beat it is struck, and what it leaves behind. */
  readonly strike: (ctx: CanvasRenderingContext2D, s: Strike) => void;
}

/** The shipped strike: nothing. The sparks and the pieces are the whole of
 * what a kill draws, and they are read off `pieces`. */
function none(): void {}

/** THE SLICK's own hit, and the record a `slick:hit` candidate patches. */
export const SLICK_HIT: HitLook = { pieces: BREAK_LOOK, life: 0, strike: none };

/** THE BULB's own, and `bulb:hit`'s record. */
export const BULB_HIT: HitLook = { pieces: BREAK_LOOK, life: 0, strike: none };

/**
 * Every other body's. It exists so that it can stop being identical without
 * anybody deciding that it should — a decision about the slick is not a
 * decision about a dart (`body-interior.ts`'s `BODY_LOOK`, for the same
 * reason).
 */
export const BODY_HIT: HitLook = { pieces: BREAK_LOOK, life: 0, strike: none };

/**
 * The route the effects take, and the one a candidate's `reached` names. A
 * lookup rather than a `Record` keyed by `CreatureKind` because a `destroy`
 * carries the kind the body was *drawn* as — a lure arrives here as the slick
 * or the bulb it was wearing, and a crawler's ring is named at the call site.
 */
export function hitFor(kind: string): HitLook {
  if (kind === "slick") return SLICK_HIT;
  if (kind === "bulb") return BULB_HIT;
  return BODY_HIT;
}
