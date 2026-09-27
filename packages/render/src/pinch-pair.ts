import { type Hold, type Layout, pinchGapMilli, pinching, pinchSays } from "@neon-spore/render";
import type { Command, DragTarget } from "@neon-spore/sim";

/** A pinch's answer, and the seat it is from. */
export interface Pinched {
  player: 1 | 2;
  command: Command;
}

type PinchHold = Extract<Hold, { kind: "drag" }>;

interface Finger {
  id: number;
  x: number;
  y: number;
}

interface Pair {
  hold: PinchHold;
  fingers: Finger[];
  /** The gap last sent, so a finger moved a pixel that changes nothing is not a message. */
  sent: number | null;
}

/**
 * **Which two fingers are a pinch** — the pointers' half of `SqueezeGap`,
 * whose meaning is `render/pinch.ts`'s.
 *
 * A press on a pinch body takes hold and says nothing (`render/vise-grip.ts`).
 * The **second** finger down on the same body makes the pair, and from then
 * the gap between them is sent on every move that changes it; a third finger
 * on a pinched body is nobody's. Either finger lifting lets the body go —
 * *lifted, the lobe is back open* (`sim/vise-hand.ts`) — and the one left
 * down is a finger alone again, waiting for a partner. A finger alone never
 * sends, so a thumb resting on the case costs nothing.
 *
 * Bodies are told apart by target, one pair a target: on a phone each seat has
 * one pinch body, and the desk's both-seats screen signs a press with the seat
 * whose side it landed on, so the pilot's and the navigator's never share one.
 */
export class Pinches {
  private readonly pairs = new Map<DragTarget, Pair>();

  /** A finger down, with the holds its press took. */
  down(l: Layout, id: number, holds: readonly Hold[], x: number, y: number): Pinched | null {
    const hold = holds.find(pinching);
    if (!hold) return null;
    const pair = this.pairs.get(hold.target) ?? { hold, fingers: [], sent: null };
    this.pairs.set(hold.target, pair);
    if (pair.fingers.length >= 2) return null;
    pair.fingers.push({ id, x, y });
    return this.say(l, pair);
  }

  /** A finger moved. */
  move(l: Layout, id: number, x: number, y: number): Pinched | null {
    const pair = this.of(id);
    const finger = pair?.fingers.find((f) => f.id === id);
    if (!pair || !finger) return null;
    finger.x = x;
    finger.y = y;
    return this.say(l, pair);
  }

  /** A finger lifted, or lost. */
  up(id: number): Pinched | null {
    const pair = this.of(id);
    if (!pair) return null;
    pair.fingers = pair.fingers.filter((f) => f.id !== id);
    if (pair.fingers.length === 0) this.pairs.delete(pair.hold.target);
    if (pair.sent === null) return null;
    pair.sent = null;
    return { player: pair.hold.player, command: pinchSays(pair.hold, null) };
  }

  private of(id: number): Pair | undefined {
    for (const pair of this.pairs.values()) if (pair.fingers.some((f) => f.id === id)) return pair;
    return undefined;
  }

  private say(l: Layout, pair: Pair): Pinched | null {
    const [a, b] = pair.fingers;
    if (!a || !b) return null;
    const gap = pinchGapMilli(l, a, b);
    if (gap === pair.sent) return null;
    pair.sent = gap;
    return { player: pair.hold.player, command: pinchSays(pair.hold, gap) };
  }
}
