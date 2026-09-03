import type { ViewRole } from "@neon-spore/render";
import type { CreatureKind, World } from "@neon-spore/sim";
import { trimToSubject } from "./brush-trim.js";
import { frameWorld } from "./pose-art.js";

/**
 * The frame a brush's specimen is photographed through, and the places a crop
 * can be centred on.
 *
 * Split from `brush-poses.ts` when that file went over its 250-line limit. The
 * seam is the one the older file's own comment already drew: next door is the
 * *moment* — a shell with one plate off, an echo one beat after it came apart
 * — and this is the picture-making rule every one of those moments is put
 * through, which does not change when a creature does.
 *
 * Two things make a frame a *picture of the creature* rather than a picture of
 * the game with the creature somewhere in it, and both used to be missing:
 *
 *  - the frame is drawn **bare** (`ViewState.bare`), so the starfield, the
 *    radar and the grid are not there to be mistaken for the subject at 34 px;
 *  - and the crop is **measured, not declared** (`brush-trim.ts`) — the body
 *    is found in the black and centred as large as it will go, so a moored pod
 *    and a lure with its ring both fill their chip.
 */

/** The column a specimen is spawned in. */
export const COL = 3;
/** The square a specimen is drawn into before it is measured and cut down. */
const SOURCE = 320;
/** The square it is cut down to. Bigger than any use of it, so the hover
 * card's picture is a picture rather than a magnified thumbnail. */
const ART = 256;

export function creatureAt(world: World, kind?: CreatureKind): { col: number; row: number } {
  const c = (kind ? world.creatures.find((x) => x.kind === kind) : undefined) ?? world.creatures[0];
  return c ? { col: c.col, row: c.row } : { col: COL, row: 7 };
}

export function podAt(world: World): { col: number; row: number } {
  const p = world.pods[0];
  return p ? { col: p.colMilli / 1000, row: p.rowMilli / 1000 } : { col: COL, row: 3 };
}

/** The point a crop of several bodies is centred on. `creatureAt` centres on
 * one, and one of two halves is a frame with the other half at its edge. */
export function midpoint(at: { col: number; row: number }[]): { col: number; row: number } {
  if (at.length === 0) return { col: COL, row: 7 };
  const col = at.reduce((sum, c) => sum + c.col, 0) / at.length;
  const row = at.reduce((sum, c) => sum + c.row, 0) / at.length;
  return { col, row };
}

/**
 * One bare frame around `at`, trimmed to whatever it drew.
 *
 * `span` is no longer the picture's framing — the trim decides that — it is
 * the *reach*: how far from the body something may be and still count as part
 * of it. Generous enough for a lure's exclamation and a torch's tail, tight
 * enough that a neighbouring column could never wander in.
 */
export function tile(
  world: World,
  at: { col: number; row: number },
  span = 4,
  role: ViewRole = "test",
): HTMLCanvasElement {
  const framed = frameWorld(world, role, "tile", SOURCE, at, span, Number.POSITIVE_INFINITY, true);
  return trimToSubject(framed.canvas, ART);
}
