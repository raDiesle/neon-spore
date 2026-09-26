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
 * *any* page is the same compile error it always was. THE DAVIT's would
 * have put it past 250, so it and every boss after it go on the next page
 * (`ship-notes-choreo-d.ts`).
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
    "it is one strike on the hull, which is the wave. Before the last pair " +
    "the valve buckles (both handles held eased, under the floor, for " +
    "mantleBuckleBeats inside mantleBuckleWindowBeats, or a spark leaks), a " +
    "vent opens (one tap on mantleCore inside mantleVentBeats, or a spark), " +
    "a crosswise crack shows for mantleCrossBeats, and " +
    "the seam glows: both handles held still for mantleBraceBeats, a lift " +
    "starting the hold over; then the last pull has mantleLastBeats, and a " +
    "window run out resets rather than strikes. The last pair swings the " +
    "halves on their hinges: both handles past the floor inside " +
    "mantleTurnBeats bare the core; run out, they swing back. Its finish " +
    "(mantleHeartbeatTaps taps, mantleCore, whichever seat is next) is the " +
    "one place in the fight the pair stop pulling together. The dark core " +
    "hangs mantleOpenBeats before the fight ends. Only the simulation lane " +
    "has landed — see sim/mantle.ts, sim/mantle-hand.ts, " +
    "sim/mantle-story.ts, sim/config-mantle.ts.",
  "THE KEEL — the boss whose next joint is whichever thumb is nearer":
    "Asked for in docs/spec/bosses-choreographed.md §24: whose tap is it, " +
    "when neither seat is named. A spine of keelSegments segments arches over " +
    "the field; one joint lights at a time, and only the seat whose half of the " +
    "screen it sits over may tap it (geometrySeat) — the middle column either. " +
    "Movement one lights the ends inward; at two loose the socket flashes the " +
    "wave's colour, which only that shot shuts. Then it flips: both seats hold " +
    "their end joint keelChordBeats together inside keelFlipBeats, or it snaps " +
    "at the hull and flips again. A marrow lights the middle column for a bolt " +
    "of each colour in keelMarrowBeats, or it burns a segment loose. Movement " +
    "three relights it at keelTempoBeats, no SLOW, and a miss slips a segment. " +
    "The rock that follows answers to either colour, and the spine cools " +
    "keelCoolBeats hands-off, a tap flaring it (keelCoolFlares). Only the " +
    "simulation lane has landed — see sim/keel*.ts, sim/config-keel.ts.",
  "THE VALVE — the boss one hand turns and the other hand stops":
    "Asked for in docs/spec/bosses-choreographed.md §25: can one hand stop what " +
    "the other is moving. A drum with a wheel and a pin. The pilot turns the " +
    "wheel onto its mark (valveNearMilli); while it sits there the navigator's " +
    "tap on the pin freezes it (valveFreezeBeats, then the fast one), and while " +
    "frozen either seat draws the pin to valvePullMilli (valvePullBeats). A " +
    "window run out kicks the wheel off its mark. Three pins are the health; a " +
    "jet (tap), a brace and a seal (both hold) and a wipe (rub) follow them. The third " +
    "mark only counts after a full lap one way (valveLapMilli). THE SLOW spans " +
    "every freeze and pull window. Only the simulation lane has landed — see " +
    "sim/valve.ts, sim/valve-step.ts, sim/valve-hand.ts, sim/config-valve.ts.",
  "THE SEAM — the boss answered with the cannon and the shield, in order":
    "Asked for in docs/spec/bosses-choreographed.md §26: a choreographed scene " +
    "built out of nothing but the standard controls. A ridge down the middle " +
    "column, and a script the wave authors. Each step lights one thing: a point " +
    "shot in its colour (seamPointBeats), grit taken on the shield under the " +
    "ridge (seamGritBeats), a rock shot in its column (seamRockBeats), or grit " +
    "and a rock at once (seamBothBeats). The story: the ridge turned face away " +
    "throws grit blind (seamBlindBeats), and a glow gathers on the crack until " +
    "seamGlowShots shots of either colour quench it (seamGlowBeats). A step run " +
    "out is a hull hit, which is the wave. Three sealing points are the health, " +
    "and THE SLOW spans every step — sim/seam*.ts, sim/config-seam.ts.",
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
    "THE SLOW spans every step but the break. A glare wants the shield under " +
    "the eye, a look a shot up the column it looks down — sim/oculus*.ts, " +
    "sim/config-oculus.ts.",
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
    "pinch step stays lit past its count. A bite wants the shield under the " +
    "case, a spit a shot up the column the seed hangs over; either run out " +
    "is a hull hit — sim/vise*.ts, sim/config-vise.ts.",
  "THE RIME — the boss two rubs wipe clear, then shoot into":
    "Asked for in docs/spec/bosses-choreographed.md §29: a rub, each seat on " +
    "its own half of a frosted lens over the middle column, and a script the " +
    "wave authors. A left or right step shaves rimeShaveMilli of frost for " +
    "every reversal of that seat's thumb; a beat with no rub grows " +
    "rimeRegrowMilli back, and a half at nought is a wipe. A first wipe starts " +
    "from solid frost, a second from the film (rimeFilmMilli) the first left; " +
    "a wipe run out frosts the half solid and retries from its first wipe. Two " +
    "wipes a half bare the core; a fire step wants a shot in its colour; a " +
    "shield step is the guard pressed with the shield under the lens, and one " +
    "run out clouds the lens until it is shielded again. A fire step run out " +
    "is a hull hit, which is the wave. Only the simulation lane has landed — " +
    "see sim/rime.ts, sim/rime-step.ts, sim/rime-hand.ts, sim/rime-guard.ts, " +
    "sim/rime-shot.ts, sim/config-rime.ts.",
  "THE TRIVET — the boss two chords plant, then shoot into":
    "Asked for in docs/spec/bosses-choreographed.md §30: a chord, each seat " +
    "holding its own foot's lit pads of a stand over the middle column, and a " +
    "script the wave authors, pads and all. A front or rear step plants that " +
    "foot once its step's pads have all been down together for its beats; a " +
    "pad lifted starts the count again, and a step run out springs the foot " +
    "and relights it. Two plants a foot light the hub; a fire step wants a " +
    "shot in its colour; a both step is both chords held at once, and one run " +
    "out rocks the hub dark until it is held again. A fire step run out is a " +
    "hull hit, which is the wave. The grace (trivetGraceBeats) is how long a " +
    "chord step stays lit past its count. Only the simulation lane has " +
    "landed — see sim/trivet.ts, sim/trivet-step.ts, sim/trivet-hand.ts, " +
    "sim/trivet-shot.ts, sim/config-trivet.ts.",
  "THE PLUMB — the boss two phones hold level, then shoot into":
    "Asked for in docs/spec/bosses-choreographed.md §31: a lean, each seat " +
    "holding its own phone level to hang its weight true under a bob over " +
    "the middle column, and a script the wave authors, ranges and all. A left " +
    "or right step settles that weight once its phone has read inside the " +
    "step's range for its beats; a lean drifting out starts the count again, " +
    "and a step run out swings the weight loose and relights it. Two settles " +
    "a weight light the core; a fire step wants a shot in its colour; a both " +
    "step is both phones held level at once, and one run out dims the core " +
    "until it is held again. A fire step run out is a hull hit, which is the " +
    "wave. The grace (plumbGraceBeats) is how long a level step stays lit " +
    "past its count. Nothing reads a phone's lean yet. Only the simulation " +
    "lane has landed — see sim/plumb.ts, sim/plumb-step.ts, " +
    "sim/plumb-hand.ts, sim/plumb-shot.ts, sim/config-plumb.ts.",
  "THE SLING — the boss two draws loose, then shoot into":
    "Asked for in docs/spec/bosses-choreographed.md §32: a draw, each seat " +
    "holding a finger down to pull its own arm of a fork over the middle " +
    "column, then loosing it by swiping toward the lit side as it lifts, and " +
    "a script the wave authors, aims and all. A left or right step looses " +
    "that arm once the finger has held for the step's beats and leaves " +
    "toward its aim; a lift too soon, the wrong way or with no swipe springs " +
    "the arm slack with the step still lit, and a step run out springs it " +
    "and relights it. Two draws an arm light the yoke; a fire step wants a " +
    "shot in its colour; a both step is both seats drawing and loosing at " +
    "once, and one run out dims the yoke until it is redrawn. A fire step " +
    "run out is a hull hit, which is the wave. The grace (slingGraceBeats) " +
    "is how long a draw step stays lit past its count. Nothing on the phone " +
    "sends a draw yet. Only the simulation lane has landed — see " +
    "sim/sling.ts, sim/sling-step.ts, sim/sling-hand.ts, sim/sling-shot.ts, " +
    "sim/config-sling.ts.",
  "THE GRINDSTONE — the boss two thumbs grind true, then shoot into":
    "Asked for in docs/spec/bosses-choreographed.md §33: a wheel over the " +
    "middle column, each seat rubbing its own flat back and forth to " +
    "grind it clean as THE RIME's halves are wiped, twice a flat, the " +
    "second pass from a thin film; each fresh reversal shaves " +
    "grindstoneShaveMilli, and a beat nobody rubbed regrows " +
    "grindstoneRegrowMilli. A pass run out regrits the flat and asks its " +
    "first pass again. Both flats clean lock the caliper and light the " +
    "axle; a fire step wants a shot in its colour; a clamp step is both " +
    "seats holding every pad of their jaws down together for its beats, " +
    "as THE TRIVET's chords are, and one run out springs the caliper " +
    "loose and is asked again. A fire step run out is a hull hit, which " +
    "is the wave. The grace (grindstoneGraceBeats) is how long a clamp " +
    "stays lit past its count. Nothing on the phone sends a rub or a pad " +
    "yet. Only the simulation lane has landed — see sim/grindstone.ts, " +
    "sim/grindstone-step.ts, sim/grindstone-hand.ts, " +
    "sim/grindstone-shot.ts, sim/config-grindstone.ts.",
  "THE CYST — the boss one hand stills for the other to crack":
    "Asked for in docs/spec/bosses-choreographed.md §34: a sac over the " +
    "middle column whose lit flank shudders until the other seat taps its " +
    "mark, read as THE VALVE reads its pin, within cystTapBeats. A stilled " +
    "flank is pinched by its own seat, read as THE VISE reads a lobe: kept " +
    "under cystShutMilli for the step's beats it cracks, and a pinch that " +
    "widens starts the count again. The stilled flank is given the beats " +
    "and cystGraceBeats, then springs wide. The pilot pinches the left and " +
    "taps the right, the navigator the other way. Both flanks cracked bare " +
    "the core; a fire step wants a shot in its colour; a flank step on a " +
    "cracked flank holds it off the core, and one run out reseals the core " +
    "and is asked again. A fire step run out is a hull hit, which is the " +
    "wave. THE SLOW holds over a tap and a pinch, never over a shot. " +
    "Nothing on the phone sends a tap or a pinch yet. Only the simulation " +
    "lane has landed — see sim/cyst.ts, sim/cyst-step.ts, " +
    "sim/cyst-hand.ts, sim/cyst-shot.ts, sim/config-cyst.ts.",
} satisfies Partial<Record<GroupName, string>>;
