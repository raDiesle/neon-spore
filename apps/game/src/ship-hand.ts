import { type Hold, type Layout, type ShipHand, shipHand } from "@neon-spore/render";

/**
 * What this device's own hand is doing on the ship, held between the pointer
 * events that move it and the frame that draws it.
 *
 * One value, owned here rather than by the renderer, because it is the state
 * of a *pointer* and `packages/render` is handed one finished picture at a
 * time. `ShipHand` itself and the rule that fills it are the control scheme's
 * (`render/touch-ship.ts`), so what the ring says can never disagree with what
 * the same press would do.
 *
 * Every setter goes through `shipHand`, which answers null for the two strips
 * and for every hold that is not the ship's — that is where the owner's line
 * between the screen controls and the band is actually drawn, and it is drawn
 * once.
 */
export class ShipHandWatch {
  private hand: ShipHand | null = null;

  /** What the frame should draw, or nothing. */
  get current(): ShipHand | undefined {
    return this.hand ?? undefined;
  }

  /** A finger is down on this hold, and has got as far as `x`. */
  down(l: Layout, hold: Hold, x: number): void {
    this.hand = shipHand(l, hold, x, true);
  }

  /**
   * A mouse over the ship with nothing held — the desktop's half of "knows
   * which element is active before swiping", which a phone answers with the
   * press itself because it has no hover to answer it with.
   */
  over(l: Layout, hold: Hold | null, x: number): void {
    this.hand = hold === null ? null : shipHand(l, hold, x, false);
  }

  clear(): void {
    this.hand = null;
  }
}
