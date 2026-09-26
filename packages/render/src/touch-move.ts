import { lightMove } from "./dark-tap.js";
import { gimbalRingTurn } from "./gimbal-grip.js";
import { colFromX, type Layout } from "./layout.js";
import { crankTurn, dragging, rimFrom, turnAbout } from "./touch-drag.js";
import type { Hold, Touch } from "./touch-hold.js";
import { wellCol, wellColsFrom } from "./touch-well.js";

/**
 * The same finger, moved, and the two kinds of answer it can have.
 *
 * The strips are **absolute**: the finger's x is a column and where the press
 * began does not matter. A drag is a **displacement**, and this is the last
 * place a pixel is legal, so it becomes thousandths of a tile before it goes
 * anywhere — the tile being the only length two phones share. A crank is the
 * exception that proves both halves: it is absolute like a strip and it is
 * measured in thousandths of a *turn* (`touch-drag.ts`).
 *
 * **A grip answers now**, as a displacement like any other drag: carried
 * sideways it steps the body a column (`sim/grip-push.ts`), and what it sends
 * is a `drag` at `gripBody`, so the wire learned no new shape of message.
 *
 * **There is a `y` now.** A pull was one number across for as long as the only
 * handle in the game hung under a rim and was swung *aside*; the owner asked
 * for the whole circle, so a drag reports both axes and the strips — which are
 * still a column and nothing else — go on ignoring the second.
 *
 * Moved out of `touch.ts` on 26 September 2026, when THE DARK's light took
 * that file to 249 lines: a press and a lift stay there, and this is the
 * answer to every kind of hold a finger can carry, one branch each.
 */
export function touchMove(l: Layout, hold: Hold, x: number, y: number): Touch | null {
  if (hold.kind === "light") return lightMove(l, hold, x, y);
  // A hand taken on THE WELL's ring reads the hour under the finger, and in
  // the seam it reads nothing: the cannon stays where it is, because the seam
  // is the wall between the two ends of the rail (`touch-well.ts`).
  if (hold.kind === "cannon") {
    const col = hold.well ? wellCol(l, x, y) : colFromX(l, x);
    return col === null ? null : { player: 1, command: { kind: "cannonCol", col }, hold };
  }
  if (hold.kind === "shield") {
    const col = hold.well ? wellCol(l, x, y) : colFromX(l, x);
    return col === null ? null : { player: 2, command: { kind: "shieldCol", col }, hold };
  }
  if (hold.kind === "grip") {
    // Across only: how fast the body comes down is the grip's *hold*, not a
    // distance (`sim/grip.ts`). On the well "across" is round the ring, a
    // column per sector from the hour the hand took hold at.
    const fromMilli = hold.well
      ? wellColsFrom(l, hold.well.angle, x, y)
      : Math.round(((x - hold.originX) * 1000) / l.tile);
    const drag = { kind: "drag", target: "gripBody", on: true, fromMilli, id: hold.id } as const;
    return { player: hold.player, command: drag, hold };
  }
  if (hold.kind === "drag") {
    // **A pinch's finger says nothing alone**: the gap is the pair's (`pinch.ts`).
    if (hold.pinch) return null;
    // **The crank is not carried anywhere, it is turned**, and what a turn
    // reports is an angle rather than a distance (`touch-drag.ts`).
    if (hold.target === "crank") return crankTurn(hold, x, y);
    // **And THE GIMBAL's two rims**, turned about the drum. Their own
    // function rather than the crank's: the circle is centred on the boss,
    // and it is the one gesture in the game that is mirrored for a turned
    // seat — the fold is undone before the bearing goes out, because a finger
    // chasing a mark round a circle is following a body rather than pointing
    // at a column (`gimbal-grip.ts`).
    if (hold.target === "gimbalOuter" || hold.target === "gimbalInner") {
      return gimbalRingTurn(l, hold, x, y);
    }
    // **And THE INSTAR's `turn` mark**, a crank drawn on the body: the press
    // flagged the hold, so the reading is the crank's about the mark's centre.
    if (hold.turns) return turnAbout(hold, x, y);
    // **And THE WELL's seam and THE MAZE's lever**, carried round a circle: the
    // press wrote down the angle it grabbed at, and a move reports how far
    // round the thumb has come — in sectors of the clock face on the well
    // (`touch-well.ts`), in tiles along the drum's rim on the maze
    // (`rimFrom`). A displacement across the screen is not a distance on one.
    const round = hold.well
      ? wellColsFrom(l, hold.well.angle, x, y)
      : hold.rim && rimFrom(hold.rim, l.tile, x, y);
    if (round !== undefined) {
      return { player: hold.player, command: dragging(hold, round, 0, true), hold };
    }
    // Both axes now: the owner asked for a handle to be carriable any way at
    // all, so what a move reports is a displacement rather than a distance
    // across. Where it is allowed to end up is the simulation's
    // (`sim/handle-pull.ts`) — this only says where the finger went.
    return {
      player: hold.player,
      command: dragging(
        hold,
        Math.round(((x - hold.originX) * 1000) / l.tile),
        Math.round(((y - hold.originY) * 1000) / l.tile),
        true,
      ),
      hold,
    };
  }
  return null;
}
