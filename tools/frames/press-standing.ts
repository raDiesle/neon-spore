import { buildQueue } from "@neon-spore/content";
import {
  type CreatureKind,
  fallTilesPerBeat,
  hullRow,
  type SimConfig,
  ticksPerBeat,
} from "@neon-spore/sim";
import type { PressSpec } from "./spec.js";

/**
 * **What the wave actually sends into the column a `--press` names, said
 * before the capture runs.**
 *
 * `press-column.ts` next door answers the first half of the same question —
 * *which* column the number points at, authored or field — and this is the
 * second: whether anything is standing there when the press lands. The ledger
 * in `docs/time-log.md` has eleven lanes and 95 friction minutes of
 * photographing the wrong thing, and the recorded case is both halves at once:
 * the cannon went under a column the gum was not in, and three sheets showed a
 * bolt sailing past a body it was never aimed at.
 *
 * **It says and never does.** A press that would photograph an empty lane is a
 * legitimate thing to want — an empty lane is a picture — so this prints a
 * line and the capture runs exactly as asked. Reaching into the world to move
 * the press onto a body would be a picture of something nobody asked for,
 * which is the failure one level worse than the one it fixes.
 *
 * **It is about what the wave sends, not about what is there.** Five kinds do
 * not hold their lane — the dart, the veer, the crawler, the ghost on a
 * crossing path, the balloon — so a body authored into one column can be
 * standing in another by the time the press lands, and a line claiming a
 * column is *empty* would be a tool lying with more confidence than the
 * ledger's original mistake. So the sentence is always about the queue: this
 * wave sends nothing here, or it sends these and they arrive then.
 *
 * **The fall is asked for and never worked out here.** `fallTilesPerBeat` is
 * the sim's own answer and the five rock tiers, the torch, the wisp, the mine
 * and the Warden's line all differ; a copy of any of that in a tool is the
 * thing `purity.test.ts`'s `COPIES` table exists to stop. A kind that does not
 * fall at all has no last beat, and this says so rather than inventing one.
 */

/** One thing the wave puts in the column, and how long it can still be falling. */
export interface Arrival {
  kind: CreatureKind;
  /** The beat it is put on the field. */
  beat: number;
  /** The last beat it can still be above the hull, or `null` for a kind that
   * does not fall — a wisp, a mine, the Warden's line, either half of a gyre. */
  last: number | null;
}

/** Everything this wave sends into one field column, in arrival order. */
export function arrivalsIn(wave: number, col: number, cfg: SimConfig): Arrival[] {
  const rows = hullRow(cfg);
  return buildQueue(wave, cfg.cols)
    .filter((e) => e.col === col)
    .map((e) => {
      const perBeat = fallTilesPerBeat(e.kind);
      return {
        kind: e.kind,
        beat: e.beat,
        last: perBeat > 0 ? e.beat + Math.ceil(rows / perBeat) : null,
      };
    });
}

/** The beat a tick falls on. A press carries a tick; a wave is written in beats. */
export function beatOfTick(tick: number, cfg: SimConfig): number {
  return Math.floor(tick / ticksPerBeat(cfg));
}

/** Whether an arrival could still be above the hull on this beat. */
function standing(a: Arrival, beat: number): boolean {
  return beat >= a.beat && (a.last === null || beat <= a.last);
}

/** `slick arriving on beat 4, to beat 18` — or `, and it stays` for a kind
 * whose fall is zero and whose leaving is not the queue's to say. */
function said(a: Arrival): string {
  return a.last === null
    ? `${a.kind} arriving on beat ${a.beat}, and it does not fall`
    : `${a.kind} arriving on beat ${a.beat}, above the hull to beat ${a.last}`;
}

/**
 * One line about one press, or `null` when the wave puts something in that
 * column on that beat and there is nothing to say.
 *
 * Silence is the common answer and has to stay cheap to read: a line printed
 * on every capture is a line a reader learns to skip, and the one that matters
 * would go with it.
 */
export function standingNote(
  kind: string,
  col: number,
  tick: number,
  wave: number,
  cfg: SimConfig,
): string | null {
  const beat = beatOfTick(tick, cfg);
  const all = arrivalsIn(wave, col, cfg);
  if (all.length === 0) {
    return `${kind}=${col} — this wave sends nothing into field column ${col}.`;
  }
  if (all.some((a) => standing(a, beat))) return null;
  const near = all.slice(0, 3).map(said).join("; ");
  const more = all.length > 3 ? `, and ${all.length - 3} more` : "";
  return `${kind}=${col} — this press lands on beat ${beat} (tick ${tick}), and nothing this wave sends into field column ${col} is above the hull then: ${near}${more}.`;
}

/** The two controls whose value is a column of the field. The same pair
 * `press-column.ts` keeps, and deliberately its own: a control that gained a
 * column note would want this one too, and a shared set would make that a
 * silent decision instead of a second line in a diff. */
const COLUMN_PRESSES = new Set(["cannonCol", "shieldCol"]);

/** Every line a run of presses is owed, in the order they were written. */
export function standingNotes(
  presses: readonly PressSpec[],
  wave: number,
  cfg: SimConfig,
): string[] {
  const out: string[] = [];
  for (const press of presses) {
    const { kind, col } = press.command;
    if (!COLUMN_PRESSES.has(kind) || typeof col !== "number") continue;
    const line = standingNote(kind, col, press.tick, wave, cfg);
    if (line !== null) out.push(line);
  }
  return out;
}
