import {
  type KeelState,
  keelLit,
  type OculusState,
  oculusLitStep,
  type SeamState,
  seamLitStep,
  type ValveState,
  type ViseState,
  valveBracing,
  valveFrozen,
  valveHolding,
  valveJetting,
  valveTurning,
  valveWiping,
  viseLitStep,
  type World,
} from "@neon-spore/sim";
import * as keelMarks from "../../../packages/render/src/keel-marks.js";
import * as oculusMarks from "../../../packages/render/src/oculus-marks.js";
import * as seamMarks from "../../../packages/render/src/seam-marks.js";
import * as valveMarks from "../../../packages/render/src/valve-marks.js";
import * as viseMarks from "../../../packages/render/src/vise-marks.js";
import { mark, type Row } from "./marks-window-kit.js";

/** **The first five bosses' rows** of `marks-window.test.ts`, the first lane's. */

const oculus = (w: World) => w.boss as OculusState;
const vise = (w: World) => w.boss as ViseState;
const keel = (w: World) => w.boss as KeelState;
const valve = (w: World) => w.boss as ValveState;
const seam = (w: World) => w.boss as SeamState;

export const ROWS_A: readonly Row[] = [
  {
    kind: "oculus",
    marks: [
      mark(oculusMarks, "drawOculusLitPair", (w) => oculusLitStep(oculus(w)) !== null),
      mark(
        oculusMarks,
        "drawOculusCore",
        (w) => oculusLitStep(oculus(w)) !== null,
        (a) => a[4] !== null,
      ),
    ],
  },
  {
    kind: "vise",
    marks: [
      mark(viseMarks, "drawViseLitSeam", (w) => viseLitStep(vise(w)) !== null),
      mark(
        viseMarks,
        "drawViseKernel",
        (w) => viseLitStep(vise(w)) !== null,
        (a) => a[5] !== null,
      ),
    ],
  },
  {
    kind: "keel",
    marks: [
      mark(keelMarks, "drawKeelRing", (w) => keelLit(keel(w))),
      mark(keelMarks, "drawKeelSocket", (w) => keel(w).phase === "socket"),
    ],
  },
  {
    kind: "valve",
    marks: [
      mark(valveMarks, "drawValveMark", (w) => valveTurning(valve(w)) || valveFrozen(valve(w))),
      mark(
        valveMarks,
        "drawValveSocket",
        (w) => {
          const s = valve(w);
          return (
            valveHolding(s) ||
            valveFrozen(s) ||
            valveJetting(s) ||
            valveBracing(s) ||
            valveWiping(s)
          );
        },
        (a) => (a[4] as number) > 0,
      ),
    ],
  },
  {
    kind: "seam",
    marks: [
      mark(seamMarks, "drawSeamPoint", (w) => seamLitStep(seam(w)) !== null),
      mark(seamMarks, "drawSeamGrit", (w) => seamLitStep(seam(w)) !== null),
      mark(seamMarks, "drawSeamRock", (w) => seamLitStep(seam(w)) !== null),
    ],
  },
];
