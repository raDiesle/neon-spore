import type { LinkStatus } from "@neon-spore/net";

/**
 * The room screen one page at a time: which of the four steps a device is on,
 * and what that step says at the top of it.
 *
 * The screen used to be every part of the workflow at once — a name field, a
 * code, a code box, two seat pills, a JOIN, a CREATE ROOM, a START, a SEND
 * LINK and a WHAT THIS IS, stacked down one sheet with CSS deciding which half
 * was reachable. Two people meeting for the first time read all of it before
 * pressing anything, and the two of them are on a voice call while they do:
 * the screen has to be small enough to say out loud. So it is four steps, and
 * a step asks one question.
 *
 * Pure, and its own file, for the reason `join-link.ts` is: this is a rule with
 * a test (`join-steps.test.ts`), and the screen around it is a DOM binding
 * without one. `join.ts` had reached its line ceiling again.
 */

/** Which way through: not chosen yet, typing a code, or reading one out. */
export type JoinMode = "" | "join" | "create";

/** The four steps, in the order a pair walks them. */
export type JoinStep = "pick" | "name" | "code" | "room";

/**
 * Which step this device is on.
 *
 * The two modes leave step 3 at different moments, and that asymmetry is the
 * design rather than an oversight. A joiner's step 3 is a field, and it is over
 * the moment they commit a code — the room is what answers, and whatever it
 * answers (a seat, or "that room is full") belongs on step 4 where there are
 * words for it. A creator's step 3 is the code itself, held up to be read down
 * a phone line; it is over when it has been read, and the only way this device
 * knows that is the other phone arriving. So: a joiner leaves on the join, a
 * creator leaves on the second seat.
 */
export function joinStep(mode: JoinMode, named: boolean, status: LinkStatus): JoinStep {
  if (!mode) return "pick";
  // Asked over the top of a room rather than before it: what reaches this
  // field is a device that walked in on a link and never passed the menu
  // (`join-name.ts`), and it is already in the room by the time it is asked.
  if (!named) return "name";
  if (mode === "create") return status.peers >= 2 ? "room" : "code";
  return status.state === "solo" ? "code" : "room";
}

/** The heading of the step, which is the question it asks. */
export function stepTitle(step: JoinStep, mode: JoinMode): string {
  switch (step) {
    case "pick":
      return "TWO DEVICES";
    case "name":
      return "WHAT ARE YOU CALLED?";
    case "code":
      return mode === "create" ? "READ THIS OUT" : "THE CODE YOU WERE TOLD";
    case "room":
      return "THE ROOM";
  }
}

/**
 * The one sentence under the heading.
 *
 * Step 3's two are the whole of what a pair has to get right, and they are
 * written at the person holding the phone rather than about the system: *be on
 * a voice call and read this out* tells the creator what to do with the four
 * characters they are looking at, which "share this code" does not.
 */
export function stepLede(step: JoinStep, mode: JoinMode, status: LinkStatus): string {
  switch (step) {
    case "pick":
      return "One of you opens a room; the other joins it. Whoever presses CREATE reads the code out.";
    case "name":
      return "The other phone says who is in the other seat, so it needs something to call you.";
    case "code":
      return mode === "create"
        ? "Be on a voice call and read this out. The other phone types it in."
        : "Type in the code you were told. Four characters, and they are said, not sent.";
    case "room":
      return status.peers >= 2 ? "" : "Waiting for the other phone.";
  }
}

/**
 * The way back off this step, or "" where there is none.
 *
 * Backing out of a step that holds a room is leaving the room, which hangs up
 * on the other player — so it is the LEAVE ROOM press with its confirm
 * (`confirm.ts`) and never a quiet `←`. Backing out of one that does not is
 * free, and is a plain `←`.
 */
export function stepBack(step: JoinStep, status: LinkStatus): "menu" | "back" | "leave" {
  if (status.state !== "solo") return "leave";
  return step === "pick" ? "menu" : "back";
}
