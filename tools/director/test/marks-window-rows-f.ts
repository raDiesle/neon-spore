import {
  type CurtainState,
  curtainHemAsks,
  type LedgerState,
  ledgerFootable,
  ledgerHaulable,
  ledgerPlugs,
  ledgerPullable,
  type SinewState,
  sinewHeld,
  type TasterState,
  tasterPinnable,
  tasterPryable,
  tasterWipable,
  type World,
} from "@neon-spore/sim";
import * as markFeedback from "../../../packages/render/src/mark-feedback.js";
import { mark, type Row } from "./marks-window-kit.js";

/**
 * **More of the rows owed when `NO_ROW` was written**, in a file of their own
 * beside `-e`'s, each the shared halo
 * held to the union of the boss's windows in the simulation.
 *
 * THE CURTAIN's hem while it asks; THE TASTER's lock while it may be pried and
 * each blade and gap while it may be pinned or wiped; THE SINEW's handles
 * whenever one is free and the tendon is not out — the simulation hears a
 * grip at any beat before then, so the halo's narrower gate (`sinew-word.ts`)
 * is inside it; THE LEDGER's root while it may be footed or plugged, and the
 * pilot's bead or haul while either is offered.
 */

const curtain = (w: World) => w.boss as CurtainState;
const taster = (w: World) => w.boss as TasterState;
const sinew = (w: World) => w.boss as SinewState;
const ledger = (w: World) => w.boss as LedgerState;

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
];
