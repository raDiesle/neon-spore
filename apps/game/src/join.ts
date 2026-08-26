import {
  isRoomCode,
  type LinkStatus,
  linkIsFault,
  linkLabel,
  normalizeRoomCode,
  ROOM_CODE_LENGTH,
  roomCodeFromBytes,
} from "@neon-spore/net";

export interface JoinBindings {
  join: (room: string) => void;
  leave: () => void;
}

export interface JoinScreen {
  /** Called whenever the link changes; repaints the chip and the overlay. */
  update: (status: LinkStatus) => void;
}

/**
 * The room code screen and the network indicator, which are one thing: the
 * indicator is how you get to the screen, and the screen is the only place the
 * indicator's states are spelled out in words.
 *
 * A code is four characters and is meant to be said out loud, because the two
 * players are already talking — that is the game. It is the first sentence of
 * every session and there is no lobby, no account and no list of friends.
 */
export function bindJoinScreen(b: JoinBindings): JoinScreen {
  const chip = document.getElementById("linkChip") as HTMLButtonElement | null;
  const screen = document.getElementById("joinScreen");
  const codeEl = document.getElementById("joinCode");
  const stateEl = document.getElementById("joinState");
  const input = document.getElementById("joinInput") as HTMLInputElement | null;
  const createBtn = document.getElementById("joinCreate");
  const joinBtn = document.getElementById("joinGo");
  const soloBtn = document.getElementById("joinSolo");
  const closeBtn = document.getElementById("joinClose");

  let last: LinkStatus = {
    state: "solo",
    room: "",
    player: 0,
    rttMs: -1,
    slack: 0,
    countdownMs: 0,
    desyncTick: null,
  };

  /** The screen, from the last status seen. Cheap, so it is redone rather than tracked. */
  const paint = (): void => {
    if (codeEl) codeEl.textContent = last.room || "————";
    if (stateEl) stateEl.textContent = explain(last);
  };

  const open = (isOpen: boolean): void => {
    if (isOpen) paint();
    if (screen) screen.style.display = isOpen ? "block" : "none";
  };

  chip?.addEventListener("click", () => open(screen?.style.display !== "block"));
  closeBtn?.addEventListener("click", () => open(false));

  createBtn?.addEventListener("click", () => {
    const code = freshCode();
    if (input) input.value = code;
    b.join(code);
  });

  joinBtn?.addEventListener("click", () => {
    const code = normalizeRoomCode(input?.value ?? "");
    if (isRoomCode(code)) b.join(code);
    else if (stateEl) stateEl.textContent = `A code is ${ROOM_CODE_LENGTH} characters.`;
  });

  soloBtn?.addEventListener("click", () => {
    b.leave();
    open(false);
  });

  input?.addEventListener("input", () => {
    input.value = normalizeRoomCode(input.value);
  });

  const update = (status: LinkStatus): void => {
    const changed = status.state !== last.state || status.room !== last.room;
    last = status;
    if (chip) {
      chip.textContent = chipText(status);
      chip.classList.toggle("fault", linkIsFault(status.state));
      chip.classList.toggle("live", status.state === "live");
    }
    if (!changed && screen?.style.display !== "block") return;
    paint();
    // A fault is the one thing that opens the screen by itself: the game has
    // stopped and the words for why are only in here.
    if (changed && linkIsFault(status.state)) open(true);
  };

  update(last);
  return { update };
}

function chipText(status: LinkStatus): string {
  const label = linkLabel(status.state);
  if (status.state === "countdown") return `${label} ${Math.ceil(status.countdownMs / 1000)}`;
  if (status.rttMs >= 0 && (status.state === "live" || status.state === "stalled")) {
    return `${label} ${status.rttMs}`;
  }
  return status.room ? `${label} ${status.room}` : label;
}

/**
 * One sentence per state. This is where open question 10 is answered for a
 * player rather than for a programmer: "the other phone has gone quiet" and
 * "the connection is gone" are different sentences, so a creature that blinds
 * you can never be mistaken for a dropped line.
 */
function explain(status: LinkStatus): string {
  switch (status.state) {
    case "solo":
      return "One device, both seats. Create a room to play it as it is meant to be played.";
    case "connecting":
      return "Reaching the room…";
    case "waiting":
      return `Room ${status.room}. Say it out loud — the other phone types it in.`;
    case "syncing":
      return "Both here. Agreeing on the beat.";
    case "countdown":
      return `Seat ${status.player}. Starting in ${Math.ceil(status.countdownMs / 1000)}.`;
    case "live":
      return `Seat ${status.player}, ${status.rttMs} ms round trip.`;
    case "stalled":
      return "The other phone has gone quiet. Still connected — waiting for it.";
    case "lost":
      return "The connection is gone. Rejoin the room, or carry on alone.";
    case "desync":
      return `The two worlds parted at tick ${status.desyncTick}. This is a bug, not a lag spike.`;
  }
}

/** Four characters of real randomness. The browser's, never the simulation's. */
function freshCode(): string {
  const bytes = new Uint8Array(ROOM_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return roomCodeFromBytes(bytes);
}
