import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each **choreographed boss's** card, the third page —
 * THE HASP and every boss built after it, THE RATCHET next.
 *
 * Cut out of `ship-notes-choreo-b.ts` on 22 September 2026, the day THE HASP
 * landed: that page stood at 238 lines with THE BELLOWS's paragraph on the
 * end of it, and a boss's paragraph is twenty lines. The seam is the one
 * `-b.ts` itself was cut along — the order they were built in, which nothing
 * depends on. Spread into `CHOREO_NOTES` in place, so the totality guard is
 * unchanged: a card added to `GroupName` and left without a paragraph on
 * *any* page is the same compile error it always was. The next boss's
 * paragraph goes here.
 */
export const CHOREO_NOTES_C = {
  "THE HASP — the boss where one of you only has to hold on, and cannot":
    "Designed on 22 September 2026 in docs/spec/bosses-choreographed.md §20 " +
    "and docs/spec/bosses.md §11.37: the boss where one seat's whole job is " +
    "not to let go. A door of iron clasps hangs over the middle of the field " +
    "with a wheel across it, and its health is the three clasps. A clasp " +
    "lights haspStillBeats in. The pilot's latch (haspLatch, an ordinary " +
    "depth-drag) counts as held past haspGripMilli of haspReachMilli, and " +
    "the navigator's wheel (haspWheel, a bearing like THE GIMBAL's rims) " +
    "only turns while it is — a rim turned with the latch up seizes and " +
    "moves nothing. The wheel is wound by travel rather than turned to a " +
    "mark, a departure from the design's row 4 and argued in §11.37: " +
    "haspWindMilli for the first clasp and haspWindStepMilli more for each " +
    "after it. The latch burns haspHoldBeats after it is taken — " +
    "haspLastHoldBeats on the last clasp, which is shorter — and his hand " +
    "is off it for haspBurnBeats before he can take it again. THE SLOW spans " +
    "every grip for its fuse, shut when the grip ends. A " +
    "clasp given swings off over haspSwingBeats. From the second clasp a " +
    "bolt works loose over the middle column: a shot of either colour takes " +
    "it, and haspBoltBeats unanswered is one strike on the hull, which is " +
    "the wave. The last clasp opens the door for haspClearBeats and the " +
    "fight is over. See sim/hasp.ts, sim/hasp-hand.ts, sim/config-hasp.ts.",
  "THE RATCHET — the boss where every step you take stays taken":
    "Built on 23 September 2026 from docs/spec/bosses-choreographed.md §22 " +
    "and written up in docs/spec/bosses.md §11.38: the boss where a step, " +
    "once taken, is never taken back. A rack of seven teeth hangs over the " +
    "middle of the field, and its health is the teeth. The navigator holds " +
    "the catch (ratchetCatch, a depth-drag, set past ratchetGripMilli of " +
    "ratchetReachMilli); the pilot presses the pawl (ratchetPawl). Every " +
    "press climbs one tooth for good, and it is clean only if the catch is " +
    "set — which he cannot see. After a clean tooth the catch has to be " +
    "lifted and set again. Each window is ratchetWindowBeats, shorter by " +
    "ratchetWindowStepBeats for every tooth spent, and a window nobody " +
    "answers burns a tooth. Five clean opens the rack for ratchetOpenBeats; " +
    "a third burn makes five unreachable, and the rack jams into the hull, " +
    "which is the wave. After the second clean tooth a bolt works loose " +
    "over the middle column: either colour takes it, and ratchetBoltBeats " +
    "unanswered is a strike on the hull. See sim/ratchet.ts, " +
    "sim/ratchet-hand.ts, sim/config-ratchet.ts.",
} satisfies Partial<Record<GroupName, string>>;
