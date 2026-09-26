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
  "THE NETTLE — a jellyfish marked for thumbs and for the panel: shoot it, shield it, suck it":
    "Asked for on 26 September 2026 and written up in docs/spec/bosses.md " +
    "§11.39: THE INSTAR's engine with the default panel back. The script " +
    "(packages/content/src/nettle-script.ts) is ten steps over eight poses " +
    "of a jellyfish, every window THE SLOW. Most marks are thumbs on the " +
    "body, as THE INSTAR's are; four steps ask the panel instead — a SHOOT " +
    "mark counts a bolt out of the top of its column, a SHIELD mark the " +
    "guard pressed with the shield under it, a SUCK mark the intake opened " +
    "with the cannon under it. Each is one press, nothing else about it is " +
    "judged, and a panel mark never slips. A window closing on an undone " +
    "mark is one strike on the hull, which is the wave. The clocks are " +
    "THE INSTAR's own fields. See sim/scene-panel.ts, sim/instar.ts, " +
    "sim/nettle-words.ts.",
  "THE MANTLE — the boss both hands have to pull at once, or neither counts":
    "Asked for on 26 September 2026 and written up in " +
    "docs/spec/bosses-choreographed.md §23: whether a shared number still " +
    "needs two hands. A hinged carapace shell hangs over the middle of the " +
    "field with a handle at each valve — mantleLeft is always Player 1's, " +
    "mantleRight always Player 2's, geometry rather than a seat number. Its " +
    "health is four plate-pairs, MANTLE_SCRIPT's own thresholds " +
    "(packages/content/src/mantle-script.ts). Both handles read live pull " +
    "depth and reset to nought the instant a thumb lifts; a pair-shear needs " +
    "the summed depth of both past the movement's threshold while both sit " +
    "past mantleFloorMilli at once — one thumb parked at the top while the " +
    "other is at nought shears nothing. THE SLOW spans every shear. A spark " +
    "leaks from the open shell between the second and third movements: " +
    "either colour shot at it in mantleSparkBeats answers it, and unanswered " +
    "it is one strike on the hull, which is the wave. The last pair splits " +
    "the shell and bares the core, whose alternating finish " +
    "(mantleHeartbeatTaps taps, mantleCore, whichever seat is next) is the " +
    "one place in the fight the pair stop pulling together. The dark core " +
    "hangs mantleOpenBeats before the fight ends. Only the simulation lane " +
    "has landed — see sim/mantle.ts, sim/mantle-hand.ts, " +
    "sim/config-mantle.ts.",
  "THE KEEL — the boss whose next joint is whichever thumb is nearer":
    "Asked for in docs/spec/bosses-choreographed.md §24: whose tap is it, " +
    "when neither seat is named. A spine of keelSegments segments arches over " +
    "the field; one joint lights at a time, and only the seat whose half of the " +
    "screen it sits over may tap it (geometrySeat) — the middle column either. " +
    "Movement one lights the ends inward, alternating; at two loose the middle " +
    "opens and its socket flashes the wave's colour, which only that colour's " +
    "shot shuts, locking a joint for free; unanswered it is a hit on the hull " +
    "and flashes again. Movement three dims the spine and relights it at " +
    "keelTempoBeats in the wave's own order, with no SLOW; a miss there slips " +
    "the segment loose. Then the spine goes rigid and the tail throws one rock " +
    "down its column — either colour answers it. THE SLOW spans every joint and " +
    "the socket before movement three. Only the simulation lane has landed — " +
    "see sim/keel.ts, sim/keel-step.ts, sim/keel-hand.ts, sim/config-keel.ts.",
  "THE VALVE — the boss one hand turns and the other hand stops":
    "Asked for in docs/spec/bosses-choreographed.md §25: can one hand stop what " +
    "the other is moving. A drum with a wheel and a pin. The pilot turns the " +
    "wheel onto its mark (valveNearMilli); while it sits there the navigator's " +
    "tap on the pin freezes it (valveFreezeBeats, then the fast one), and while " +
    "frozen either seat draws the pin to valvePullMilli (valvePullBeats). A " +
    "window run out kicks the wheel off its mark. Three pins are the health; " +
    "the first out leaks a spark, shot in either colour, or the hull. The third " +
    "mark only counts after a full lap one way (valveLapMilli). THE SLOW spans " +
    "every freeze and pull window. Only the simulation lane has landed — see " +
    "sim/valve.ts, sim/valve-step.ts, sim/valve-hand.ts, sim/config-valve.ts.",
  "THE SEAM — the boss answered with the cannon and the shield, in order":
    "Asked for in docs/spec/bosses-choreographed.md §26: a choreographed scene " +
    "built out of nothing but the standard controls. A ridge down the middle " +
    "column, and a script the wave authors. Each step lights one thing: a point " +
    "shot in its colour (seamPointBeats), grit taken on the shield under the " +
    "ridge (seamGritBeats), a rock shot in its column (seamRockBeats), or grit " +
    "and a rock at once (seamBothBeats). A shot or a shield outside its step " +
    "does nothing; a step run out is a hull hit, which is the wave. Three " +
    "sealing points are the health. THE SLOW spans every step. Only the " +
    "simulation lane has landed — see sim/seam.ts, sim/seam-step.ts, " +
    "sim/seam-shot.ts, sim/seam-guard.ts, sim/config-seam.ts.",
  "THE OCULUS — the boss both hands hold shut, then shoot into":
    "Asked for in docs/spec/bosses-choreographed.md §27: two seats holding at " +
    "once, for as long as the count runs. An eye over the middle column behind " +
    "six leaves, and a script the wave authors. A shut step closes two leaves " +
    "once both seats have held their leaf for its beats; a thumb lifted starts " +
    "the count again, and a shut run out springs the leaves and relights it. " +
    "The break opens the socket; a fire step wants a shot in its colour; a " +
    "reseal is a hold that keeps the socket open, and one run out swallows it. " +
    "A fire step run out is a hull hit, which is the wave. The grace " +
    "(oculusGraceBeats) is how long a hold step stays lit past its count. " +
    "THE SLOW spans every step but the break. Only the simulation lane has " +
    "landed — see sim/oculus.ts, sim/oculus-step.ts, sim/oculus-hand.ts, " +
    "sim/oculus-shot.ts, sim/config-oculus.ts.",
  "THE VISE — the boss two pinches crack, then shoot into":
    "Asked for in docs/spec/bosses-choreographed.md §28: a pinch, each seat on " +
    "its own lobe of a case clamping a kernel over the middle column, and a " +
    "script the wave authors. A left or right step cracks a seam once that " +
    "lobe's gap has stayed at or under viseShutMilli for its beats; the gap " +
    "widening back starts the count again, and a step run out springs the lobe " +
    "and relights it. Two seams a lobe bare the kernel; a fire step wants a " +
    "shot in its colour; a both step is both lobes pinched at once, and one run " +
    "out covers the kernel until it is held again. A fire step run out is a " +
    "hull hit, which is the wave. The grace (viseGraceBeats) is how long a " +
    "pinch step stays lit past its count. Only the simulation lane has " +
    "landed — see sim/vise.ts, sim/vise-step.ts, sim/vise-hand.ts, " +
    "sim/vise-shot.ts, sim/config-vise.ts.",
} satisfies Partial<Record<GroupName, string>>;
