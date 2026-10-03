import { type GimbalRing, INNER, OUTER } from "@neon-spore/sim";
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
 * pilot is shown **the outer ring** — its rim and its teeth — and the
 * navigator **the inner**. Neither is ever shown the other's ring, so neither
 * can check the other's bearing against their own, and neither can see that
 * the inner ring is gripped from the far face and answers a turn backwards
 * (`gimbalShownMilli`, `sim/gimbal.ts`). Since 3 October 2026 each is shown
 * the **other's mark** instead of their own (`gimbal-partner.ts`), so a ring
 * is talked onto its mark, and *round to the right, a quarter* means two
 * different turns in the two seats. A screen with both rings on it would let
 * one of them simply steer the other, and there would be nothing to agree
 * about (`gimbal-draw.ts`, `docs/spec/bosses.md` §11.34).
 * Which ring is whose is said by geometry rather than colour — the outer is
 * the larger and is pinned top and bottom, the inner pinned at its sides —
 * because both are rock grey and neither is ever shot (§18, *Colour*).
 * `test` is both, rings and their own marks, which is the only screen the
 * right angle is visible on.
 */
export const showsGimbalOuter = (role: ViewRole): boolean => role !== "p2";
export const showsGimbalInner = (role: ViewRole): boolean => role !== "p1";
/** The rings `role`'s screen is shown, the outer first: what the rig, the marks and a bolt's stop all draw on. */
export const gimbalRingsShown = (role: ViewRole): GimbalRing[] =>
  ([OUTER, INNER] as GimbalRing[]).filter((ring) =>
    ring === OUTER ? showsGimbalOuter(role) : showsGimbalInner(role),
  );

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

/**
 * THE GALL's pinch mark (§38). This boss splits the hands and not the eyes:
 * both screens are shown the seam, its four scars and the gall wherever it
 * sits, because *finding* it after a jump is the fight, and a gall one seat
 * could not see would be a secret rather than a search. What each seat is
 * shown full is **the chevrons of its own pinch** — lit when the gall sits
 * on its half, and only faint when it sits on the other's — so the seat
 * whose turn it is sees *you*, and the other sees *not you, look*, and has
 * to say where it went. `test` is both at full.
 */
export const showsGallReach = (role: ViewRole, seat: 1 | 2): boolean =>
  role === "test" || role === `p${seat}`;

/**
 * THE BURGEE's two hands (§39). This boss splits the hands by the step and
 * not the eyes: both screens are shown the boom, the flag wherever it
 * swings and the spindle, because the tap is timed off the flag and the
 * swipe is aimed at it, and a flag one seat could not see would be a flag
 * that seat could not call. What each seat is shown full is **its own
 * hand's mark** — the freeze ring for the step's freezer, the draw's track
 * for the other seat — and the other seat's only faint, so each can say
 * what its partner is asked for. `test` is both at full.
 */
export const showsBurgeeHand = (role: ViewRole, seat: 1 | 2): boolean =>
  role === "test" || role === `p${seat}`;

/**
 * THE FLUE's tap ring (§40). This boss splits the hands by the step and not
 * the eyes: both screens are shown the flue, the ember wherever it drifts
 * and the damper, because the still seat has to watch the ember stop to know
 * its stillness is counting, and the other has to see it stop to tap it.
 * What the tapper is shown full is **the ring round the steadied ember**;
 * the still seat sees it faint, so it can see the taps are its partner's to
 * spend and keep its hands off. `test` is both at full.
 */
export const showsFlueHand = (role: ViewRole, seat: 1 | 2): boolean =>
  role === "test" || role === `p${seat}`;

/**
 * THE GOVERNOR's two asks (§43). Both screens are shown the whole governor —
 * the needle's true pace is the one thing both seats must read off the same
 * picture — and the hands are split by the step: **the lit mark** is shown
 * full to the seat that taps it and faint to the seat braking, and **the
 * yoke's jaws** full to the seat braking and faint to the tapper, so each
 * sees the other's job without being handed it. `test` is both at full.
 */
export const showsGovernorHand = (role: ViewRole, seat: 1 | 2): boolean =>
  role === "test" || role === `p${seat}`;

/**
 * THE LAMPREY's two asks (§41). Both screens are shown the whole eel — the
 * jaw the pinner follows is the mouth the tapper's tooth is on — and the
 * hands are split by the step: **the jaw's band** full to the pinner and
 * faint to the tapper, **the lit tooth's ring** full to the tapper and faint
 * to the pinner. `test` is both at full.
 */
export const showsLampreyHand = (role: ViewRole, seat: 1 | 2): boolean =>
  role === "test" || role === `p${seat}`;

/**
 * THE MIMIC's split (§42, *Player 1 and Player 2*), the Queen's two marks
 * turned on their side: **the sign seat `drawer` must draw is shown to the
 * other seat only**, and **the pad it draws on to `drawer` only** — the
 * screen that can see is never the hand that can answer. `test` is both
 * seats, and is shown both.
 */
export const showsMimicSign = (role: ViewRole, drawer: 1 | 2): boolean =>
  role === "test" || role !== `p${drawer}`;
export const showsMimicPad = (role: ViewRole, drawer: 1 | 2): boolean =>
  role === "test" || role === `p${drawer}`;
