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
  /**
   * Show or hide the room screen. The chip is how a player reaches it; the
   * main menu is a second door onto the same screen, so it is opened by name
   * rather than by clicking the chip on the player's behalf.
   */
  open: (isOpen: boolean) => void;
  /**
   * Join the room the address names, if it names one. Call it once the status
   * callback has somewhere to go — see the note on the implementation.
   */
  invite: () => void;
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
  const shareBtn = document.getElementById("joinShare");

  let last: LinkStatus = {
    state: "solo",
    room: "",
    player: 0,
    rttMs: -1,
    slack: 0,
    countdownMs: 0,
    delayMs: 0,
    desyncTick: null,
    brokenPromises: 0,
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

  // Reading four characters aloud is the design and stays the design — the two
  // players are already talking, and that is the game. This is for the minute
  // before they are: the room has to be got to the other phone somehow, and on
  // two handsets in two cities that is a message rather than a voice.
  shareBtn?.addEventListener("click", () => {
    if (!last.room) return;
    void shareRoom(last.room).then((said) => {
      if (stateEl) stateEl.textContent = said;
    });
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

  /**
   * A link with a room in it walks straight into that room, and puts this
   * screen up so there are words for what is happening while it does. The code
   * is still the way in — a link only saves the second player from typing one
   * they were sent rather than told, which is the whole difference between two
   * people in a kitchen and two people on a call in two cities.
   *
   * It is the caller's to fire and not done on the way out of here, because
   * joining immediately reports a status and the caller cannot route that
   * anywhere until it holds what this function is still in the middle of
   * returning.
   */
  const invite = (): void => {
    const room = roomRequested(location.href);
    if (!room) return;
    open(true);
    b.join(room);
  };

  return { update, open, invite };
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
      return `Seat ${status.player}, ${status.rttMs} ms round trip, ${status.delayMs} ms of lay.`;
    case "stalled":
      return "The other phone has gone quiet. Still connected — waiting for it.";
    case "lost":
      return "The connection is gone. Rejoin the room, or carry on alone.";
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

/** Four characters of real randomness. The browser's, never the simulation's. */
function freshCode(): string {
  const bytes = new Uint8Array(ROOM_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return roomCodeFromBytes(bytes);
}

/**
 * The room a link was opened on, or "" for none. Pure, so the rule can be
 * tested the way `menuRequested` is.
 *
 * A code is still the way in and a link is only a way to deliver one, so this
 * accepts nothing a person could not have typed: the code goes through
 * `normalizeRoomCode` and is refused unless it is a whole one, which keeps a
 * mistyped or truncated address out of a room rather than into a wrong one.
 */
export function roomRequested(url: string): string {
  const given = new URL(url, "http://game.invalid/").searchParams.get(ROOM_PARAM);
  if (!given) return "";
  const code = normalizeRoomCode(given);
  return isRoomCode(code) ? code : "";
}

const ROOM_PARAM = "room";

/** The address that opens this room, for a message the other phone can tap. */
export function roomLink(room: string): string {
  const url = new URL(location.href);
  url.hash = "";
  url.search = "";
  url.searchParams.set(ROOM_PARAM, room);
  return url.href;
}

/**
 * Hand the room to the other phone by whatever the handset has. The share
 * sheet where there is one — that is the Android path and the one that
 * matters — the clipboard where there is not, and the plain address where
 * neither is allowed, because a code that cannot be copied can still be read.
 */
async function shareRoom(room: string): Promise<string> {
  const url = roomLink(room);
  try {
    if (navigator.share) {
      await navigator.share({ title: "Neon Spore", text: `Room ${room}`, url });
      return `Sent. Room ${room}.`;
    }
    await navigator.clipboard.writeText(url);
    return `Link copied. Room ${room}.`;
  } catch {
    // A share sheet the player dismissed, or a clipboard the browser refused.
    // Neither is a failure worth a red word: the address is right there.
    return url;
  }
}
