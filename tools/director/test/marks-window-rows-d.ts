import {
  type AntiphonState,
  antiphonOrganAsks,
  antiphonRailAsks,
  type GimbalState,
  type GovernorState,
  gimbalRingAsks,
  governorFiring,
  governorOpenFor,
  governorOpenMarks,
  type HaspState,
  type HiveState,
  haspBurning,
  haspLatchUp,
  haspWheelUp,
  hiveHaulAsks,
  hiveHoldable,
  hiveSwelling,
  INNER,
  type LeadState,
  leadGrippable,
  type MantleState,
  mantleCoreAsks,
  mantleKnobAsks,
  mantleVenting,
  OUTER,
  type RatchetState,
  ratchetCatchAsks,
  ratchetPawlAsks,
  type ScuttleState,
  type SurgeState,
  scuttleSwingable,
  surgeAsks,
  type World,
} from "@neon-spore/sim";
import * as governorMarks from "../../../packages/render/src/governor-marks.js";
import * as markFeedback from "../../../packages/render/src/mark-feedback.js";
import { mark, type Row } from "./marks-window-kit.js";

/**
 * **The rows owed when `NO_ROW` was written** (`marks-window-no-row.ts`), a
 * lane at a time.
 *
 * THE MANTLE's mark functions decide inside themselves whether to draw, so a
 * call to one says nothing; its row is the halo they draw, the field's shared
 * mark, and the partner's ring on the other screen — a knob while the shell
 * wants both hands, the core's half for the seat whose tap is next, and the
 * vent while it hisses.
 *
 * THE GOVERNOR's track mark is lit when it is drawn `open`: a mark a tap may
 * land now. One landed stays lit, steady, until its step is answered, which is
 * the answer rather than the ask. Its halos are the seats' open marks and the
 * gap while the hub fires.
 *
 * THE HIVE, THE GIMBAL, THE HASP and THE RATCHET draw every mark that asks as
 * the shared halo too, each behind a gate of its own, so each row is that halo
 * and the union of the boss's windows. THE HIVE's are three — a site on the
 * wall the pilot may hold, the clenched underside he may haul, and a lobe
 * swelling for the navigator. THE HASP's are the latch while it will take his
 * hand and the wheel while it is up for hers; its halo is narrower, never
 * drawn past the grip or with her hand already on the rim.
 *
 * THE SURGE, THE LEAD, THE SCUTTLE and THE ANTIPHON the same: either seat's
 * grip on the bulb; the stalk while it stands still and nobody holds it; a
 * loose part while the frame may be swung; the organ grown and nothing in
 * hand, or a candidate on the rail while it stands.
 */

const mantle = (w: World) => w.boss as MantleState;
const governor = (w: World) => w.boss as GovernorState;

/** Whether any of THE MANTLE's marks asks: a knob, the core's half, or the vent. */
const mantleAsks = (w: World): boolean => {
  const s = mantle(w);
  return (
    mantleKnobAsks(s, 0) ||
    mantleKnobAsks(s, 1) ||
    mantleCoreAsks(s, 1) ||
    mantleCoreAsks(s, 2) ||
    mantleVenting(s)
  );
};
const hive = (w: World) => w.boss as HiveState;
const gimbal = (w: World) => w.boss as GimbalState;
const hasp = (w: World) => w.boss as HaspState;
const ratchet = (w: World) => w.boss as RatchetState;
const surge = (w: World) => w.boss as SurgeState;
const lead = (w: World) => w.boss as LeadState;
const scuttle = (w: World) => w.boss as ScuttleState;
const antiphon = (w: World) => w.boss as AntiphonState;

export const ROWS_D: readonly Row[] = [
  {
    kind: "mantle",
    // Both seats' screens, so the partner's ring is held too: on TEST every
    // mark is the screen's own and it is never drawn.
    roles: ["p1", "p2"],
    marks: [
      mark(markFeedback, "drawMarkHalo", mantleAsks),
      mark(markFeedback, "drawMarkTheirs", mantleAsks),
    ],
  },
  {
    kind: "governor",
    marks: [
      mark(
        governorMarks,
        "drawGovernorMark",
        (w) => governorOpenMarks(governor(w)).length > 0,
        (a) => a[5] === "open",
      ),
      mark(markFeedback, "drawMarkHalo", (w) => {
        const s = governor(w);
        return governorOpenFor(s, 1) || governorOpenFor(s, 2) || governorFiring(s);
      }),
    ],
  },
  {
    kind: "hive",
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => {
        const s = hive(w);
        const swelling = s.downBeat < 0 && hiveSwelling(s, w.cfg, w.beat);
        return hiveHoldable(s).length > 0 || hiveHaulAsks(s) || swelling;
      }),
    ],
  },
  {
    kind: "gimbal",
    marks: [
      mark(
        markFeedback,
        "drawMarkHalo",
        (w) => gimbalRingAsks(gimbal(w), INNER) || gimbalRingAsks(gimbal(w), OUTER),
      ),
    ],
  },
  {
    kind: "hasp",
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => {
        const s = hasp(w);
        return (haspLatchUp(s) && !haspBurning(s)) || haspWheelUp(s);
      }),
    ],
  },
  {
    kind: "ratchet",
    marks: [
      mark(
        markFeedback,
        "drawMarkHalo",
        (w) => ratchetCatchAsks(ratchet(w), w.cfg) || ratchetPawlAsks(ratchet(w)),
      ),
    ],
  },
  {
    kind: "surge",
    marks: [
      mark(
        markFeedback,
        "drawMarkHalo",
        (w) => surgeAsks(surge(w), w, 1) || surgeAsks(surge(w), w, 2),
      ),
    ],
  },
  {
    kind: "lead",
    marks: [mark(markFeedback, "drawMarkHalo", (w) => leadGrippable(lead(w)))],
  },
  {
    kind: "scuttle",
    marks: [mark(markFeedback, "drawMarkHalo", (w) => scuttleSwingable(scuttle(w)))],
  },
  {
    kind: "antiphon",
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => {
        const s = antiphon(w);
        if (antiphonOrganAsks(s)) return true;
        return s.rail.some((_, i) => antiphonRailAsks(s, w.cfg, w.beat, i));
      }),
    ],
  },
];
