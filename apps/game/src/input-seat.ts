import { pressSeat } from "@neon-spore/render";
import type { Command } from "@neon-spore/sim";
import type { Bindings } from "./input-bindings.js";
import type { InputBuffer } from "./input-buffer.js";

/** What a press, a move, a lift or a rub hands back: a seat and maybe a word. */
interface Said {
  player: 1 | 2;
  command: Command | null;
}

/**
 * **Who a press is from**, and the buffer it is said into. Cut out of
 * `input.ts` at its length limit: the pointer handlers decide *what* a finger
 * did, and this decides *whose* it was.
 *
 * `touch.ts` signs a press on the band with the half it landed on, and THE
 * HANDOVER trades which half this screen draws — so while the panels are away
 * a band press is re-signed as this device's, and a lockstep never sees one
 * attributed to the peer (`Bindings.handed`). A hand on the *field* keeps the
 * seat it was found for (`render/desk-grab.ts` `pressSeat`), which is why the
 * height each finger first landed at is kept until it lifts.
 */
export class PressSeats {
  /** Where each finger still down first landed. */
  private readonly pressY = new Map<number, number>();

  constructor(
    private readonly bindings: Pick<Bindings, "layout" | "handed" | "player">,
    private readonly buffer: InputBuffer,
  ) {}

  /** A finger landed at height `y`. */
  press(id: number, y: number): void {
    this.pressY.set(id, y);
  }

  /** The finger is gone, or its press took hold of nothing. */
  lift(id: number): void {
    this.pressY.delete(id);
  }

  /** The seat `t` speaks for, given where finger `id` first landed. */
  from(t: { player: 1 | 2 }, id: number): 1 | 2 {
    const { layout, handed, player } = this.bindings;
    return pressSeat(layout(), this.pressY.get(id) ?? 0, t, handed(), player());
  }

  /** Each of `said` that has a word, pushed under the seat it is from. */
  say(said: readonly (Said | null | undefined)[], id: number): void {
    for (const s of said) if (s?.command) this.buffer.push(this.from(s, id), s.command);
  }
}
