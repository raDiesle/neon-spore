import { blisterIsUp, NO_BEARING, type TimedCommand } from "@neon-spore/sim";
import { fresh, type Pose, run, until } from "./pose-kit.js";

/**
 * THE BLISTER's SWIPE with a thumb half way through its stroke: the body up
 * out of its pore, the track laid across it pointing up, and the bar filled
 * to the half the thumb has carried (`sim/blister-swipe.ts`,
 * `render/blister-help.ts`).
 *
 * Its own file for the reason every pose beside it gives — the group's file
 * is near its limit. The stroke is a press and one move, the way
 * `touchMove` sends a `blisterSwipe` drag while the finger travels.
 */
export const BLISTER_SWIPE: Pose = {
  name: "BLISTER · A STROKE HALF CARRIED",
  note: "A SWIPE blister is up out of its pore for its two beats, pointing up. Player 2 has pressed on it and carried the thumb half the way a stroke needs: the bar across it is half full. Lifted now it would count nothing; carried on and lifted, one of its three blows. Player 2's screen, the seat its BY names.",
  lookAt: "whether the bar reads as which way to go, and whether half full reads as not yet",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh([
      {
        beat: 0,
        col: 4,
        kind: "blister",
        color: null,
        row: 3,
        count: 3,
        gesture: "swipe",
        way: "up",
      },
    ]);
    until(w, "a blister up", (x) => x.creatures.some(blisterIsUp));
    const body = w.creatures.find(blisterIsUp);
    if (!body) throw new Error("no blister up");
    const half = Math.round(w.cfg.blisterSwipeMilli / 2);
    const stroke = (tick: number, reach: number): TimedCommand => ({
      tick,
      player: 2,
      command: {
        kind: "drag",
        target: "blisterSwipe",
        id: body.id,
        on: true,
        fromMilli: 0,
        fromYMilli: -reach,
      },
    });
    run(w, 3, [stroke(w.tick, 0), stroke(w.tick + 1, half)]);
    return w;
  },
};

/**
 * THE BLISTER's TURN with a thumb half way round: the body up, THE MAZE's
 * channel round it filled green from the top to the bottom, and the knob on
 * its lever at the bottom (`sim/blister-turn.ts`, `render/blister-turn-help.ts`).
 * The turn is a press and four bearings an eighth apart, the way `turnAbout`
 * sends them while the thumb goes round.
 */
export const BLISTER_TURN: Pose = {
  name: "BLISTER · A TURN HALF ROUND",
  note: "A TURN blister is up out of its pore for its two beats. Player 2 has pressed on it and taken the thumb half way round clockwise: the channel round it is green from the top to the bottom, and the knob stands at the bottom on its lever. Another half and it is one of its three blows. Player 2's screen, the seat its BY names.",
  lookAt: "whether the knob and channel read as go round, and whether half green reads as not yet",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh([
      { beat: 0, col: 4, kind: "blister", color: null, row: 3, count: 3, gesture: "turn" },
    ]);
    until(w, "a blister up", (x) => x.creatures.some(blisterIsUp));
    const body = w.creatures.find(blisterIsUp);
    if (!body) throw new Error("no blister up");
    const bearing = (tick: number, at: number): TimedCommand => ({
      tick,
      player: 2,
      command: { kind: "drag", target: "blisterTurn", id: body.id, on: true, fromMilli: at },
    });
    const round = [0, 125, 250, 375, 500].map((at, i) => bearing(w.tick + 1 + i, at));
    run(w, 7, [bearing(w.tick, NO_BEARING), ...round]);
    return w;
  },
};

/**
 * THE BLISTER's RUB with a thumb on it that has turned back once: the body
 * up, the rub's line and arrows on it, and one of its three pips gone
 * (`sim/blister-rub.ts`, `render/blister-help.ts`). The rub is the press's
 * nought and one reversal, as `rub-turns.ts` sends them.
 */
export const BLISTER_RUB: Pose = {
  name: "BLISTER · RUBBED ONCE",
  note: "A RUB blister is up out of its pore for its two beats. Player 2 is scrubbing it and has turned back once: one of its three pips is gone, and the red line with its two arrows sliding in still asks for more. Player 2's screen, the seat its BY names.",
  lookAt: "whether the line and arrows read as scrub here, and whether the pips say what is left",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh([
      { beat: 0, col: 4, kind: "blister", color: null, row: 3, count: 3, gesture: "rub" },
    ]);
    until(w, "a blister up", (x) => x.creatures.some(blisterIsUp));
    const body = w.creatures.find(blisterIsUp);
    if (!body) throw new Error("no blister up");
    const rubbed = (tick: number, turns: number): TimedCommand => ({
      tick,
      player: 2,
      command: { kind: "drag", target: "blisterRub", on: true, fromMilli: body.id, id: turns },
    });
    run(w, 3, [rubbed(w.tick, 0), rubbed(w.tick + 1, 1)]);
    return w;
  },
};
