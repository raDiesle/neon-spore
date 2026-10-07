import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each **choreographed boss's** card, the fourth page —
 * THE CYST and every boss built after it.
 *
 * Cut out of `ship-notes-choreo-c.ts` on 26 September 2026, when that page
 * stood at 241 lines and THE DAVIT's paragraph was sixteen more. The seam is
 * the one the pages before it were cut along — the order they were built in,
 * which nothing depends on. Spread into `CHOREO_NOTES` in place, so the
 * totality guard is unchanged. The next boss's paragraph goes here.
 *
 * THE CYST's came over on 27 September 2026, when THE HASP's story grew its
 * paragraph on page three: the last boss on the page goes, never the one
 * being worked on.
 */
export const CHOREO_NOTES_D = {
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
    "wave. Story steps under THE SLOW, each run out a hull hit: a swell " +
    "pinched shut on both flanks at once, a spore off the middle turned by " +
    "the shield, a bud off the middle shot in its colour. THE SLOW never " +
    "holds a shot. The picture is render/cyst*.ts, the lit flank white.",
  "THE DAVIT — the boss one hand steers for the other to loose":
    "Asked for in docs/spec/bosses-choreographed.md §35: a crane boom over " +
    "the middle column, steered by one seat's thumb carried across it — read " +
    "as THE CAPSTAN reads a cradle, davitSteerDegreesPerTile degrees a tile " +
    "— onto the step's leanMilli, within its rangeMilli, while the other " +
    "seat holds a draw, read as THE SLING reads an arm. The draw counts its " +
    "beats only while the steer holds, and lands only if it lifts while the " +
    "steer still holds, swiping toward the steer's half; a steer that leaves " +
    "the target resets the draw it steered. On the left swing the pilot " +
    "steers and the navigator looses, on the right the other way; two looses " +
    "on each light the pivot, shot in its colour. A reland step lets either " +
    "seat loose against the other's steer, and one run out dims the pivot. " +
    "A swing run out is tried again after davitRestBeats; a fire step run " +
    "out is a hull hit, which is the wave. Unsteered, the boom swings back " +
    "davitDriftMilli a beat. It was steered by the phone's lean until 30 " +
    "September 2026 — see sim/davit.ts, sim/davit-step.ts, " +
    "sim/davit-hand.ts, sim/davit-shot.ts, sim/config-davit.ts, " +
    "render/davit-grip.ts.",
  "THE HALTER — the boss one hand keeps still for the other to open":
    "Asked for in docs/spec/bosses-choreographed.md §36: a seam over the " +
    "middle column that opens only while one seat sends nothing at all — " +
    "RestraintGate, counted in whole beats from the step's light and zeroed " +
    "by any command — and the other holds both grips, THE TRIVET's chord. " +
    "Held together halterHoldBeats, the lit segment cracks. The left mark " +
    "rests the navigator and the pilot grips, the right the other way; both " +
    "cracked bare the centre, shot in its colour. A guard step keeps it bare " +
    "and takes the pair either way round; a guard failed or run out shuts it " +
    "until the guard is made again. A segment window run out is tried again " +
    "after halterPauseBeats; a fire step run out is a hull hit, which is the " +
    "wave. Nothing on the phone sends a grip here yet. Only the simulation " +
    "lane has landed — see sim/halter.ts, sim/halter-step.ts, " +
    "sim/halter-hand.ts, sim/halter-shot.ts, sim/config-halter.ts.",
  "THE CAPSTAN — the boss one hand rocks for the other to wear":
    "Asked for in docs/spec/bosses-choreographed.md §37: a drum over the " +
    "middle column on a cradle one seat rocks with a pull past " +
    "capstanPullMilli — a thumb carried across the drum — while the other wipes the " +
    "bared face's band, THE RIME's RubCount. Only the bared face wears; the " +
    "hidden one keeps its wear. The left mark is the pilot's pull and the " +
    "navigator's thumb, the right the other way; a band not lit stops one " +
    "short of capstanWearThreshold. Both bright bare the core, shot in its " +
    "colour. A hold step wants capstanHoldBeats beats of pull and rub, " +
    "either way round; run out, it covers the core and is asked again. A " +
    "band window run out is tried again with its wear; a fire step run out " +
    "is a hull hit, which is the wave. The pull is a thumb on the drum's " +
    "middle and the rub a thumb on either end (render/capstan-grip.ts) — see " +
    "sim/capstan.ts, sim/capstan-step.ts, sim/capstan-hand.ts, " +
    "sim/capstan-shot.ts, sim/config-capstan.ts.",
  "THE GALL — the boss that moves the moment it is closed":
    "Asked for in docs/spec/bosses-choreographed.md §38: a soft nodule on a " +
    "seam across the hull, sitting on one of four points. The seat nearer " +
    "it pinches it — THE VISE's SqueezeGap, the point as the pinch's id — " +
    "and keeps the gap under gallShutMilli for gallShutBeats; a pinch on " +
    "any other point is on bare seam. A close landed jumps it to another " +
    "point, drawn off the seeded Rng. Three closes bare the root, shot in " +
    "its colour. A close window run out is tried again with the gall where " +
    "it was; a fire step run out is a hull hit, which is the wave. Nothing " +
    "on the phone sends a pinch here yet. Only the simulation lane has " +
    "landed — see sim/gall.ts, sim/gall-step.ts, sim/gall-hand.ts, " +
    "sim/gall-shot.ts, sim/config-gall.ts.",
  "THE BURGEE — a flag stilled by one seat and caught by the other":
    "Asked for in docs/spec/bosses-choreographed.md §39: a pennant on a free " +
    "boom mid-hull that swings across the three middle columns on its own, " +
    "burgeeSwingMilli, never a player's to move. The step's freezer taps it " +
    "still over the lit column — THE VALVE's FREEZE TAP, an edge, landing only " +
    "on the mark — and the other seat holds a draw a beat and lifts toward " +
    "the column while it is still frozen, THE SLING's HOLD, THEN SWIPE. Two " +
    "catches, seats swapped, light the spindle; three shots at it, each after " +
    "the creeping flag is caught back. A catch run out is tried again; a " +
    "recatch run out dims the spindle; a fire step run out is a hull hit, " +
    "which is the wave. Nothing on the phone sends a tap or a draw here yet. " +
    "Only the simulation lane has landed — see sim/burgee.ts, " +
    "sim/burgee-step.ts, sim/burgee-hand.ts, sim/burgee-shot.ts, " +
    "sim/config-burgee.ts.",
  "THE FLUE — an ember one seat sees and the other shoots":
    "Reworked by the owner, 5 October 2026 (docs/spec/bosses.md §11.57): " +
    "an ember runs end to end along a slot across the top of the field, " +
    "flueSpanMilli either side of the middle, and only the pilot is drawn " +
    "it. The cannon is held under the middle column. Each level asks one " +
    "weapon — a bolt or the beam — in one colour, with its own ember speed, " +
    "THE SLOW at its own strength and the end it sets off from, and is met " +
    "once or more; the pilot says when, early by the " +
    "shot's own delay, and the navigator fires. A shot is judged at the " +
    "flue, within flueHitMilli of the ember; anything else spends one of " +
    "flueShots and beams the ember back to its end, held flueBeamBeats; " +
    "the last one spent is a hull hit, which is the wave. " +
    "See sim/flue.ts, sim/flue-step.ts, sim/flue-shot.ts, sim/flue-lead.ts, " +
    "sim/config-flue.ts.",
  "THE GOVERNOR — a needle each of you taps on your own mark":
    "Asked for in docs/spec/bosses-choreographed.md §43 and reworked on the " +
    "owner's word of 6 October 2026: a needle running round a dial mid-hull " +
    "on its own, quick. Every tap step lights a mark for each seat, and " +
    "each taps as the needle crosses its own, within governorMarkMilli — " +
    "TAPS ON A MOVING TARGET, both seats at once. Later steps light three " +
    "and four marks, numbered, to be tapped in order. The taps before the " +
    "first shot light the hub; then the needle's lit tip is shot under THE " +
    "SLOW, through a gap in the bottom of the rim, by a bolt that meets it " +
    "there within governorDownMilli of the bottom (7 October 2026). A tap step run out is tried again with what was landed " +
    "kept, a retap run out dims the hub until it is made, and a fire step " +
    "run out is a hull hit, which is the wave. See sim/governor.ts, " +
    "sim/governor-mark.ts, sim/governor-step.ts, sim/governor-hand.ts, " +
    "sim/governor-turn.ts, sim/governor-shot.ts, sim/config-governor.ts.",
  "THE LAMPREY — an eel one of you holds by the tail for the other to pull off":
    "Asked for in docs/spec/bosses-choreographed.md §41, and rebuilt on the " +
    "owner's word of 5 October 2026: an eel leaping across the field to a " +
    "fresh tile a stay, further each stay, and biting into it under THE SLOW. " +
    "One seat holds the tail; the other pulls the head up off the tile (a " +
    "pull), taps the lit tooth (a teeth), or pulls the head while the holder " +
    "drags the tail the other way at once (an apart). A gullet stay is shot " +
    "in its colour. Any stay run out bites through to the hull, which is the " +
    "wave. See sim/lamprey.ts, sim/lamprey-step.ts, sim/lamprey-leap.ts, " +
    "sim/lamprey-hand.ts, sim/lamprey-shot.ts, sim/config-lamprey.ts.",
  "THE MIMIC — a sign one of you reads for the other to draw":
    "Asked for in docs/spec/bosses-choreographed.md §42: a mantle with " +
    "eight arms that holds a frame, and a picture of squares in it on one " +
    "seat's screen only. The other seat taps it into the frame a tile at a " +
    "time; the frame is centred on row mimicFrameRow and as big as the " +
    "step's pictures. No panel, no brush, one colour, no SLOW. Tapping a " +
    "painted tile clears it. A whole, exact picture " +
    "peels and draws the arms back up a step; one not finished in its " +
    "window is worn on the skin for mimicMimicBeats, then an arm reaches a " +
    "step down, and mimicReaches reaches in a movement strike the hull. " +
    "Pictures for the pilot, a roll, pictures for the navigator that change " +
    "mimicChangeBeats in, a roll, then split boards each seat reads for the " +
    "other, each baring a core on row mimicCoreRow to tap. " +
    "See sim/mimic.ts, sim/mimic-frame.ts, sim/mimic-shapes.ts, sim/mimic-hand.ts.",
} satisfies Partial<Record<GroupName, string>>;
