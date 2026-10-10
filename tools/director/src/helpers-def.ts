import type { ViewRole } from "@neon-spore/render";
import type { World } from "@neon-spore/sim";
import type { CropKind, Pose } from "./pose-kit.js";

/**
 * **What one row of CONTROLS › HELPERS is** — a picture the game draws on the
 * field to explain something, never one a thumb answers.
 *
 * The owner, 10 October 2026, on THE QUEEN's NEXT TO FALL: *a visual
 * explanation helper … document on a new page what kind of visual helpers we
 * have in the game, similar we do for "on field controls"*. So a row has the
 * shape an ON THE FIELD row has (`field-control-def.ts`) with the gesture
 * taken out and the screen put in: a helper is very often drawn on one seat
 * and not the other, and which one is most of what it means.
 */
export interface HelperDef {
  name: string;
  /** Where on the screen it stands, and while what is true. */
  where: string;
  /** Whose screen draws it — `P1`, `P2` or `BOTH`, with what each one sees. */
  seat: string;
  /** What it tells the pair, in a sentence or two. */
  says: string;
  /** The file in `packages/render/src` that draws it — a pointer, not a copy. */
  source: string;
  /**
   * The frame it is pictured in: a STATES gallery pose by name, or one built
   * for this page (`helpers-poses.ts`) where the gallery holds no moment the
   * helper is drawn in. `helpers-page.test.ts` fails on a name the gallery
   * has not got.
   */
  pose: string | Pose;
  /** The screen the frame is drawn as — the seat that is shown the helper. */
  role: ViewRole;
  /** A cut other than the pose's own — the band, for a mark on a button. */
  crop?: CropKind;
  /** A few tiles round one point instead, for a mark too small to read at
   * the size of the whole field. */
  zoom?: { at: (w: World) => { col: number; row: number }; span: number };
  /** Where on the frame to look. */
  lookAt: string;
}

/** A heading on the page, and the rows under it. */
export interface HelperGroup {
  title: string;
  sub: string;
  rows: readonly HelperDef[];
}
