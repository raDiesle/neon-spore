import {
  type FlueState,
  flueLitLevel,
  type GallState,
  type GrindstoneState,
  gallClosing,
  gallLitStep,
  grinding,
  grindstoneLitStep,
  type HalterState,
  halterLitStep,
  type LampreyState,
  lampreyBiting,
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
import * as gallMarks from "../../../packages/render/src/gall-marks.js";
import * as grindstoneMarks from "../../../packages/render/src/grindstone-marks.js";
import * as halterMarks from "../../../packages/render/src/halter-marks.js";
import * as lampreyMarks from "../../../packages/render/src/lamprey-marks.js";
import * as mimicTile from "../../../packages/render/src/mimic-tile.js";
import * as plumbMarks from "../../../packages/render/src/plumb-marks.js";
import { plumbAsked } from "../../../packages/render/src/plumb-pose.js";
import * as rimeMarks from "../../../packages/render/src/rime-marks.js";
import * as rimeStory from "../../../packages/render/src/rime-story.js";
import * as slingMarks from "../../../packages/render/src/sling-marks.js";
import { mark, type Row } from "./marks-window-kit.js";

/**
 * **The rows after the second six bosses'** of `marks-window.test.ts`. THE GALL's scars
 * name the seam's points and ask for nothing, and THE GRINDSTONE's axle is
 * ringed white once the caliper has bitten, before its fire step: that is
 * the bite, and only the step's colour counts as lit. THE PLUMB's glass has
 * no argument that says it is asked, so its call is read off the state it
 * was handed. THE RIME's icicle is drawn from `rime-story.ts`, not its marks
 * file.
 * THE FLUE's ring is round the ember only once it has steadied under a rester.
 * THE LAMPREY's band and ring are both the bite's: the jaw to pin and the
 * tooth to tap are asked only while the mouth is on the hull.
 */

const gall = (w: World) => w.boss as GallState;
const flue = (w: World) => w.boss as FlueState;
const grindstone = (w: World) => w.boss as GrindstoneState;
const halter = (w: World) => w.boss as HalterState;
const lamprey = (w: World) => w.boss as LampreyState;
const mimic = (w: World) => w.boss as MimicState;
const plumb = (w: World) => w.boss as PlumbState;
const rime = (w: World) => w.boss as RimeState;
const sling = (w: World) => w.boss as SlingState;

/** THE HALTER's grips and seam: a lit step that asks for a hold, not the shot. */
const halterHolds = (w: World) => {
  const step = halterLitStep(halter(w));
  return step !== null && step.ask !== "fire";
};

export const ROWS_C: readonly Row[] = [
  {
    kind: "gall",
    marks: [
      mark(gallMarks, "drawGallPinch", (w) => gallClosing(gall(w))),
      mark(
        gallMarks,
        "drawGallRoot",
        (w) => gall(w).bared && gallLitStep(gall(w))?.ask === "fire",
        (a) => a[4] !== null,
      ),
    ],
  },
  {
    kind: "grindstone",
    marks: [
      mark(grindstoneMarks, "drawGrindstoneFaceGlow", (w) => grinding(grindstone(w)) !== null),
      mark(
        grindstoneMarks,
        "drawGrindstonePads",
        (w) => grindstoneLitStep(grindstone(w))?.ask === "clamp",
        (a) => a[4] === true,
      ),
      mark(
        grindstoneMarks,
        "drawGrindstoneAxle",
        (w) => grindstone(w).locked && grindstoneLitStep(grindstone(w))?.ask === "fire",
        (a) => a[5] !== null,
      ),
    ],
  },
  {
    kind: "halter",
    marks: [
      mark(halterMarks, "drawHalterSeamGlow", halterHolds),
      mark(halterMarks, "drawHalterGrips", halterHolds),
      mark(
        halterMarks,
        "drawHalterCore",
        (w) => halter(w).bared && halterLitStep(halter(w))?.ask === "fire",
        (a) => a[4] !== null,
      ),
    ],
  },
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
    marks: [
      mark(lampreyMarks, "drawLampreyJawMark", (w) => lampreyBiting(lamprey(w))),
      mark(lampreyMarks, "drawLampreyToothMark", (w) => lampreyBiting(lamprey(w))),
    ],
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
];
