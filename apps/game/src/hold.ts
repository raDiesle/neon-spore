import type { LinkStatus } from "@neon-spore/net";

/**
 * The card that comes up when the line goes bad, with a clock on it.
 *
 * A phone drops its socket constantly — a screen locks, a train enters a
 * tunnel, wifi hands over to the mobile network — and the layer underneath
 * reaches for the room again without saying anything, which is right. What was
 * missing is the moment after that: the other player is sitting in front of a
 * field that has stopped, with no idea whether to wait five seconds or put the
 * phone down, and nothing on the screen counting.
 *
 * So this says which of the two things happened, how long it has been going
 * on, and offers the only two answers there are — keep waiting, or leave the
 * room and pick it up later.
 */

/**
 * How long a bad line has to stay bad before it is worth a card. A socket that
 * drops and comes back inside `RECONNECT_MS` is the ordinary case on a
 * handset, and a card that flashed for it would be the fault rather than the
 * thing it reported.
 */
export const HOLD_AFTER_MS = 1200;

export interface HoldBindings {
  /** Hang up and go back to one device. */
  leave: () => void;
}

export interface HoldCard {
  update: (status: LinkStatus) => void;
}

export interface Trouble {
  title: string;
  ms: number;
  what: string;
}

/**
 * Which of the two bad lines this is, or null for a line that is fine.
 *
 * Pure, and exported, because the difference between them is the whole point
 * of the card: "your phone lost the room" and "the other phone went quiet" ask
 * the player to do different things, and only one of them is about their own
 * signal.
 */
export function troubleOf(status: LinkStatus): Trouble | null {
  if (status.state === "solo") return null;
  if (status.state === "lost") {
    return {
      title: "THE CONNECTION IS GONE",
      ms: status.awayMs,
      what: "Nothing is reaching the room any more. Open the room screen to type the code again, or leave and carry on alone.",
    };
  }
  if (status.awayMs >= HOLD_AFTER_MS) {
    return {
      title: "REACHING THE ROOM AGAIN",
      ms: status.awayMs,
      what: "This phone lost its line, not the game. It is being reached for again — the seat is held for a few seconds more.",
    };
  }
  if (status.state === "stalled" && status.stalledMs >= HOLD_AFTER_MS) {
    return {
      title: "THE OTHER PHONE HAS GONE QUIET",
      ms: status.stalledMs,
      what: "Still connected, and the field is holding still until it speaks again. Wait for it, or leave the room and pick this up later.",
    };
  }
  return null;
}

export function bindHoldCard(b: HoldBindings): HoldCard {
  const root = document.getElementById("linkHold");
  const titleEl = document.getElementById("holdTitle");
  const timerEl = document.getElementById("holdTimer");
  const whatEl = document.getElementById("holdWhat");
  const waitBtn = document.getElementById("holdWait");
  const leaveBtn = document.getElementById("holdLeave");

  /** Pressed KEEP WAITING: the card stays down until the line changes again. */
  let dismissed = false;
  let shownTitle = "";
  let shownSecond = -1;

  const hide = (): void => {
    root?.classList.remove("on");
  };

  waitBtn?.addEventListener("click", () => {
    dismissed = true;
    hide();
  });
  leaveBtn?.addEventListener("click", () => {
    dismissed = false;
    hide();
    b.leave();
  });

  return {
    update: (status) => {
      const trouble = troubleOf(status);
      if (!trouble) {
        dismissed = false;
        shownTitle = "";
        shownSecond = -1;
        hide();
        return;
      }
      // A different fault is a different question, so an answer given to the
      // last one does not carry over to it.
      if (trouble.title !== shownTitle) {
        dismissed = false;
        shownTitle = trouble.title;
        if (titleEl) titleEl.textContent = trouble.title;
        if (whatEl) whatEl.textContent = trouble.what;
      }
      if (dismissed) return;
      // Once a second. This runs on every frame of a bad line, and rewriting
      // the same text sixty times a second is sixty layouts for one number.
      const second = Math.floor(trouble.ms / 1000);
      if (second !== shownSecond) {
        shownSecond = second;
        if (timerEl) timerEl.textContent = `${second}s`;
      }
      root?.classList.add("on");
    },
  };
}
