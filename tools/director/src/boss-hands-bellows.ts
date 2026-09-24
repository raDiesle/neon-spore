import {
  type BellowsState,
  bellowsBoss,
  bellowsHeld,
  bellowsLeaking,
  bellowsTurn,
  isMeteorKind,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE BELLOWS played right**, for the STATES sheet: one seat's stroke at a
 * time, in the seat whose beat it is, and both hands off together at the end.
 *
 * The hand is short because the boss is, and what it has to get right is the
 * one thing the pair does: **a stroke is an edge**, so a handle is worked by
 * pressing it straight down from a hand that is off it — `fromYMilli` at the
 * full reach with `handMilli` still `NO_HAND` crosses `bellowsWorkMilli` in
 * one tick and counts once (`sim/bellows-hand.ts`). Holding it there again
 * the next tick is nothing at all, which is why the hand lets go in every
 * phase that is not somebody's beat: the exchange after a jam or a seam has
 * to start from two hands off two handles.
 *
 * **The finale is the only place the order inside a tick matters.** Both
 * seats let go in the same batch, so the second release reads the first's
 * `liftTick` off the same tick and the lift is mutual by nought beats
 * (`releaseBellows`). A hand that released them on two ticks would still be
 * inside `bellowsWindowBeats` and would still split the waist — but it would
 * be posing the near miss rather than the gesture.
 *
 * Both hazards are answered on the way past so the wave holds long enough to
 * reach the last seam: the leaking spark is shot in either colour, and the
 * breath down the cannon's column is met with the shield, which is player 2's
 * (`docs/spec/bosses.md` §11.35 argues that departure from the design).
 */
type Press = Omit<TimedCommand, "tick">;

const drag = (player: 1 | 2, on: boolean, fromYMilli: number): Press => ({
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "bellowsPull" : "bellowsPush",
    on,
    fromMilli: 0,
    fromYMilli,
  },
});

export const bellowsHand = (w: World): Press[] => {
  const s = bellowsBoss(w);
  if (s === null) return [];
  const out: Press[] = [...hazards(w, s), ...handles(w, s)];
  return out;
};

/**
 * **THE BELLOWS played wrong**, and the only way to pose the jam: the seat
 * whose beat it is **not** strokes its handle. Correct play never jams, so a
 * card for the state the whole boss is built to punish cannot be earned by a
 * hand that plays well — this one waits for the first exchange's marks and
 * then has the navigator push while the pilot is still pulling.
 */
export const bellowsWrongHand = (w: World): Press[] => {
  const s = bellowsBoss(w);
  if (s === null) return [];
  if (s.phase !== "pull") return [];
  return [drag(2, true, w.cfg.bellowsReachMilli)];
};

/** The two handles, in the beat that is theirs, and off them in every other. */
function handles(w: World, s: BellowsState): Press[] {
  if (s.phase === "last") {
    if (bellowsHeld(s, 1) && bellowsHeld(s, 2)) return [drag(1, false, 0), drag(2, false, 0)];
    return [drag(1, true, 0), drag(2, true, 0)];
  }
  const turn = bellowsTurn(s);
  if (turn === 0) return [drag(1, false, 0), drag(2, false, 0)];
  // Still resting on the handle from the shared window's last round: lifted,
  // so the next press is a stroke (`bellowsExchanges`).
  if (bellowsHeld(s, turn)) return [drag(turn, false, 0)];
  return [drag(turn, true, w.cfg.bellowsReachMilli)];
}

/** The spark shot out, and the shield under the breath, so the fight reaches its end. */
function hazards(w: World, s: BellowsState): Press[] {
  const out: Press[] = [];
  if (bellowsLeaking(s)) {
    out.push({ player: 1, command: { kind: "cannonCol", col: s.sparkCol } });
    out.push({ player: 2, command: { kind: "fire", color: "cyan" } });
  }
  // The nearest body, which on this wave is the breath: the queue above it is
  // the wave's own and the shield is where the next thing to land is anyway.
  let body: { col: number; row: number } | null = null;
  for (const c of w.creatures) {
    if (isMeteorKind(c.kind) && (body === null || c.row > body.row)) body = c;
  }
  if (body !== null) out.push({ player: 2, command: { kind: "shieldCol", col: body.col } });
  return out;
}
