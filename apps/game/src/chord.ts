import { chordFinger, chordSays, type Hold } from "@neon-spore/render";
import type { DragTarget } from "@neon-spore/sim";
import type { Pinched } from "./pinch.js";

type ChordHold = Extract<Hold, { kind: "drag" }>;

interface Body {
  hold: ChordHold;
  /** Each finger on the body and the pad it was counted as. */
  pads: Map<number, number>;
}

/**
 * **Which pad each finger is** — the pointers' half of `ChordHold`, whose
 * meaning is `render/chord.ts`'s.
 *
 * A press on a chord body takes hold and says nothing (`render/trivet-grip.ts`).
 * Here it is counted: the **lowest pad no finger is on** is the one it takes,
 * and its press says that pad down; its lift says the same pad up. So a
 * first finger is pad nought, a second pad one, and a finger lifted and put
 * back takes the gap it left — which is the chord broken and made again,
 * exactly what the simulation starts its count from nought for
 * (`sim/trivet-hand.ts`). A finger past the last pad is sent all the same and
 * the simulation does not hear it.
 *
 * Bodies are told apart by target, `pinch.ts`' rule: on a phone each seat has
 * one foot, and the desk's both-seats screen signs a press with the seat whose
 * side it landed on, so the pilot's and the navigator's never share one.
 */
export class Chords {
  private readonly bodies = new Map<DragTarget, Body>();

  /** A finger down, with the holds its press took. */
  down(id: number, holds: readonly Hold[]): Pinched | null {
    const hold = holds.find(chordFinger);
    if (!hold) return null;
    const body = this.bodies.get(hold.target) ?? { hold, pads: new Map() };
    this.bodies.set(hold.target, body);
    const taken = new Set(body.pads.values());
    let pad = 0;
    while (taken.has(pad)) pad++;
    body.pads.set(id, pad);
    return { player: body.hold.player, command: chordSays(body.hold, pad, true) };
  }

  /** A finger lifted, or lost. */
  up(id: number): Pinched | null {
    for (const [target, body] of this.bodies) {
      const pad = body.pads.get(id);
      if (pad === undefined) continue;
      body.pads.delete(id);
      if (body.pads.size === 0) this.bodies.delete(target);
      return { player: body.hold.player, command: chordSays(body.hold, pad, false) };
    }
    return null;
  }
}
