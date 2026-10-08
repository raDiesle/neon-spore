import {
  type BastionState,
  bastionLitStep,
  type FlueState,
  flueLitLevel,
  type LampreyState,
  type LatchState,
  lampreyAsks,
  latchLitStep,
  type MimicState,
  mimicDraws,
  type PlumbState,
  plumbLitStep,
  type RimeState,
  rimeLitStep,
  rimeRubbing,
  type SlingState,
  slingAsks,
  slingLitStep,
  type World,
} from "@neon-spore/sim";
import * as flueMarks from "../../../packages/render/src/flue-marks.js";
import * as lampreyMarks from "../../../packages/render/src/lamprey-marks.js";
import * as markFeedback from "../../../packages/render/src/mark-feedback.js";
import * as mimicTile from "../../../packages/render/src/mimic-tile.js";
import * as plumbMarks from "../../../packages/render/src/plumb-marks.js";
import { plumbAsked } from "../../../packages/render/src/plumb-pose.js";
import * as rimeMarks from "../../../packages/render/src/rime-marks.js";
import * as rimeStory from "../../../packages/render/src/rime-story.js";
import * as slingMarks from "../../../packages/render/src/sling-marks.js";
import { mark, type Row } from "./marks-window-kit.js";

/**
 * **The rows after the second six bosses'** of `marks-window.test.ts`. THE PLUMB's glass has
 * no argument that says it is asked, so its call is read off the state it
 * was handed. THE RIME's icicle is drawn from `rime-story.ts`, not its marks
 * file.
 * THE FLUE's ring is round the ember only once it has steadied under a rester.
 * THE LAMPREY's band and ring are both the bite's: the jaw to pin and the
 * tooth to tap are asked only while the mouth is on the hull.
 */

const bastion = (w: World) => w.boss as BastionState;
const flue = (w: World) => w.boss as FlueState;
const lamprey = (w: World) => w.boss as LampreyState;
const latch = (w: World) => w.boss as LatchState;
const mimic = (w: World) => w.boss as MimicState;
const plumb = (w: World) => w.boss as PlumbState;
const rime = (w: World) => w.boss as RimeState;
const sling = (w: World) => w.boss as SlingState;

export const ROWS_C: readonly Row[] = [
  {
    kind: "plumb",
    marks: [
      mark(
        plumbMarks,
        "drawPlumbGlass",
        (w) => {
          const step = plumbLitStep(plumb(w));
          return step !== null && step.ask !== "fire";
        },
        (a) => plumbAsked(a[2] as PlumbState, a[3] as 0 | 1),
      ),
      mark(
        plumbMarks,
        "drawPlumbCore",
        (w) => plumb(w).coreLit && plumbLitStep(plumb(w))?.ask === "fire",
        (a) => a[5] !== null,
      ),
    ],
  },
  {
    kind: "rime",
    marks: [
      mark(rimeMarks, "drawRimeLitHalf", (w) => rimeRubbing(rime(w), 0) || rimeRubbing(rime(w), 1)),
      mark(rimeMarks, "drawRimeSurge", (w) => rimeLitStep(rime(w))?.ask === "shield"),
      mark(
        rimeMarks,
        "drawRimeCore",
        (w) => rime(w).bared && rimeLitStep(rime(w))?.ask === "fire",
        (a) => a[5] !== null,
      ),
      mark(
        rimeStory,
        "drawRimeIcicle",
        (w) => rimeLitStep(rime(w))?.ask === "icicle",
        (a) => (a[2] as number) > 0,
      ),
    ],
  },
  {
    kind: "sling",
    marks: [
      mark(
        slingMarks,
        "drawSlingCord",
        (w) => slingAsks(sling(w), 0) || slingAsks(sling(w), 1),
        (a) => a[4] === true,
      ),
      mark(
        slingMarks,
        "drawSlingCup",
        (w) => sling(w).yokeLit && slingLitStep(sling(w))?.ask === "fire",
        (a) => a[3] !== null,
      ),
    ],
  },
  {
    kind: "flue",
    marks: [
      mark(flueMarks, "drawFlueSlotGlow", (w) => flueLitLevel(flue(w)) !== null),
      // Drawn dim between levels in the next one's colour; lit only while one is.
      mark(
        flueMarks,
        "drawFlueSight",
        (w) => flueLitLevel(flue(w)) !== null,
        (a) => a[4] === true,
      ),
    ],
  },
  {
    kind: "lamprey",
    marks: [mark(lampreyMarks, "drawLampreyToothMark", (w) => lampreyAsks(lamprey(w)) === "teeth")],
  },
  {
    // THE MIMIC's picture, tile by tile on the reader's board, only while a
    // seat has one to paint: a square painted outside it is not a mark.
    kind: "mimic",
    marks: [
      mark(
        mimicTile,
        "drawMimicTile",
        (w) => ([1, 2] as const).some((k) => mimicDraws(mimic(w), k)),
        (a) => a[5] === "wanted",
      ),
    ],
  },
  {
    // THE LATCH's halos, the field's shared mark (`latch-verdicts.ts`), and
    // the partner's ring on the grip that asks the other seat, only while a
    // level is lit — never while the colony drops in or rests between levels.
    // Walked on both seats' screens, since on TEST both grips are its own.
    kind: "latch",
    roles: ["p1", "p2"],
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => latchLitStep(latch(w)) !== null),
      mark(markFeedback, "drawMarkTheirs", (w) => latchLitStep(latch(w)) !== null),
    ],
  },
  {
    // THE BASTION's halos and the partner's ring (`bastion-verdicts.ts`): on
    // the slab knobs while the armour is lit, on the rim while the gun ring
    // is — never while the moon comes in, sheds or grows a shell back, and
    // never on the cage or the hull, which the shield and the cannon answer.
    kind: "bastion",
    roles: ["p1", "p2"],
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => bastionHandled(bastion(w))),
      mark(markFeedback, "drawMarkTheirs", (w) => bastionHandled(bastion(w))),
    ],
  },
];

/** Whether the lit shell is one a thumb takes off: the armour or the gun ring. */
function bastionHandled(s: BastionState): boolean {
  const layer = bastionLitStep(s)?.layer;
  return layer === "plates" || layer === "ring";
}
