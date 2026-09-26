import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each **choreographed boss's** card, the fourth page —
 * THE DAVIT and every boss built after it.
 *
 * Cut out of `ship-notes-choreo-c.ts` on 26 September 2026, when that page
 * stood at 241 lines and THE DAVIT's paragraph was sixteen more. The seam is
 * the one the pages before it were cut along — the order they were built in,
 * which nothing depends on. Spread into `CHOREO_NOTES` in place, so the
 * totality guard is unchanged. The next boss's paragraph goes here.
 */
export const CHOREO_NOTES_D = {
  "THE DAVIT — the boss one hand steers for the other to loose":
    "Asked for in docs/spec/bosses-choreographed.md §35: a crane boom over " +
    "the middle column, steered by one seat's lean — read as THE PLUMB reads " +
    "a weight — onto the step's leanMilli, within its rangeMilli, while the " +
    "other seat holds a draw, read as THE SLING reads an arm. The draw counts " +
    "its beats only while the lean holds, and lands only if it lifts while " +
    "the lean still holds, swiping toward the lean's half; a lean that leaves " +
    "the target resets the draw it steered. On the left swing the pilot " +
    "steers and the navigator looses, on the right the other way; two looses " +
    "on each light the pivot, shot in its colour. A reland step lets either " +
    "seat loose against the other's lean, and one run out dims the pivot. " +
    "A swing run out is tried again after davitRestBeats; a fire step run " +
    "out is a hull hit, which is the wave. Unsteered, the boom swings back " +
    "davitDriftMilli a beat. Nothing on the phone sends a lean or a draw " +
    "here yet. Only the simulation lane has landed — see sim/davit.ts, " +
    "sim/davit-step.ts, sim/davit-hand.ts, sim/davit-shot.ts, " +
    "sim/config-davit.ts.",
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
} satisfies Partial<Record<GroupName, string>>;
