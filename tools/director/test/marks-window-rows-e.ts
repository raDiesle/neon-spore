import {
  type GaugeState,
  gaugeBandAsks,
  type MazeState,
  type MirrorState,
  mazeHeartAsks,
  mazeStringAsks,
  mirrorAsks,
  type PinballState,
  type PulseState,
  pinPlungerAsks,
  pinTableAsks,
  pulseBarAsks,
  type SnakeState,
  snakeJawsAsks,
  type VaneState,
  vaneArmAsks,
  vaneHousingAsks,
  type World,
} from "@neon-spore/sim";
import * as markFeedback from "../../../packages/render/src/mark-feedback.js";
import { mark, type Row } from "./marks-window-kit.js";

/**
 * **THE MIRROR, THE VANE, THE MAZE and THE GAUGE**, four of the rows owed
 * when `NO_ROW` was written (`marks-window-no-row.ts`), in a file of their
 * own because `-c` was near its 250 lines with three other lanes writing
 * the rest of the list.
 *
 * Each of the four draws every mark that asks as the field's shared halo,
 * behind the simulation's own asking, so each row is that halo and the
 * union of the boss's windows: a lobe of THE MIRROR's asked of either seat;
 * THE VANE's arm until the pin lands and its housing while the haul is up;
 * THE MAZE's string while it is read and its heart while it wants the grip;
 * THE GAUGE's band while the dial is bound and wound open.
 *
 * THE SNAKE, PINBALL and THE PULSE are the next three, the same way: the
 * jaws once the maw has rested; the plunger while it winds and the table
 * while it takes a nudge; a seat's bar while the heart is off and that seat
 * has not braced — which takes a miss, so THE PULSE is walked with AUTO on
 * the pilot's seat alone. These, like THE GAUGE, are rounds, and are walked through
 * `drawRound` (`marks-window.test.ts`).
 */

const mirror = (w: World) => w.boss as MirrorState;
const vane = (w: World) => w.boss as VaneState;
const maze = (w: World) => w.boss as MazeState;
const gauge = (w: World) => w.boss as GaugeState;
const snake = (w: World) => w.boss as SnakeState;
const pinball = (w: World) => w.boss as PinballState;
const pulse = (w: World) => w.boss as PulseState;

export const ROWS_E: readonly Row[] = [
  {
    kind: "mirror",
    marks: [
      mark(
        markFeedback,
        "drawMarkHalo",
        (w) => mirrorAsks(mirror(w), 1).length > 0 || mirrorAsks(mirror(w), 2).length > 0,
      ),
    ],
  },
  {
    kind: "vane",
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => {
        const s = vane(w);
        return vaneArmAsks(w.cfg, s, w.beat) || vaneHousingAsks(w.cfg, s, w.beat);
      }),
    ],
  },
  {
    kind: "maze",
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => mazeStringAsks(maze(w)) || mazeHeartAsks(maze(w))),
    ],
  },
  {
    kind: "gauge",
    marks: [mark(markFeedback, "drawMarkHalo", (w) => gaugeBandAsks(gauge(w)))],
  },
  {
    kind: "snake",
    marks: [mark(markFeedback, "drawMarkHalo", (w) => snakeJawsAsks(w.cfg, snake(w), w.tick))],
  },
  {
    kind: "pinball",
    marks: [
      mark(
        markFeedback,
        "drawMarkHalo",
        (w) => pinPlungerAsks(pinball(w)) || pinTableAsks(pinball(w)),
      ),
    ],
  },
  {
    kind: "pulse",
    // The pilot alone: the navigator's notes go by, the heart falls, and the
    // bar asks of both seats.
    auto: "p1",
    marks: [
      mark(
        markFeedback,
        "drawMarkHalo",
        (w) => pulseBarAsks(w.cfg, pulse(w), 1) || pulseBarAsks(w.cfg, pulse(w), 2),
      ),
    ],
  },
];
