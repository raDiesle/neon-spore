import { Chords } from "./chord-pads.js";
import type { Layout } from "./layout.js";
import { type Pinched, Pinches } from "./pinch-pair.js";
import { Rubs } from "./rub-turns.js";
import type { Hold } from "./touch-hold.js";

/**
 * **The gestures one sample cannot answer**, kept together: two fingers on
 * one pinch body (`pinch.ts`), a chord's fingers each counted as a pad
 * (`chord.ts`), and a rubbing thumb's turns (`rub.ts`). Every pointer event
 * is offered to all three and each answers only the holds flagged its own, so
 * the page that owns the pointers has one call a phase rather than three.
 */
export class Fingers {
  private readonly pinches = new Pinches();
  private readonly chords = new Chords();
  private readonly rubs = new Rubs();

  /** A finger down, with the holds its press took. */
  down(l: Layout, id: number, holds: readonly Hold[], x: number, y: number): Pinched[] {
    return said(
      this.pinches.down(l, id, holds, x, y),
      this.chords.down(id, holds),
      this.rubs.down(id, holds, x, y),
    );
  }

  /** A finger moved, one sample at a time. */
  move(l: Layout, id: number, x: number, y: number): Pinched[] {
    return said(this.pinches.move(l, id, x, y), this.rubs.move(l, id, x, y));
  }

  /** A finger lifted, or lost. */
  up(id: number): Pinched[] {
    return said(this.pinches.up(id), this.chords.up(id), this.rubs.up(id));
  }
}

function said(...answers: (Pinched | null)[]): Pinched[] {
  return answers.filter((a): a is Pinched => a !== null);
}
