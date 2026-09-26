import {
  type KeelState,
  keelBoss,
  keelFlipping,
  keelLit,
  keelMarrowLit,
  keelSeat,
  keelThrown,
  midCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE KEEL played right**, for the STATES sheet and the autopilot: every
 * lit joint tapped by the seat whose half it sits over, the socket shot in its
 * own colour up the middle, and the tail's rock shot out of its column.
 *
 * **The tap is a level the simulation reads as an edge**: `keelJoint` locks
 * on any press while a joint is lit and the phase leaves `joint` at once
 * (`sim/keel-hand.ts`), so pressing on every lit tick is one tap. A joint over
 * the middle column is either seat's, and P1 takes it.
 *
 * **The rock first**, shot with either colour (`sim/keel-shot.ts`), because
 * unanswered it is the one blow this boss lands on the hull that no window
 * forgives — THE MANTLE's spark, again (`boss-hands-mantle.ts`).
 *
 * **The story between** (`sim/keel-story.ts`): through the flip both seats
 * hold their end joint down, which is the chord; through the marrow P1 aims
 * the middle and P2 fires whichever colour it has not had yet; and through the
 * cooldown both hands stay off, which is sending nothing.
 */
type Press = Omit<TimedCommand, "tick">;

export const keelHand = (w: World): Press[] => {
  const s = keelBoss(w);
  if (s === null) return [];
  return [...rock(s), ...socket(w, s), ...flip(s), ...marrow(w, s), ...tap(w, s)];
};

function rock(s: KeelState): Press[] {
  if (!keelThrown(s)) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: s.rockCol } },
    { player: 2, command: { kind: "fire", color: s.socket } },
  ];
}

function socket(w: World, s: KeelState): Press[] {
  if (s.phase !== "socket" || keelThrown(s)) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: midCol(w.cfg) } },
    { player: 2, command: { kind: "fire", color: s.socket } },
  ];
}

function tap(w: World, s: KeelState): Press[] {
  if (!keelLit(s)) return [];
  const player = keelSeat(s, w.cfg.cols) ?? 1;
  return [{ player, command: { kind: "drag", target: "keelJoint", on: true, fromMilli: 0 } }];
}

function flip(s: KeelState): Press[] {
  if (!keelFlipping(s)) return [];
  const hold = { kind: "drag", target: "keelJoint", on: true, fromMilli: 0 } as const;
  return [
    { player: 1, command: hold },
    { player: 2, command: hold },
  ];
}

function marrow(w: World, s: KeelState): Press[] {
  if (!keelMarrowLit(s)) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: midCol(w.cfg) } },
    { player: 2, command: { kind: "fire", color: s.marrow[0] ? "cyan" : "red" } },
  ];
}
