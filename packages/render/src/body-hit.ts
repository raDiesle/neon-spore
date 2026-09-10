import { afterglow } from "./body-hit-afterglow.js";
import { pop } from "./body-hit-pop.js";
import { rupture } from "./body-hit-rupture.js";
import { scatter } from "./body-hit-scatter.js";
import { shock } from "./body-hit-shock.js";
import { splash } from "./body-hit-splash.js";
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
 * **A record per body, and the last one is the point.** Six candidates were
 * offered on the slick's and the bulb's hit, and on 10 September 2026 the
 * owner liked all of them and the shipped kill besides, and asked for every
 * one to be in the game. So the slick keeps the shipped kill, the bulb pops,
 * and the other five went to the bodies they read best on — each record
 * says why. They are separate objects so that a candidate on one body's hit
 * does not silently change another's; `BODY_HIT` is every body without an
 * answer of its own. `hitFor` is the route the effects take, and it is what
 * a candidate's `reached` must name.
 *
 * **Two halves, because a hit is two things.** The *pieces* are what the body
 * comes apart into and how the squares over them are scaled — `BreakLook`,
 * decided once for every body by `creature:break` and shared until a kind
 * says otherwise. The *strike* is what the body does on the beat it is struck
 * and what it leaves behind: drawn where the body stood for `life` seconds
 * after it is gone, in the body's own colour, which is also the colour of the
 * shot that landed — a body only dies to its own ammunition, so the rule that
 * an impact is drawn in the colour of the thing that hit and the rule that
 * it is drawn in the body's are one rule here. A kind with no strike of its
 * own has `life` 0 and `strike` is never called, so its kill is untouched to
 * the pixel until a candidate patches its record.
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

/** A strike that draws nothing: the sparks and the pieces are the whole of
 * what the kill draws, and they are read off `pieces`. */
function none(): void {}

/** Every strike below is on screen for this long, in seconds — the length
 * the six were judged at in VERSUS, and one number so no body lingers. */
const STRIKE_LIFE = 0.9;

/**
 * THE SLICK's own hit, and the record a `slick:hit` candidate patches. The
 * owner kept the shipped kill for it on 10 September 2026 — squares and
 * wedges, no strike — and sent the three offered strikes to other bodies.
 */
export const SLICK_HIT: HitLook = { pieces: BREAK_LOOK, life: 0, strike: none };

/** THE BULB's own, and `bulb:hit`'s record: a bubble pops. */
export const BULB_HIT: HitLook = { pieces: BREAK_LOOK, life: STRIKE_LIFE, strike: pop };

/** THE THROB's: half of it is plating, so a shot on it is a *blow* — the
 * contour pressed flat and rebounding, two rings running down the column to
 * light the hull. */
export const THROB_HIT: HitLook = { pieces: BREAK_LOOK, life: STRIKE_LIFE, strike: shock };

/** THE DART's: a body that moves in leaps leaves an afterimage — the skin
 * goes at once, the cores burn out, the outline hangs and fades. */
export const DART_HIT: HitLook = { pieces: BREAK_LOOK, life: STRIKE_LIFE, strike: afterglow };

/** THE WISP's: a light rather than a body, so it scatters as lit motes that
 * rise and blink out — and nothing of a wisp ever falls to the ship. */
export const WISP_HIT: HitLook = { pieces: BREAK_LOOK, life: STRIKE_LIFE, strike: scatter };

/** THE RIND's last layer: a rind is skin, and the skin peels back along its
 * veins into petals while the gel slides down and dries on the ship. */
export const RIND_HIT: HitLook = { pieces: BREAK_LOOK, life: STRIKE_LIFE, strike: rupture };

/** THE ECHO's: one small body into a dozen drops, thrown up and falling to
 * a puddle — a body that was many, ending as many. */
export const ECHO_HIT: HitLook = { pieces: BREAK_LOOK, life: STRIKE_LIFE, strike: splash };

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
 *
 * `of` is the creature it *was*, where the kill says so (`sim/events.ts`):
 * an echo and a rind die as the slick or the bulb they wore, and the strike
 * is the one place the game tells them apart. It is asked first, and a body
 * without one falls through to what it wore.
 */
export function hitFor(kind: string, of?: string): HitLook {
  if (of === "echo") return ECHO_HIT;
  if (of === "rind") return RIND_HIT;
  if (kind === "slick") return SLICK_HIT;
  if (kind === "bulb") return BULB_HIT;
  if (kind === "throb") return THROB_HIT;
  if (kind === "dart") return DART_HIT;
  if (kind === "wisp") return WISP_HIT;
  return BODY_HIT;
}
