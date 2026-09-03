import { type LinkStatus, linkLabel } from "@neon-spore/net";

/**
 * The words the network wears: the chip's, the room screen's, and the two
 * seat pills'.
 *
 * They are pure functions of a status and live apart from the screen that
 * shows them, because they are the answer to open question 10 — "the other
 * phone has gone quiet" and "the connection is gone" must be different
 * sentences, so that a creature which blinds a player can never be mistaken
 * for a dropped line. A sentence that matters that much is worth being able to
 * read in one place.
 */

export function chipText(status: LinkStatus): string {
  const label = linkLabel(status.state);
  if (status.state === "countdown") return `${label} ${Math.ceil(status.countdownMs / 1000)}`;
  if (status.rttMs >= 0 && (status.state === "live" || status.state === "stalled")) {
    return `${label} ${status.rttMs}`;
  }
  return status.room ? `${label} ${status.room}` : label;
}

/** One sentence per state, for the room screen. */
export function explain(status: LinkStatus): string {
  switch (status.state) {
    case "solo":
      return "One device, both seats. Open a room to play it as it is meant to be played — one of you on each phone.";
    case "connecting":
      return "Reaching the room…";
    case "waiting":
      return `Room ${status.room}. Say it out loud, or send the link — the other phone types it in.`;
    case "syncing":
      return "Both here. Agreeing on the beat.";
    case "countdown":
      return `Seat ${status.player}. Starting in ${Math.ceil(status.countdownMs / 1000)}.`;
    case "live":
      return `Seat ${status.player}, ${status.rttMs} ms round trip, ${status.delayMs} ms of lay.`;
    case "stalled":
      return "The other phone has gone quiet. Still connected — waiting for it.";
    case "lost":
      return "The connection is gone. Rejoin the room, or leave it and carry on alone.";
    case "full":
      return `Room ${status.room} already has two people in it. Your line is fine — the room is not free.`;
    // Two ways here, found in two different places: a peer that broke the
    // model, or two worlds that drifted apart. Saying which saves the next hour.
    case "desync":
      return status.brokenPromises > 0
        ? `The other phone sent ${status.brokenPromises} inputs it had promised not to send. This is a bug, not a lag spike.`
        : `The two worlds parted at tick ${status.desyncTick}. This is a bug, not a lag spike.`;
  }
}

/**
 * Whether the room holds two people, as far as this device can tell.
 *
 * The status carries no head count — the room's `peers` message is consumed
 * inside `link.ts` — but it does not need to: every state from `syncing`
 * onwards is one the room only reaches with two seats filled, and `waiting` is
 * the one that means exactly the opposite.
 */
export function peerHere(status: LinkStatus): boolean {
  switch (status.state) {
    case "syncing":
    case "countdown":
    case "live":
    case "stalled":
      return true;
    default:
      return false;
  }
}

/** What a seat pill says: this device's own seat, or the other player's. */
export function seatWord(status: LinkStatus, seat: 1 | 2): string {
  if (status.state === "solo") return "—";
  if (status.player === seat) return "YOU";
  if (status.state === "stalled") return "QUIET";
  if (status.state === "lost") return "GONE";
  return peerHere(status) ? "HERE" : "WAITING…";
}

/** What the TWO DEVICES entry says, which is the whole room in one line. */
export function roomLine(status: LinkStatus): string {
  switch (status.state) {
    case "solo":
      return "Open a room, or type in the code you were told.";
    case "connecting":
      return "Reaching the room…";
    case "waiting":
      return `Room ${status.room}. Waiting for the other phone — say the code out loud.`;
    case "syncing":
      return `Room ${status.room}. Both here, agreeing on the beat.`;
    case "countdown":
      return `Room ${status.room}. Seat ${status.player}. Starting in ${Math.ceil(status.countdownMs / 1000)}.`;
    case "live":
      return `Room ${status.room}. Seat ${status.player}, ${status.rttMs} ms round trip.`;
    case "stalled":
      return `Room ${status.room}. The other phone has gone quiet.`;
    case "lost":
      return "The connection is gone. Open the room screen to rejoin, or leave it.";
    case "full":
      return `Room ${status.room} already has two people in it.`;
    case "desync":
      return "The two worlds parted. This is a bug, not a lag spike.";
  }
}
