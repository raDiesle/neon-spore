import {
  type RatchetState,
  ratchetBoss,
  ratchetHeld,
  ratchetLoose,
  ratchetWorking,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE RATCHET played right, and played blind**, for the STATES sheet.
 *
 * Played right is the catch set, then the pawl pressed — in that order and
 * never the other, because the press is judged on the tick it lands and a
 * catch set a tick later sets nothing. After a clean tooth the catch is
 * spent, so the hand lifts it and sets it again, which is the one thing the
 * navigator has to learn (`sim/ratchet-hand.ts`).
 *
 * Played blind is the pilot pressing with no catch under him at all: every
 * tooth burns, and the third burn jams the rack. That is the only wrong the
 * boss has worth a card, so it is the only wrong twin here.
 */
type Press = Omit<TimedCommand, "tick">;

export const ratchetHand = (w: World): Press[] => play(w, true);

export const ratchetBlindHand = (w: World): Press[] => play(w, false);

function play(w: World, catching: boolean): Press[] {
  const s = ratchetBoss(w);
  if (s === null) return [];
  return [...bolt(s), ...hands(w, s, catching)];
}

function hands(w: World, s: RatchetState, catching: boolean): Press[] {
  const held = ratchetHeld(s, w.cfg);
  if (ratchetWorking(s) && (held || !catching)) return s.pawlDown ? [pawl(false)] : [pawl(true)];
  const out: Press[] = s.pawlDown ? [pawl(false)] : [];
  if (!catching || held) return out;
  // A spent catch is lifted before it is set again.
  out.push(s.catchSpent ? caught(false, 0) : caught(true, w.cfg.ratchetReachMilli));
  return out;
}

function pawl(on: boolean): Press {
  return { player: 1, command: { kind: "drag", target: "ratchetPawl", on, fromMilli: 0 } };
}

function caught(on: boolean, depth: number): Press {
  return {
    player: 2,
    command: { kind: "drag", target: "ratchetCatch", on, fromMilli: 0, fromYMilli: depth },
  };
}

/** The loose bolt shot out of the middle column before it reaches the hull. */
function bolt(s: RatchetState): Press[] {
  if (!ratchetLoose(s)) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: s.boltCol } },
    { player: 2, command: { kind: "fire", color: "cyan" } },
  ];
}
