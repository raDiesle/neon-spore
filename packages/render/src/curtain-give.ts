import {
  type Creature,
  type CurtainState,
  gripPushOf,
  gripsCreature,
  type World,
} from "@neon-spore/sim";
import { drawnCol } from "./depth.js";
import type { Layout } from "./layout.js";

/**
 * **THE CURTAIN gives under a hand** rather than sliding whole — the
 * design's *sag under a hand* (`docs/spec/bosses-choreographed.md` §6), as a
 * picture and nothing else. The rule is untouched: the sheet still steps a
 * column when a hand has earned one (`sim/grip-push.ts`), and two hands
 * pulling apart still hold it (`grip-push-dir.ts`). What changes is what the
 * cloth does in between.
 *
 * **The cloth under the hand goes ahead of the rail.** Each hand on the sheet
 * has carried some part of a column it has not yet been paid for, and the
 * cloth where it is held is drawn that far towards where it is going, up to
 * `CURTAIN_GIVE_ACROSS`. When the column is paid the rail sets off after the
 * hand, and what it has still to cover (`col` less the drawn column) is
 * counted into the same give, so the cloth does not snap back the frame the
 * sheet starts to move — it is the rail catching the hand up.
 *
 * **A held sheet dips where it is held**: a thumb's weight on wet cloth, the
 * hem pulled down under it by `CURTAIN_GIVE_SAG` a hand. Two hands pulling
 * apart cancel sideways — the body holds, as the rule says — and stretch the
 * cloth between them instead, so the dip deepens by how hard the weaker of
 * the two is pulling. That is the one picture of the cancel this boss has.
 *
 * **Against the jammed rail it strains.** While a hit pins the rail the shove
 * is refused (`curtain-shove.ts`) but the hand still carries, so the cloth
 * goes as far as it can towards the hand and stays there: the membrane
 * stretching against its rail, which is what the design asked THE SLOW to
 * show — and on this boss the jam *is* THE SLOW (`sim/curtain-shot.ts`).
 *
 * **Nothing aimed at moves with it**, the sway's rule (`curtain-sway.ts`):
 * the beads dip with the hem and stay over their columns, and only the edge
 * the cloth is pulled toward reaches out, so a covered core is never shown
 * from under a trailing edge. It dies as the hem is gathered, as the sway
 * does.
 */

/** How far ahead of the rail the cloth under a hand is carried at most, in tiles. */
export const CURTAIN_GIVE_ACROSS = 0.5;
/** How far the hem dips under one hand, in tiles. */
export const CURTAIN_GIVE_SAG = 0.26;
/** How far it dips at most, two hands pulling it apart, in tiles: into the row below and no further. */
export const CURTAIN_GIVE_SAG_MAX = 0.6;
/** How far either side of the hand the give reaches before it is mostly gone, in tiles. */
const GIVE_SPREAD = 1.7;

/** The cloth's give, in pixels, about the point `x` the hand holds it by. */
export interface CurtainGive {
  x: number;
  /** How far the cloth at `x` is carried sideways, signed the way the hand went. */
  across: number;
  /** How far the hem at `x` dips. */
  sag: number;
  /** The falloff's spread, in pixels. */
  spread: number;
}

/** No hand on the cloth: it hangs as the rail and the draught have it. */
export const NO_GIVE: CurtainGive = { x: 0, across: 0, sag: 0, spread: 1 };

/**
 * The give of the sheet `body` under whatever hands are on it, held by the
 * point `mid` the hand ring is drawn at (`curtainSheetMidX`), or `NO_GIVE`
 * with no hand on it or none of it on the field. `gathered` is how far the
 * hem is lifted, 0 to 1 (`curtainHemPull`), handed in rather than asked so
 * that this file and the hem's are not each other's imports.
 */
export function curtainGive(
  l: Layout,
  world: World,
  c: CurtainState,
  body: Creature,
  beatPhase: number,
  mid: number | null,
  gathered: number,
): CurtainGive {
  if (mid === null || c.phase === "out") return NO_GIVE;
  const { cfg } = world;
  const pulls: number[] = [];
  for (const player of [1, 2] as const) {
    if (!gripsCreature(world, player, body.id)) continue;
    const push = gripPushOf(world, player);
    // What this hand has carried that has not been paid out in a column yet.
    const owed = push === null ? 0 : push.milli / Math.max(1, cfg.gripPushMilli) - push.cols;
    pulls.push(clamp(owed));
  }
  if (pulls.length === 0) return NO_GIVE;
  const free = 1 - gathered;
  const [a = 0, b = 0] = pulls;
  const behind = body.col - drawnCol(body, beatPhase);
  const across = clamp(a + b + behind);
  const apart = a * b < 0 ? Math.min(Math.abs(a), Math.abs(b)) : 0;
  return {
    x: mid,
    across: across * CURTAIN_GIVE_ACROSS * l.tile * free,
    sag: Math.min(CURTAIN_GIVE_SAG_MAX, (pulls.length + apart) * CURTAIN_GIVE_SAG) * l.tile * free,
    spread: GIVE_SPREAD * l.tile,
  };
}

/** How much of the give reaches the cloth at `x`: all of it at the hand, falling away either side. */
export function giveReach(g: CurtainGive, x: number): number {
  const d = (x - g.x) / g.spread;
  return Math.exp(-d * d);
}

function clamp(v: number): number {
  return Math.max(-1, Math.min(1, v));
}
