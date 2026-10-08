import {
  type BatonState,
  batonDrawAsks,
  batonStripAsks,
  type CurtainState,
  curtainHemAsks,
  type GorgeState,
  gorgeAsks,
  type LedgerState,
  ledgerFootable,
  ledgerHaulable,
  ledgerPlugs,
  ledgerPullable,
  type ScoutState,
  type SinewState,
  scoutLineAsks,
  scoutPrimeAsks,
  sinewHeld,
  type TasterState,
  type ThroatState,
  tasterPinnable,
  tasterPryable,
  tasterWipable,
  type World,
} from "@neon-spore/sim";
import * as markFeedback from "../../../packages/render/src/mark-feedback.js";
import { mark, type Row } from "./marks-window-kit.js";

/**
 * **More of the rows owed when `NO_ROW` was written**, in a file of their own
 * beside `-e`'s, each the shared halo held to the union of the boss's windows
 * in the simulation.
 *
 * THE CURTAIN's hem while it asks; THE TASTER's lock while it may be pried and
 * each blade and gap while it may be pinned or wiped; THE SINEW's handles
 * whenever one is free and the tendon is not out — the simulation hears a
 * grip at any beat before then, so the halo's narrower gate (`sinew-word.ts`)
 * is inside it; THE LEDGER's root while it may be footed or plugged, and the
 * pilot's bead or haul while either is offered.
 *
 * THE SCOUT's line and its prime, on THE HAUL; THE BATON's draw while the pieces merge and
 * its strip after, either seat's; THE THROAT's mouth and pump all through
 * `sucks`, the one phase its hands are heard in (`sim/throat-hand.ts`); THE
 * GORGE's sites as each falls due.
 */

const curtain = (w: World) => w.boss as CurtainState;
const taster = (w: World) => w.boss as TasterState;
const sinew = (w: World) => w.boss as SinewState;
const ledger = (w: World) => w.boss as LedgerState;
const scout = (w: World) => w.boss as ScoutState;
const baton = (w: World) => w.boss as BatonState;
const throat = (w: World) => w.boss as ThroatState;
const gorge = (w: World) => w.boss as GorgeState;
const SEATS = [1, 2] as const;

export const ROWS_F: readonly Row[] = [
  {
    kind: "curtain",
    marks: [mark(markFeedback, "drawMarkHalo", (w) => curtainHemAsks(curtain(w)))],
  },
  {
    kind: "taster",
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => {
        const t = taster(w);
        if (tasterPryable(t, w.beat, w.cfg)) return true;
        return t.blades.some((_, i) => tasterPinnable(t, w.cfg, i) || tasterWipable(t, w.cfg, i));
      }),
    ],
  },
  {
    kind: "sinew",
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => {
        const s = sinew(w);
        return s.outBeat < 0 && (!sinewHeld(s, 1) || !sinewHeld(s, 2));
      }),
    ],
  },
  {
    kind: "ledger",
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => {
        const t = ledger(w);
        const { cfg, beat } = w;
        return (
          ledgerFootable(t, cfg, beat) ||
          ledgerPlugs(t, cfg, beat) ||
          ledgerPullable(t, cfg, beat) !== null ||
          ledgerHaulable(t, cfg, beat)
        );
      }),
    ],
  },
  {
    kind: "scout",
    // AUTO carries one mote a trip on THE SCOUT, so the ship is never laden
    // there and neither hand is ever offered; THE HAUL carries the level.
    wave: "theHaul",
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => {
        const s = scout(w);
        return scoutLineAsks(w.cfg, s) || scoutPrimeAsks(w.cfg, s, w.tick);
      }),
    ],
  },
  {
    kind: "baton",
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) => {
        const b = baton(w);
        return SEATS.some((p) => batonDrawAsks(b, p) || batonStripAsks(b, p, w.beat));
      }),
    ],
  },
  {
    kind: "throat",
    marks: [mark(markFeedback, "drawMarkHalo", (w) => throat(w).phase === "sucks")],
  },
  {
    kind: "gorge",
    marks: [
      mark(markFeedback, "drawMarkHalo", (w) =>
        SEATS.some((seat) => gorgeAsks(gorge(w), w.cfg, seat).length > 0),
      ),
    ],
  },
];
