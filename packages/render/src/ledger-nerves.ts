import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import type { Point } from "./ledger-shape.js";

/**
 * **What the ship does under THE LEDGER's socket while a return comes down**,
 * as a record — and what it does today is nothing.
 *
 * The design asks for the hull to present every beat of this fight, and names
 * `ship-nerves.ts` *lit along the cord's line* among the ways
 * (bosses-choreographed.md §5, *Presentation*). The write-up argued against it:
 * the shock through the plating is already the hull's answer to a return, and
 * lit nerves would be a second picture of one hit (bosses.md §11.27). The
 * owner kept THE LEDGER on 8 October 2026 and asked for it offered in VERSUS
 * rather than argued, so this is the seam a candidate patches — called from
 * the navigator's pass (`ledger-root.ts`) after the grommet and before her
 * lock, behind the same gate: lit nerves under the socket on the pilot's
 * screen would read out the column the cord is faded out to keep from him.
 */
export interface LedgerNerveDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly l: Layout;
  /** The grommet, on the plating's real surface. */
  readonly at: Point;
  /** The plating above a screen x (`hull-frame.ts`). */
  readonly surfaceY: SurfaceY;
  /** 0..1, how far down the cord the soonest return has come; 0 with none on it. */
  readonly near: number;
  /** The wall clock in seconds. */
  readonly time: number;
}

export interface LedgerNerves {
  draw(d: LedgerNerveDraw): void;
}

/** The shipped answer: the shock through the plating says it, and nothing here does. */
export const LEDGER_NERVES: LedgerNerves = { draw: () => {} };
