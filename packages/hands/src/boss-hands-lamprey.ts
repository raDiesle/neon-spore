import {
  beatPhaseTicks,
  guardArmed,
  guardWindowTicks,
  type LampreyState,
  lampreyAsks,
  lampreyBoss,
  lampreyHolder,
  lampreyTailHeld,
  lampreyTailPulls,
  lampreyTailWay,
  lampreyTowAt,
  lampreyWorker,
  shieldRow,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE LAMPREY played right**, for the autopilot. In a bite the holder puts
 * a thumb on the tail, and once it is held the other frees the head: pulls it
 * all the way up, or taps the one lit tooth. In an `apart` both pull at once,
 * the tail along the body away from the head. With the gullet lit, the
 * cannon goes to the eel's column and the step's colour goes up it.
 *
 * **A `tow` is pulled in two presses**: the tail out as in an `apart`, and
 * the head along its curve to the far end — which the eel's lunge at two
 * thirds throws back to a third, the thumb off with it. The hand lifts, and
 * takes the knob again where it waits.
 *
 * **Each thumb is sent once**, and again only when the simulation has
 * forgotten it — every landing starts the thumbs again
 * (`sim/lamprey-step.ts`), so the hand is read off the state and keeps
 * nothing of its own.
 *
 * **A tooth is an edge**, THE VALVE's pin (`boss-hands-valve.ts`): a thumb
 * still down is lifted the tick after it came down, so the next tap is a new
 * press. The tooth tapped is the lit one, read off the state, so the hand
 * never snaps one back; and it waits for the tail, so it never taps loose.
 *
 * **The shot** wants the step's colour; `"either"` is fired cyan.
 *
 * **Its dung is a rock**, turned the way the field's hand turns one
 * (`autopilot-field-hand.ts`): the navigator carries the shield under it and
 * the pilot raises it in the last stretch of the beat before it reaches the
 * shield's row.
 */
type Press = Omit<TimedCommand, "tick">;

export const lampreyHand = (w: World): Press[] => {
  const s = lampreyBoss(w);
  if (s === null) return [];
  return [...holdTail(w, s), ...freeHead(w, s), ...tap(s), ...shoot(w, s), ...shield(w, s)];
};

function shield(w: World, s: LampreyState): Press[] {
  const dung = w.creatures.find((c) => s.dung.includes(c.id));
  if (dung === undefined) return [];
  if (w.shieldCol !== dung.col)
    return [{ player: 2, command: { kind: "shieldCol", col: dung.col } }];
  if (dung.row < shieldRow(w.cfg) - 1 || guardArmed(w)) return [];
  const toBeat = ticksPerBeat(w.cfg) - beatPhaseTicks(w.cfg, w.tick);
  return toBeat <= guardWindowTicks(w.cfg) / 2 ? [{ player: 1, command: { kind: "guard" } }] : [];
}

function holdTail(w: World, s: LampreyState): Press[] {
  const holder = lampreyHolder(s);
  if (holder === null) return [];
  const full = w.cfg.lampreyTailPullMilli;
  const pulls = lampreyTailPulls(s);
  if (pulls ? (s.tailMilli[holder - 1] ?? 0) >= full : s.tailDown[holder - 1]) return [];
  // A hair past the whole pull, so the rounding along a diagonal never leaves it short.
  const way = lampreyTailWay(s);
  const reach = pulls ? full + 50 : 0;
  const command = {
    kind: "drag",
    target: "lampreyTail",
    on: true,
    fromMilli: Math.round((way.x * reach) / 1000),
    fromYMilli: Math.round((way.y * reach) / 1000),
  } as const;
  return [{ player: holder, command }];
}

function freeHead(w: World, s: LampreyState): Press[] {
  const worker = lampreyWorker(s);
  const ask = lampreyAsks(s);
  if (worker !== null && ask === "tow") return tow(w, s, worker);
  if (worker === null || (ask !== "pull" && ask !== "apart")) return [];
  if (ask === "pull" && !lampreyTailHeld(s)) return [];
  if ((s.headMilli[worker - 1] ?? 0) >= w.cfg.lampreyHeadPullMilli) return [];
  const up = -w.cfg.lampreyHeadPullMilli;
  const command = {
    kind: "drag",
    target: "lampreyHead",
    on: true,
    fromMilli: 0,
    fromYMilli: up,
  } as const;
  return [{ player: worker, command }];
}

/** The head along a tow's curve to its far end, from where the thumb took hold; lifted once the lunge throws it off. */
function tow(w: World, s: LampreyState, worker: 1 | 2): Press[] {
  const head = (on: boolean, fromMilli: number, fromYMilli: number): Press => ({
    player: worker,
    command: { kind: "drag", target: "lampreyHead", on, fromMilli, fromYMilli },
  });
  if (s.slipped[worker - 1]) return [head(false, 0, 0)];
  const full = w.cfg.lampreyTowMilli;
  if (s.towMilli >= full) return [];
  const from = lampreyTowAt(w.cfg, s, s.towFrom < 0 ? s.towMilli : s.towFrom);
  const end = lampreyTowAt(w.cfg, s, full);
  return [head(true, end.x - from.x, end.y - from.y)];
}

function tap(s: LampreyState): Press[] {
  const lifts = ([1, 2] as const)
    .filter((seat) => s.tapDown[seat - 1])
    .map((seat) => press(seat, false, s.litTooth));
  if (lifts.length > 0) return lifts;
  const worker = lampreyWorker(s);
  if (worker === null || lampreyAsks(s) !== "teeth" || !lampreyTailHeld(s)) return [];
  return [press(worker, true, s.litTooth)];
}

function shoot(w: World, s: LampreyState): Press[] {
  const step = s.steps[s.cursor];
  if (step === undefined || lampreyAsks(s) !== "gullet") return [];
  if (w.cannonCol !== s.col) return [{ player: 1, command: { kind: "cannonCol", col: s.col } }];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}

const press = (player: 1 | 2, on: boolean, id: number): Press => ({
  player,
  command: { kind: "drag", target: "lampreyTooth", on, fromMilli: 0, id },
});
