import {
  isRoomCode,
  type LinkStatus,
  linkIsFault,
  normalizeRoomCode,
  ROOM_CODE_LENGTH,
  SOLO_STATUS,
} from "@neon-spore/net";
import { bindTwoStep } from "./confirm.js";
import { freshCode, roomRequested } from "./join-link.js";
import { bindNameField } from "./join-name.js";
import { bindRoomStep, type RoomStepBindings } from "./join-room-step.js";
import { bindStepView } from "./join-step-view.js";
import { type JoinMode, joinStep } from "./join-steps.js";
import { chipText, explain, lastTimeLine } from "./join-words.js";
import { rememberFrom } from "./pairing.js";

/** The link, as this screen asks things of it. Step 4's own asks — READY,
 * the seat, the tempo — are `RoomStepBindings` (`join-room-step.ts`). */
export interface JoinBindings extends RoomStepBindings {
  join: (room: string) => void;
  leave: () => void;
  /** The way out of this screen, which is the menu it was opened from. */
  back: () => void;
}

export interface JoinScreen {
  /** Called whenever the link changes; repaints the chip and the overlay. */
  update: (status: LinkStatus) => void;
  /**
   * Show or hide the room screen. The chip is how a player already in a room
   * reaches it; the main menu is the door for everybody else, so it is opened
   * by name rather than by clicking the chip on the player's behalf.
   */
  open: (isOpen: boolean) => void;
  /**
   * Join the room the address names, if it names one. Call it once the status
   * callback has somewhere to go — see the note on the implementation.
   */
  invite: () => void;
}

/**
 * The room screen and the network indicator, which are one thing: the
 * indicator is how you get back to the screen, and the screen is the only
 * place the indicator's states are spelled out in words.
 *
 * A code is four characters and is meant to be said out loud, because the two
 * players are already talking — that is the game. It is the first sentence of
 * every session and there is no lobby, no account and no list of friends.
 *
 * **It is four steps and each asks one thing** — JOIN or CREATE, the name, the
 * code, the room — because the pair are on a voice call while they read it and
 * a screen read aloud has to be short. Which step, and what it says, is
 * `join-steps.ts`; this is the sheet the step is painted onto.
 *
 * The chip is gone entirely while there is no room. It used to sit in the
 * corner saying SOLO, which is a button that reports the absence of the thing
 * it opens: nobody reads "SOLO" as "press here for two devices". The way to
 * two devices is the menu now, and the chip comes back the moment there is a
 * room for it to be about.
 *
 * The code itself — drawn fresh, read off a link, written into one — is
 * `join-link.ts`; this is the screen around it.
 */
export function bindJoinScreen(b: JoinBindings): JoinScreen {
  const chip = document.getElementById("linkChip") as HTMLButtonElement | null;
  const screen = document.getElementById("joinScreen");
  const ledeEl = document.getElementById("joinLede");
  const codeEl = document.getElementById("joinCode");
  const stateEl = document.getElementById("joinState");
  const lastEl = document.getElementById("joinLast");
  const input = document.getElementById("joinInput") as HTMLInputElement | null;
  const closeEl = document.getElementById("joinClose");
  const backEl = document.getElementById("joinBack");
  const leaveEl = document.getElementById("joinLeave");
  const showStep = bindStepView();
  // Step 4 — the seats, the tempo and the two READY circles — is its own
  // binding; this sheet only hands it the status.
  const room = bindRoomStep(b);

  let last: LinkStatus = SOLO_STATUS;
  /** Which way through this pair chose. Reset every time the screen opens solo. */
  let mode: JoinMode = "";
  const nameField = bindNameField(() => {
    paint();
    // The name was the thing in the way: whatever the chosen way through was
    // about to do, it can do now.
    begin();
  });

  /**
   * Do the step the mode asks for, once it is reachable. A creator's step 3 is
   * a code, and a code is a room — so the room is opened on the way in rather
   * than by a second press on a screen whose only content is the answer.
   */
  const begin = (): void => {
    if (mode !== "create" || nameField.asking() || last.state !== "solo") return;
    const code = freshCode();
    if (input) input.value = code;
    b.join(code);
  };

  /** The screen, from the last status seen. Cheap, so it is redone rather than tracked. */
  const paint = (): void => {
    // So the menu can offer the way back in without a code (`pairing.ts`).
    rememberFrom(last);
    nameField.paint();
    showStep(joinStep(mode, !nameField.asking(), last), mode, last);
    if (codeEl) codeEl.textContent = last.room || "————";
    if (stateEl) stateEl.textContent = explain(last);
    // What the two of you got to last time, when the room remembers a time.
    if (lastEl) lastEl.textContent = lastTimeLine(last);
    room.paint(last);
  };

  const open = (isOpen: boolean): void => {
    // A pair with no room starts at step 1 every time. A pair with one is put
    // back where they were, which is why this only resets while solo.
    if (isOpen && last.state === "solo") mode = "";
    if (isOpen) paint();
    if (screen) screen.style.display = isOpen ? "block" : "none";
  };

  chip?.addEventListener("click", () => open(screen?.style.display !== "block"));
  closeEl?.addEventListener("click", () => {
    open(false);
    b.back();
  });

  // One step back, which is only ever offered where there is no room to lose.
  backEl?.addEventListener("click", () => {
    mode = "";
    paint();
  });

  document.getElementById("joinPickJoin")?.addEventListener("click", () => {
    mode = "join";
    paint();
  });

  document.getElementById("joinPickCreate")?.addEventListener("click", () => {
    mode = "create";
    paint();
    begin();
  });

  document.getElementById("joinGo")?.addEventListener("click", () => {
    const code = normalizeRoomCode(input?.value ?? "");
    if (isRoomCode(code)) b.join(code);
    else if (ledeEl) ledeEl.textContent = `A code is ${ROOM_CODE_LENGTH} characters.`;
  });

  // Not a straight `click` → `leave()`: this hangs up on the other player, so
  // it asks in place first. See `confirm.ts`.
  if (leaveEl) {
    bindTwoStep(leaveEl, "LEAVE", () => {
      b.leave();
      mode = "";
      open(false);
      b.back();
    });
  }

  input?.addEventListener("input", () => {
    input.value = normalizeRoomCode(input.value);
  });

  const update = (status: LinkStatus): void => {
    const changed = status.state !== last.state || status.room !== last.room;
    last = status;
    // A room this screen did not open — the menu's way back in (`pairing.ts`),
    // or a link walked straight into — is one this device joined, and the
    // steps behind it are over.
    if (!mode && status.state !== "solo") mode = "join";
    if (chip) {
      chip.textContent = chipText(status);
      chip.classList.toggle("on", status.state !== "solo");
      chip.classList.toggle("fault", linkIsFault(status.state));
      chip.classList.toggle("live", status.state === "live");
    }
    if (!changed && screen?.style.display !== "block") return;
    paint();
    // A fault is the one thing that opens the screen by itself: the game has
    // stopped and the words for why are only in here. **Except a parting**, whose
    // door is the menu's CONTINUE (`shell.ts`): opened here too, this screen
    // stood over that menu, a dead START on top of the press that mends it.
    if (changed && linkIsFault(status.state) && status.state !== "desync") open(true);
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
    // After `open`, which resets the way through for a pair with no room yet.
    mode = "join";
    b.join(room);
    paint();
  };

  return { update, open, invite };
}
