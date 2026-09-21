import type { BossPart } from "@neon-spore/content";
import {
  type LedgerState,
  ledgerBoss,
  type SimConfig,
  type SpliceState,
  spliceRound,
  type World,
} from "@neon-spore/sim";
import type { AnchorPoint } from "./caption-anchor.js";
import { around, box } from "./caption-anchor-box.js";
import type { Layout } from "./layout.js";
import { ledgerBodyBox, ledgerRootPoint, ledgerSocketPoint } from "./ledger-shape.js";
import { spliceCurve } from "./splice-straws.js";
import { showsSpliceTangle } from "./view-role.js";
import { showsLedgerSocket } from "./view-role-clocks.js";

/**
 * **Where the fixtures of THE LEDGER and THE SPLICE are** — the fifth of
 * `caption-anchor-boss.ts`, split off `-d` on line count, and read the same
 * way: each line asks the boss's own shape file, and a part a screen does not
 * draw is no ring at all.
 *
 * These two are the pair whose pages were *nearly* right on the hull. THE
 * LEDGER's cord really is rooted in it, and THE SPLICE's mouths really do
 * stand over the plating — but the hull anchor is the middle of it, and both
 * of these are somewhere else along it: the cord goes in at one column and
 * walks, and the mouths are a whole row.
 */

export function bossAnchorE(
  l: Layout,
  world: World,
  part: BossPart | undefined,
): AnchorPoint | null {
  const cfg = world.cfg;
  const ledger = ledgerBoss(world);
  if (ledger !== null) return ledgerPart(l, cfg, ledger, part);
  const splice = spliceRound(world);
  if (splice !== null) return splicePart(l, cfg, splice, part);
  return null;
}

/** How much of a tile the cord is worth on either side of its own line. */
const CORD_R = 0.3;
/** And the lock on the socket, which is drawn about a third of one across. */
const LOCK_R = 0.45;

/**
 * THE LEDGER: the body between its two halves by default — that is what
 * bills, and the seam down it is this boss's whole health bar
 * (`ledger-shape.ts`). `cord` is the line from the body's underside to the
 * hull it is rooted in, which every bead rides and which three of the five
 * pages are about; it is ringed straight, between its two ends, because the
 * bow it sways with is a picture rather than a place.
 *
 * `lock` is the navigator's mark on the socket's column and the chevron for
 * the column it walks to next — hers alone, so it is no ring on his screen
 * (`ledger-read.ts`).
 */
function ledgerPart(
  l: Layout,
  cfg: SimConfig,
  t: LedgerState,
  part: BossPart | undefined,
): AnchorPoint | null {
  if (part === "cord") {
    return around([ledgerRootPoint(l, cfg, t), ledgerSocketPoint(l, t)], l.tile * CORD_R);
  }
  if (part === "lock") {
    if (!showsLedgerSocket(l.role)) return null;
    const at = ledgerSocketPoint(l, t);
    return box({ x: at.x, y: at.y, rx: l.tile * LOCK_R, ry: l.tile * LOCK_R });
  }
  return box(ledgerBodyBox(l, cfg, t));
}

/** How much of a tile one mouth of the tangle is worth as a ring. */
const MOUTH_R = 0.4;

/**
 * THE SPLICE: the tangle, top ends to mouths, for the seat that is shown the
 * straws — and no ring at all for the pilot, who is shown stubs and could not
 * read a tangle he cannot see (`showsSpliceTangle`). `mouths` is the row the
 * straws come out at, which both screens draw and which is the only part of
 * this boss the pilot has.
 */
function splicePart(
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
  part: BossPart | undefined,
): AnchorPoint | null {
  const curves = s.entranceCols.map((_, i) => spliceCurve(l, cfg, s, i));
  if (part === "mouths") {
    return around(
      curves.map((c) => ({ x: c.x1, y: c.y1 })),
      l.tile * MOUTH_R,
    );
  }
  if (!showsSpliceTangle(l.role)) return null;
  return around(
    curves.flatMap((c) => [
      { x: c.x0, y: c.y0 },
      { x: c.x1, y: c.y1 },
    ]),
    l.tile * MOUTH_R,
  );
}
