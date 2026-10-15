import { blisterIsUp, NO_GRIP } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";
import { blisterUp, sent, sinceUp } from "./poses-versus-blister.js";

/**
 * THE BLISTER's HOLD played through by a hand of its own: up out of its pore
 * untouched, a thumb put on it and kept there a beat — one blow, the drop
 * filling as it goes — and lifted a little after. It is what `blister:hold`
 * on VERSUS is judged on: a body that holds the HOLD LAB's drop in it, and
 * changes under a thumb, so the held and the let-go both have to be on the
 * page. On the COMPARED LOOKS sheet (`poses-versus-bodies.ts`), cropped to
 * the blister's tiles.
 */
export const BLISTER_HOLD_PLAYED: Pose = {
  name: "BLISTER · HOLD HELD A BEAT AND LET GO",
  note: "A HOLD blister is up out of its pore for its two beats, three blows owed. Player 2 puts a thumb on it and keeps it there a beat — the drop fills, and one blow lands — then lifts. Player 2's screen, the seat its BY names.",
  lookAt: "whether the body holds the drop, and says when a thumb is on it",
  crop: "tile",
  role: "p2",
  span: 3,
  cadenceSeconds: 1.25,
  at: (w) => {
    const c = w.creatures.find(blisterIsUp);
    return c ? { col: c.col, row: c.row } : { col: 4, row: 3 };
  },
  build: () => blisterUp("hold"),
  hand: (w) => {
    const c = w.creatures.find(blisterIsUp);
    if (!c) return [];
    const t = sinceUp(w, "hold");
    if (t === GRIP) return sent(w, { kind: "grip", id: c.id });
    if (t === LET_GO) return sent(w, { kind: "grip", id: NO_GRIP });
    return [];
  },
};

/** Ticks from the blister coming up: the thumb put on, and lifted a little after its beat. */
const GRIP = 30;
const LET_GO = 112;
