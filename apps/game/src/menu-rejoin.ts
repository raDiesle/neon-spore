import { el } from "./menu-parts.js";

/**
 * **The way straight back into the room this device was just in**, at the top
 * of the front page.
 *
 * The case is one the menu had no answer for. Two people are playing, one of
 * them reloads — a dropped tab, a phone that slept, a thumb on the address bar
 * — and lands on the front page with a socket that no longer exists. The other
 * phone has lost nothing: it is still in the room with the field up, waiting.
 * What the reloaded phone had was four rows to read and, behind PLAY, a REJOIN
 * that only works if the two of them have played before and both gave names.
 *
 * So this is a button and deliberately not a row. The owner asked for it that
 * way — *some special visualized top button to rejoin ongoing game* — and the
 * shape follows from who is looking at it: somebody who wants one thing, now,
 * and is aware the other person is sitting there waiting. A list is for
 * choosing between things.
 *
 * **It carries the code**, in the type the room screen uses for one, because
 * the code is the thing the pair can check against each other out loud — and
 * because a button that says only BACK IN gives a reader no way to tell *which*
 * room it means on a device that has been in several.
 *
 * **What it does not say is that the other phone is there.** Nothing on this
 * device can know that (`last-room.ts`), so the line under the code says what
 * is true — they *may* still be in it — and pressing it goes and finds out.
 */
export interface RejoinButton {
  node: HTMLButtonElement;
  /** The room to offer, or "" to take the button off the page. */
  set(room: string): void;
}

export function rejoinButton(onPress: (room: string) => void): RejoinButton {
  const node = el("button", "rejoin");
  node.type = "button";
  node.hidden = true;
  const code = el("span", "code");
  node.append(
    el("span", "back-in", "BACK INTO THE GAME"),
    code,
    el("span", "why", "You were in this room a moment ago. They may still be in it."),
  );
  // The code is read off the button rather than held in a variable beside it:
  // what a press means is what the reader can see, and the two cannot drift.
  node.addEventListener("click", () => {
    const room = code.textContent ?? "";
    if (room !== "") onPress(room);
  });
  return {
    node,
    set: (room) => {
      code.textContent = room;
      node.hidden = room === "";
    },
  };
}
