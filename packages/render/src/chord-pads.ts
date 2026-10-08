import { chordFinger, chordSays } from "./chord.js";
import type { Pinched } from "./pinch-pair.js";
import type { Hold } from "./touch-hold.js";

type ChordHold = Extract<Hold, { kind: "drag" }>;

interface Body {
  hold: ChordHold;
  /** Each finger on the body and the pads it was counted as: one, or every pad (`Hold.pads`). */
  pads: Map<number, number[]>;
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
 * Bodies are told apart by target and seat. By target is `pinch.ts`' rule: on
 * a phone each seat has one foot, and the desk's both-seats screen signs a
 * press with the seat whose side it landed on. By seat as well since THE
 * HALTER (taken out on 8 October 2026), whose two grips were both seats': at
 * the desk the pilot's thumb and the navigator's on one grip are two bodies.
 *
 * **A desk's mouse is every pad at once.** Its press carries a hold for each
 * body of the chord, each flagged with its count of pads (`desk-chord.ts`),
 * and each says every pad no finger is on down, and up again on the lift.
 */
export class Chords {
  private readonly bodies = new Map<string, Body>();

  /** A finger down, with the holds its press took. */
  down(id: number, holds: readonly Hold[]): Pinched[] {
    const said: Pinched[] = [];
    for (const hold of holds) {
      if (!chordFinger(hold)) continue;
      const key = `${hold.player}:${hold.target}`;
      const body = this.bodies.get(key) ?? { hold, pads: new Map() };
      this.bodies.set(key, body);
      const taken = new Set([...body.pads.values()].flat());
      const free = (from: number): number => {
        let pad = from;
        while (taken.has(pad)) pad++;
        return pad;
      };
      const mine =
        hold.pads === undefined
          ? [free(0)]
          : Array.from({ length: hold.pads }, (_, pad) => pad).filter((pad) => !taken.has(pad));
      body.pads.set(id, mine);
      for (const pad of mine)
        said.push({ player: body.hold.player, command: chordSays(body.hold, pad, true) });
    }
    return said;
  }

  /** A finger lifted, or lost. */
  up(id: number): Pinched[] {
    const said: Pinched[] = [];
    for (const [key, body] of this.bodies) {
      const pads = body.pads.get(id);
      if (pads === undefined) continue;
      body.pads.delete(id);
      if (body.pads.size === 0) this.bodies.delete(key);
      for (const pad of pads)
        said.push({ player: body.hold.player, command: chordSays(body.hold, pad, false) });
    }
    return said;
  }
}
