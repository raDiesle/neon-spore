import type { BossPart } from "@neon-spore/content";
import {
  type LedgerState,
  ledgerBoss,
  type SimConfig,
  type SpliceState,
  spliceRound,
  type ThroatState,
  type UndertowState,
  undertowBoss,
  type World,
} from "@neon-spore/sim";
import type { AnchorPoint } from "./caption-anchor.js";
import { bossAnchorF } from "./caption-anchor-boss-f.js";
import { around, box } from "./caption-anchor-box.js";
import type { Layout } from "./layout.js";
import { ledgerBodyBox, ledgerRootPoint, ledgerSocketPoint } from "./ledger-shape.js";
import { spliceCurve } from "./splice-straws.js";
import { throatLockPoint } from "./throat-lock.js";
import { GULLET_PAD, mouthX, mouthY, rings, throatGullet } from "./throat-shape.js";
import { undertowEdgeBox } from "./undertow-shape.js";
import { showsSpliceTangle } from "./view-role.js";
import { showsLedgerSocket, showsThroatLock, showsUndertowBow } from "./view-role-clocks.js";

/**
 * **Where the fixtures of THE LEDGER, THE SPLICE, THE UNDERTOW and THE
 * THROAT are** — the fifth of
 * `caption-anchor-boss.ts`, split off `-d` on line count, and read the same
 * way: each line asks the boss's own shape file, and a part a screen does not
 * draw is no ring at all.
 *
 * These two are the pair whose pages were *nearly* right on the hull. THE
 * LEDGER's cord really is rooted in it, and THE SPLICE's mouths really do
 * stand over the plating — but the hull anchor is the middle of it, and both
 * of these are somewhere else along it: the cord goes in at one column and
 * walks, and the mouths are a whole row.
 *
 * **THE UNDERTOW and THE THROAT are here on the same argument.** The hull is
 * not the wrong *thing* for either — THE UNDERTOW bows a plate of it, and THE
 * THROAT's mouth stands over it — but the hull anchor is the **middle** of the
 * plating, and a breach is in the column the seed put it in.
 *
 * Both read `l.hullY`, the flat line, rather than the skin they are drawn
 * against: that skin is a function of x the draw files are handed and a
 * caption is not (`SurfaceY` in `undertow-draw.ts`), and it is never more
 * than a fraction of a tile off the line. A ring is a ring and not a trace.
 */

export function bossAnchorE(
  l: Layout,
  world: World,
  part: BossPart | undefined,
  beatPhase: number,
): AnchorPoint | null {
  const cfg = world.cfg;
  const ledger = ledgerBoss(world);
  if (ledger !== null) return ledgerPart(l, cfg, ledger, part);
  const splice = spliceRound(world);
  if (splice !== null) return splicePart(l, cfg, splice, part);
  const undertow = undertowBoss(world);
  if (undertow !== null) return undertowPart(l, cfg, undertow, part, world.beat, beatPhase);
  const boss = world.boss;
  if (boss?.kind === "throat") return throatPart(l, cfg, boss, part, world.beat, beatPhase);
  // The three rounds of the sixth file, on the same line-count argument.
  return bossAnchorF(l, world, part, beatPhase);
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
      curves.map((c) => ({ x: c.x1, y: c.ym })),
      l.tile * MOUTH_R,
    );
  }
  if (!showsSpliceTangle(l.role)) return null;
  return around(
    curves.flatMap((c) => [
      { x: c.x0, y: c.y0 },
      { x: c.x1, y: c.ym },
    ]),
    l.tile * MOUTH_R,
  );
}

/**
 * THE UNDERTOW: every lobe it is pushing up, along the edge they are in —
 * and no ring at all while the field is quiet between pushes, which is the one
 * honest answer when there is nothing on the hull to point at.
 *
 * `plate` is a bow before its lobe is through, the pilot's alone
 * (`showsUndertowBow`), exactly as the plate is drawn; `lobe` is what is
 * standing or tall right now, on both screens. Either falls back to every
 * lobe rather than to nothing, because a page about a bow is still a page
 * about the column it is bowing in.
 *
 * The box reaches as high as the tallest lobe it rings (`undertowEdgeBox`),
 * so a lobe gone tall takes the ring up with it.
 */
function undertowPart(
  l: Layout,
  cfg: SimConfig,
  u: UndertowState,
  part: BossPart | undefined,
  beat: number,
  beatPhase: number,
): AnchorPoint | null {
  const wanted = u.lobes.filter((b) => {
    if (part === "plate") return b.stage === "bowing" && showsUndertowBow(l.role);
    if (part === "lobe") return b.stage !== "bowing";
    return true;
  });
  const shown = wanted.length > 0 ? wanted : u.lobes;
  const edge = undertowEdgeBox(l, cfg, u, shown, beat, beatPhase);
  return edge === null ? null : box(edge);
}

/** How much of a tile THE THROAT's mouth, gums and lock are worth as a ring. */
const GULLET_R = 0.75;

/**
 * THE THROAT: the whole gullet, from the root it hangs off down to the mouth,
 * leaning however far the rings it has lost let it (`throat-shape.ts`).
 *
 * `mouths` is the mouth alone — where a body stops, and the one circle a gum
 * has to be flung into; `ring` is the lowest ring still holding, which is the
 * one the next swallow costs; `tally` is NEXT INHALE, on the column the mouth
 * will inhale in, and it is the navigator's, so on the pilot's screen it is no
 * ring at all (`showsThroatLock`) — which is the film's own first page,
 * *only player 2 sees the count*, drawn rather than asserted.
 */
function throatPart(
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  part: BossPart | undefined,
  beat: number,
  beatPhase: number,
): AnchorPoint | null {
  const mouth = { x: mouthX(l, cfg, b, beat, beatPhase), y: mouthY(l, cfg) };
  if (part === "tally") {
    if (!showsThroatLock(l.role)) return null;
    return around([throatLockPoint(l, cfg, b, beat)], l.tile * GULLET_R);
  }
  if (part === "mouths") return around([mouth], l.tile * GULLET_R);
  const all = rings(l, cfg, b, beat, beatPhase);
  if (part === "ring") {
    const held = all.filter((r) => r.slack < 1);
    const one = held[held.length - 1] ?? all[all.length - 1];
    if (one === undefined) return null;
    return box({ x: one.x, y: one.y, rx: one.rx, ry: Math.max(one.ry, l.tile * 0.25) });
  }
  return around(throatGullet(l, cfg, b, beat, beatPhase), l.tile * GULLET_PAD);
}
