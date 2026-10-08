import {
  type GovernorState,
  governorFiring,
  governorOpenFor,
  governorOpenMarks,
  type MantleState,
  mantleCoreAsks,
  mantleKnobAsks,
  mantleVenting,
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
 * mark — a knob while the shell wants both hands, the core's half for the seat
 * whose tap is next, and the vent while it hisses.
 *
 * THE GOVERNOR's track mark is lit when it is drawn `open`: a mark a tap may
 * land now. One landed stays lit, steady, until its step is answered, which is
 * the answer rather than the ask. Its halos are the seats' open marks and the
 * gap while the hub fires.
 */

const mantle = (w: World) => w.boss as MantleState;
const governor = (w: World) => w.boss as GovernorState;

export const ROWS_D: readonly Row[] = [
  {
    kind: "mantle",
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => {
        const s = mantle(w);
        return (
          mantleKnobAsks(s, 0) ||
          mantleKnobAsks(s, 1) ||
          mantleCoreAsks(s, 1) ||
          mantleCoreAsks(s, 2) ||
          mantleVenting(s)
        );
      }),
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
];
