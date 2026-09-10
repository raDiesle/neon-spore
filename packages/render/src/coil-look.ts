import { prongs, spray } from "./coil-prongs.js";

/**
 * THE ONE RECORD A CANDIDATE **COIL** LOOK PATCHES.
 *
 * `carom-look.ts`'s kind and its reasons: a record rather than two named
 * functions, so a candidate look is a field patched onto a live export for
 * the length of one `draw()` and the call site never learns anything about it
 * (`docs/versus.md`). A file of its own because the record needs the paint and
 * a candidate needs the record.
 *
 * **What is in it, and what is deliberately not.** THE COIL is a rock inside a
 * dome, and neither of those is this creature's own: the rock is
 * `drawMeteorBody`'s and the dome is THE CLASP's, called rather than copied on
 * the owner's instruction (`coil.ts`). What a coil draws that nothing else
 * does is the **chain** — three studs on the rim that are where a charge
 * leaves a dome and where one lands, and the bolt that crosses the field
 * between two of them. So the question a pair is asked here is *does the
 * charge read as one thing passing from dome to dome, and do the marks it
 * leaves by read as places on a shell rather than dots beside it* — and that
 * is two fields, `studs` and `charge`, each drawn on its own frame.
 *
 * **The first pair came through here with not one pixel moved** — the loop
 * `coil.ts` carried as `drawStuds`, and the body of `CoilJumpFx.draw` — and
 * both left on 10 September 2026 when the owner took PRONGS over them
 * (`coil-prongs.ts`; `tools/versus/DECIDED.md` has the discs and the two
 * bolts they were).
 */

/**
 * Everything the studs are drawn from, in field pixels — the dome is drawn
 * about `(x, y)` and the studs sit on its rim, so unlike a crust these are
 * places on the field rather than lengths about an origin.
 */
export interface StudDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly x: number;
  readonly y: number;
  /** The dome's rim radius, before `STUD_OUT` pushes a stud past it. */
  readonly r: number;
  readonly tile: number;
  /** How far round the studs have turned: slow, the body's own way, and
   * offset by its id so no two domes stand at the same angle. */
  readonly spin: number;
  /** Seconds on the wall clock, for a look with a gutter of its own. */
  readonly time: number;
  /** How far the charge has come towards this dome, 0 at rest and 1 on the
   * frame it opens (`coilCharge`). Zero on the seat that is not shown it. */
  readonly charge: number;
  /** Which way the body is crossing — +1 right, −1 left (`coilHeading`).
   * Not read by the shipped studs. */
  readonly dir: number;
  /** The dome's own rim colour and the hot one a charge turns it, hazed. */
  readonly rim: string;
  readonly hot: string;
  /** Whether this dome is lit by the ship's own plate this frame. Not read by
   * the shipped studs. */
  readonly lit: boolean;
}

/**
 * Everything a charge in flight is drawn from. `from` is frozen — the tile the
 * charge left, a falling rock by now — and `to` is looked up every frame off
 * the dome it is reaching for (`coil-jump.ts` on why the two ends differ).
 */
export interface ChargeDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly from: { readonly x: number; readonly y: number };
  readonly to: { readonly x: number; readonly y: number };
  /** How far along the flight it is, 0 at the failed dome and 1 arriving. */
  readonly t: number;
  /** Seconds since it left. */
  readonly age: number;
  readonly tile: number;
  /** The dome it is going to, for a seed no other charge shares. */
  readonly id: number;
}

export interface CoilLook {
  /** The marks on the rim a charge leaves by and lands on, drawn over the
   * dome. */
  studs(d: StudDraw): void;
  /** The charge crossing the field from a failed dome to the next one. */
  charge(d: ChargeDraw): void;
}

/** The shipped chain: three prongs off the rim that flare and crackle while
 * a charge is on its way, and a bolt with a spray off its head. */
export const COIL_LOOK: CoilLook = { studs: prongs, charge: spray };
