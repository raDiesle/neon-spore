import type { Layout } from "./layout.js";
import { type Pinched, Pinches } from "./pinch-pair.js";
import { Rubs } from "./rub-turns.js";
import type { Thumb } from "./thumb-aura.js";
import type { Hold } from "./touch-hold.js";

/**
 * **The gestures one sample cannot answer**, kept together: two fingers on
 * one pinch body (`pinch.ts`) and a rubbing thumb's turns (`rub.ts`). Every
 * pointer event is offered to both and each answers only the holds flagged its
 * own, so the page that owns the pointers has one call a phase rather than two.
 *
 * And where every finger on a boss's mark is, for the glow drawn round it
 * (`thumb-aura.ts`) — it says nothing to the ship, but it is the same
 * pointers in the same three phases.
 */
export class Fingers {
  private readonly pinches = new Pinches();
  private readonly rubs = new Rubs();
  private readonly onMarks = new Map<number, Thumb>();

  /** Every finger down on a boss's mark, where it is now. */
  get thumbs(): readonly Thumb[] {
    return [...this.onMarks.values()];
  }

  /** A finger down, with the holds its press took, and whether it landed on
   * a boss's mark (`auraTouch`). */
  down(
    l: Layout,
    id: number,
    holds: readonly Hold[],
    x: number,
    y: number,
    onMark = false,
  ): Pinched[] {
    if (onMark) this.onMarks.set(id, { id, x, y });
    return [
      ...said(this.pinches.down(l, id, holds, x, y)),
      ...said(this.rubs.down(id, holds, x, y)),
    ];
  }

  /** A finger moved, one sample at a time. */
  move(l: Layout, id: number, x: number, y: number): Pinched[] {
    if (this.onMarks.has(id)) this.onMarks.set(id, { id, x, y });
    return said(this.pinches.move(l, id, x, y), this.rubs.move(l, id, x, y));
  }

  /** Every ring a finger wears, gone — the window lost under a held mouse. */
  lift(): void {
    this.onMarks.clear();
  }

  /** A finger lifted, or lost. */
  up(id: number): Pinched[] {
    this.onMarks.delete(id);
    return said(this.pinches.up(id), this.rubs.up(id));
  }
}

function said(...answers: (Pinched | null)[]): Pinched[] {
  return answers.filter((a): a is Pinched => a !== null);
}
