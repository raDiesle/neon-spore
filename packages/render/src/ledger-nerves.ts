import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { paintLitNerves } from "./ledger-nerves-lit.js";
import type { Point } from "./ledger-shape.js";

/**
 * **What the ship does under THE LEDGER's socket**, as a record.
 *
 * The design asks for the hull to present every beat of this fight, and names
 * `ship-nerves.ts` *lit along the cord's line* among the ways
 * (bosses-choreographed.md §5, *Presentation*). It was offered in VERSUS on
 * 8 October 2026 and taken on the 9th, with the owner's own reading of it:
 * the nerve lights from her shield up to the boss when the shield is roughly
 * under the socket (`ledger-nerves-lit.ts`). Called from the navigator's pass
 * (`ledger-root.ts`) after the grommet and before her lock, behind the same
 * gate: lit nerves under the socket on the pilot's screen would read out the
 * column the cord is faded out to keep from him.
 */
export interface LedgerNerveDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly l: Layout;
  /** The grommet, on the plating's real surface. */
  readonly at: Point;
  /** The plating above a screen x (`hull-frame.ts`). */
  readonly surfaceY: SurfaceY;
  /** The cord's two ends as the cord is drawn — the body's underside and the
   * hull line — and how taut it hangs (`ledger-cord-shape.ts`). */
  readonly root: Point;
  readonly socket: Point;
  readonly taut: number;
  /** Her shield block, on its strip. */
  readonly shield: Point;
  /** Columns between her shield and the socket. */
  readonly off: number;
  /** The wall clock in seconds. */
  readonly time: number;
}

export interface LedgerNerves {
  draw(d: LedgerNerveDraw): void;
}

export const LEDGER_NERVES: LedgerNerves = { draw: paintLitNerves };
