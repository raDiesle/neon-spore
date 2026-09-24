import type { ViewRole } from "./view-role.js";

/**
 * **The clock bosses' halves, page three** — the pairs asked for by name in
 * `docs/spec/bosses-choreographed.md`, THE GIMBAL on, each two halves of one
 * fight with one half to a seat.
 *
 * Cut from `view-role-clocks-b.ts` on 23 September 2026, when THE HASP and
 * THE SPOOL landing side by side had put that page at 233 lines, on the line
 * `boss-draw-clocks-c.ts` was cut the same day. The rules are the first
 * page's; nothing re-exports these, and every drawer that asks one names this
 * file (`.claude/skills/new-boss`).
 */

/**
 * THE GIMBAL's two rings, one to a seat, and this is the whole boss: the
 * pilot is shown **the outer ring** — its rim, its teeth, and his own mark on
 * it — and the navigator **the inner**, with hers. Neither is ever shown the
 * other's ring at all, so neither can check the other's bearing against their
 * own, and neither can see that the inner ring is gripped from the far face
 * and answers a turn backwards (`gimbalShownMilli`, `sim/gimbal.ts`). That
 * reflection is the fight: *round to the right, a quarter* means two
 * different turns in the two seats, and the pair has to find the word for the
 * one they both mean before three alignments run out. A screen with both
 * rings on it would let one of them simply steer the other, and there would
 * be nothing to agree about (`gimbal-draw.ts`, `docs/spec/bosses.md` §11.34).
 * Which ring is whose is said by geometry rather than colour — the outer is
 * the larger and is pinned top and bottom, the inner pinned at its sides —
 * because both are rock grey and neither is ever shot (§18, *Colour*).
 * `test` is both, which is the only screen the right angle is visible on.
 */
export const showsGimbalOuter = (role: ViewRole): boolean => role !== "p2";
export const showsGimbalInner = (role: ViewRole): boolean => role !== "p1";

/**
 * THE SPOOL's two halves of one sentence (§21). The pilot is shown **the
 * brake** — the rail, and the knob at the depth his thumb has it — and never
 * the zone: he feels a depth and is told nothing of what it is worth. The
 * navigator is shown **the gauge** — the zone, and where the paid-out length
 * is against it — and has no brake to feel.
 *
 * Both are shown the spool and the line, and how fast the line runs is on
 * both screens: it is the thing the pair say *faster* and *slower* about, and
 * hiding it would leave her a gauge and nothing to see it answered in. What
 * neither holds is the other's half — a depth with its meaning, or a zone
 * with a hand on it (`spool-brake.ts`, `spool-gauge.ts`, `sim/spool.ts`).
 * `test` is both.
 */
export const showsSpoolBrake = (role: ViewRole): boolean => role !== "p2";
export const showsSpoolZone = (role: ViewRole): boolean => role !== "p1";

/**
 * THE HASP's two halves, and the whole of that fight is the gap between them:
 * the pilot is shown **the latch** — its rail, its bar and the heat drifting
 * up it — and never the wheel, whether it turns, or that there is one; the
 * navigator is shown **the wheel** — its spokes, how far it has come and
 * whether it is free — and never the latch, the heat, or that a hand is the
 * reason it seizes (§20). Both are shown the three clasps, which are the
 * health and the door they are both opening.
 *
 * What follows from it is stricter than a handle kept off a screen: the
 * working clasp creeping ajar as the wheel is wound is drawn on the wheel's
 * screens alone, and so are the bursts of a seize and the dim that says it
 * (`hasp-pose.ts`, `hasp-fx.ts`) — any of them on his screen would be the
 * wheel, told by the lid over it. `test` is both.
 */
export const showsHaspLatch = (role: ViewRole): boolean => role !== "p2";
export const showsHaspWheel = (role: ViewRole): boolean => role !== "p1";

/**
 * THE RATCHET's two hands, and this boss splits the hands and not the eyes
 * (§22): both screens are shown the whole rack, the pawl bearing on it, the
 * lock's pins and every tooth it climbs. The navigator alone is shown **the
 * catch** — its rail, the bar at her depth and the glow while it is set — and
 * the pilot alone **the pawl's pad**, the mark he presses and whether a tooth
 * is waiting on it.
 *
 * The catch is the one that matters. He presses when he believes she is
 * holding, and must never see her hold directly — only her `SET`, across the
 * delay — so the glow, the bar and the bursts of a set and a let-go are all
 * drawn on her screens alone (`ratchet-parts.ts`, `ratchet-fx.ts`). `test`
 * is both.
 */
export const showsRatchetPawl = (role: ViewRole): boolean => role !== "p2";
export const showsRatchetCatch = (role: ViewRole): boolean => role !== "p1";
