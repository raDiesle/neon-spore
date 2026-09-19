import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE THROAT's seven, in a file of their own for `bind-vane.ts`' reason —
 * `bind.ts` is full — and every one of them panned to the column the mouth is
 * standing in, because the tube is a fixture and its column is the one thing
 * in the fight the pair says out loud.
 *
 * The cinch is the gullet held shut: a soft close with the breath stopping in
 * it, because what it buys is silence from a thing that was about to swallow.
 * The slip is that gone — the same close let go, with the draw coming back, so
 * a thumb lifted and a ring torn out are one loss whichever it was
 * (`sim/throat-hand.ts`). The haul is the tube dragged sideways: wet weight
 * moving, and the pilot's cue that the column she just named is no longer the
 * one under the mouth.
 *
 * The other four are the gullet's own clock, and they are what the pair is
 * counting: the inhale is the beat player 2 has been saying out loud, the
 * choke is that arithmetic paid off, the swallow is the boss healing off the
 * pair's habit of clearing the field, and the eversion is the ending.
 */
export function throatCue(e: Extract<SimEvent, { type: `throat${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "throatCinch":
      return { id: "boss.throatCinch", pan };
    case "throatSlip":
      return { id: "boss.throatSlip", pan };
    case "throatHaul":
      return { id: "boss.throatHaul", pan };
    case "throatInhale":
      return { id: "boss.throatInhale", pan };
    case "throatChoke":
      return { id: "boss.throatChoke", pan };
    case "throatSwallow":
      return { id: "boss.throatSwallow", pan };
    case "throatEvert":
      return { id: "boss.throatEvert", pan };
  }
}
