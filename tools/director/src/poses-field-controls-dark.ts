import { livingKindForColor, type TimedCommand, TO_THE_END } from "@neon-spore/sim";
import { fresh, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE DARK with a thumb dragged across it: three squares lit along one row,
 * and the one body they reach shown while the other stays in the black
 * (`sim/dark.ts`, `render/dark-field.ts`).
 *
 * Its own file for the reason every pose beside it gives — the group's file
 * is at its limit. The swipe is three `light` commands a few ticks apart, the
 * way `lightMove` sends one each time the finger crosses into a new square.
 */
export const DARK_LIGHT: Pose = {
  name: "DARK · A SWIPE OF LIGHT",
  note: "THE DARK is down: the field above the ship is black on both screens and no body shows. A thumb has been dragged across three squares of one row, and those squares are lit for two beats — the slick under them shows, the one two columns off does not. The light is on both screens. Player 2's screen.",
  lookAt:
    "whether the lit squares read as a light in the dark, and whether the hidden slick is really gone",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh(
      [
        { beat: 0, col: 1, kind: livingKindForColor("red"), color: "red" },
        { beat: 0, col: 5, kind: livingKindForColor("cyan"), color: "cyan" },
      ],
      [],
      null,
      {},
      0,
      [{ kind: "dark", at: 0, beats: TO_THE_END }],
    );
    run(w, TPB * 4);
    const body = w.creatures.find((c) => c.col === 1);
    if (!body) throw new Error("the slick in column 1 is not on the field");
    const cmds: TimedCommand[] = [0, 1, 2].map((col, i) => ({
      tick: w.tick + i * 3,
      player: 2,
      command: { kind: "light", col, row: body.row },
    }));
    run(w, 8, cmds);
    return w;
  },
};
