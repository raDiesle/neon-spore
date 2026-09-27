import {
  type BurgeeState,
  burgeeCatching,
  burgeeLitStep,
  type CapstanState,
  type CystState,
  capstanBand,
  capstanFace,
  capstanLitStep,
  cystLitStep,
  cystSide,
  type DavitState,
  davitLitStep,
  type FilamentState,
  type FleetState,
  filamentTracing,
  type World,
} from "@neon-spore/sim";
import * as burgeeMarks from "../../../packages/render/src/burgee-marks.js";
import * as capstanMarks from "../../../packages/render/src/capstan-marks.js";
import * as cystMarks from "../../../packages/render/src/cyst-marks.js";
import * as davitMarks from "../../../packages/render/src/davit-marks.js";
import * as filamentMarks from "../../../packages/render/src/filament-turn-marks.js";
import * as fleetGrip from "../../../packages/render/src/fleet-grip-draw.js";
import { mark, type Row } from "./marks-window-kit.js";

/**
 * **The second six bosses' rows** of `marks-window.test.ts`. THE BURGEE's
 * studs glow white once both catches are in, before a fire step is lit:
 * that is the spindle's state and its health, the colour and the closing
 * ring are the ask, and only those count as lit.
 *
 * THE FLEET's `fleet-marks.ts` asks for nothing — the record, and the sights
 * that are the square's name — so its row is the grip on the wound, which is
 * where the flood and the wreck ask.
 */

const burgee = (w: World) => w.boss as BurgeeState;
const capstan = (w: World) => w.boss as CapstanState;
const cyst = (w: World) => w.boss as CystState;
const davit = (w: World) => w.boss as DavitState;
const filament = (w: World) => w.boss as FilamentState;
const fleet = (w: World) => w.boss as FleetState;

export const ROWS_B: readonly Row[] = [
  {
    kind: "burgee",
    marks: [
      mark(burgeeMarks, "drawBurgeeRing", (w) => burgeeCatching(burgee(w))),
      mark(burgeeMarks, "drawBurgeeTrack", (w) => burgeeCatching(burgee(w))),
      mark(
        burgeeMarks,
        "drawBurgeeStuds",
        (w) => burgee(w).spindleLit && burgeeLitStep(burgee(w))?.ask === "fire",
        (a) => a[5] !== null,
      ),
    ],
  },
  {
    kind: "capstan",
    marks: [
      mark(
        capstanMarks,
        "drawCapstanFace",
        (w) => capstanFace(w, capstan(w)) !== null,
        (a) => a[5] === true,
      ),
      mark(
        capstanMarks,
        "drawCapstanHorn",
        (w) => capstanBand(capstan(w)) !== null || capstanLitStep(capstan(w))?.ask === "hold",
        (a) => (a[3] as number) > 0,
      ),
      mark(
        capstanMarks,
        "drawCapstanCore",
        (w) => capstan(w).bared && capstanLitStep(capstan(w))?.ask === "fire",
        (a) => a[5] !== null,
      ),
    ],
  },
  {
    kind: "cyst",
    marks: [
      mark(cystMarks, "drawCystMark", (w) => cystSide(cyst(w)) !== null),
      mark(
        cystMarks,
        "drawCystCore",
        (w) => cyst(w).bared && cystLitStep(cyst(w))?.ask === "fire",
        (a) => a[5] !== null,
      ),
    ],
  },
  {
    kind: "davit",
    marks: [
      mark(davitMarks, "drawDavitAsk", (w) => {
        const ask = davitLitStep(davit(w))?.ask;
        return ask === "left" || ask === "right";
      }),
      mark(
        davitMarks,
        "drawDavitHook",
        (w) => davit(w).pivotLit && davitLitStep(davit(w))?.ask === "fire",
        (a) => a[5] !== null,
      ),
    ],
  },
  {
    kind: "filament",
    marks: [
      mark(
        filamentMarks,
        "drawFilamentArrows",
        (w) => filamentTracing(filament(w)),
        (a) => (a[3] as number) < (a[4] as number),
      ),
      mark(filamentMarks, "drawFilamentMax", (w) => filamentTracing(filament(w))),
    ],
  },
  {
    kind: "fleet",
    marks: [
      mark(
        fleetGrip,
        "drawFleetGrip",
        (w) => fleet(w).phase === "flood" || fleet(w).phase === "wreck",
        (a) => (a[3] as FleetState).phase !== "hunt",
      ),
    ],
  },
];
