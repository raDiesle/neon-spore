import type { Layout } from "./layout.js";
import { type Rubbed, Rubs } from "./rub-turns.js";
import type { Thumb } from "./thumb-aura.js";
import type { Hold } from "./touch-hold.js";

/**
 * **The gesture one sample cannot answer**: a rubbing thumb's turns
 * (`rub.ts`). Every pointer event is offered to it and it answers only the
 * holds flagged its own. THE VISE's two-finger pinch was kept here beside it
 * until the owner ruled out two fingers of one player on 8 October 2026; its
 * lobes are carried shut by one thumb now (`vise-grip.ts`).
 *
 * And where every finger on a boss's mark is, for the glow drawn round it
 * (`thumb-aura.ts`) — it says nothing to the ship, but it is the same
 * pointers in the same three phases.
 */
export class Fingers {
  private readonly rubs = new Rubs();
  private readonly onMarks = new Map<number, Thumb>();

  /** Every finger down on a boss's mark, where it is now. */
  get thumbs(): readonly Thumb[] {
    return [...this.onMarks.values()];
  }

  /** A finger down, with the holds its press took, and whether it landed on
   * a boss's mark (`auraTouch`). */
  down(
    _l: Layout,
    id: number,
    holds: readonly Hold[],
    x: number,
    y: number,
    onMark = false,
  ): Rubbed[] {
    if (onMark) this.onMarks.set(id, { id, x, y });
    return said(this.rubs.down(id, holds, x, y));
  }

  /** A finger moved, one sample at a time. */
  move(l: Layout, id: number, x: number, y: number): Rubbed[] {
    if (this.onMarks.has(id)) this.onMarks.set(id, { id, x, y });
    return said(this.rubs.move(l, id, x, y));
  }

  /** Every ring a finger wears, gone — the window lost under a held mouse. */
  lift(): void {
    this.onMarks.clear();
  }

  /** A finger lifted, or lost. */
  up(id: number): Rubbed[] {
    this.onMarks.delete(id);
    return said(this.rubs.up(id));
  }
}

function said(answer: Rubbed | null): Rubbed[] {
  return answer === null ? [] : [answer];
}
