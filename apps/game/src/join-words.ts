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
    case "ready":
      return readyLine(status);
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
 * What a seat pill says: this device's own seat, or the other player's.
 *
 * Whether the other seat is filled is the room's own count (`status.peers`),
 * not a guess read off which `LinkState` we happen to be in. The two agree
 * today — every state from `syncing` onwards is one the room only reaches with
 * two seats — but the count is the fact and the state is a symptom of it, so a
 * state added tomorrow cannot make a full room's pill read WAITING.
 */
export function seatWord(status: LinkStatus, seat: 1 | 2): string {
  if (status.state === "solo") return "—";
  if (status.player === seat) return "YOU";
  if (status.state === "stalled") return "QUIET";
  if (status.state === "lost") return "GONE";
  if (status.peers < 2) return "WAITING…";
  // A name beats HERE, which says only that somebody is there — and knowing
  // *who* is there is the whole reason a name is asked for. A seat whose
  // player gave none falls back to the word, which is still true.
  return status.names[seat - 1] || "HERE";
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
    case "ready":
      return `Room ${status.room}. ${readyLine(status)}`;
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

/**
 * The wait on the press, from this device's side.
 *
 * Three different waits, and a player has to be able to tell which one they
 * are in: nobody has pressed, I have pressed and the other phone has not, or
 * the other phone has pressed and I have not. Saying "waiting" to all three
 * leaves the person who has already pressed wondering whether their tap landed.
 */
export function readyLine(status: LinkStatus): string {
  if (status.readyHere && !status.readyThere) return "Waiting for the other phone.";
  if (status.readyThere && !status.readyHere) return "The other phone is ready. Press START.";
  return "Both here. Press START when you are both looking up.";
}

/** What the START button says, and whether it can be pressed. */
export function startButton(status: LinkStatus): { label: string; enabled: boolean } {
  if (status.state === "ready" && !status.readyHere) return { label: "START", enabled: true };
  if (status.state === "ready") return { label: "WAITING…", enabled: false };
  if (status.state === "countdown") {
    return { label: `STARTING ${Math.ceil(status.countdownMs / 1000)}`, enabled: false };
  }
  // Before the clocks agree there is nothing to press: a press that stamped a
  // beat zero the two devices place differently is the whole failure the clock
  // sync exists to prevent.
  return { label: "START", enabled: false };
}
