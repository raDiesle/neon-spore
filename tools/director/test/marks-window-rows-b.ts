import {
  type CapstanState,
  type CystState,
  capstanBand,
  capstanFace,
  capstanLitStep,
  cystLitStep,
  cystSide,
  type FilamentState,
  type FleetState,
  filamentTracing,
  type TrapezeState,
  trapezeOpenZone,
  type World,
} from "@neon-spore/sim";
import * as capstanMarks from "../../../packages/render/src/capstan-marks.js";
import * as cystMarks from "../../../packages/render/src/cyst-marks.js";
import * as filamentMarks from "../../../packages/render/src/filament-turn-marks.js";
import * as fleetGrip from "../../../packages/render/src/fleet-grip-draw.js";
import * as trapezeMarks from "../../../packages/render/src/trapeze-marks.js";
import { mark, type Row } from "./marks-window-kit.js";

/**
 * **The second six bosses' rows** of `marks-window.test.ts`, five since THE
 * DAVIT left the game on 8 October 2026. THE TRAPEZE's
 * zones are drawn dashed all through a swipe level, so the pair know where
 * they are before they are asked; only a zone drawn open is the ask.
 *
 * THE FLEET's `fleet-marks.ts` asks for nothing — the record, and the sights
 * that are the square's name — so its row is the grip on the wound, which is
 * where the flood and the wreck ask.
 */

const trapeze = (w: World) => w.boss as TrapezeState;
const capstan = (w: World) => w.boss as CapstanState;
const cyst = (w: World) => w.boss as CystState;
const filament = (w: World) => w.boss as FilamentState;
const fleet = (w: World) => w.boss as FleetState;

export const ROWS_B: readonly Row[] = [
  {
    kind: "trapeze",
    // A zone drawn open, its chevrons and its light, only while the swing comes back over a side in a swipe level.
    marks: [
      mark(
        trapezeMarks,
        "drawTrapezeZone",
        (w) => trapezeOpenZone(w.cfg, trapeze(w)) !== 0,
        (a) => a[5] === true,
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
